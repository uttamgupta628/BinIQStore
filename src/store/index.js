import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "https://biniq.onrender.com/api";

const useStore = create(
  persist(
    (set, get) => ({
      isFirstOpen: true,
      setFirstOpen: () => {
        console.log("Setting isFirstOpen to false");
        set({ isFirstOpen: false });
      },
      user: null,
      accessToken: null,
      product: null,
      store: null,
      subscription: null,
      notifications: [],

      // ─────────────────────────────────────────
      // AUTH
      // ─────────────────────────────────────────

      // ✅ POST /api/users/login
      login: async ({ email, password, role }) => {
        try {
          const response = await axios.post(
            `${BASE_URL}/users/login`,
            { email, password, role },
            { headers: { "Content-Type": "application/json" } },
          );
          const data = response.data;

          const token =
            data.token ||
            data.access ||
            data.accessToken ||
            data.access_token ||
            data.key;

          const user = data.user_details || data.user || data.data || data;

          if (!token) {
            throw new Error(data.message || "Login failed - no token received");
          }

          set({ user, accessToken: token });
          return data;
        } catch (error) {
          const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Login failed";
          throw new Error(message);
        }
      },

      logout: () => {
        set({
          user: null,
          product: null,
          store: null,
          subscription: null,
          accessToken: null,
          notifications: [],
        });
      },

      // ✅ POST /api/users/register
      signup: async ({
        full_name,
        email,
        phone_number,
        address,
        store_name,
        password,
        confirm_password,
        role,
      }) => {
        try {
          console.log("Signup API call:", `${BASE_URL}/users/register`);
          const response = await axios.post(
            `${BASE_URL}/users/register`,
            {
              full_name,
              email,
              phone_number,
              address,
              store_name,
              password,
              confirm_password,
              role,
            },
            { headers: { "Content-Type": "application/json" } },
          );
          const data = response.data;
          console.log("Signup response:", data);
          return data;
        } catch (error) {
          console.error("Signup error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw new Error(
            error.response?.data?.message ||
              error.response?.data?.error ||
              Object.values(error.response?.data || {})?.[0]?.[0] ||
              error.message ||
              "Signup failed",
          );
        }
      },

      // ✅ POST /api/users/forgot-password
      forgotPassword: async ({ email }) => {
        try {
          console.log(
            "Forgot Password API call:",
            `${BASE_URL}/users/forgot-password`,
          );
          const response = await axios.post(
            `${BASE_URL}/users/forgot-password`,
            { email },
            { headers: { "Content-Type": "application/json" } },
          );
          const data = response.data;
          console.log("Forgot Password response:", data);
          return data;
        } catch (error) {
          console.error("Forgot Password error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw new Error(
            error.response?.data?.message ||
              error.response?.data?.error ||
              error.message ||
              "Request failed",
          );
        }
      },

      // ✅ GET /api/users/profile
      fetchUserProfile: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          console.log("Fetching user profile...");
          const response = await axios.get(`${BASE_URL}/users/profile`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          });

          const data = response.data;
          console.log(
            "=== FETCH USER PROFILE RESPONSE ===",
            JSON.stringify(data),
          );

          const freshUser = data.user || data.user_details || data;

          const currentUser = useStore.getState().user;
          const mergedUser = {
            ...currentUser,
            ...freshUser,
            verified: freshUser.verified,
            subscription_end_time: freshUser.subscription_end_time,
            status: freshUser.status,
            total_scans: freshUser.total_scans,
            scans_used: freshUser.scans_used,
          };

          set({ user: mergedUser });
          return mergedUser;
        } catch (error) {
          console.error("Fetch user profile error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          return null;
        }
      },

      // ✅ GET /api/subscriptions
      fetchActiveSubscription: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const response = await axios.get(`${BASE_URL}/subscriptions`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          const data = response.data;
          console.log(
            "=== RAW SUBSCRIPTION RESPONSE ===",
            JSON.stringify(data),
          );

          const docs = Array.isArray(data) ? data : [];
          set({ subscription: docs });
          return docs;
        } catch (error) {
          console.error("Fetch active subscription error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          return null;
        }
      },

      // ─────────────────────────────────────────
      // PRODUCTS
      // ─────────────────────────────────────────

      // ✅ GET /api/products/:product_id
      fetchProductById: async (productId, localDataFallback = []) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          console.log("Fetching product by ID:", productId);
          const response = await axios.get(
            `${BASE_URL}/products/${productId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          const data = response.data;
          console.log("Fetch product by ID response:", JSON.stringify(data));
          set({ product: data });
          return data;
        } catch (error) {
          // 404 → fall back to local data silently (no WARN needed now — only hits
          // if the product genuinely doesn't exist or belongs to another user)
          if (error.response?.status === 404 && localDataFallback.length > 0) {
            const found = localDataFallback.find(
              (p) => (p.id || p._id) === productId,
            );
            if (found) {
              set({ product: found });
              return found;
            }
          }
          console.error("Fetch product by ID error:", error.message);
          // Return null instead of throwing so the UI can handle it gracefully
          return null;
        }
      },

      // ✅ GET /api/categories
      fetchCategories: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing.");

          const response = await axios.get(`${BASE_URL}/categories`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          const data = response.data;
          console.log("Categories response:", data);

          const cats = Array.isArray(data)
            ? data
            : data.results || data.categories || [];
          return cats.map((cat) => ({
            label: cat.category_name,
            value: cat._id,
          }));
        } catch (error) {
          console.error("Fetch categories error:", error.message);
          throw error;
        }
      },

      // ✅ POST /api/products
      addProduct: async (payload) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing.");

          const response = await axios.post(`${BASE_URL}/products`, payload, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });
          const data = response.data;
          console.log("Add product response:", data);
          return data;
        } catch (error) {
          console.error("Add product error:", error.message);
          throw error;
        }
      },

      // ✅ GET /api/products/trending
      fetchTrendingProducts: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const response = await axios.get(`${BASE_URL}/products/trending`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          const data = response.data;
          const products =
            data.results || data.products || (Array.isArray(data) ? data : []);

          return products.map((item) => ({
            // ── Keep both id forms so fetchProductById can match either ──
            id: item._id || item.id,
            _id: item._id || item.id,
            // ── Raw fields passed through so SingleItemPage can normalise them ──
            title: item.title,
            description: item.description,
            image_inner: item.image_inner || null,
            image_outer: item.image_outer || null,
            price: item.price,
            offer_price: item.offer_price || null,
            upc_id: item.upc_id || null,
            type: item.type,
            category_id: item.category_id || null,
            createdAt: item.createdAt || item.created_at || null,
            likes: item.likes || 0,
            // ── Legacy display fields for cards that still use them ──
            image: item.image_inner ? { uri: item.image_inner } : null,
            discountPrice: item.offer_price
              ? `$${item.offer_price}`
              : `$${item.price}`,
            originalPrice: item.offer_price ? `$${item.price}` : null,
            totalDiscount: item.offer_price
              ? `${
                  100 - Math.round((item.offer_price / item.price) * 100)
                }% off`
              : "",
          }));
        } catch (error) {
          console.error("Fetch trending products error:", error.message);
          throw error;
        }
      },

      // ✅ GET /api/products/activity
      fetchActivityFeed: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const response = await axios.get(`${BASE_URL}/products/activity`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          const data = response.data;
          const products =
            data.results || data.products || (Array.isArray(data) ? data : []);
          return products.map((item) => ({
            id: item._id || item.id,
            image: item.image_inner ? { uri: item.image_inner } : null,
            title: item.title,
            description: item.description,
            price: item.offer_price
              ? `$${item.price} - $${item.offer_price}`
              : `$${item.price}`,
          }));
        } catch (error) {
          console.error("Fetch activity feed error:", error.message);
          throw error;
        }
      },

      // ✅ GET /api/promotions
      fetchPromotions: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const response = await axios.get(`${BASE_URL}/promotions`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          const data = response.data;
          const promotions =
            data.data ||
            data.results ||
            data.promotions ||
            (Array.isArray(data) ? data : []);

          return promotions.map((item) => ({
            ...item,
            id: item._id || item.id,
            image: item.banner_image ? { uri: item.banner_image } : null,
            shortDescription: item.description,
          }));
        } catch (error) {
          console.error("Fetch promotions error:", error.message);
          throw error;
        }
      },

      // ✅ POST /api/promotions
      addPromotion: async (payload) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing.");

          const response = await axios.post(`${BASE_URL}/promotions`, payload, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });
          const data = response.data;
          console.log("Add promotion response:", data);
          return data;
        } catch (error) {
          console.error("Add promotion error:", error.message);
          if (error.response) {
            console.error(
              "Response data:",
              JSON.stringify(error.response.data),
            );
            console.error("Response status:", error.response.status);
          }
          throw error;
        }
      },

      // ─────────────────────────────────────────
      // SUBSCRIPTIONS
      // ─────────────────────────────────────────

      // ✅ GET /api/subscriptions
      fetchSubscriptions: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const response = await axios.get(`${BASE_URL}/subscriptions`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });
          const data = response.data;
          console.log("Fetch subscriptions response:", data);
          return data;
        } catch (error) {
          console.error("Fetch subscriptions error:", error.message);
          throw error;
        }
      },

      // ✅ POST /api/subscriptions/subscribe
      subscribe: async (plan, paymentMethod) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const response = await axios.post(
            `${BASE_URL}/subscriptions/subscribe`,
            { plan, payment_method: paymentMethod },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          const data = response.data;
          console.log("Subscribe response:", data);
          return data;
        } catch (error) {
          console.error("Subscribe error:", error.message);
          throw error;
        }
      },

      // ✅ DELETE /api/subscriptions/cancel
      cancelSubscription: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const response = await axios.delete(
            `${BASE_URL}/subscriptions/cancel`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          const data = response.data;
          console.log("Cancel subscription response:", data);
          return data;
        } catch (error) {
          console.error("Cancel subscription error:", error.message);
          throw error;
        }
      },

      // ─────────────────────────────────────────
      // STORE
      // ─────────────────────────────────────────

      // ✅ GET /api/stores/my-store
      // ✅ FIXED: removed misplaced component-level hook calls that were inside this function
      fetchStoreDetails: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const [storeRes, statsRes] = await Promise.allSettled([
            axios.get(`${BASE_URL}/stores/my-store`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
              },
            }),
            axios.get(`${BASE_URL}/stores/my-store/stats`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }),
          ]);

          if (storeRes.status === "rejected") {
            if (storeRes.reason?.response?.status === 404) {
              console.log("No store found for this user yet — skipping.");
              set({ store: null });
              return null;
            }
            throw storeRes.reason;
          }

          const storeData = storeRes.value.data;

          const statsData =
            statsRes.status === "fulfilled" ? statsRes.value.data : {};

          const merged = {
            ...storeData,
            views_this_week:
              statsData?.views_this_week ??
              statsData?.weekly_views ??
              storeData?.views_count ??
              0,
            monthly_views:
              statsData?.monthly_views ?? storeData?.views_count ?? 0,
          };

          console.log("Fetch store details response:", merged);
          set({ store: merged });
          await AsyncStorage.setItem("store-details", JSON.stringify(merged));
          return merged;
        } catch (error) {
          if (error.response?.status === 404) {
            console.log("No store found for this user yet — skipping.");
            set({ store: null });
            return null;
          }
          console.error("Fetch store details error:", error.message);
          throw error;
        }
      },

      // ✅ POST /api/stores (create) or PUT /api/stores (update)
      saveStoreDetails: async (storeData, hasStore = false) => {
        try {
          const { accessToken, user } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const userId = user?._id || user?.id;

          const response = hasStore
            ? await axios.put(
                `${BASE_URL}/stores`,
                { ...storeData, user_id: userId },
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                  },
                },
              )
            : await axios.post(`${BASE_URL}/stores`, storeData, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              });

          const data = response.data;
          console.log("Save store details response:", data);

          const savedStore = data.store || storeData;
          set({ store: savedStore });
          await AsyncStorage.setItem(
            "store-details",
            JSON.stringify(savedStore),
          );
          return data;
        } catch (error) {
          console.error("Save store details error:", error.message);
          throw error;
        }
      },

      // ─────────────────────────────────────────
      // NOTIFICATIONS
      // ─────────────────────────────────────────

      // ✅ GET /api/notifications
      fetchNotifications: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const response = await axios.get(`${BASE_URL}/notifications`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });
          const data = response.data;
          console.log("=== NOTIFICATIONS RAW ===", JSON.stringify(data));
          set({ notifications: data });
          return data;
        } catch (error) {
          console.error("Fetch notifications error:", error.message);
          throw error;
        }
      },

      // ✅ PUT /api/notifications/:notification_id/read
      markNotificationRead: async (notificationId) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          console.log("=== MARKING READ, ID ===", notificationId); // ADD

          const response = await axios.put(
            `${BASE_URL}/notifications/${notificationId}/read`,
            {},
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          console.log(
            "=== MARK READ RESPONSE ===",
            JSON.stringify(response.data),
          ); // ADD
          return response.data;
        } catch (error) {
          console.error("Mark notification read error:", error.message);
          console.error("=== MARK READ STATUS ===", error.response?.status); // ADD
          console.error(
            "=== MARK READ BODY ===",
            JSON.stringify(error.response?.data),
          ); // ADD
          throw error;
        }
      },

      // ─────────────────────────────────────────
      // SCANS
      // ─────────────────────────────────────────

      // ✅ GET /api/users/scans
      fetchScans: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const response = await axios.get(`${BASE_URL}/users/scans`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });
          console.log("Fetch scans response:", response.data);
          return response.data;
        } catch (error) {
          console.error("Fetch scans error:", error.message);
          throw error;
        }
      },

      // ✅ POST /api/users/scan
      recordScan: async (qrData, productName, category, image) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const response = await axios.post(
            `${BASE_URL}/users/scan`,
            {
              qr_data: qrData,
              product_name: productName || qrData,
              category: category || "Uncategorized",
              image: image || null,
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          console.log("Record scan response:", response.data);
          return response.data;
        } catch (error) {
          console.error("Record scan error:", error.message);
          throw error;
        }
      },

      // ✅ DELETE /api/users/scans/:scan_id
      deleteScan: async (scanId) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const response = await axios.delete(
            `${BASE_URL}/users/scans/${scanId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          console.log("Delete scan response:", response.data);
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
      // Only persist token + firstOpen.
      // user and store excluded — always come fresh from API.
      partialize: (state) => ({
        isFirstOpen: state.isFirstOpen,
        accessToken: state.accessToken,
      }),
    },
  ),
);

export default useStore;
