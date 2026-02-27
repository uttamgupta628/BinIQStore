import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Upload_Photo_Icon from "../../../assets/Upload_Photo_Icon.svg";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import useStore from "../../store";
import { uploadImageToCloudinary } from "../../store/cloudinaryUpload";

const NewPromotionScreen = () => {
  const navigation = useNavigation();
  const { fetchCategories, addPromotion } = useStore();

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [upcId, setUpcId] = useState("");
  const [price, setPrice] = useState("");
  const [bannerImage, setBannerImage] = useState(null);     // local URI for preview
  const [bannerImageUrl, setBannerImageUrl] = useState(null); // Cloudinary URL for save

  // Dropdowns
  const [openCategory, setOpenCategory] = useState(false);
  const [valueCategory, setValueCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  const [openStatus, setOpenStatus] = useState(false);
  const [valueStatus, setValueStatus] = useState("Active");
  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  const [openVisibility, setOpenVisibility] = useState(false);
  const [valueVisibility, setValueVisibility] = useState("On");
  const visibilityOptions = [
    { label: "On", value: "On" },
    { label: "Off", value: "Off" },
  ];

  // Date pickers
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // +7 days
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Error loading categories:", error.message);
      }
    };
    loadCategories();
  }, []);

  const handleImagePick = () => {
    Alert.alert(
      "Select Banner Image",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: () =>
            launchCamera(
              { mediaType: "photo", maxWidth: 800, maxHeight: 600 },
              (response) => handleImageResponse(response)
            ),
        },
        {
          text: "Gallery",
          onPress: () =>
            launchImageLibrary(
              { mediaType: "photo", maxWidth: 800, maxHeight: 600 },
              (response) => handleImageResponse(response)
            ),
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const handleImageResponse = async (response) => {
    if (response.didCancel || response.errorCode) return;
    if (!response.assets || !response.assets[0]) return;

    const asset = response.assets[0];
    setBannerImage(asset.uri); // show preview immediately

    setIsUploadingImage(true);
    try {
      const imageFile = {
        uri: asset.uri,
        fileName: asset.fileName || `promotion_${Date.now()}.jpg`,
        type: asset.type || "image/jpeg",
      };
      const cloudinaryUrl = await uploadImageToCloudinary(imageFile, "biniq/promotions");
      setBannerImageUrl(cloudinaryUrl);
      console.log("Banner uploaded:", cloudinaryUrl);
    } catch (error) {
      console.error("Banner upload failed:", error.message);
      Alert.alert("Upload Error", "Failed to upload image. Please try again.");
      setBannerImage(null);
      setBannerImageUrl(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const formatDate = (date) => date.toISOString().split("T")[0]; // YYYY-MM-DD display
  const formatDateDisplay = (date) =>
    date.toLocaleDateString([], { year: "numeric", month: "short", day: "2-digit" });

  const handleAddPromotion = async () => {
    // Validate all required fields
    if (!title.trim()) { Alert.alert("Error", "Title is required."); return; }
    if (!description.trim()) { Alert.alert("Error", "Description is required."); return; }
    if (!upcId.trim()) { Alert.alert("Error", "UPC ID is required."); return; }
    if (!price || isNaN(Number(price)) || Number(price) < 0) { Alert.alert("Error", "Enter a valid price."); return; }
    if (!valueCategory) { Alert.alert("Error", "Please select a category."); return; }
    if (!bannerImageUrl) {
      if (isUploadingImage) { Alert.alert("Please wait", "Image is still uploading..."); }
      else { Alert.alert("Error", "Please select a banner image."); }
      return;
    }
    if (endDate <= startDate) { Alert.alert("Error", "End date must be after start date."); return; }

    setIsLoading(true);
    try {
      const payload = {
        category_id: valueCategory,
        title: title.trim(),
        description: description.trim(),
        upc_id: upcId.trim(),
        price: Number(price),
        status: valueStatus,           // "Active" | "Inactive"
        visibility: valueVisibility,   // "On" | "Off"
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        banner_image: bannerImageUrl,  // Cloudinary URL
      };

      console.log("Creating promotion:", payload);
      const response = await addPromotion(payload);

      Alert.alert("Success", response.message || "Promotion created successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setTitle("");
            setDescription("");
            setUpcId("");
            setPrice("");
            setValueCategory(null);
            setValueStatus("Active");
            setValueVisibility("On");
            setStartDate(new Date());
            setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
            setBannerImage(null);
            setBannerImageUrl(null);
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Add promotion error:", error.message);
      const errData = error.response?.data;
      const message = errData?.errors
        ? errData.errors.map((e) => e.msg).join("\n")
        : errData?.message || "Failed to create promotion.";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={!openCategory && !openStatus && !openVisibility}
    >
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={25} />
            </Pressable>
            <Text style={styles.headerText}>New Promotion</Text>
          </View>
        </View>

        <View style={styles.spacer} />
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Create a New Promotion</Text>
          <Text style={styles.sectionSubtitle}>
            Engage your customers with exciting offers and discounts
          </Text>
        </View>

        <View style={styles.spacer} />
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Promotion Details</Text>

          {/* Title */}
          <Text style={styles.label}>Title *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Buy One, Get One Free"
              value={title}
              onChangeText={setTitle}
              style={styles.inputText}
              placeholderTextColor="#999"
            />
          </View>

          {/* Description */}
          <Text style={styles.label}>Description *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Free shipping on orders over $50"
              value={description}
              onChangeText={setDescription}
              style={styles.inputText}
              placeholderTextColor="#999"
            />
          </View>

          {/* UPC ID */}
          <Text style={styles.label}>UPC ID *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="e.g. PROMO-2026-001"
              value={upcId}
              onChangeText={setUpcId}
              style={styles.inputText}
              placeholderTextColor="#999"
            />
          </View>

          {/* Price */}
          <Text style={styles.label}>Price *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter price"
              value={price}
              onChangeText={setPrice}
              style={styles.inputText}
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* Category */}
          <Text style={styles.label}>Category *</Text>
          <View style={[styles.dropdownContainer, { zIndex: 700 }]}>
            <DropDownPicker
              open={openCategory}
              value={valueCategory}
              items={categories}
              setOpen={(val) => { setOpenCategory(val); setOpenStatus(false); setOpenVisibility(false); }}
              setValue={setValueCategory}
              setItems={setCategories}
              placeholder="Select category"
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={[styles.dropdownContainerStyle, { maxHeight: hp(6.5) * 4 }]}
              scrollable
              ArrowDownIconComponent={() => <SimpleLineIcons name="arrow-down" size={20} color="#000" />}
              onSelectItem={() => setOpenCategory(false)}
            />
          </View>

          {/* Status */}
          <Text style={styles.label}>Status *</Text>
          <View style={[styles.dropdownContainer, { zIndex: 600 }]}>
            <DropDownPicker
              open={openStatus}
              value={valueStatus}
              items={statusOptions}
              setOpen={(val) => { setOpenStatus(val); setOpenCategory(false); setOpenVisibility(false); }}
              setValue={setValueStatus}
              placeholder="Select status"
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownContainerStyle}
              ArrowDownIconComponent={() => <SimpleLineIcons name="arrow-down" size={20} color="#000" />}
              onSelectItem={() => setOpenStatus(false)}
            />
          </View>

          {/* Visibility */}
          <Text style={styles.label}>Visibility *</Text>
          <View style={[styles.dropdownContainer, { zIndex: 500 }]}>
            <DropDownPicker
              open={openVisibility}
              value={valueVisibility}
              items={visibilityOptions}
              setOpen={(val) => { setOpenVisibility(val); setOpenCategory(false); setOpenStatus(false); }}
              setValue={setValueVisibility}
              placeholder="Select visibility"
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownContainerStyle}
              ArrowDownIconComponent={() => <SimpleLineIcons name="arrow-down" size={20} color="#000" />}
              onSelectItem={() => setOpenVisibility(false)}
            />
          </View>

          {/* Start Date */}
          <Text style={styles.label}>Start Date *</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartDate(true)}>
            <MaterialIcons name="calendar-today" size={18} color="#524B6B" />
            <Text style={styles.dateText}>{formatDateDisplay(startDate)}</Text>
          </TouchableOpacity>
          {showStartDate && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowStartDate(Platform.OS === "ios");
                if (date) setStartDate(date);
              }}
            />
          )}

          {/* End Date */}
          <Text style={styles.label}>End Date *</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndDate(true)}>
            <MaterialIcons name="calendar-today" size={18} color="#524B6B" />
            <Text style={styles.dateText}>{formatDateDisplay(endDate)}</Text>
          </TouchableOpacity>
          {showEndDate && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
              onChange={(event, date) => {
                setShowEndDate(Platform.OS === "ios");
                if (date) setEndDate(date);
              }}
            />
          )}

          {/* Banner Image */}
          <Text style={styles.label}>Banner Image *</Text>
          <TouchableOpacity style={styles.bannerContainer} onPress={handleImagePick}>
            {bannerImage ? (
              <View style={{ width: "100%", height: "100%" }}>
                <Image source={{ uri: bannerImage }} style={styles.bannerImage} resizeMode="cover" />
                {isUploadingImage && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator color="#fff" size="large" />
                    <Text style={styles.uploadOverlayText}>Uploading...</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.bannerPlaceholder}>
                <Upload_Photo_Icon width="40%" height="40%" />
                <Text style={styles.bannerPlaceholderText}>Tap to upload banner</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.loginButton, (isLoading || isUploadingImage) && styles.disabledButton]}
          onPress={handleAddPromotion}
          disabled={isLoading || isUploadingImage}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Create Promotion</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ImageBackground>
    </ScrollView>
  );
};

export default NewPromotionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1 },
  vector: { width: wp(100), minHeight: hp(100) },
  header: { width: wp(100), height: hp(7), marginTop: "10%", paddingHorizontal: "5%", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerChild: { flexDirection: "row", alignItems: "center" },
  headerText: { fontFamily: "Nunito-Bold", fontSize: hp(3), textAlign: "left", color: "#0D0140", marginLeft: hp(1) },
  sectionContainer: { paddingHorizontal: "5%" },
  sectionTitle: { fontFamily: "Nunito-Bold", fontSize: hp(2.8), color: "#14BA9C" },
  sectionSubtitle: { color: "#524B6B", fontFamily: "Nunito-SemiBold", fontSize: hp(1.7), marginTop: "2%" },
  sectionHeader: { color: "#000", fontFamily: "Nunito-SemiBold", fontSize: hp(1.9), marginTop: "2%" },
  spacer: { height: hp(2) },
  label: { color: "black", fontFamily: "Nunito-SemiBold", fontSize: hp(1.7), marginTop: "3%" },
  inputContainer: { backgroundColor: "#fff", width: "100%", height: hp(6.5), borderRadius: 8, marginVertical: "2%", paddingHorizontal: "5%", justifyContent: "center", borderWidth: 0.4, borderColor: "#524B6B" },
  inputText: { fontFamily: "Nunito-Regular", color: "#000", fontSize: hp(2.2) },
  dropdownContainer: { width: "100%", marginVertical: "2%" },
  dropdown: { backgroundColor: "#fff", borderColor: "#524B6B", borderRadius: 8, borderWidth: 0.4 },
  dropdownText: { fontFamily: "Nunito-Regular", fontSize: hp(2.2), color: "#000" },
  dropdownContainerStyle: { borderColor: "#524B6B", backgroundColor: "#fff" },
  dateButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", width: "100%", height: hp(6.5), borderRadius: 8, marginVertical: "2%", paddingHorizontal: "5%", borderWidth: 0.4, borderColor: "#524B6B", gap: 8 },
  dateText: { fontFamily: "Nunito-Regular", color: "#000", fontSize: hp(2.2) },
  bannerContainer: { backgroundColor: "#fff", width: "100%", height: hp(23), borderRadius: 8, marginVertical: "2%", borderWidth: 0.4, borderColor: "#524B6B", overflow: "hidden" },
  bannerImage: { width: "100%", height: "100%", borderRadius: 8 },
  bannerPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  bannerPlaceholderText: { fontFamily: "Nunito-Regular", color: "#999", fontSize: hp(1.8), marginTop: hp(1) },
  uploadOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  uploadOverlayText: { color: "#fff", fontFamily: "Nunito-SemiBold", fontSize: hp(2), marginTop: 8 },
  loginButton: { backgroundColor: "#130160", width: "90%", height: hp(7), borderRadius: 10, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: hp(2) },
  disabledButton: { opacity: 0.6 },
  loginButtonText: { fontFamily: "Nunito-SemiBold", color: "#fff", fontSize: hp(2.5) },
  bottomSpacer: { height: hp(5) },
});