import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

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
      notifications: { todays: [], yesturdays: [], olders: [] },
      login: async ({ email, password }) => {
        try {
          console.log(
            "Login API call:",
            `https://api.biniq.net/api/users/login`,
          );
          const response = await axios.post(
            `https://api.biniq.net/api/users/login`,
            { email, password },
          );
          const data = response.data;
          console.log("Login response:", data);
          if (!data.access) {
            throw new Error(data.message || "Login failed");
          }
          set({
            user: data.user,
            accessToken: data.access,
            refreshToken: data.refresh,
          });
          return data;
        } catch (error) {
          console.error("Login error:", error.message);
          throw new Error(
            error.response?.data?.message || error.message || "Login failed",
          );
        }
      },
      forgotPassword: async ({ email }) => {
        try {
          console.log(
            "Forgot Password API call:",
            `https://api.biniq.net/api/users/forgot-password`,
          );
          const response = await axios.post(
            `https://api.biniq.net/api/users/forgot-password`, // ✅ correct endpoint
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
              Object.values(error.response?.data || {})?.[0]?.[0] ||
              error.message ||
              "Request failed",
          );
        }
      },
      logout: () => {
        set({ user: null, product: null });
      },
      fetchProductById: async (productId) => {
        try {
          const { user } = useStore.getState();
          if (!user || !user.api_key) {
            throw new Error("User not logged in or API key missing");
          }
          const response = await axios.post(
            `https://binq.paywin24.com/api/get-product-by-id`,
            { product_id: productId },
            {
              headers: {
                apiToken: user.api_key,
                "Content-Type": "application/json",
              },
            },
          );
          const data = response.data;
          if (!data.success) {
            throw new Error(data.message || "Failed to fetch product");
          }
          set({ product: data.product });
          return data.product;
        } catch (error) {
          console.error("Fetch product by ID error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw error;
        }
      },
      fetchCategories: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing.");

          const response = await axios.get(
            `https://api.biniq.net/api/products/AddCategory`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          const data = response.data;
          console.log("Categories response:", data);

          const cats = data.results || data.categories || data || [];
          return cats.map((cat) => ({
            label: cat.name || cat.category_name,
            value: cat.id,
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

      addProduct: async (productData) => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing.");

          console.log("Adding product...");
          console.log("Payload:", {
            name: productData.title,
            description: productData.description,
            category: productData.category_id,
            price: productData.price,
            quantity: productData.quantity,
            images: productData.pic ? [productData.pic] : [],
          });

          const response = await axios.post(
            `https://api.biniq.net/api/products/products`,
            {
              name: productData.title,
              description: productData.description,
              category: productData.category_id,
              price: productData.price,
              quantity: productData.quantity,
              images: productData.pic ? [productData.pic] : [],
            },
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
      fetchStoreDetails: async () => {
        try {
          const { user } = useStore.getState();
          if (!user || !user.api_key) {
            throw new Error("User not logged in or API key missing");
          }
          const response = await axios.post(
            `https://binq.paywin24.com/api/get-store-details`,
            {},
            {
              headers: {
                apiToken: user.api_key,
                "Content-Type": "application/json",
              },
            },
          );
          const data = response.data;
          if (!data.success) {
            throw new Error(data.message || "Failed to fetch store details");
          }
          set({ store: data.store });
          await AsyncStorage.setItem(
            "store-details",
            JSON.stringify(data.store),
          );
          return data.store;
        } catch (error) {
          console.error("Fetch store details error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw error;
        }
      },
      saveStoreDetails: async (storeData) => {
        try {
          const { user } = useStore.getState();
          if (!user || !user.api_key) {
            throw new Error("User not logged in or API key missing");
          }
          const response = await axios.post(
            `https://binq.paywin24.com/api/add-store-details`,
            storeData,
            {
              headers: {
                apiToken: user.api_key,
                "Content-Type": "application/json",
              },
            },
          );
          const data = response.data;
          if (data.success) {
            await AsyncStorage.setItem(
              "store-details",
              JSON.stringify(data.store),
            );
          }
          return data;
        } catch (error) {
          console.error("Save store details error:", error.message);
          throw error;
        }
      },
      fetchTrendingProducts: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          console.log("Fetching trending products...");
          const response = await axios.get(
            "https://api.biniq.net/api/products/trending",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          const data = response.data;
          console.log("Trending products response:", data);

          // adjust mapping based on actual API response shape
          const products = data.results || data.products || data || [];
          return products.map((item) => ({
            id: item.id,
            image: item.images?.[0] ? { uri: item.images[0] } : null,
            title: item.name || item.title,
            description: item.description,
            discountPrice: `$${item.offer_price || item.price}`,
            originalPrice: `$${item.price}`,
            totalDiscount: item.offer_price
              ? `${
                  100 - Math.round((item.offer_price / item.price) * 100)
                }% off`
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

      fetchActivityFeed: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          console.log("Fetching activity feed...");
          const response = await axios.get(
            "https://api.biniq.net/api/products/activity",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          const data = response.data;
          console.log("Activity feed response:", data);

          const products = data.results || data.products || data || [];
          return products.map((item) => ({
            id: item.id,
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

      fetchPromotions: async () => {
        try {
          const { accessToken } = useStore.getState();
          if (!accessToken) throw new Error("Access token missing");

          console.log("Fetching promotions...");
          const response = await axios.get(
            "https://api.biniq.net/api/promotions",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          const data = response.data;
          console.log("Promotions response:", data);

          const promotions = data.results || data.promotions || data || [];
          return promotions.map((item) => ({
            id: item.id,
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

      //  signup function
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
          // Split full_name into first and last
          const nameParts = full_name.trim().split(" ");
          const first_name = nameParts[0] || "";
          const last_name = nameParts.slice(1).join(" ") || "";

          console.log(
            "Signup API call:",
            `https://api.biniq.net/api/users/register`,
          );
          console.log("Signup payload:", {
            first_name,
            last_name,
            email,
            phone_number,
            address,
            store_name,
            password,
            confirm_password,
            role,
          });

          const response = await axios.post(
            `https://api.biniq.net/api/users/register`,
            {
              first_name, // ✅ send separately
              last_name, // ✅ send separately
              email,
              phone_number,
              address,
              store_name,
              password,
              confirm_password,
              role,
            },
            {
              headers: { "Content-Type": "application/json" },
            },
          );

          const data = response.data;
          console.log("Signup response:", data);

          if (!data.email) {
            throw new Error(data.message || "Signup failed");
          }

          set({ user: data });
          return data;
        } catch (error) {
          console.error("Signup error:", error.message);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
          throw new Error(
            error.response?.data?.message ||
              Object.values(error.response?.data || {})?.[0]?.[0] ||
              error.message ||
              "Signup failed",
          );
        }
      },

      fetchNotifications: async () => {
        try {
          const { user } = useStore.getState();
          if (!user || !user.api_key) {
            throw new Error("User not logged in or API key missing");
          }
          const response = await axios.post(
            `https://binq.paywin24.com/api/notifiation`,
            {},
            {
              headers: {
                apiToken: user.api_key,
                "Content-Type": "application/json",
              },
            },
          );
          const data = response.data;
          if (!data.success) {
            throw new Error(data.message || "Failed to fetch notifications");
          }
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

      // ✅ ADD THESE before the last closing }),
recordScan: async (qrData, productName, category, image) => {
  try {
    const { accessToken } = useStore.getState();
    if (!accessToken) throw new Error("Access token missing");

    const response = await axios.post(
      "http://192.168.29.162:3001/api/users/scan",
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

fetchScans: async () => {
  try {
    const { accessToken } = useStore.getState();
    if (!accessToken) throw new Error("Access token missing");

    const response = await axios.get(
      "http://192.168.29.162:3001/api/users/scans",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Fetch scans response:", response.data);
    return response.data; // { success, total_scans, scans_remaining, scans: [] }
  } catch (error) {
    console.error("Fetch scans error:", error.message);
    throw error;
  }
},

deleteScan: async (scanId) => {
  try {
    const { accessToken } = useStore.getState();
    if (!accessToken) throw new Error("Access token missing");

    const response = await axios.delete(
      `http://192.168.29.162:3001/api/users/scans/${scanId}`,
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
    },
  ),
  
);

export default useStore;
