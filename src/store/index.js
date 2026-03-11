import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://192.168.1.4:3001/api";

const useStore = create(
  persist(
    (set, get) => ({
      isFirstOpen: true,
      setFirstOpen: () => {
        set({ isFirstOpen: false });
      },
      user: null,
      accessToken: null,
      product: null,
      store: null,
      subscription: null,
      notifications: [],

      login: async ({ email, password }) => {
        try {
          const response = await axios.post(
            `${BASE_URL}/users/login`,
            { email, password },
            { headers: { "Content-Type": "application/json" } },
          );
          const data = response.data;
          console.log("=== FULL LOGIN RESPONSE ===", JSON.stringify(data));

          const token =
            data.token || data.access || data.accessToken ||
            data.access_token || data.key;

          const user =
            data.user_details || data.user || data.data || data;

          if (!token) throw new Error(data.message || "Login failed");

          set({ user, accessToken: token });
          return data;
        } catch (error) {
          throw new Error(
            error.response?.data?.message ||
            error.response?.data?.detail ||
            error.message || "Login failed",
          );
        }
      },

      logout: () => {
        set({
          user: null, product: null, store: null,
          subscription: null, accessToken: null, notifications: [],
        });
      },

      signup: async ({ full_name, email, phone_number, address, store_name, password, confirm_password, role }) => {
        try {
          const response = await axios.post(
            `${BASE_URL}/users/register`,
            { full_name, email, phone_number, address, store_name, password, confirm_password, role },
            { headers: { "Content-Type": "application/json" } },
          );
          return response.data;
        } catch (error) {
          throw new Error(
            error.response?.data?.message ||
            error.response?.data?.error ||
            Object.values(error.response?.data || {})?.[0]?.[0] ||
            error.message || "Signup failed",
          );
        }
      },

      forgotPassword: async ({ email }) => {
        try {
          const response = await axios.post(
            `${BASE_URL}/users/forgot-password`,
            { email },
            { headers: { "Content-Type": "application/json" } },
          );
          return response.data;
        } catch (error) {
          throw new Error(
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message || "Request failed",
          );
        }
      },

      // ✅ GET /api/users/profile
      fetchUserProfile: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const response = await axios.get(`${BASE_URL}/users/profile`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          });

          const data = response.data;
          console.log("=== FETCH USER PROFILE RESPONSE ===", JSON.stringify(data));

          const freshUser = data.user || data.user_details || data;

          // ✅ Force override critical fields — persist cache cannot overwrite these
          const currentUser = useStore.getState().user;
          const mergedUser = {
            ...currentUser,
            ...freshUser,
            verified:              freshUser.verified,
            subscription_end_time: freshUser.subscription_end_time,
            status:                freshUser.status,
            total_scans:           freshUser.total_scans,
            scans_used:            freshUser.scans_used,
          };

          set({ user: mergedUser });
          return mergedUser;
        } catch (error) {
          console.error("Fetch user profile error:", error.message);
          return null;
        }
      },

      fetchActiveSubscription: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const response = await axios.get(`${BASE_URL}/subscriptions`, {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          });
          const data = response.data;
          const docs = Array.isArray(data) ? data : [];
          set({ subscription: docs });
          return docs;
        } catch (error) {
          console.error("Fetch active subscription error:", error.message);
          return null;
        }
      },

      fetchProductById: async (productId, localDataFallback = []) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const response = await axios.get(`${BASE_URL}/products/${productId}`, {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          });
          const data = response.data;
          set({ product: data });
          return data;
        } catch (error) {
          if (error.response?.status === 404 && localDataFallback.length > 0) {
            const found = localDataFallback.find(p => (p.id || p._id) === productId);
            if (found) { set({ product: found }); return found; }
          }
          throw error;
        }
      },

      fetchCategories: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing.");
          const response = await axios.get(`${BASE_URL}/categories`, {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          });
          const data = response.data;
          const cats = Array.isArray(data) ? data : data.results || data.categories || [];
          return cats.map(cat => ({ label: cat.category_name, value: cat._id }));
        } catch (error) {
          console.error("Fetch categories error:", error.message);
          throw error;
        }
      },

      addProduct: async (payload) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing.");
          const response = await axios.post(`${BASE_URL}/products`, payload, {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          });
          return response.data;
        } catch (error) {
          console.error("Add product error:", error.message);
          throw error;
        }
      },

      fetchTrendingProducts: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");
          const response = await axios.get(`${BASE_URL}/products/trending`, {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          });
          const data = response.data;
          const products = data.results || data.products || (Array.isArray(data) ? data : []);
          return products.map(item => ({
            id: item._id || item.id,
            image: item.image_inner ? { uri: item.image_inner } : null,
            title: item.title,
            description: item.description,
            discountPrice: `$${item.offer_price || item.price}`,
            originalPrice: `$${item.price}`,
            totalDiscount: item.offer_price
              ? `${100 - Math.round((item.offer_price / item.price) * 100)}% off` : "",
          }));
        } catch (error) {
          console.error("Fetch trending products error:", error.message);
          throw error;
        }
      },

      fetchActivityFeed: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");
          const response = await axios.get(`${BASE_URL}/products/activity`, {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          });
          const data = response.data;
          const products = data.results || data.products || (Array.isArray(data) ? data : []);
          return products.map(item => ({
            id: item._id || item.id,
            image: item.image_inner ? { uri: item.image_inner } : null,
            title: item.title,
            description: item.description,
            price: item.offer_price ? `$${item.price} - $${item.offer_price}` : `$${item.price}`,
          }));
        } catch (error) {
          console.error("Fetch activity feed error:", error.message);
          throw error;
        }
      },

      fetchPromotions: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");
          const response = await axios.get(`${BASE_URL}/promotions`, {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          });
          const data = response.data;
          const promotions = data.data || data.results || data.promotions || (Array.isArray(data) ? data : []);
          return promotions.map(item => ({
            id: item._id || item.id,
            image: item.banner_image ? { uri: item.banner_image } : null,
            title: item.title || item.name,
            shortDescription: item.description,
            price: item.price ? `$${item.price}` : "N/A",
            status: item.status,
            visibility: item.visibility,
            start_date: item.start_date,
            end_date: item.end_date,
          }));
        } catch (error) {
          console.error("Fetch promotions error:", error.message);
          throw error;
        }
      },

      addPromotion: async (payload) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing.");
          const response = await axios.post(`${BASE_URL}/promotions`, payload, {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          });
          return response.data;
        } catch (error) {
          console.error("Add promotion error:", error.message);
          throw error;
        }
      },

      fetchSubscriptions: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");
          const response = await axios.get(`${BASE_URL}/subscriptions`, {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          });
          return response.data;
        } catch (error) {
          console.error("Fetch subscriptions error:", error.message);
          throw error;
        }
      },

      subscribe: async (plan, paymentMethod) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");
          const response = await axios.post(
            `${BASE_URL}/subscriptions/subscribe`,
            { plan, payment_method: paymentMethod },
            { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } },
          );
          return response.data;
        } catch (error) {
          console.error("Subscribe error:", error.message);
          throw error;
        }
      },

      cancelSubscription: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");
          const response = await axios.delete(`${BASE_URL}/subscriptions/cancel`, {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          });
          return response.data;
        } catch (error) {
          console.error("Cancel subscription error:", error.message);
          throw error;
        }
      },

      // ✅ GET /api/stores/my-store — always replaces, never merges
      fetchStoreDetails: async () => {
  try {
    const { accessToken } = useStore.getState();
    if (!accessToken) throw new Error("Access token missing");

    const [storeRes, statsRes] = await Promise.allSettled([
      axios.get(`${BASE_URL}/stores/my-store`, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      }),
      axios.get(`${BASE_URL}/stores/my-store/stats`, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      }),
    ]);

    if (storeRes.status === 'rejected') {
      if (storeRes.reason?.response?.status === 404) { set({ store: null }); return null; }
      throw storeRes.reason;
    }

    const storeData = storeRes.value.data;

    // Merge weekly stats if the /stats endpoint exists
    const statsData = statsRes.status === 'fulfilled' ? statsRes.value.data : {};

    const merged = {
      ...storeData,
      views_this_week: statsData?.views_this_week ?? statsData?.weekly_views ?? storeData?.views_count ?? 0,
      monthly_views:   statsData?.monthly_views   ?? storeData?.views_count  ?? 0,
    };

    console.log('Fetch store details response:', merged);
    set({ store: merged });
    await AsyncStorage.setItem('store-details', JSON.stringify(merged));
    return merged;
  } catch (error) {
    if (error.response?.status === 404) { set({ store: null }); return null; }
    console.error('Fetch store details error:', error.message);
    throw error;
  }
},

      saveStoreDetails: async (storeData, hasStore = false) => {
        try {
          const { accessToken, user } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");
          const userId = user?._id || user?.id;

          const response = hasStore
            ? await axios.put(`${BASE_URL}/stores`, { ...storeData, user_id: userId }, {
                headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
              })
            : await axios.post(`${BASE_URL}/stores`, storeData, {
                headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
              });

          const data = response.data;
          const savedStore = data.store || storeData;
          set({ store: savedStore });
          await AsyncStorage.setItem("store-details", JSON.stringify(savedStore));
          return data;
        } catch (error) {
          console.error("Save store details error:", error.message);
          throw error;
        }
      },

      fetchNotifications: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");
          const response = await axios.get(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          });
          set({ notifications: response.data });
          return response.data;
        } catch (error) {
          console.error("Fetch notifications error:", error.message);
          throw error;
        }
      },

      markNotificationRead: async (notificationId) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");
          const response = await axios.put(`${BASE_URL}/notifications/${notificationId}/read`, {}, {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          });
          return response.data;
        } catch (error) {
          console.error("Mark notification read error:", error.message);
          throw error;
        }
      },

      fetchScans: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");
          const response = await axios.get(`${BASE_URL}/users/scans`, {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          });
          return response.data;
        } catch (error) {
          console.error("Fetch scans error:", error.message);
          throw error;
        }
      },

      recordScan: async (qrData, productName, category, image) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");
          const response = await axios.post(
            `${BASE_URL}/users/scan`,
            { qr_data: qrData, product_name: productName || qrData, category: category || "Uncategorized", image: image || null },
            { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } },
          );
          return response.data;
        } catch (error) {
          console.error("Record scan error:", error.message);
          throw error;
        }
      },

      deleteScan: async (scanId) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");
          const response = await axios.delete(`${BASE_URL}/users/scans/${scanId}`, {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          });
          return response.data;
        } catch (error) {
          console.error("Delete scan error:", error.message);
          throw error;
        }
      },
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // ✅ KEY FIX: Only persist token + firstOpen
      // user and store are EXCLUDED — they always come fresh from API
      // This prevents stale verified:false from cache overwriting fresh verified:true
      partialize: (state) => ({
        isFirstOpen:  state.isFirstOpen,
        accessToken:  state.accessToken,
      }),
    },
  ),
);

export default useStore;