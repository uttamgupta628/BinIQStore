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
      accessToken: null, // ✅ FIX: declared in initial state so hydration works correctly
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

          // ✅ FIX: backend returns array directly, field is category_name not name
          const cats = Array.isArray(data) ? data : data.results || data.categories || [];
          return cats.map((cat) => ({
            label: cat.category_name,
            value: cat._id,
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
      // Backend uses express.json() — NO multer — so send plain JSON.
      // image_inner and image_outer are stored as strings (local URI or S3 URL).
      addProduct: async (payload) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing.");

          console.log("Adding product...", payload);

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

          const products = data.results || data.products || (Array.isArray(data) ? data : []);
          return products.map((item) => ({
            id: item._id || item.id,
            image: item.image_inner ? { uri: item.image_inner } : null,  // schema: image_inner
            title: item.title,
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

          const products = data.results || data.products || (Array.isArray(data) ? data : []);
          return products.map((item) => ({
            id: item._id || item.id,
            image: item.image_inner ? { uri: item.image_inner } : null,  // schema: image_inner
            title: item.title,
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
              // ✅ FIX: prevent server/proxy from returning a cached response
              "Cache-Control": "no-cache",
            },
          });

          const data = response.data;
          console.log("Fetch store details response:", data);
          // ✅ always overwrite Zustand store so stale image URLs don't persist
          set({ store: data });
          await AsyncStorage.setItem("store-details", JSON.stringify(data));
          return data;
        } catch (error) {
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

      // POST /api/stores (create) or PUT /api/stores (update)
      // hasStore=true  → PUT  (update existing store, requires user_id in body)
      // hasStore=false → POST (create new store)
      saveStoreDetails: async (storeData, hasStore = false) => {
        try {
          const { accessToken, user } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          const userId = user?._id || user?.id;

          let response;
          if (hasStore) {
            // ✅ PUT /api/stores — update existing store
            console.log("Updating store details, store_image:", storeData.store_image);
            response = await axios.put(
              `${BASE_URL}/stores`,
              { ...storeData, user_id: userId },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              },
            );
          } else {
            // ✅ POST /api/stores — create new store
            console.log("Creating new store...");
            response = await axios.post(
              `${BASE_URL}/stores`,
              storeData,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              },
            );
          }

          const data = response.data;
          console.log("Save store details response:", data);

          // Cache the updated store in Zustand + AsyncStorage
          const savedStore = data.store || storeData;
          set({ store: savedStore });
          await AsyncStorage.setItem("store-details", JSON.stringify(savedStore));

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

      // ✅ POST /api/promotions
      addPromotion: async (payload) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing.");

          console.log("Adding promotion...", payload);
          const response = await axios.post(
            `${BASE_URL}/promotions`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          const data = response.data;
          console.log("Add promotion response:", data);
          return data;
        } catch (error) {
          console.error("Add promotion error:", error.message);
          if (error.response) {
            console.error("Response data:", JSON.stringify(error.response.data));
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