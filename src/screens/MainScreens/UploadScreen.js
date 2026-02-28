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
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import CameraIcon from "../../../assets/CameraIcon.svg";
import GalleryIcon from "../../../assets/gallery_icon.svg";
import useStore from "../../store";
import { uploadImageToCloudinary } from "../../store/cloudinaryUpload";

const UploadScreen = () => {
  const navigation = useNavigation();
  const { addProduct, fetchCategories } = useStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  // Category dropdown
  const [openCategory, setOpenCategory] = useState(false);
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);

  // Type selector: 1 = Trending, 2 = Activity Feed
  const [selectedType, setSelectedType] = useState(null);

  // Images
  const [photoLocal, setPhotoLocal] = useState(null);
  const [coverLocal, setCoverLocal] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [coverUrl, setCoverUrl] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load categories on mount
  useEffect(() => {
    const load = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats || []);
      } catch (e) {
        console.error("Category load error:", e.message);
      }
    };
    load();
  }, []);

  // ─── Image picker ────────────────────────────────────────────────
  const pickImage = (onLocalSet, onUrlSet, setUploading) => {
    Alert.alert(
      "Choose Image", "Select source",
      [
        {
          text: "Camera",
          onPress: () => launchCamera(
            { mediaType: "photo", maxWidth: 1024, maxHeight: 1024 },
            (res) => handleImageResponse(res, onLocalSet, onUrlSet, setUploading)
          ),
        },
        {
          text: "Gallery",
          onPress: () => launchImageLibrary(
            { mediaType: "photo", maxWidth: 1024, maxHeight: 1024 },
            (res) => handleImageResponse(res, onLocalSet, onUrlSet, setUploading)
          ),
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const handleImageResponse = async (response, onLocalSet, onUrlSet, setUploading) => {
    if (response.didCancel || response.errorCode) return;
    if (!response.assets?.[0]) return;
    const asset = response.assets[0];
    onLocalSet(asset.uri);
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(
        { uri: asset.uri, fileName: asset.fileName || `upload_${Date.now()}.jpg`, type: asset.type || "image/jpeg" },
        "biniq/products"
      );
      onUrlSet(url);
    } catch (err) {
      Alert.alert("Upload Failed", "Could not upload image. Please try again.");
      onLocalSet(null);
      onUrlSet(null);
    } finally {
      setUploading(false);
    }
  };

  // ─── Submit ──────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!title.trim()) { Alert.alert("Error", "Please enter a title."); return; }
    if (!description.trim()) { Alert.alert("Error", "Please enter a description."); return; }
    if (!categoryId) { Alert.alert("Error", "Please select a category."); return; }
    if (!selectedType) { Alert.alert("Error", "Please select a content type."); return; }
    if (uploadingPhoto || uploadingCover) { Alert.alert("Please wait", "Images are still uploading..."); return; }
    if (!photoUrl) { Alert.alert("Error", "Please upload a photo."); return; }
    if (!coverUrl) { Alert.alert("Error", "Please upload a cover photo."); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        tags: tags.trim() ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        image_inner: photoUrl,
        image_outer: coverUrl,
        category_id: categoryId,
        type: selectedType,         // ✅ 1 = Trending, 2 = Activity Feed
        upc_id: `AUTO-${Date.now()}`,
        price: 0,
      };

      const result = await addProduct(payload);
      console.log("Upload result:", result);
      Alert.alert("Success", "Your content has been uploaded!", [
        { text: "OK", onPress: () => navigation.navigate("UploadSuccess") },
      ]);
    } catch (error) {
      console.error("Upload error:", error.message);
      Alert.alert("Error", error?.response?.data?.message || error.message || "Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Image field component ───────────────────────────────────────
  const ImagePickerField = ({ label, localUri, uploading, onPress }) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.uploadContainer}>
        <Pressable style={styles.searchContainer} onPress={onPress}>
          {localUri ? (
            <Image source={{ uri: localUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.cameraButton}><CameraIcon /></View>
          )}
          {uploading ? (
            <View style={{ flex: 1, alignItems: "center" }}>
              <ActivityIndicator color="#130160" size="small" />
              <Text style={[styles.input, { color: "#130160" }]}>Uploading...</Text>
            </View>
          ) : (
            <Text style={styles.input}>{localUri ? "Tap to change" : "take a photo"}</Text>
          )}
          <View style={styles.searchButton}><GalleryIcon /></View>
        </Pressable>
      </View>
    </>
  );

  const isDisabled = isSubmitting || uploadingPhoto || uploadingCover;

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground source={require("../../../assets/vector_1.png")} style={styles.vector}>
        <View style={{ height: hp(10) }} />

        <View style={{ width: wp(100), paddingHorizontal: "5%" }}>
          <Text style={{ fontFamily: "Nunito-Bold", fontSize: hp(2.4), color: "#14BA9C" }}>
            What would you like to upload today?
          </Text>
        </View>

        <View style={{ paddingHorizontal: "5%" }}>

          {/* Title */}
          <Text style={styles.label}>Title</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="New Arrival – Sneakers"
              value={title}
              onChangeText={setTitle}
              style={styles.textInput}
              placeholderTextColor="gray"
            />
          </View>

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <View style={[styles.inputContainer, { height: hp(10), alignItems: "flex-start", paddingTop: "3%" }]}>
            <TextInput
              placeholder="Short caption or product details"
              value={description}
              onChangeText={setDescription}
              style={[styles.textInput, { textAlignVertical: "top" }]}
              placeholderTextColor="gray"
              multiline
            />
          </View>

          {/* Tags */}
          <Text style={styles.label}>Tags</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Add Tags (comma separated: shoes, new, sale)"
              value={tags}
              onChangeText={setTags}
              style={styles.textInput}
              placeholderTextColor="gray"
            />
          </View>

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={{ zIndex: 1000, marginVertical: "2%" }}>
            <DropDownPicker
              open={openCategory}
              value={categoryId}
              items={categories}
              setOpen={setOpenCategory}
              setValue={setCategoryId}
              setItems={setCategories}
              placeholder="Select a category"
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownContainer}
              placeholderStyle={{ color: "gray" }}
            />
          </View>

          {/* Content Type */}
          <Text style={styles.label}>Content Type</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, selectedType === 1 && styles.typeBtnActive]}
              onPress={() => setSelectedType(1)}
            >
              <Text style={[styles.typeBtnText, selectedType === 1 && styles.typeBtnTextActive]}>
                📈 Trending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, selectedType === 2 && styles.typeBtnActive]}
              onPress={() => setSelectedType(2)}
            >
              <Text style={[styles.typeBtnText, selectedType === 2 && styles.typeBtnTextActive]}>
                📰 Activity Feed
              </Text>
            </TouchableOpacity>
          </View>

          {/* Photos */}
          <ImagePickerField
            label="Upload Photo"
            localUri={photoLocal}
            uploading={uploadingPhoto}
            onPress={() => pickImage(setPhotoLocal, setPhotoUrl, setUploadingPhoto)}
          />
          <ImagePickerField
            label="Cover Photo"
            localUri={coverLocal}
            uploading={uploadingCover}
            onPress={() => pickImage(setCoverLocal, setCoverUrl, setUploadingCover)}
          />
        </View>

        <TouchableOpacity
          style={[styles.gettingStarted, isDisabled && styles.disabledBtn]}
          onPress={handleUpload}
          disabled={isDisabled}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontFamily: "Nunito-SemiBold", color: "#fff", fontSize: hp(2) }}>
              Upload Content
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: hp(5) }} />
      </ImageBackground>
    </ScrollView>
  );
};

export default UploadScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  vector: { flex: 1, width: wp(100) },
  uploadContainer: { flexDirection: "row", alignItems: "center", marginVertical: "2%", width: "100%" },
  searchContainer: {
    flex: 1, flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderRadius: 12, borderColor: "#99ABC678",
    height: hp(7), backgroundColor: "#fff",
  },
  cameraButton: { padding: 10 },
  searchButton: { padding: 10 },
  input: { flex: 1, fontSize: hp(2), fontFamily: "Nunito-Regular", paddingVertical: 8, color: "#999" },
  previewImage: { width: hp(6), height: hp(6), borderRadius: 8, margin: 4, resizeMode: "cover" },
  inputContainer: {
    backgroundColor: "#fff", width: "100%", height: hp(7),
    alignSelf: "center", borderRadius: 8, marginVertical: "2%",
    paddingHorizontal: "5%", justifyContent: "center",
    borderWidth: 0.4, borderColor: "#524B6B",
  },
  textInput: { fontFamily: "Nunito-Regular", color: "#000", fontSize: hp(2.2) },
  label: { color: "black", fontFamily: "Nunito-SemiBold", fontSize: hp(2.2), marginTop: "3%" },
  dropdown: { borderColor: "#524B6B", borderWidth: 0.4, borderRadius: 8, height: hp(7) },
  dropdownText: { fontFamily: "Nunito-Regular", fontSize: hp(2.2), color: "#000" },
  dropdownContainer: { borderColor: "#524B6B", borderWidth: 0.4 },
  typeRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: "2%" },
  typeBtn: {
    width: "48%", height: hp(6.5), borderRadius: 8,
    borderWidth: 1, borderColor: "#524B6B",
    justifyContent: "center", alignItems: "center",
    backgroundColor: "#fff",
  },
  typeBtnActive: { backgroundColor: "#130160", borderColor: "#130160" },
  typeBtnText: { fontFamily: "Nunito-SemiBold", fontSize: hp(2), color: "#524B6B" },
  typeBtnTextActive: { color: "#fff" },
  gettingStarted: {
    backgroundColor: "#130160", width: "90%", height: hp(6.7),
    borderRadius: 10, justifyContent: "center", alignItems: "center",
    alignSelf: "center", marginTop: "10%",
  },
  disabledBtn: { opacity: 0.6 },
});