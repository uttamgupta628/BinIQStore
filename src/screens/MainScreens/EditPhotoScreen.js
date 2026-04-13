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
import React, { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import CameraIcon from "../../../assets/CameraIcon.svg";
import GalleryIcon from "../../../assets/gallery_icon.svg";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import useStore from "../../store";

const BASE_URL = "https://biniq.onrender.com/api";

const EditPhotoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params || {};
  const { accessToken } = useStore();

  // Pre-fill with existing product data
  const [title, setTitle] = useState(product?.title || "");
  const [description, setDescription] = useState(product?.description || "");
  const [tags, setTags] = useState(
    Array.isArray(product?.tags)
      ? product.tags.join(", ")
      : product?.tags || "",
  );

  // Keep existing image URLs; update only if user picks a new one
  const [innerImageUri, setInnerImageUri] = useState(
    product?.image_inner || null,
  );
  const [outerImageUri, setOuterImageUri] = useState(
    product?.image_outer || null,
  );
  const [innerImageAsset, setInnerImageAsset] = useState(null);
  const [outerImageAsset, setOuterImageAsset] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  // ── Image pickers ─────────────────────────────────────────────────────

  const pickFromGallery = async (target) => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      quality: 0.8,
      selectionLimit: 1,
    });
    if (result.didCancel || !result.assets?.length) return;
    const asset = result.assets[0];
    if (target === "inner") {
      setInnerImageUri(asset.uri);
      setInnerImageAsset(asset);
    } else {
      setOuterImageUri(asset.uri);
      setOuterImageAsset(asset);
    }
  };

  const pickFromCamera = async (target) => {
    const result = await launchCamera({
      mediaType: "photo",
      quality: 0.8,
      saveToPhotos: false,
    });
    if (result.didCancel || !result.assets?.length) return;
    const asset = result.assets[0];
    if (target === "inner") {
      setInnerImageUri(asset.uri);
      setInnerImageAsset(asset);
    } else {
      setOuterImageUri(asset.uri);
      setOuterImageAsset(asset);
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────
  // Backend updateProduct reads from req.body as JSON.
  // It uses :product_id as the route param (not :id).
  // image_inner / image_outer are plain URL strings, not file uploads.

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        // Keep existing image URLs (new local picks are preview-only until you add a Cloudinary upload step)
        image_inner: innerImageUri || product?.image_inner,
        image_outer: outerImageUri || product?.image_outer,
      };

      // Convert comma-separated tags string → array
      if (tags.trim()) {
        payload.tags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }

      // ✅ Use _id (API shape) with fallback to id (normalized shape)
      const productId = product?._id || product?.id;

      await axios.put(
        `${BASE_URL}/products/${productId}`, // ✅ matches backend :product_id
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json", // ✅ backend reads req.body, not multipart
          },
        },
      );

      Alert.alert("Success", "Product updated successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error(
        "Save product error:",
        error.response?.data || error.message,
      );
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to save changes. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ── Image picker row ──────────────────────────────────────────────────

  const ImagePickerRow = ({ target, imageUri }) => (
    <View style={styles.uploadContainer}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.imagePreview}
          resizeMode="cover"
        />
      ) : null}
      <View style={styles.searchContainer}>
        <Pressable
          style={styles.cameraButton}
          onPress={() => pickFromCamera(target)}
          hitSlop={8}
        >
          <CameraIcon />
        </Pressable>
        <Text style={styles.inputPlaceholder}>
          {imageUri ? "Change photo" : "Take a photo"}
        </Text>
        <Pressable
          style={styles.searchButton}
          onPress={() => pickFromGallery(target)}
          hitSlop={8}
        >
          <GalleryIcon />
        </Pressable>
      </View>
    </View>
  );

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
      >
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={25} />
            </Pressable>
            <Text style={styles.headerText}>Edit Product</Text>
          </View>
        </View>

        <View style={{ height: hp(3) }} />

        <View style={{ paddingHorizontal: "5%" }}>
          <Text style={styles.productNameChip} numberOfLines={1}>
            {product?.title || "Untitled Product"}
          </Text>
        </View>

        <View style={{ paddingHorizontal: "5%" }}>
          <Text style={styles.label}>Title</Text>
          <View style={styles.inputBox}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Product title"
              style={styles.textInput}
              placeholderTextColor="gray"
            />
          </View>

          <Text style={styles.label}>Description</Text>
          <View
            style={[
              styles.inputBox,
              { height: hp(10), alignItems: "flex-start", paddingTop: hp(1.2) },
            ]}
          >
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Short caption or product details"
              style={[styles.textInput, { textAlignVertical: "top" }]}
              placeholderTextColor="gray"
              multiline
            />
          </View>

          <View style={styles.inputBox}>
            <TextInput
              value={tags}
              onChangeText={setTags}
              placeholder="Add tags (comma separated)"
              style={styles.textInput}
              placeholderTextColor="gray"
            />
          </View>

          <Text style={styles.label}>Upload Photo</Text>
          <ImagePickerRow target="inner" imageUri={innerImageUri} />

          <Text style={styles.label}>Cover Photo</Text>
          <ImagePickerRow target="outer" imageUri={outerImageUri} />

          {(innerImageAsset || outerImageAsset) && (
            <Text style={styles.noteText}>
              ⚠️ New photo selected as preview only. To persist new images, a
              Cloudinary upload endpoint is needed on the backend.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.gettingStarted, isSaving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <View style={{ height: hp(5) }} />
      </ImageBackground>
    </ScrollView>
  );
};

export default EditPhotoScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  vector: { flex: 1, width: wp(100) },
  header: {
    width: wp(100),
    height: hp(7),
    marginTop: "10%",
    paddingHorizontal: "5%",
    flexDirection: "row",
    alignItems: "center",
  },
  headerChild: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerText: { fontFamily: "Nunito-Bold", fontSize: hp(3), color: "#0D0140" },
  productNameChip: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.6),
    color: "#14BA9C",
    marginBottom: hp(1),
  },
  label: {
    color: "#000",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(2.2),
    marginTop: "3%",
  },
  inputBox: {
    backgroundColor: "#fff",
    width: "100%",
    height: hp(7),
    borderRadius: 8,
    marginVertical: "2%",
    paddingHorizontal: "5%",
    justifyContent: "center",
    borderWidth: 0.4,
    borderColor: "#524B6B",
  },
  textInput: {
    fontFamily: "Nunito-Regular",
    color: "#000",
    fontSize: hp(2.2),
    flex: 1,
  },
  uploadContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: "2%",
    gap: 10,
  },
  imagePreview: {
    width: hp(7),
    height: hp(7),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0EA",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#99ABC678",
    height: hp(7),
    backgroundColor: "#fff",
  },
  cameraButton: { padding: 10 },
  inputPlaceholder: {
    flex: 1,
    fontSize: hp(2),
    fontFamily: "Nunito-Regular",
    color: "#555",
  },
  searchButton: { padding: 10 },
  noteText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.6),
    color: "#e67e22",
    marginTop: hp(1),
    lineHeight: hp(2.4),
  },
  gettingStarted: {
    backgroundColor: "#130160",
    width: "90%",
    height: hp(6.7),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: "4%",
  },
  saveBtnText: {
    fontFamily: "Nunito-SemiBold",
    color: "#fff",
    fontSize: hp(2),
  },
  cancelBtn: {
    width: "90%",
    height: hp(6.5),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: "3%",
    borderWidth: 1,
    borderColor: "#e63946",
  },
  cancelBtnText: {
    fontFamily: "Nunito-SemiBold",
    color: "red",
    fontSize: hp(2.2),
  },
});
