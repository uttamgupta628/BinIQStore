import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ✅ Single source of truth — Express backend only
const BASE_URL = "http://192.168.29.162:3001/api";

const useStore = create(
  persist(
    (set) => ({
      isFirstOpen: true,
      setFirstOpen: () => {
        console.log("Setting isFirstOpen to false");
        set({ isFirstOpen: false });
      },
      user: null,
      product: null,
      store: null,
      notifications: [],

      // ─────────────────────────────────────────
      // AUTH
      // ─────────────────────────────────────────

      // ✅ POST /api/users/login
      login: async ({ email, password }) => {
        try {
          console.log("Login API call:", `${BASE_URL}/users/login`);
          const response = await axios.post(
            `${BASE_URL}/users/login`,
            { email, password },
            { headers: { "Content-Type": "application/json" } },
          );
          const data = response.data;

          console.log("=== FULL LOGIN RESPONSE ===", JSON.stringify(data));
          console.log("=== KEYS ===", Object.keys(data));

          // Express userController login returns: { token, user_details }
          const token =
            data.token ||
            data.access ||
            data.accessToken ||
            data.access_token ||
            data.key;

          const user =
            data.user_details ||
            data.user ||
            data.data ||
            data;

          if (!token) {
            console.error("No token found in response:", Object.keys(data));
            throw new Error(data.message || "Login failed");
          }

          console.log("✅ Token found:", token.substring(0, 20) + "...");
          console.log("✅ User:", JSON.stringify(user));

          set({ user, accessToken: token });
          return data;
        } catch (error) {
          console.error("Login error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw new Error(
            error.response?.data?.message ||
              error.response?.data?.detail ||
              error.message ||
              "Login failed",
          );
        }
      },

      logout: () => {
        set({
          user: null,
          product: null,
          store: null,
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
          console.log("Forgot Password API call:", `${BASE_URL}/users/forgot-password`);
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

      // ─────────────────────────────────────────
      // PRODUCTS
      // ─────────────────────────────────────────

      // ✅ GET /api/products/:product_id
      fetchProductById: async (productId) => {
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
          console.log("Fetch product by ID response:", data);
          set({ product: data });
          return data;
        } catch (error) {
          console.error("Fetch product by ID error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw error;
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

          const cats = data.results || data.categories || data || [];
          return cats.map((cat) => ({
            label: cat.name || cat.category_name,
            value: cat.id || cat._id,
          }));
        } catch (error) {
          console.error("Fetch categories error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw error;
        }
      },

      // ✅ POST /api/products
      addProduct: async (productData) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing.");

          const payload = {
            name: productData.title,
            description: productData.description,
            category: productData.category_id,
            price: productData.price,
            quantity: productData.quantity,
            images: productData.pic ? [productData.pic] : [],
          };
          console.log("Adding product, payload:", payload);

          const response = await axios.post(
            `${BASE_URL}/products`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          const data = response.data;
          console.log("Add product response:", data);
          return data;
        } catch (error) {
          console.error("Add product error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw error;
        }
      },

      // ✅ GET /api/products/trending
      fetchTrendingProducts: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          console.log("Fetching trending products...");
          const response = await axios.get(`${BASE_URL}/products/trending`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          const data = response.data;
          console.log("Trending products response:", data);

          const products = data.results || data.products || data || [];
          return products.map((item) => ({
            id: item._id || item.id,
            image: item.images?.[0] ? { uri: item.images[0] } : null,
            title: item.name || item.title,
            description: item.description,
            discountPrice: `$${item.offer_price || item.price}`,
            originalPrice: `$${item.price}`,
            totalDiscount: item.offer_price
              ? `${100 - Math.round((item.offer_price / item.price) * 100)}% off`
              : "",
          }));
        } catch (error) {
          console.error("Fetch trending products error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw error;
        }
      },

      // ✅ GET /api/products/activity
      fetchActivityFeed: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          console.log("Fetching activity feed...");
          const response = await axios.get(`${BASE_URL}/products/activity`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          const data = response.data;
          console.log("Activity feed response:", data);

          const products = data.results || data.products || data || [];
          return products.map((item) => ({
            id: item._id || item.id,
            image: item.images?.[0] ? { uri: item.images[0] } : null,
            title: item.name || item.title,
            description: item.description,
            price: item.offer_price
              ? `$${item.price} - $${item.offer_price}`
              : `$${item.price}`,
          }));
        } catch (error) {
          console.error("Fetch activity feed error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw error;
        }
      },

      // ✅ GET /api/promotions
      fetchPromotions: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          console.log("Fetching promotions...");
          const response = await axios.get(`${BASE_URL}/promotions`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          const data = response.data;
          console.log("Promotions response:", data);

          // Express returns: { success: true, data: [] }
          const promotions = data.data || data.results || data.promotions || (Array.isArray(data) ? data : []);

          return promotions.map((item) => ({
            id: item._id || item.id,
            image: item.images?.[0] ? { uri: item.images[0] } : null,
            title: item.title || item.name,
            shortDescription: item.description,
            price: item.offer_price
              ? `$${item.price} - $${item.offer_price}`
              : `$${item.price}`,
          }));
        } catch (error) {
          console.error("Fetch promotions error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw error;
        }
      },

      // ─────────────────────────────────────────
      // STORE
      // ─────────────────────────────────────────

      // ✅ GET /api/stores/my-store
      fetchStoreDetails: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          console.log("Fetching store details...");
          const response = await axios.get(`${BASE_URL}/stores/my-store`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          const data = response.data;
          console.log("Fetch store details response:", data);
          set({ store: data });
          await AsyncStorage.setItem("store-details", JSON.stringify(data));
          return data;
        } catch (error) {
          // 404 = user has not created a store yet — not a real crash
          if (error.response?.status === 404) {
            console.log("No store found for this user yet — skipping.");
            set({ store: null });
            return null;
          }
          console.error("Fetch store details error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw error;
        }
      },

      // ✅ PUT /api/stores
      saveStoreDetails: async (storeData) => {
        try {
          const { accessToken, user } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          console.log("Saving store details...");
          const response = await axios.put(
            `${BASE_URL}/stores`,
            { ...storeData, user_id: user._id || user.id },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          const data = response.data;
          console.log("Save store details response:", data);

          if (data.store) {
            set({ store: data.store });
            await AsyncStorage.setItem(
              "store-details",
              JSON.stringify(data.store),
            );
          }
          return data;
        } catch (error) {
          console.error("Save store details error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
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

          console.log("Fetching notifications...");
          const response = await axios.get(`${BASE_URL}/notifications`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          const data = response.data;
          console.log("Fetch notifications response:", data);
          set({ notifications: data });
          return data;
        } catch (error) {
          console.error("Fetch notifications error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw error;
        }
      },

      // ✅ PUT /api/notifications/:notification_id/read
      markNotificationRead: async (notificationId) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

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
          console.log("Mark notification read response:", response.data);
          return response.data;
        } catch (error) {
          console.error("Mark notification read error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw error;
        }
      },

      // ─────────────────────────────────────────
      // SCANS — live under /api/users/ in Express
      // ─────────────────────────────────────────

      // ✅ GET /api/users/scans
      fetchScans: async () => {
        try {
          const { accessToken } = useStore.getState();
          console.log(
            "fetchScans: accessToken =",
            accessToken ? "✅ present" : "❌ MISSING",
          );
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
          if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
          }
          throw error;
        }
      },

      // ✅ POST /api/users/scan  (singular — that's the Express route)
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
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
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
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw error;
        }
      },
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useStore;