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
// Each entry defines: key (matches DB field prefix), label, placeholder,
// brand color, icon text, URL regex validator, and error message.
// ─────────────────────────────────────────────────────────────────────────────
const SOCIAL_PLATFORMS = [
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/yourpage",
    color: "#1877F2",
    icon: "f",
    validate: (url) =>
      /^https?:\/\/(www\.)?(facebook\.com|fb\.com|fb\.watch)\/.+/i.test(
        url.trim(),
      ),
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
      /^https?:\/\/(wa\.me\/\d+|(www\.)?whatsapp\.com\/(send|channel)\?.+|api\.whatsapp\.com\/.+)/i.test(
        url.trim(),
      ),
    errorMsg: "Must be a valid WhatsApp link (e.g. https://wa.me/1234567890)",
  },
];

const getSocialPlatform = (key) => SOCIAL_PLATFORMS.find((p) => p.key === key);

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

  // ── Loading states ──
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // ── Store fields ──
  const [valueStartDay, setValueStartDay] = useState("Monday");
  const [valueEndDay, setValueEndDay] = useState("Sunday");
  const [valueStartTime, setValueStartTime] = useState(new Date());
  const [valueEndTime, setValueEndTime] = useState(new Date());
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [storeName, setStoreName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [hasStore, setHasStore] = useState(false);

  // ── Image state ──
  // storeImageUrl: Cloudinary URL persisted to DB
  // storeImageLocal: local URI shown as preview
  const [storeImageUrl, setStoreImageUrl] = useState(null);
  const [storeImageLocal, setStoreImageLocal] = useState(null);
  const storeImageUrlRef = useRef(null); // avoids stale closure in handleSave
  const imageManuallyChangedRef = useRef(false); // prevents useEffect from overwriting new pick

  // ── Social media links ──
  const [facebookLink, setFacebookLink] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [twitterLink, setTwitterLink] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");

  // Social link map — keyed by platform key for easy lookup
  const socialLinkMap = {
    facebook: { value: facebookLink, set: setFacebookLink },
    instagram: { value: instagramLink, set: setInstagramLink },
    twitter: { value: twitterLink, set: setTwitterLink },
    whatsapp: { value: whatsappLink, set: setWhatsappLink },
  };

  // Which platform input rows are currently shown
  // Pre-populate from DB values on load (handled in useEffect below)
  const [activeSocialKeys, setActiveSocialKeys] = useState([]);

  // Per-field social URL validation errors
  const [socialErrors, setSocialErrors] = useState({});

  const [days] = useState([
    { label: "Monday", value: "Monday" },
    { label: "Tuesday", value: "Tuesday" },
    { label: "Wednesday", value: "Wednesday" },
    { label: "Thursday", value: "Thursday" },
    { label: "Friday", value: "Friday" },
    { label: "Saturday", value: "Saturday" },
    { label: "Sunday", value: "Sunday" },
  ]);

  const API_KEY = "AIzaSyCY-8_-SbCN29nphT9QFtbzWV5H3asJQ4Q";

  // ─── Load store details on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken || !user) return;

    const loadStoreDetails = async () => {
      setIsLoading(true);
      try {
        const store = await fetchStoreDetails();
        if (!store) {
          setHasStore(false);
          return;
        }

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

        // ── Social links from DB ──
        setFacebookLink(store.facebook_link || "");
        setInstagramLink(store.instagram_link || "");
        setTwitterLink(store.twitter_link || "");
        setWhatsappLink(store.whatsapp_link || "");

        // Show input rows for platforms that already have a saved value
        const preLoaded = SOCIAL_PLATFORMS.filter((p) =>
          store[`${p.key}_link`]?.trim(),
        ).map((p) => p.key);
        setActiveSocialKeys(preLoaded);

        // ── Store image ──
        if (!imageManuallyChangedRef.current) {
          setStoreImageUrl(store.store_image || null);
          storeImageUrlRef.current = store.store_image || null;
          setStoreImageLocal(store.store_image || null);
        }

        // ── Working days ──
        if (store.working_days) {
          const parts = store.working_days.split(" - ");
          setValueStartDay(parts[0] || "Monday");
          setValueEndDay(parts[1] || "Sunday");
        }

        // ── Working time ──
        if (store.working_time) {
          const parts = store.working_time.split(" - ");
          if (parts.length === 2) {
            const startMatch = parts[0].match(/(\d+):(\d+)/);
            const endMatch = parts[1].match(/(\d+):(\d+)/);
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

  // ─── Image picker ────────────────────────────────────────────────────────────
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
      const cloudinaryUrl = await uploadImageToCloudinary(
        imageFile,
        "biniq/stores",
      );
      setStoreImageUrl(cloudinaryUrl);
      storeImageUrlRef.current = cloudinaryUrl;
      imageManuallyChangedRef.current = true;
      console.log("Store image uploaded:", cloudinaryUrl);

      // Auto-save image immediately so it's never lost
      if (hasStore) {
        try {
          await saveStoreDetails({ store_image: cloudinaryUrl }, true);
          console.log("store_image auto-saved to DB:", cloudinaryUrl);
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

  // ─── Address autocomplete ────────────────────────────────────────────────────
  const fetchSuggestions = async (input) => {
    if (!input) {
      setSuggestions([]);
      return;
    }
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input,
    )}&key=${API_KEY}`;
    try {
      const response = await axios.get(url);
      const data = response.data;
      setSuggestions(data.status === "OK" ? data.predictions : []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
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
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      addr,
    )}&key=${API_KEY}`;
    try {
      const response = await axios.get(url);
      const data = response.data;
      if (data.results.length > 0) {
        const components = data.results[0].address_components;
        let city = "",
          state = "",
          zipCode = "",
          country = "";
        components.forEach((c) => {
          if (c.types.includes("locality")) city = c.long_name;
          if (c.types.includes("administrative_area_level_1"))
            state = c.long_name;
          if (c.types.includes("postal_code")) zipCode = c.long_name;
          if (c.types.includes("country")) country = c.long_name;
        });
        return { city, state, zipCode, country };
      }
      return null;
    } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
    }
  };

  // ─── Dropdown helpers ────────────────────────────────────────────────────────
  const handleOpenDropdown = (setOpen, isOpen, key) => {
    if (isOpen) {
      setOpen(false);
    } else {
      setOpen(true);
      if (key !== "startDay") setOpenStartDay(false);
      if (key !== "endDay") setOpenEndDay(false);
    }
  };

  const handleTimeChange = (event, selectedDate, setTime, setShowPicker) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) setTime(selectedDate);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ─── Social media helpers ────────────────────────────────────────────────────
  const handleSocialAdd = (key) => {
    setActiveSocialKeys((prev) => [...prev, key]);
  };

  const handleSocialRemove = (key) => {
    socialLinkMap[key].set("");
    setActiveSocialKeys((prev) => prev.filter((k) => k !== key));
    setSocialErrors((prev) => {
      const e = { ...prev };
      delete e[key];
      return e;
    });
  };

  const handleSocialChange = (key, text) => {
    socialLinkMap[key].set(text);
    // Clear error as user types
    if (socialErrors[key]) {
      setSocialErrors((prev) => {
        const e = { ...prev };
        delete e[key];
        return e;
      });
    }
  };

  const handleSocialBlur = (key) => {
    const { value } = socialLinkMap[key];
    if (!value.trim()) return; // empty = optional, no error
    const platform = getSocialPlatform(key);
    if (!platform.validate(value)) {
      setSocialErrors((prev) => ({ ...prev, [key]: platform.errorMsg }));
    } else {
      setSocialErrors((prev) => {
        const e = { ...prev };
        delete e[key];
        return e;
      });
    }
  };

  // Validate all active social links — returns true if all pass
  const validateAllSocialLinks = () => {
    const newErrors = {};
    activeSocialKeys.forEach((key) => {
      const { value } = socialLinkMap[key];
      if (!value.trim()) return; // optional
      const platform = getSocialPlatform(key);
      if (!platform.validate(value)) {
        newErrors[key] = platform.errorMsg;
      }
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
      Alert.alert("Please wait", "Image is still uploading...");
      return;
    }
    // Validate social links before saving
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
      console.log("Saving with store_image:", currentImageUrl);

      const storeData = {
        store_name: storeName.trim(),
        address,
        city,
        state,
        zip_code: zipCode,
        country,
        google_maps_link: googleMapsLink,
        website_url: websiteUrl,
        working_days: `${valueStartDay} - ${valueEndDay}`,
        working_time: `${formatTime(valueStartTime)} - ${formatTime(
          valueEndTime,
        )}`,
        phone_number: phoneNumber,
        store_email: storeEmail,
        // ── Social links: save value if active, otherwise null ──
        facebook_link: activeSocialKeys.includes("facebook")
          ? facebookLink || null
          : null,
        instagram_link: activeSocialKeys.includes("instagram")
          ? instagramLink || null
          : null,
        twitter_link: activeSocialKeys.includes("twitter")
          ? twitterLink || null
          : null,
        whatsapp_link: activeSocialKeys.includes("whatsapp")
          ? whatsappLink || null
          : null,
        // ── Image ──
        store_image: currentImageUrl || null,
      };

      const response = await saveStoreDetails(storeData, hasStore);
      console.log("Save response:", response);

      // Re-fetch so Zustand cache and image state are in sync
      imageManuallyChangedRef.current = false;
      const updatedStore = await fetchStoreDetails();
      if (updatedStore?.store_image) {
        setStoreImageUrl(updatedStore.store_image);
        storeImageUrlRef.current = updatedStore.store_image;
        setStoreImageLocal(updatedStore.store_image);
      }

      Alert.alert(
        "Success",
        hasStore
          ? "Store updated successfully!"
          : "Store created successfully!",
      );
      setHasStore(true);
    } catch (error) {
      console.error("Save error:", error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to save store details.",
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

  // Platforms not yet added (available to add)
  const availableSocialPlatforms = SOCIAL_PLATFORMS.filter(
    (p) => !activeSocialKeys.includes(p.key),
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.container}>
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
              You don't have a store yet. Fill in the details below to create
              one.
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
          <TouchableOpacity
            style={styles.editBtn}
            onPress={handlePickStoreImage}
          >
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
              onChangeText={(text) => {
                setAddress(text);
                fetchSuggestions(text);
              }}
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
                    <Text style={styles.suggestionText}>
                      {item.description}
                    </Text>
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
                <TextInput
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={styles.inputContainerHalf}>
              <Text style={styles.label}>State</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="State"
                  value={state}
                  onChangeText={setState}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainerHalf}>
              <Text style={styles.label}>Zip Code</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Zip Code"
                  value={zipCode}
                  onChangeText={setZipCode}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={styles.inputContainerHalf}>
              <Text style={styles.label}>Country</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Country"
                  value={country}
                  onChangeText={setCountry}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          <Text style={styles.label}>Google Maps Link</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Google Maps Link"
              value={googleMapsLink}
              onChangeText={setGoogleMapsLink}
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>

          <Text style={styles.label}>Website URL</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Add website URL"
              value={websiteUrl}
              onChangeText={setWebsiteUrl}
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>
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
                setOpen={() =>
                  handleOpenDropdown(setOpenStartDay, openStartDay, "startDay")
                }
                setValue={setValueStartDay}
                placeholder="Start Day"
                style={styles.dropdown}
                textStyle={styles.dropdownText}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                ArrowDownIconComponent={() => (
                  <SimpleLineIcons name="arrow-down" size={20} color="#000" />
                )}
                onSelectItem={() => setOpenStartDay(false)}
              />
            </View>
            <View style={[styles.dropdownContainer, { zIndex: 500 }]}>
              <DropDownPicker
                open={openEndDay}
                value={valueEndDay}
                items={days}
                setOpen={() =>
                  handleOpenDropdown(setOpenEndDay, openEndDay, "endDay")
                }
                setValue={setValueEndDay}
                placeholder="End Day"
                style={styles.dropdown}
                textStyle={styles.dropdownText}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                ArrowDownIconComponent={() => (
                  <SimpleLineIcons name="arrow-down" size={20} color="#000" />
                )}
                onSelectItem={() => setOpenEndDay(false)}
              />
            </View>
          </View>

          <Text style={styles.label}>Working Time</Text>
          <View style={styles.dropdownRow}>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.timePickerText}>
                {formatTime(valueStartTime)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.timePickerText}>
                {formatTime(valueEndTime)}
              </Text>
            </TouchableOpacity>
          </View>
          {showStartTimePicker && (
            <DateTimePicker
              value={valueStartTime}
              mode="time"
              display="default"
              onChange={(event, date) =>
                handleTimeChange(
                  event,
                  date,
                  setValueStartTime,
                  setShowStartTimePicker,
                )
              }
            />
          )}
          {showEndTimePicker && (
            <DateTimePicker
              value={valueEndTime}
              mode="time"
              display="default"
              onChange={(event, date) =>
                handleTimeChange(
                  event,
                  date,
                  setValueEndTime,
                  setShowEndTimePicker,
                )
              }
            />
          )}

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="+97 23342234244"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>

          <Text style={styles.label}>Store Email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter your store email"
              value={storeEmail}
              onChangeText={setStoreEmail}
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* ════════════════════════════════════════
            SOCIAL MEDIA LINKS
            — optional, select which platforms to add
            — per-platform URL validation on blur
            — values saved to DB on Save
        ════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Social Media Links</Text>
          <Text style={styles.socialSubtitle}>
            Add links to your store's social profiles (optional)
          </Text>

          {/* Active platform rows */}
          {activeSocialKeys.map((key) => {
            const platform = getSocialPlatform(key);
            const { value } = socialLinkMap[key];
            const hasError = !!socialErrors[key];

            return (
              <View key={key} style={styles.socialLinkBlock}>
                <View style={styles.socialLinkRow}>
                  {/* Coloured brand badge */}
                  <View
                    style={[
                      styles.socialBadge,
                      { backgroundColor: platform.color },
                    ]}
                  >
                    <Text style={styles.socialBadgeText}>{platform.icon}</Text>
                  </View>

                  {/* URL input */}
                  <View
                    style={[
                      styles.socialInputWrapper,
                      hasError && styles.socialInputError,
                    ]}
                  >
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

                  {/* Remove button */}
                  <TouchableOpacity
                    style={styles.socialRemoveBtn}
                    onPress={() => handleSocialRemove(key)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.socialRemoveBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Inline validation error */}
                {hasError && (
                  <Text style={styles.socialErrorText}>
                    {socialErrors[key]}
                  </Text>
                )}
              </View>
            );
          })}

          {/* Add platform buttons — only shown for platforms not yet added */}
          {availableSocialPlatforms.length > 0 && (
            <View style={styles.socialAddSection}>
              <Text style={styles.socialAddLabel}>
                {activeSocialKeys.length === 0
                  ? "Select a platform to add:"
                  : "Add another:"}
              </Text>
              <View style={styles.socialAddButtons}>
                {availableSocialPlatforms.map((platform) => (
                  <TouchableOpacity
                    key={platform.key}
                    style={[
                      styles.socialAddBtn,
                      { borderColor: platform.color },
                    ]}
                    onPress={() => handleSocialAdd(platform.key)}
                  >
                    <View
                      style={[
                        styles.socialAddBtnDot,
                        { backgroundColor: platform.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.socialAddBtnText,
                        { color: platform.color },
                      ]}
                    >
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
            (isLoading || isUploadingImage) && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={isLoading || isUploadingImage}
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
    textAlign: "left",
    color: "#0D0140",
    marginLeft: "3%",
  },
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
  profileSection: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: "3%",
    marginBottom: hp(1),
  },
  profilePicture: { width: wp(26), height: wp(26), borderRadius: wp(13) },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  divider: {
    borderWidth: 0.3,
    borderColor: "#C4C4C4",
    width: wp(90),
    alignSelf: "center",
    marginTop: "6%",
  },
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
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  suggestionText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.8),
    color: "#000",
  },

  // ── Social media ──
  socialSubtitle: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.7),
    color: "#777",
    marginTop: -hp(2), // pull up under title
    marginBottom: hp(2),
  },
  socialLinkBlock: {
    marginBottom: hp(0.5),
  },
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
  socialBadgeText: {
    color: "#fff",
    fontFamily: "Nunito-Bold",
    fontSize: hp(1.6),
  },
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
  socialInputError: {
    borderColor: "#E53935",
    borderWidth: 1,
  },
  socialInput: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.8),
    color: "#000",
  },
  socialRemoveBtn: {
    marginLeft: wp(2),
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  socialRemoveBtnText: {
    fontSize: hp(1.5),
    color: "#555",
  },
  socialErrorText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.5),
    color: "#E53935",
    marginLeft: wp(11), // align under input (badge width + gap)
    marginBottom: hp(0.8),
  },
  socialAddSection: {
    marginTop: hp(1.5),
  },
  socialAddLabel: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.7),
    color: "#524B6B",
    marginBottom: hp(1),
  },
  socialAddButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
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
  socialAddBtnText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.7),
  },
});
