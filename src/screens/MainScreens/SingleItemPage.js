import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ImageBackground,
  StatusBar,
  Pressable,
  Image,
  ActivityIndicator,
  Share,
  Alert,
  Modal,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { launchImageLibrary } from "react-native-image-picker";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import Share_Icon from "../../../assets/share_icon.svg";
import axios from "axios";
import useStore from "../../store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PLACEHOLDER = require("../../../assets/gray_img.png");
const BASE_URL = "https://biniq.onrender.com/api";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const parsePrice = (val) => {
  if (val === null || val === undefined) return null;
  const n = parseFloat(String(val).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n;
};

const getImageSource = (value) => {
  if (!value) return PLACEHOLDER;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim().length > 0)
    return { uri: value };
  if (typeof value === "object" && value.uri) return { uri: value.uri };
  return PLACEHOLDER;
};

/**
 * Normalises both the raw API shape (image_inner / image_outer / price / offer_price)
 * and the local data-array shape (image, discountPrice, originalPrice) into one
 * consistent object used throughout this screen.
 */
const normalizeProduct = (raw) => {
  if (!raw) return null;

  const isLocalShape =
    raw.discountPrice !== undefined ||
    raw.originalPrice !== undefined ||
    (raw.image !== undefined &&
      (typeof raw.price === "string" || raw.price === undefined));

  if (isLocalShape) {
    let price = null;
    let offerPrice = null;

    if (raw.discountPrice && raw.originalPrice) {
      offerPrice = parsePrice(raw.discountPrice);
      price = parsePrice(raw.originalPrice);
    } else if (typeof raw.price === "string" && raw.price.includes(" - ")) {
      const parts = raw.price.split(" - ");
      price = parsePrice(parts[0]);
      offerPrice = parsePrice(parts[1]);
    } else {
      price = parsePrice(raw.price);
    }

    const imageUri =
      raw.image?.uri || (typeof raw.image === "string" ? raw.image : null);

    return {
      id: raw.id || raw._id,
      title: raw.title || "Untitled Product",
      description: raw.description || "",
      image_inner: imageUri,
      image_outer: imageUri,
      _originalImage: raw.image,
      price,
      offer_price: offerPrice,
      upc_id: raw.upc_id || null,
      type: raw.type || null,
      category_id: raw.category_id || null,
      createdAt: raw.createdAt || null,
      _isLocal: true,
    };
  }

  // API shape
  return {
    id: raw._id || raw.id,
    title: raw.title || "Untitled Product",
    description: raw.description || "",
    image_inner: raw.image_inner || raw.imageInner || raw.inner_image || null,
    image_outer: raw.image_outer || raw.imageOuter || raw.outer_image || null,
    price: parsePrice(raw.price),
    offer_price: parsePrice(raw.offer_price),
    upc_id: raw.upc_id || null,
    type: raw.type || null,
    category_id: raw.category_id || null,
    createdAt: raw.createdAt || null,
    _isLocal: false,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const SingleItemPage = ({ route }) => {
  const navigation = useNavigation();
  const { productId, section, data } = route.params || {};
  const { fetchProductById, accessToken } = useStore();

  const [product, setProduct] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("inner");

  // Action states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);

  // ── Load product ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        // Immediately seed from local data for instant UI
        if (data && data.length > 0) {
          const localFound = data.find(
            (item) => (item.id || item._id) === productId,
          );
          if (localFound) setProduct(normalizeProduct(localFound));
        }

        // Fetch fresh from API
        if (productId) {
          const result = await fetchProductById(productId, data || []);
          if (result) {
            const normalized = normalizeProduct(result);

            // Patch images from local if API returned none
            if (!normalized.image_inner && !normalized.image_outer) {
              const localFound = data?.find(
                (item) => (item.id || item._id) === productId,
              );
              if (localFound) {
                const imgUri =
                  localFound.image?.uri ||
                  (typeof localFound.image === "string"
                    ? localFound.image
                    : null);
                normalized.image_inner = imgUri;
                normalized.image_outer = imgUri;
              }
            }

            setProduct(normalized);
          }
        }
      } catch (error) {
        console.error("Load product error:", error.message);
        // Already seeded from local — silent fallback
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();

    // Build similar items list from the local data array
    if (data && data.length > 0) {
      const filtered = data.filter(
        (item) => (item.id || item._id) !== productId,
      );
      setSimilarItems(filtered.sort(() => 0.5 - Math.random()).slice(0, 6));
    }
  }, [productId]);

  // ── Derived display values ──────────────────────────────────────────────

  const innerSrc = (() => {
    const src = getImageSource(product?.image_inner);
    if (src === PLACEHOLDER && product?._originalImage)
      return getImageSource(product._originalImage);
    return src;
  })();

  const outerSrc = (() => {
    const src = getImageSource(product?.image_outer);
    if (src === PLACEHOLDER && product?._originalImage)
      return getImageSource(product._originalImage);
    return src;
  })();

  const displayImage = activeImage === "inner" ? innerSrc : outerSrc;

  const rawPrice = Number(product?.price);
  const rawOffer = Number(product?.offer_price);
  const hasDiscount =
    product?.offer_price != null && rawOffer > 0 && rawOffer < rawPrice;

  const displayOffer = hasDiscount
    ? `$${rawOffer}`
    : rawPrice
    ? `$${rawPrice}`
    : "";
  const displayOriginal = hasDiscount ? `$${rawPrice}` : null;
  const discountPercent = hasDiscount
    ? `${Math.round(((rawPrice - rawOffer) / rawPrice) * 100)}% Off`
    : "";

  const categoryName =
    product?.category_id?.category_name ||
    product?.category?.category_name ||
    (typeof product?.category_id === "string" ? product.category_id : null) ||
    null;

  const upcId = product?.upc_id || null;

  const typeLabel =
    product?.type === 1
      ? "Trending"
      : product?.type === 2
      ? "Activity Feed"
      : null;

  const createdDate = product?.createdAt
    ? new Date(product.createdAt).toLocaleString()
    : null;

  const hasBothImages =
    product?.image_inner &&
    product?.image_outer &&
    product.image_inner !== product.image_outer;

  // ── Share ───────────────────────────────────────────────────────────────

  const handleShare = async () => {
    try {
      const title = product?.title || "Check out this product";
      const description = product?.description
        ? `${product.description}\n\n`
        : "";
      const priceText = displayOffer
        ? `Price: ${displayOffer}${
            displayOriginal ? `  (was ${displayOriginal})` : ""
          }`
        : "";
      await Share.share({
        title,
        message: `${title}\n\n${description}${priceText}`.trim(),
      });
    } catch (error) {
      console.error("Share error:", error.message);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────

  const handleDelete = () => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await axios.delete(`${BASE_URL}/products/${product.id}`, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              });
              Alert.alert("Deleted", "Product deleted successfully.", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error("Delete product error:", error.message);
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Failed to delete product. Please try again.",
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  // ── Replace image ───────────────────────────────────────────────────────

  // const handleReplacePress = () => {
  //   if (hasBothImages) {
  //     setShowReplaceModal(true);
  //   } else {
  //     pickAndReplaceImage("inner");
  //   }
  // };

  // const pickAndReplaceImage = async (target) => {
  //   setShowReplaceModal(false);

  //   try {
  //     const result = await launchImageLibrary({
  //       mediaType: "photo",
  //       quality: 0.8,
  //       selectionLimit: 1,
  //     });

  //     if (result.didCancel || !result.assets?.length) return;

  //     const asset = result.assets[0];
  //     setIsReplacing(true);

  //     const formData = new FormData();
  //     formData.append(target === "inner" ? "image_inner" : "image_outer", {
  //       uri: asset.uri,
  //       type: asset.type || "image/jpeg",
  //       name: asset.fileName || `${target}_image.jpg`,
  //     });

  //     const response = await axios.put(
  //       `${BASE_URL}/products/${product.id}`,
  //       formData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //           "Content-Type": "multipart/form-data",
  //         },
  //       },
  //     );

  //     const updated = normalizeProduct(response.data);
  //     setProduct((prev) => ({
  //       ...prev,
  //       image_inner: updated.image_inner || prev.image_inner,
  //       image_outer: updated.image_outer || prev.image_outer,
  //     }));

  //     Alert.alert("Success", "Image updated successfully.");
  //   } catch (error) {
  //     console.error("Replace image error:", error.message);
  //     Alert.alert(
  //       "Error",
  //       error.response?.data?.message ||
  //         "Failed to replace image. Please try again.",
  //     );
  //   } finally {
  //     setIsReplacing(false);
  //   }
  // };

  // ── Edit ────────────────────────────────────────────────────────────────

  const handleEdit = () => {
    navigation.navigate("EditPhotoScreen", { product });
  };

  // ── Loading state ───────────────────────────────────────────────────────

  if (isLoading && !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="inventory" size={56} color="#ccc" />
        <Text
          style={[styles.loadingText, { marginTop: 12, textAlign: "center" }]}
        >
          Product not found.
        </Text>
        <TouchableOpacity
          style={styles.goBackBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Similar items renderer ──────────────────────────────────────────────

  const renderSimilarItem = ({ item }) => {
    const norm = normalizeProduct(item);
    const imgSrc = getImageSource(norm?.image_inner || item.image);

    const priceDisplay =
      norm?.offer_price && norm.offer_price < norm?.price
        ? `$${norm.offer_price}`
        : norm?.price
        ? `$${norm.price}`
        : item.discountPrice || item.price || "";

    const originalDisplay =
      norm?.offer_price && norm.offer_price < norm?.price
        ? `$${norm.price}`
        : item.originalPrice || null;

    return (
      <Pressable
        style={styles.similarItemContainer}
        onPress={() =>
          navigation.push("SinglePageItem", {
            productId: norm?.id || item.id,
            section,
            data,
          })
        }
      >
        <View style={styles.similarItemCard}>
          <Image
            source={imgSrc}
            style={styles.similarItemImage}
            resizeMode="cover"
          />
          <View style={styles.similarItemBody}>
            <Text style={styles.similarItemDescription} numberOfLines={2}>
              {norm?.description ||
                norm?.title ||
                item.description ||
                item.title}
            </Text>
            <View style={styles.similarItemPriceRow}>
              <Text style={styles.similarItemDiscountPrice}>
                {priceDisplay}
              </Text>
              {originalDisplay ? (
                <Text style={styles.similarItemOriginalPrice}>
                  {originalDisplay}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  // ── Main render ─────────────────────────────────────────────────────────

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar translucent backgroundColor="transparent" />

      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
        resizeMode="stretch"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={25} />
            </Pressable>
            <Text style={styles.headerText}>Item</Text>
          </View>
          <Pressable
            onPress={handleShare}
            style={styles.shareButton}
            hitSlop={10}
          >
            <Share_Icon height={hp(4)} />
          </Pressable>
        </View>

        {/* Main image */}
        <View style={styles.mainImageContainer}>
          {isReplacing && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.imageLoadingText}>Uploading image…</Text>
            </View>
          )}
          <Image
            source={displayImage}
            style={[styles.mainImage, isReplacing && { opacity: 0.45 }]}
            resizeMode="cover"
          />
        </View>

        {/* Inner / Outer toggle */}
        {hasBothImages && (
          <View style={styles.imageToggleRow}>
            {["inner", "outer"].map((side) => (
              <TouchableOpacity
                key={side}
                style={[
                  styles.toggleBtn,
                  activeImage === side && styles.toggleBtnActive,
                ]}
                onPress={() => setActiveImage(side)}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    activeImage === side && styles.toggleBtnTextActive,
                  ]}
                >
                  {side.charAt(0).toUpperCase() + side.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Content area */}
        <View style={styles.contentContainer}>
          {/* Price */}
          {displayOffer ? (
            <View style={styles.priceContainer}>
              {displayOriginal && (
                <Text style={styles.originalPrice}>{displayOriginal}</Text>
              )}
              <Text style={styles.discountedPrice}>{displayOffer}</Text>
              {discountPercent ? (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>
                    {discountPercent}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Title */}
          <Text style={styles.title}>{product.title}</Text>

          {/* Description card */}
          {product.description ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>Item Details</Text>
              <Text style={styles.sectionCardText}>{product.description}</Text>
            </View>
          ) : null}

          {/* Meta info card */}
          {categoryName || upcId || typeLabel || createdDate ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>Product Info</Text>
              {[
                categoryName && {
                  icon: "category",
                  label: "Category",
                  value: categoryName,
                },
                upcId && { icon: "qr-code", label: "UPC", value: upcId },
                typeLabel && { icon: "label", label: "Type", value: typeLabel },
                createdDate && {
                  icon: "schedule",
                  label: "Added",
                  value: createdDate,
                },
              ]
                .filter(Boolean)
                .map((row, i, arr) => (
                  <View
                    key={row.label}
                    style={[
                      styles.metaRow,
                      i === arr.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <MaterialIcons name={row.icon} size={15} color="#524B6B" />
                    <Text style={styles.metaLabel}>{row.label}</Text>
                    <Text style={styles.metaValue}>{row.value}</Text>
                  </View>
                ))}
            </View>
          ) : null}

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleEdit}
              activeOpacity={0.75}
            >
              <FontAwesome name="edit" size={17} color="#130160" />
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={[styles.button, isReplacing && styles.buttonDisabled]}
              onPress={handleReplacePress}
              disabled={isReplacing}
              activeOpacity={0.75}
            >
              {isReplacing ? (
                <ActivityIndicator size="small" color="#130160" />
              ) : (
                <MaterialCommunityIcons name="file-replace" size={17} color="#130160" />
              )}
              <Text style={styles.buttonText}>
                {isReplacing ? "Uploading…" : "Replace"}
              </Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonDestructive,
                isDeleting && styles.buttonDisabled,
              ]}
              onPress={handleDelete}
              disabled={isDeleting}
              activeOpacity={0.75}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#e63946" />
              ) : (
                <AntDesign name="delete" size={17} color="#e63946" />
              )}
              <Text style={[styles.buttonText, { color: "#e63946" }]}>
                {isDeleting ? "Deleting…" : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Similar items */}
          {similarItems.length > 0 && (
            <View style={styles.similarItemsSection}>
              <View style={styles.similarHeader}>
                <View style={styles.similarAccentBar} />
                <Text style={styles.similarItemsTitle}>Similar Items</Text>
              </View>
              <FlatList
                data={similarItems}
                renderItem={renderSimilarItem}
                keyExtractor={(item, index) =>
                  (item.id || item._id)?.toString() || `similar-${index}`
                }
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={styles.similarRow}
              />
            </View>
          )}

          <View style={{ height: hp(5) }} />
        </View>
      </ImageBackground>

      {/* Replace image picker modal */}
      <Modal
        visible={showReplaceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReplaceModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowReplaceModal(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Replace which image?</Text>
            <Text style={styles.modalSubtitle}>
              Choose which image you want to replace with a new photo from your
              library.
            </Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => pickAndReplaceImage("inner")}
            >
              <View style={styles.modalOptionIcon}>
                <MaterialIcons name="image" size={22} color="#130160" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalOptionText}>Inner Image</Text>
                <Text style={styles.modalOptionSub}>
                  The inside view of the product
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#ccc" />
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => pickAndReplaceImage("outer")}
            >
              <View style={styles.modalOptionIcon}>
                <MaterialIcons name="image-search" size={22} color="#130160" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalOptionText}>Outer Image</Text>
                <Text style={styles.modalOptionSub}>
                  The outside / cover view
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowReplaceModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

export default SingleItemPage;

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  vector: {
    flex: 1,
    width: wp(100),
  },

  // Loading / empty
  loadingContainer: {
    flex: 1,
    minHeight: hp(100),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8FC",
    gap: hp(1.5),
  },
  loadingText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(2),
    color: "#524B6B",
  },
  goBackBtn: {
    marginTop: 8,
    backgroundColor: "#130160",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  goBackBtnText: {
    color: "#fff",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(2),
  },

  // Header
  header: {
    width: wp(100),
    height: hp(7),
    marginTop: "10%",
    paddingHorizontal: "5%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerChild: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(3),
    color: "#0D0140",
  },
  shareButton: { padding: 4 },

  // Main image
  mainImageContainer: {
    width: "90%",
    height: hp(28),
    marginHorizontal: "5%",
    borderRadius: 16,
    marginVertical: "5%",
    overflow: "hidden",
    backgroundColor: "#e4e4e4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  imageLoadingText: {
    color: "#fff",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.8),
    marginTop: 8,
  },

  // Toggle
  imageToggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: hp(1.5),
    gap: 12,
  },
  toggleBtn: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(0.9),
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#130160",
  },
  toggleBtnActive: { backgroundColor: "#130160" },
  toggleBtnText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.8),
    color: "#130160",
  },
  toggleBtnTextActive: { color: "#fff" },

  // Content
  contentContainer: {
    paddingHorizontal: "5%",
    paddingTop: hp(1),
  },

  // Price
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1),
    gap: 8,
    flexWrap: "wrap",
  },
  originalPrice: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.9),
    textDecorationLine: "line-through",
    color: "#999",
  },
  discountedPrice: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.8),
    color: "#130160",
  },
  discountBadge: {
    backgroundColor: "#FFF0F0",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  discountBadgeText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(1.5),
    color: "#e63946",
  },

  // Title
  title: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.6),
    color: "#0a0a2e",
    marginBottom: hp(2),
    lineHeight: hp(3.4),
  },

  // Info cards
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: wp(4),
    marginBottom: hp(1.8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionCardTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2),
    color: "#0a0a2e",
    marginBottom: hp(1),
  },
  sectionCardText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.8),
    color: "#555",
    lineHeight: hp(2.8),
  },

  // Meta rows
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(0.9),
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4FA",
  },
  metaLabel: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.7),
    color: "#524B6B",
    width: wp(18),
  },
  metaValue: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.7),
    color: "#333",
    flex: 1,
  },

  // Action buttons
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(3),
    gap: wp(2),
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: hp(1.6),
    gap: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8E8F0",
  },
  buttonDestructive: {
    borderColor: "#FFE0E0",
    backgroundColor: "#FFF8F8",
  },
  buttonDisabled: { opacity: 0.55 },
  buttonText: {
    fontFamily: "Nunito-SemiBold",
    color: "#130160",
    fontSize: hp(1.65),
  },

  // Similar items
  similarItemsSection: { marginBottom: hp(2) },
  similarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: hp(1.5),
  },
  similarAccentBar: {
    width: 4,
    height: hp(2.4),
    borderRadius: 2,
    backgroundColor: "#130160",
  },
  similarItemsTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.3),
    color: "#0a0a2e",
  },
  similarRow: {
    justifyContent: "space-between",
    marginBottom: hp(1.5),
  },
  similarItemContainer: {
    width: (SCREEN_WIDTH * 0.9 - wp(3)) / 2,
  },
  similarItemCard: {
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  similarItemImage: {
    width: "100%",
    height: hp(14),
  },
  similarItemBody: { padding: wp(2.5) },
  similarItemDescription: {
    fontFamily: "Nunito-SemiBold",
    color: "#222",
    fontSize: hp(1.5),
    marginBottom: hp(0.5),
    lineHeight: hp(2.1),
  },
  similarItemPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  similarItemDiscountPrice: {
    fontFamily: "Nunito-Bold",
    color: "#130160",
    fontSize: hp(1.8),
  },
  similarItemOriginalPrice: {
    fontFamily: "Nunito-Regular",
    color: "#aaa",
    fontSize: hp(1.5),
    textDecorationLine: "line-through",
  },

  // Replace modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
    paddingBottom: hp(5),
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0EA",
    alignSelf: "center",
    marginBottom: hp(2),
  },
  modalTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.4),
    color: "#0a0a2e",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.7),
    color: "#777",
    marginBottom: hp(2.5),
    lineHeight: hp(2.5),
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.8),
    gap: 14,
  },
  modalOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EEF0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOptionText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(1.9),
    color: "#0a0a2e",
  },
  modalOptionSub: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.5),
    color: "#999",
    marginTop: 2,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#F0F0F8",
    marginHorizontal: -wp(6),
  },
  modalCancelBtn: {
    marginTop: hp(2.5),
    alignItems: "center",
    paddingVertical: hp(1.5),
    borderRadius: 10,
    backgroundColor: "#F0F0F8",
  },
  modalCancelText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(1.9),
    color: "#524B6B",
  },
});
