import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  StatusBar,
  Dimensions,
  Pressable,
  Image,
  TextInput,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import EditImage from "../../../assets/EditImage.svg";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import axios from "axios";
import useStore from "../../store/";
import { uploadImageToCloudinary } from "../../store/cloudinaryUpload";

const { width, height } = Dimensions.get("window");

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL MEDIA PLATFORM CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const SOCIAL_PLATFORMS = [
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/yourpage",
    color: "#1877F2",
    icon: "f",
    validate: (url) =>
      /^https?:\/\/(www\.)?(facebook\.com|fb\.com|fb\.watch)\/.+/i.test(url.trim()),
    errorMsg: "Must be a valid Facebook URL (facebook.com or fb.com)",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/yourhandle",
    color: "#E1306C",
    icon: "ig",
    validate: (url) =>
      /^https?:\/\/(www\.)?instagram\.com\/.+/i.test(url.trim()),
    errorMsg: "Must be a valid Instagram URL (instagram.com)",
  },
  {
    key: "twitter",
    label: "Twitter / X",
    placeholder: "https://twitter.com/yourhandle",
    color: "#000000",
    icon: "𝕏",
    validate: (url) =>
      /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/i.test(url.trim()),
    errorMsg: "Must be a valid Twitter/X URL (twitter.com or x.com)",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    placeholder: "https://wa.me/1234567890",
    color: "#25D366",
    icon: "wa",
    validate: (url) =>
      /^https?:\/\/(wa\.me\/\d+|(www\.)?whatsapp\.com\/(send|channel)\?.+|api\.whatsapp\.com\/.+)/i.test(url.trim()),
    errorMsg: "Must be a valid WhatsApp link (e.g. https://wa.me/1234567890)",
  },
];

const getSocialPlatform = (key) => SOCIAL_PLATFORMS.find((p) => p.key === key);

// ─────────────────────────────────────────────────────────────────────────────
// DAILY RATES CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const WEEK_DAYS = [
  "Friday",
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
];

const PRICE_OPTIONS = [
  { label: "$15.00", value: "15.00" },
  { label: "$14.00", value: "14.00" },
  { label: "$13.00", value: "13.00" },
  { label: "$12.00", value: "12.00" },
  { label: "$11.00", value: "11.00" },
  { label: "$10.00", value: "10.00" },
  { label: "$9.00",  value: "9.00"  },
  { label: "$8.00",  value: "8.00"  },
  { label: "$7.00",  value: "7.00"  },
  { label: "$6.00",  value: "6.00"  },
  { label: "$5.00",  value: "5.00"  },
  { label: "$4.00",  value: "4.00"  },
  { label: "$3.00",  value: "3.00"  },
  { label: "$2.00",  value: "2.00"  },
  { label: "$1.00",  value: "1.00"  },
  { label: "$0.50",  value: "0.50"  },
];

const DEFAULT_DAILY_RATES = WEEK_DAYS.reduce((acc, day) => {
  acc[day] = null;
  return acc;
}, {});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function EditProfileScreen({ openDrawer }) {
  const navigation = useNavigation();
  const { fetchStoreDetails, saveStoreDetails, user, accessToken } = useStore();

  // ── Dropdown / time picker visibility ──
  const [openStartDay, setOpenStartDay] = useState(false);
  const [openEndDay, setOpenEndDay] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // ── Rate picker modal ──
  const [ratePickerVisible, setRatePickerVisible] = useState(false);
  const [ratePickerDay, setRatePickerDay] = useState(null);

  // ── Loading states ──
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // ── Store fields ──
  const [valueStartDay, setValueStartDay] = useState("Monday");
  const [valueEndDay, setValueEndDay]     = useState("Sunday");
  const [valueStartTime, setValueStartTime] = useState(new Date());
  const [valueEndTime, setValueEndTime]     = useState(new Date());
  const [address, setAddress]           = useState("");
  const [city, setCity]                 = useState("");
  const [state, setState]               = useState("");
  const [zipCode, setZipCode]           = useState("");
  const [country, setCountry]           = useState("");
  const [storeName, setStoreName]       = useState("");
  const [websiteUrl, setWebsiteUrl]     = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [phoneNumber, setPhoneNumber]   = useState("");
  const [storeEmail, setStoreEmail]     = useState("");
  const [suggestions, setSuggestions]   = useState([]);
  const [hasStore, setHasStore]         = useState(false);

  // ── Daily rates ──
  const [dailyRates, setDailyRates] = useState(DEFAULT_DAILY_RATES);

  // ── Profile image state ──
  const [storeImageUrl, setStoreImageUrl]     = useState(null);
  const [storeImageLocal, setStoreImageLocal] = useState(null);
  const storeImageUrlRef          = useRef(null);
  const imageManuallyChangedRef   = useRef(false);

  // ── Gallery / multiple images state ──
  const [storeImages, setStoreImages]         = useState([]);
  const [uploadingIndexes, setUploadingIndexes] = useState([]);

  // ── Social media links ──
  const [facebookLink, setFacebookLink]   = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [twitterLink, setTwitterLink]     = useState("");
  const [whatsappLink, setWhatsappLink]   = useState("");

  const socialLinkMap = {
    facebook:  { value: facebookLink,  set: setFacebookLink  },
    instagram: { value: instagramLink, set: setInstagramLink },
    twitter:   { value: twitterLink,   set: setTwitterLink   },
    whatsapp:  { value: whatsappLink,  set: setWhatsappLink  },
  };

  const [activeSocialKeys, setActiveSocialKeys] = useState([]);
  const [socialErrors, setSocialErrors]         = useState({});

  const [days] = useState([
    { label: "Monday",    value: "Monday"    },
    { label: "Tuesday",   value: "Tuesday"   },
    { label: "Wednesday", value: "Wednesday" },
    { label: "Thursday",  value: "Thursday"  },
    { label: "Friday",    value: "Friday"    },
    { label: "Saturday",  value: "Saturday"  },
    { label: "Sunday",    value: "Sunday"    },
  ]);

  const API_KEY = "AIzaSyCY-8_-SbCN29nphT9QFtbzWV5H3asJQ4Q";

  // ─── Load store details on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken || !user) return;

    const loadStoreDetails = async () => {
      setIsLoading(true);
      try {
        const store = await fetchStoreDetails();
        if (!store) { setHasStore(false); return; }

        setHasStore(true);
        setStoreName(store.store_name || "");
        setAddress(store.address || "");
        setCity(store.city || "");
        setState(store.state || "");
        setZipCode(store.zip_code || "");
        setCountry(store.country || "");
        setGoogleMapsLink(store.google_maps_link || "");
        setWebsiteUrl(store.website_url || "");
        setPhoneNumber(store.phone_number || "");
        setStoreEmail(store.store_email || "");

        setFacebookLink(store.facebook_link || "");
        setInstagramLink(store.instagram_link || "");
        setTwitterLink(store.twitter_link || "");
        setWhatsappLink(store.whatsapp_link || "");

        const preLoaded = SOCIAL_PLATFORMS
          .filter((p) => store[`${p.key}_link`]?.trim())
          .map((p) => p.key);
        setActiveSocialKeys(preLoaded);

        if (!imageManuallyChangedRef.current) {
          setStoreImageUrl(store.store_image || null);
          storeImageUrlRef.current = store.store_image || null;
          setStoreImageLocal(store.store_image || null);
        }

        if (store.store_images && Array.isArray(store.store_images)) {
          setStoreImages(store.store_images);
        }

        if (store.daily_rates && typeof store.daily_rates === "object") {
          setDailyRates((prev) => ({ ...prev, ...store.daily_rates }));
        }

        if (store.working_days) {
          const parts = store.working_days.split(" - ");
          setValueStartDay(parts[0] || "Monday");
          setValueEndDay(parts[1] || "Sunday");
        }

        if (store.working_time) {
          const parts = store.working_time.split(" - ");
          if (parts.length === 2) {
            const startMatch = parts[0].match(/(\d+):(\d+)/);
            const endMatch   = parts[1].match(/(\d+):(\d+)/);
            if (startMatch) {
              const t = new Date();
              t.setHours(parseInt(startMatch[1]), parseInt(startMatch[2]));
              setValueStartTime(t);
            }
            if (endMatch) {
              const t = new Date();
              t.setHours(parseInt(endMatch[1]), parseInt(endMatch[2]));
              setValueEndTime(t);
            }
          }
        }
      } catch (error) {
        console.error("Error loading store details:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoreDetails();
  }, [accessToken]);

  // ─── Daily rate modal helpers ────────────────────────────────────────────────
  const openRatePicker = (day) => {
    setRatePickerDay(day);
    setRatePickerVisible(true);
  };

  const closeRatePicker = () => {
    setRatePickerVisible(false);
    setRatePickerDay(null);
  };

  const selectRate = (value) => {
    if (ratePickerDay) {
      setDailyRates((prev) => ({ ...prev, [ratePickerDay]: value }));
    }
    closeRatePicker();
  };

  const setDayRate = (day, value) => {
    setDailyRates((prev) => ({ ...prev, [day]: value }));
  };

  // ─── Profile image picker ────────────────────────────────────────────────────
  const handlePickStoreImage = () => {
    Alert.alert(
      "Store Image",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: () =>
            launchCamera(
              { mediaType: "photo", maxWidth: 800, maxHeight: 800 },
              (response) => handleImageResponse(response),
            ),
        },
        {
          text: "Gallery",
          onPress: () =>
            launchImageLibrary(
              { mediaType: "photo", maxWidth: 800, maxHeight: 800 },
              (response) => handleImageResponse(response),
            ),
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  const handleImageResponse = async (response) => {
    if (response.didCancel || response.errorCode) return;
    if (!response.assets || !response.assets[0]) return;

    const asset = response.assets[0];
    const imageFile = {
      uri: asset.uri,
      fileName: asset.fileName || `store_${Date.now()}.jpg`,
      type: asset.type || "image/jpeg",
    };

    setStoreImageLocal(asset.uri);
    setIsUploadingImage(true);
    try {
      const cloudinaryUrl = await uploadImageToCloudinary(imageFile, "biniq/stores");
      setStoreImageUrl(cloudinaryUrl);
      storeImageUrlRef.current = cloudinaryUrl;
      imageManuallyChangedRef.current = true;

      if (hasStore) {
        try {
          await saveStoreDetails({ store_image: cloudinaryUrl }, true);
        } catch (autoSaveError) {
          console.error("Auto-save store_image failed:", autoSaveError.message);
        }
      }
    } catch (error) {
      console.error("Store image upload failed:", error.message);
      Alert.alert("Upload Error", "Failed to upload image. Please try again.");
      setStoreImageLocal(storeImageUrl);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ─── Gallery image picker ────────────────────────────────────────────────────
  const handlePickAdditionalImages = () => {
    if (storeImages.length >= 10) {
      Alert.alert("Limit reached", "You can upload up to 10 store images.");
      return;
    }
    Alert.alert(
      "Add Store Photo",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: () =>
            launchCamera(
              { mediaType: "photo", maxWidth: 1200, maxHeight: 1200 },
              (response) => handleAdditionalImageResponse(response),
            ),
        },
        {
          text: "Gallery",
          onPress: () =>
            launchImageLibrary(
              {
                mediaType: "photo",
                maxWidth: 1200,
                maxHeight: 1200,
                selectionLimit: 10 - storeImages.length,
              },
              (response) => handleAdditionalImageResponse(response),
            ),
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  const handleAdditionalImageResponse = async (response) => {
    if (response.didCancel || response.errorCode) return;
    if (!response.assets || !response.assets.length) return;

    const assets = response.assets.slice(0, 10 - storeImages.length);
    const startIndex = storeImages.length;
    const placeholderIndexes = assets.map((_, i) => startIndex + i);

    setUploadingIndexes((prev) => [...prev, ...placeholderIndexes]);
    setStoreImages((prev) => [...prev, ...assets.map((a) => a.uri)]);

    const uploadedUrls = await Promise.all(
      assets.map(async (asset, i) => {
        try {
          const imageFile = {
            uri: asset.uri,
            fileName: asset.fileName || `store_gallery_${Date.now()}_${i}.jpg`,
            type: asset.type || "image/jpeg",
          };
          return await uploadImageToCloudinary(imageFile, "biniq/stores");
        } catch (err) {
          console.error("Gallery image upload failed:", err.message);
          return null;
        }
      }),
    );

    setStoreImages((prev) => {
      const updated = [...prev];
      placeholderIndexes.forEach((idx, i) => { updated[idx] = uploadedUrls[i] ?? null; });
      return updated.filter(Boolean);
    });

    setUploadingIndexes((prev) =>
      prev.filter((idx) => !placeholderIndexes.includes(idx)),
    );
  };

  const handleRemoveAdditionalImage = (index) => {
    Alert.alert("Remove Photo", "Are you sure you want to remove this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setStoreImages((prev) => prev.filter((_, i) => i !== index)),
      },
    ]);
  };

  // ─── Address autocomplete ────────────────────────────────────────────────────
  const fetchSuggestions = async (input) => {
    if (!input) { setSuggestions([]); return; }
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${API_KEY}`;
    try {
      const response = await axios.get(url);
      setSuggestions(response.data.status === "OK" ? response.data.predictions : []);
    } catch (error) {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    setAddress(suggestion.description);
    setSuggestions([]);
    const details = await geocodeAddress(suggestion.description);
    if (details) {
      setCity(details.city || "");
      setState(details.state || "");
      setZipCode(details.zipCode || "");
      setCountry(details.country || "");
    }
  };

  const geocodeAddress = async (addr) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addr)}&key=${API_KEY}`;
    try {
      const response = await axios.get(url);
      if (response.data.results.length > 0) {
        const components = response.data.results[0].address_components;
        let city = "", state = "", zipCode = "", country = "";
        components.forEach((c) => {
          if (c.types.includes("locality")) city = c.long_name;
          if (c.types.includes("administrative_area_level_1")) state = c.long_name;
          if (c.types.includes("postal_code")) zipCode = c.long_name;
          if (c.types.includes("country")) country = c.long_name;
        });
        return { city, state, zipCode, country };
      }
      return null;
    } catch { return null; }
  };

  // ─── Dropdown helpers (Working Days) ────────────────────────────────────────
  const handleOpenDropdown = (setOpen, isOpen, key) => {
    if (isOpen) {
      setOpen(false);
    } else {
      setOpen(true);
      if (key !== "startDay") setOpenStartDay(false);
      if (key !== "endDay")   setOpenEndDay(false);
    }
  };

  const handleTimeChange = (event, selectedDate, setTime, setShowPicker) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) setTime(selectedDate);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ─── Social media helpers ────────────────────────────────────────────────────
  const handleSocialAdd    = (key) => setActiveSocialKeys((prev) => [...prev, key]);

  const handleSocialRemove = (key) => {
    socialLinkMap[key].set("");
    setActiveSocialKeys((prev) => prev.filter((k) => k !== key));
    setSocialErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  };

  const handleSocialChange = (key, text) => {
    socialLinkMap[key].set(text);
    if (socialErrors[key]) {
      setSocialErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
    }
  };

  const handleSocialBlur = (key) => {
    const { value } = socialLinkMap[key];
    if (!value.trim()) return;
    const platform = getSocialPlatform(key);
    if (!platform.validate(value)) {
      setSocialErrors((prev) => ({ ...prev, [key]: platform.errorMsg }));
    } else {
      setSocialErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
    }
  };

  const validateAllSocialLinks = () => {
    const newErrors = {};
    activeSocialKeys.forEach((key) => {
      const { value } = socialLinkMap[key];
      if (!value.trim()) return;
      const platform = getSocialPlatform(key);
      if (!platform.validate(value)) newErrors[key] = platform.errorMsg;
    });
    setSocialErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!storeName.trim()) {
      Alert.alert("Error", "Please enter a store name.");
      return;
    }
    if (isUploadingImage) {
      Alert.alert("Please wait", "Profile image is still uploading...");
      return;
    }
    if (uploadingIndexes.length > 0) {
      Alert.alert("Please wait", "Gallery photos are still uploading...");
      return;
    }
    if (!validateAllSocialLinks()) {
      Alert.alert(
        "Invalid Social Links",
        "Please fix the highlighted social media URL errors before saving.",
      );
      return;
    }

    setIsLoading(true);
    try {
      const currentImageUrl = storeImageUrlRef.current;

      const storeData = {
        store_name:      storeName.trim(),
        address,
        city,
        state,
        zip_code:        zipCode,
        country,
        google_maps_link: googleMapsLink,
        website_url:     websiteUrl,
        working_days:    `${valueStartDay} - ${valueEndDay}`,
        working_time:    `${formatTime(valueStartTime)} - ${formatTime(valueEndTime)}`,
        phone_number:    phoneNumber,
        store_email:     storeEmail,
        facebook_link:   activeSocialKeys.includes("facebook")  ? facebookLink  || null : null,
        instagram_link:  activeSocialKeys.includes("instagram") ? instagramLink || null : null,
        twitter_link:    activeSocialKeys.includes("twitter")   ? twitterLink   || null : null,
        whatsapp_link:   activeSocialKeys.includes("whatsapp")  ? whatsappLink  || null : null,
        store_image:     currentImageUrl || null,
        store_images:    storeImages,
        daily_rates:     dailyRates,
      };

      const response = await saveStoreDetails(storeData, hasStore);
      console.log("Save response:", response);

      imageManuallyChangedRef.current = false;
      const updatedStore = await fetchStoreDetails();
      if (updatedStore?.store_image) {
        setStoreImageUrl(updatedStore.store_image);
        storeImageUrlRef.current = updatedStore.store_image;
        setStoreImageLocal(updatedStore.store_image);
      }
      if (updatedStore?.store_images && Array.isArray(updatedStore.store_images)) {
        setStoreImages(updatedStore.store_images);
      }

      Alert.alert("Success", hasStore ? "Store updated successfully!" : "Store created successfully!");
      setHasStore(true);
    } catch (error) {
      console.error("Save error:", error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || error.message || "Failed to save store details.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Loading splash ──────────────────────────────────────────────────────────
  if (isLoading && !hasStore && !storeName) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#130160" />
      </View>
    );
  }

  const availableSocialPlatforms = SOCIAL_PLATFORMS.filter(
    (p) => !activeSocialKeys.includes(p.key),
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.container}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={23} />
            </Pressable>
            <Text style={styles.headerText}>Edit Profile</Text>
          </View>
        </View>

        {/* ── No-store banner ── */}
        {!hasStore && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              You don't have a store yet. Fill in the details below to create one.
            </Text>
          </View>
        )}

        {/* ── Profile image ── */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handlePickStoreImage} activeOpacity={0.8}>
            {storeImageLocal ? (
              <Image
                source={{ uri: storeImageLocal, cache: "reload" }}
                style={styles.profilePicture}
              />
            ) : (
              <Image
                source={require("../../../assets/profile_img.png")}
                style={styles.profilePicture}
              />
            )}
            {isUploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.editBtn} onPress={handlePickStoreImage}>
            <EditImage width={wp(3)} />
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>
            {isUploadingImage ? "Uploading..." : "Tap to change photo"}
          </Text>
        </View>

        {/* ════════════════════════════════════════
            STORE DETAILS
        ════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Store Details</Text>

          <Text style={styles.label}>Store Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Hidden Finds"
              value={storeName}
              onChangeText={setStoreName}
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>

          <Text style={styles.label}>Address</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter your complete store address"
              value={address}
              onChangeText={(text) => { setAddress(text); fetchSuggestions(text); }}
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(item)}
                  >
                    <Text style={styles.suggestionText}>{item.description}</Text>
                  </TouchableOpacity>
                )}
                style={styles.suggestionList}
              />
            </View>
          )}

          <View style={styles.inputRow}>
            <View style={styles.inputContainerHalf}>
              <Text style={styles.label}>City</Text>
              <View style={styles.inputContainer}>
                <TextInput placeholder="City" value={city} onChangeText={setCity} style={styles.input} placeholderTextColor="#999" />
              </View>
            </View>
            <View style={styles.inputContainerHalf}>
              <Text style={styles.label}>State</Text>
              <View style={styles.inputContainer}>
                <TextInput placeholder="State" value={state} onChangeText={setState} style={styles.input} placeholderTextColor="#999" />
              </View>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainerHalf}>
              <Text style={styles.label}>Zip Code</Text>
              <View style={styles.inputContainer}>
                <TextInput placeholder="Zip Code" value={zipCode} onChangeText={setZipCode} style={styles.input} placeholderTextColor="#999" />
              </View>
            </View>
            <View style={styles.inputContainerHalf}>
              <Text style={styles.label}>Country</Text>
              <View style={styles.inputContainer}>
                <TextInput placeholder="Country" value={country} onChangeText={setCountry} style={styles.input} placeholderTextColor="#999" />
              </View>
            </View>
          </View>

          <Text style={styles.label}>Google Maps Link</Text>
          <View style={styles.inputContainer}>
            <TextInput placeholder="Google Maps Link" value={googleMapsLink} onChangeText={setGoogleMapsLink} style={styles.input} placeholderTextColor="gray" />
          </View>

          <Text style={styles.label}>Website URL</Text>
          <View style={styles.inputContainer}>
            <TextInput placeholder="Add website URL" value={websiteUrl} onChangeText={setWebsiteUrl} style={styles.input} placeholderTextColor="gray" />
          </View>
        </View>

        <View style={styles.divider} />

        {/* ════════════════════════════════════════
            STORE GALLERY
        ════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Store Gallery</Text>
          <Text style={styles.socialSubtitle}>
            Add up to 10 photos of your store (optional)
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.galleryScroll}
            contentContainerStyle={styles.galleryScrollContent}
            nestedScrollEnabled
          >
            {storeImages.map((uri, index) => (
              <View key={`gallery-${index}`} style={styles.galleryThumb}>
                <Image source={{ uri }} style={styles.galleryThumbImage} resizeMode="cover" />
                {uploadingIndexes.includes(index) ? (
                  <View style={styles.galleryThumbOverlay}>
                    <ActivityIndicator color="#fff" size="small" />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.galleryThumbRemove}
                    onPress={() => handleRemoveAdditionalImage(index)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={styles.galleryThumbRemoveText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {storeImages.length < 10 && (
              <TouchableOpacity
                style={styles.galleryAddBtn}
                onPress={handlePickAdditionalImages}
                activeOpacity={0.7}
              >
                <Text style={styles.galleryAddBtnIcon}>＋</Text>
                <Text style={styles.galleryAddBtnText}>
                  {storeImages.length === 0 ? "Add Photos" : "Add More"}
                </Text>
                <Text style={styles.galleryAddBtnCount}>{storeImages.length}/10</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        <View style={styles.divider} />

        {/* ════════════════════════════════════════
            BUSINESS DETAILS
        ════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Business Details</Text>

          <Text style={styles.label}>Working Days</Text>
          <View style={styles.dropdownRow}>
            <View style={[styles.dropdownContainer, { zIndex: 600 }]}>
              <DropDownPicker
                open={openStartDay}
                value={valueStartDay}
                items={days}
                setOpen={() => handleOpenDropdown(setOpenStartDay, openStartDay, "startDay")}
                setValue={setValueStartDay}
                placeholder="Start Day"
                style={styles.dropdown}
                textStyle={styles.dropdownText}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                ArrowDownIconComponent={() => <SimpleLineIcons name="arrow-down" size={20} color="#000" />}
                onSelectItem={() => setOpenStartDay(false)}
              />
            </View>
            <View style={[styles.dropdownContainer, { zIndex: 500 }]}>
              <DropDownPicker
                open={openEndDay}
                value={valueEndDay}
                items={days}
                setOpen={() => handleOpenDropdown(setOpenEndDay, openEndDay, "endDay")}
                setValue={setValueEndDay}
                placeholder="End Day"
                style={styles.dropdown}
                textStyle={styles.dropdownText}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                ArrowDownIconComponent={() => <SimpleLineIcons name="arrow-down" size={20} color="#000" />}
                onSelectItem={() => setOpenEndDay(false)}
              />
            </View>
          </View>

          <Text style={styles.label}>Working Time</Text>
          <View style={styles.dropdownRow}>
            <TouchableOpacity style={styles.timePickerButton} onPress={() => setShowStartTimePicker(true)}>
              <Text style={styles.timePickerText}>{formatTime(valueStartTime)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timePickerButton} onPress={() => setShowEndTimePicker(true)}>
              <Text style={styles.timePickerText}>{formatTime(valueEndTime)}</Text>
            </TouchableOpacity>
          </View>
          {showStartTimePicker && (
            <DateTimePicker
              value={valueStartTime}
              mode="time"
              display="default"
              onChange={(event, date) =>
                handleTimeChange(event, date, setValueStartTime, setShowStartTimePicker)
              }
            />
          )}
          {showEndTimePicker && (
            <DateTimePicker
              value={valueEndTime}
              mode="time"
              display="default"
              onChange={(event, date) =>
                handleTimeChange(event, date, setValueEndTime, setShowEndTimePicker)
              }
            />
          )}

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <TextInput placeholder="+97 23342234244" value={phoneNumber} onChangeText={setPhoneNumber} style={styles.input} placeholderTextColor="gray" />
          </View>

          <Text style={styles.label}>Store Email</Text>
          <View style={styles.inputContainer}>
            <TextInput placeholder="Enter your store email" value={storeEmail} onChangeText={setStoreEmail} style={styles.input} placeholderTextColor="gray" />
          </View>
        </View>

        <View style={styles.divider} />

        {/* ════════════════════════════════════════
            DAILY RATES
        ════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Daily Rates</Text>
          <Text style={styles.socialSubtitle}>
            Set an entry rate for each day of the week (optional)
          </Text>

          <View style={styles.dailyRatesContainer}>
            {WEEK_DAYS.map((day) => (
              <View key={day} style={styles.rateRow}>
                {/* Day label */}
                <View style={styles.rateDayLabel}>
                  <Text style={styles.rateDayText}>{day}</Text>
                </View>

                {/* Tappable selector — opens the modal */}
                <TouchableOpacity
                  style={styles.rateSelector}
                  onPress={() => openRatePicker(day)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={
                      dailyRates[day]
                        ? styles.rateSelectorValue
                        : styles.rateSelectorPlaceholder
                    }
                  >
                    {dailyRates[day]
                      ? `$${parseFloat(dailyRates[day]).toFixed(2)}`
                      : "Select rate"}
                  </Text>
                  <SimpleLineIcons name="arrow-down" size={14} color="#524B6B" />
                </TouchableOpacity>

                {/* Clear button */}
                {dailyRates[day] !== null && (
                  <TouchableOpacity
                    style={styles.rateClearBtn}
                    onPress={() => setDayRate(day, null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.rateClearBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* ════════════════════════════════════════
            SOCIAL MEDIA LINKS
        ════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Social Media Links</Text>
          <Text style={styles.socialSubtitle}>
            Add links to your store's social profiles (optional)
          </Text>

          {activeSocialKeys.map((key) => {
            const platform = getSocialPlatform(key);
            const { value } = socialLinkMap[key];
            const hasError = !!socialErrors[key];
            return (
              <View key={key} style={styles.socialLinkBlock}>
                <View style={styles.socialLinkRow}>
                  <View style={[styles.socialBadge, { backgroundColor: platform.color }]}>
                    <Text style={styles.socialBadgeText}>{platform.icon}</Text>
                  </View>
                  <View style={[styles.socialInputWrapper, hasError && styles.socialInputError]}>
                    <TextInput
                      style={styles.socialInput}
                      placeholder={platform.placeholder}
                      placeholderTextColor="#aaa"
                      value={value}
                      onChangeText={(text) => handleSocialChange(key, text)}
                      onBlur={() => handleSocialBlur(key)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.socialRemoveBtn}
                    onPress={() => handleSocialRemove(key)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.socialRemoveBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                {hasError && (
                  <Text style={styles.socialErrorText}>{socialErrors[key]}</Text>
                )}
              </View>
            );
          })}

          {availableSocialPlatforms.length > 0 && (
            <View style={styles.socialAddSection}>
              <Text style={styles.socialAddLabel}>
                {activeSocialKeys.length === 0 ? "Select a platform to add:" : "Add another:"}
              </Text>
              <View style={styles.socialAddButtons}>
                {availableSocialPlatforms.map((platform) => (
                  <TouchableOpacity
                    key={platform.key}
                    style={[styles.socialAddBtn, { borderColor: platform.color }]}
                    onPress={() => handleSocialAdd(platform.key)}
                  >
                    <View style={[styles.socialAddBtnDot, { backgroundColor: platform.color }]} />
                    <Text style={[styles.socialAddBtnText, { color: platform.color }]}>
                      {platform.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* ── Save / Create button ── */}
        <TouchableOpacity
          style={[
            styles.gettingStarted,
            (isLoading || isUploadingImage || uploadingIndexes.length > 0) && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={isLoading || isUploadingImage || uploadingIndexes.length > 0}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {hasStore ? "Save Changes" : "Create Store"}
            </Text>
          )}
        </TouchableOpacity>
      </ImageBackground>

      <View style={styles.bottomSpacer} />
      <ImageBackground
        source={require("../../../assets/vector_2.png")}
        style={styles.vector2}
      />

      {/* ════════════════════════════════════════
          RATE PICKER BOTTOM-SHEET MODAL
          Rendered outside ImageBackground so it
          covers the full screen correctly.
      ════════════════════════════════════════ */}
      <Modal
        visible={ratePickerVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeRatePicker}
      >
        {/* Semi-transparent backdrop — tap to dismiss */}
        <TouchableOpacity
          style={styles.rateModalBackdrop}
          activeOpacity={1}
          onPress={closeRatePicker}
        >
          {/* The sheet itself — stop touch propagation so taps inside don't close */}
          <TouchableOpacity activeOpacity={1} style={styles.rateModalSheet}>
            {/* Header */}
            <View style={styles.rateModalHeader}>
              <View style={styles.rateModalHandleBar} />
              <View style={styles.rateModalTitleRow}>
                <Text style={styles.rateModalTitle}>
                  {ratePickerDay ? `${ratePickerDay} Rate` : "Select Rate"}
                </Text>
                <TouchableOpacity onPress={closeRatePicker} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <MaterialIcons name="close" size={22} color="#555" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Scrollable options list */}
            <FlatList
              data={PRICE_OPTIONS}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              bounces
              contentContainerStyle={styles.rateModalList}
              renderItem={({ item }) => {
                const isSelected =
                  ratePickerDay && dailyRates[ratePickerDay] === item.value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.rateOption,
                      isSelected && styles.rateOptionSelected,
                    ]}
                    onPress={() => selectRate(item.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.rateOptionText,
                        isSelected && styles.rateOptionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <MaterialIcons name="check-circle" size={22} color="#130160" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  vector: { flex: 1, width: wp(100) },
  vector2: {
    width: wp(100),
    height: height * 2,
    position: "absolute",
    bottom: 0,
    zIndex: -1,
  },

  // ── Header ──
  header: {
    width: wp(100),
    height: hp(7),
    marginTop: "10%",
    paddingHorizontal: "5%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerChild: { flexDirection: "row", alignItems: "center", width: wp(50) },
  headerText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(3.2),
    color: "#0D0140",
    marginLeft: "3%",
  },

  // ── Banner ──
  infoBanner: {
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    marginHorizontal: "5%",
    marginTop: "3%",
    padding: 12,
  },
  infoBannerText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.8),
    color: "#856404",
  },

  // ── Profile image ──
  profileSection: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: "3%",
    marginBottom: hp(1),
  },
  profilePicture: { width: wp(26), height: wp(26), borderRadius: wp(13) },
  uploadingOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: wp(13),
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  editBtn: {
    width: wp(7.5),
    height: wp(7.5),
    backgroundColor: "#130160",
    position: "absolute",
    bottom: hp(2.5),
    right: wp(35),
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#fbfdff",
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.6),
    color: "#524B6B",
    marginTop: hp(0.8),
  },

  // ── Section ──
  sectionContainer: { padding: "5%" },
  sectionTitle: {
    fontFamily: "Nunito-SemiBold",
    fontSize: wp(5),
    color: "#000000",
    marginBottom: "5%",
  },
  label: {
    color: "black",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.8),
    marginTop: "1.5%",
  },

  // ── Inputs ──
  inputContainer: {
    backgroundColor: "#fff",
    width: "100%",
    height: hp(6.5),
    alignSelf: "center",
    borderRadius: 8,
    marginVertical: "2%",
    paddingHorizontal: "5%",
    justifyContent: "center",
    borderWidth: 0.4,
    borderColor: "#524B6B",
  },
  inputContainerHalf: { width: "48%" },
  input: { fontFamily: "Nunito-Regular", color: "#000", fontSize: hp(2.2) },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: "2%",
  },

  // ── Working days dropdowns ──
  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: "2%",
  },
  dropdownContainer: {
    width: "48%",
    alignSelf: "center",
    borderRadius: 8,
    justifyContent: "center",
    borderWidth: 0.1,
    borderColor: "#524B6B",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderColor: "#524B6B",
    height: hp(6),
    borderRadius: 6,
    borderWidth: 0.3,
  },
  dropdownText: { fontFamily: "Nunito-Regular", fontSize: 16, color: "#000" },
  dropdownContainerStyle: { borderColor: "#524B6B", backgroundColor: "#fff" },

  // ── Time picker ──
  timePickerButton: {
    backgroundColor: "#fff",
    width: "48%",
    height: hp(6),
    borderRadius: 6,
    borderWidth: 0.3,
    borderColor: "#524B6B",
    justifyContent: "center",
    alignItems: "center",
  },
  timePickerText: { fontFamily: "Nunito-Regular", fontSize: 16, color: "#000" },

  // ── Divider ──
  divider: {
    borderWidth: 0.3,
    borderColor: "#C4C4C4",
    width: wp(90),
    alignSelf: "center",
    marginTop: "6%",
  },

  // ── Save button ──
  gettingStarted: {
    backgroundColor: "#130160",
    width: "90%",
    height: hp(7),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: "5%",
  },
  disabledButton: { opacity: 0.6 },
  saveButtonText: {
    fontFamily: "Nunito-SemiBold",
    color: "#fff",
    fontSize: hp(2.5),
  },
  bottomSpacer: { height: hp(7) },

  // ── Address suggestions ──
  suggestionsContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    maxHeight: hp(20),
    marginTop: 5,
    zIndex: 1000,
  },
  suggestionList: { width: "100%" },
  suggestionItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  suggestionText: { fontFamily: "Nunito-Regular", fontSize: hp(1.8), color: "#000" },

  // ── Gallery ──
  galleryScroll: { marginTop: hp(0.5) },
  galleryScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1),
    paddingRight: wp(5),
  },
  galleryThumb: {
    width: wp(22),
    height: wp(22),
    borderRadius: 10,
    marginRight: wp(3),
    overflow: "visible",
  },
  galleryThumbImage: {
    width: wp(22),
    height: wp(22),
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  galleryThumbOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryThumbRemove: {
    position: "absolute",
    top: -wp(2.5),
    right: -wp(2.5),
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  galleryThumbRemoveText: { color: "#fff", fontSize: hp(1.4), fontFamily: "Nunito-Bold" },
  galleryAddBtn: {
    width: wp(22),
    height: wp(22),
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#130160",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F4FF",
  },
  galleryAddBtnIcon: { fontSize: hp(3), color: "#130160", lineHeight: hp(3.5) },
  galleryAddBtnText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.5),
    color: "#130160",
    marginTop: hp(0.3),
  },
  galleryAddBtnCount: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.3),
    color: "#888",
    marginTop: hp(0.2),
  },

  // ── Daily Rates rows ──
  dailyRatesContainer: { marginBottom: hp(1) },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.8),
    minHeight: hp(6.5),
  },
  rateDayLabel: { width: wp(26), paddingRight: wp(2) },
  rateDayText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.9),
    color: "#0D0140",
  },
  rateSelector: {
    flex: 1,
    height: hp(5.8),
    borderWidth: 0.4,
    borderColor: "#524B6B",
    borderRadius: 8,
    paddingHorizontal: wp(3),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  rateSelectorValue: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.8),
    color: "#000",
  },
  rateSelectorPlaceholder: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.8),
    color: "#999",
  },
  rateClearBtn: {
    marginLeft: wp(2.5),
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  rateClearBtnText: {
    fontSize: hp(1.6),
    color: "#666",
    fontFamily: "Nunito-Bold",
  },

  // ── Rate Picker Modal ──
  rateModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  rateModalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: hp(60),
    paddingBottom: Platform.OS === "ios" ? hp(4) : hp(2),
  },
  rateModalHeader: {
    alignItems: "center",
    paddingTop: hp(1.2),
    paddingBottom: hp(0.5),
    borderBottomWidth: 0.5,
    borderBottomColor: "#E8E8E8",
  },
  rateModalHandleBar: {
    width: wp(10),
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D0D0D0",
    marginBottom: hp(1.2),
  },
  rateModalTitleRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingBottom: hp(1),
  },
  rateModalTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.2),
    color: "#0D0140",
  },
  rateModalList: {
    paddingTop: hp(0.5),
    paddingBottom: hp(1),
  },
  rateOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.8),
    borderBottomWidth: 0.3,
    borderBottomColor: "#F0F0F0",
  },
  rateOptionSelected: { backgroundColor: "#F0EEFF" },
  rateOptionText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(2),
    color: "#333",
  },
  rateOptionTextSelected: {
    fontFamily: "Nunito-SemiBold",
    color: "#130160",
  },

  // ── Social media ──
  socialSubtitle: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.7),
    color: "#777",
    marginTop: -hp(2),
    marginBottom: hp(2),
  },
  socialLinkBlock: { marginBottom: hp(0.5) },
  socialLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.3),
  },
  socialBadge: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2),
  },
  socialBadgeText: { color: "#fff", fontFamily: "Nunito-Bold", fontSize: hp(1.6) },
  socialInputWrapper: {
    flex: 1,
    height: hp(6),
    borderWidth: 0.4,
    borderColor: "#524B6B",
    borderRadius: 8,
    paddingHorizontal: wp(3),
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  socialInputError: { borderColor: "#E53935", borderWidth: 1 },
  socialInput: { fontFamily: "Nunito-Regular", fontSize: hp(1.8), color: "#000" },
  socialRemoveBtn: {
    marginLeft: wp(2),
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  socialRemoveBtnText: { fontSize: hp(1.5), color: "#555" },
  socialErrorText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.5),
    color: "#E53935",
    marginLeft: wp(11),
    marginBottom: hp(0.8),
  },
  socialAddSection: { marginTop: hp(1.5) },
  socialAddLabel: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.7),
    color: "#524B6B",
    marginBottom: hp(1),
  },
  socialAddButtons: { flexDirection: "row", flexWrap: "wrap" },
  socialAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderRadius: 20,
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.8),
    backgroundColor: "#fff",
    marginRight: wp(2),
    marginBottom: hp(1),
  },
  socialAddBtnDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    marginRight: wp(1.5),
  },
  socialAddBtnText: { fontFamily: "Nunito-SemiBold", fontSize: hp(1.7) },
});