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
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Heart_Icon from "../../../assets/heart_icon.svg";
import Share_Icon from "../../../assets/share_icon.svg";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import useStore from "../../store";

const PLACEHOLDER = require("../../../assets/gray_img.png");

/**
 * Normalises either a raw API product OR a locally-mapped list item
 * into one consistent shape so the UI never shows N/A unnecessarily.
 *
 * Raw API shape (from fetchProductById):
 *   { title, description, price, offer_price, image_inner, image_outer,
 *     upc_id, type, category_id: { category_name }, createdAt }
 *
 * Local/mapped shape (from fetchTrendingProducts / fetchActivityFeed):
 *   { id, title, description, price (string "$10"), discountPrice,
 *     originalPrice, totalDiscount, image: { uri: "..." } }
 */
const normalizeProduct = (raw) => {
  if (!raw) return null;

  // Detect local-mapped shape: has an `image` object and price is a string
  const isLocalShape = raw.image !== undefined && typeof raw.price === "string";

  if (isLocalShape) {
    const parsePrice = (str) => {
      if (!str) return null;
      const n = parseFloat(String(str).replace(/[^0-9.]/g, ""));
      return isNaN(n) ? null : n;
    };

    let originalPrice = null;
    let offerPrice = null;

    if (raw.discountPrice && raw.originalPrice) {
      // Trending shape
      offerPrice = parsePrice(raw.discountPrice);
      originalPrice = parsePrice(raw.originalPrice);
    } else if (raw.price && raw.price.includes(" - ")) {
      // Activity feed shape: "$10 - $8"
      const parts = raw.price.split(" - ");
      originalPrice = parsePrice(parts[0]);
      offerPrice = parsePrice(parts[1]);
    } else {
      originalPrice = parsePrice(raw.price);
    }

    return {
      id: raw.id,
      title: raw.title || "Untitled Product",
      description: raw.description || "",
      image_inner: raw.image?.uri || null,
      image_outer: raw.image?.uri || null,
      price: originalPrice,
      offer_price: offerPrice,
      upc_id: null,
      type: null,
      category_id: null,
      createdAt: null,
    };
  }

  // Raw API shape — return as-is
  return raw;
};

const SingleItemPage = ({ route }) => {
  const navigation = useNavigation();
  const { productId, section, data } = route.params || {};
  const { fetchProductById } = useStore();

  const [product, setProduct] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("inner");

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        if (productId) {
          const result = await fetchProductById(productId, data || []);
          setProduct(normalizeProduct(result));
        }
      } catch (error) {
        console.error("Load product error:", error.message);
        // Last resort: find directly from local data
        if (data && data.length > 0) {
          const found = data.find((item) => item.id === productId);
          if (found) setProduct(normalizeProduct(found));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();

    if (data && data.length > 0) {
      const filtered = data.filter((item) => item.id !== productId);
      setSimilarItems(filtered.sort(() => 0.5 - Math.random()).slice(0, 4));
    }
  }, [productId]);

  // ── Image helpers ─────────────────────────────────────
  const getImageSource = (value) => {
    if (!value) return PLACEHOLDER;
    if (typeof value === "string") return { uri: value };
    if (value.uri) return value;
    return PLACEHOLDER;
  };

  const innerImage = getImageSource(product?.image_inner);
  const outerImage = getImageSource(product?.image_outer);
  const displayImage = activeImage === "inner" ? innerImage : outerImage;

  // ── Price helpers ─────────────────────────────────────
  const rawPrice = Number(product?.price);
  const rawOffer = Number(product?.offer_price);
  const hasDiscount = product?.offer_price && rawOffer > 0 && rawOffer < rawPrice;

  const displayOffer = hasDiscount ? `$${rawOffer}` : rawPrice ? `$${rawPrice}` : "";
  const displayOriginal = hasDiscount ? `$${rawPrice}` : null;
  const discountPercent = hasDiscount
    ? `${Math.round(((rawPrice - rawOffer) / rawPrice) * 100)}% Off`
    : "";

  // ── Meta helpers ──────────────────────────────────────
  const categoryName =
    product?.category_id?.category_name ||
    product?.category?.category_name ||
    product?.category ||
    null;

  const upcId = product?.upc_id || null;

  const typeLabel =
    product?.type === 1 ? "Trending" :
    product?.type === 2 ? "Activity Feed" : null;

  const createdDate = product?.createdAt
    ? new Date(product.createdAt).toLocaleString()
    : null;

  const hasBothImages = product?.image_inner && product?.image_outer;

  // ── Loading ───────────────────────────────────────────
  if (isLoading) {
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
        <Text style={styles.loadingText}>Product not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.loadingText, { color: "#130160", marginTop: 10 }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Similar items renderer ────────────────────────────
  const renderSimilarItem = ({ item }) => (
    <Pressable
      style={styles.similarItemContainer}
      onPress={() =>
        navigation.push("SinglePageItem", { productId: item.id, section, data })
      }
    >
      <View style={styles.similarItemCard}>
        <Image
          source={getImageSource(item.image)}
          style={styles.similarItemImage}
        />
        <Ionicons
          name="heart"
          size={hp(3)}
          color={"#EE2525"}
          style={styles.heartIcon}
        />
        <View style={styles.similarItemDescriptionContainer}>
          <Text style={styles.similarItemDescription} numberOfLines={2}>
            {item.description || item.title}
          </Text>
        </View>
        <View style={styles.similarItemPriceContainer}>
          <Text style={styles.similarItemDiscountPrice}>
            {item.discountPrice || item.price}
          </Text>
          {item.originalPrice && (
            <Text style={styles.similarItemPriceText}>
              <Text style={styles.similarItemOriginalPrice}>
                {item.originalPrice}
              </Text>
              {"  "}{item.totalDiscount}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  // ── Main render ───────────────────────────────────────
  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent={true} backgroundColor={"transparent"} />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
        resizeMode="stretch"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color={"#0D0D26"} size={25} />
            </Pressable>
            <Text style={styles.headerText}>Item</Text>
          </View>
          <View style={styles.headerIcons}>
            <Pressable><Heart_Icon height={hp(4)} /></Pressable>
            <Pressable><Share_Icon height={hp(4)} /></Pressable>
          </View>
        </View>

        {/* Main image */}
        <View style={styles.mainImageContainer}>
          <Image source={displayImage} style={styles.mainImage} resizeMode="cover" />
        </View>

        {/* Inner / Outer toggle — only if both image URLs exist */}
        {hasBothImages && (
          <View style={styles.imageToggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, activeImage === "inner" && styles.toggleBtnActive]}
              onPress={() => setActiveImage("inner")}
            >
              <Text style={[styles.toggleBtnText, activeImage === "inner" && styles.toggleBtnTextActive]}>
                Inner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, activeImage === "outer" && styles.toggleBtnActive]}
              onPress={() => setActiveImage("outer")}
            >
              <Text style={[styles.toggleBtnText, activeImage === "outer" && styles.toggleBtnTextActive]}>
                Outer
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.contentContainer}>

          {/* Price */}
          {displayOffer ? (
            <View style={styles.priceContainer}>
              {displayOriginal && (
                <Text style={styles.originalPrice}>{displayOriginal}</Text>
              )}
              <Text style={styles.discountedPrice}>{displayOffer}</Text>
              {discountPercent ? (
                <Text style={styles.discount}>{discountPercent}</Text>
              ) : null}
            </View>
          ) : null}

          {/* Title & details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{product.title}</Text>

            {product.description ? (
              <View style={styles.itemDetailsContainer}>
                <Text style={styles.detailsTitle}>Item Details</Text>
                <Text style={styles.detailsText}>{product.description}</Text>
              </View>
            ) : null}

            {/* Only render meta rows that have real values */}
            {(categoryName || upcId || typeLabel || createdDate) && (
              <View style={styles.itemMetaContainer}>
                {categoryName && (
                  <Text style={styles.metaText}>
                    Category: <Text style={styles.metaValue}>{categoryName}</Text>
                  </Text>
                )}
                {upcId && (
                  <Text style={styles.metaText}>
                    UPC #: <Text style={styles.metaValue}>{upcId}</Text>
                  </Text>
                )}
                {typeLabel && (
                  <Text style={styles.metaText}>
                    Type - <Text style={styles.metaValue}>{typeLabel}</Text>
                  </Text>
                )}
                {createdDate && (
                  <Text style={styles.metaText}>
                    Date and time -{" "}
                    <Text style={styles.metaValue}>{createdDate}</Text>
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("EditPhotoScreen")}
            >
              <Text style={styles.buttonText}>Edit</Text>
              <FontAwesome name="edit" size={18} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Replace</Text>
              <MaterialCommunityIcons name="file-replace" size={18} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Delete</Text>
              <AntDesign name="delete" size={18} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Similar items */}
          {similarItems.length > 0 && (
            <View style={styles.similarItemsSection}>
              <Text style={styles.similarItemsTitle}>SIMILAR ITEMS</Text>
              <View style={styles.similarItemsContainer}>
                <FlatList
                  data={similarItems}
                  renderItem={renderSimilarItem}
                  keyExtractor={(item, index) =>
                    item.id ? item.id.toString() : `similar-${index}`
                  }
                  numColumns={2}
                  scrollEnabled={false}
                />
              </View>
            </View>
          )}

          <View style={{ height: hp(5) }} />
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

export default SingleItemPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: wp(100),
    backgroundColor: "#E6F3F5",
  },
  vector: {
    flex: 1,
    width: wp(100),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E6F3F5",
    gap: hp(1.5),
  },
  loadingText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(2),
    color: "#524B6B",
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
  headerChild: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(3),
    textAlign: "left",
    color: "#0D0140",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "23%",
  },
  mainImageContainer: {
    width: "90%",
    height: hp(27),
    marginHorizontal: "5%",
    borderRadius: 10,
    marginVertical: "5%",
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  imageToggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: hp(1.5),
    gap: 10,
  },
  toggleBtn: {
    paddingHorizontal: wp(7),
    paddingVertical: hp(0.8),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#130160",
  },
  toggleBtnActive: {
    backgroundColor: "#130160",
  },
  toggleBtnText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.8),
    color: "#130160",
  },
  toggleBtnTextActive: {
    color: "#fff",
  },
  contentContainer: {
    paddingHorizontal: "5%",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "1%",
    marginTop: "3.5%",
    gap: 8,
  },
  originalPrice: {
    fontFamily: "Nunito-Regular",
    fontSize: 16,
    textDecorationLine: "line-through",
    color: "#666",
  },
  discountedPrice: {
    fontFamily: "Nunito-Bold",
    fontSize: 18,
    color: "#000",
  },
  discount: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: "#e63946",
  },
  detailsContainer: {
    marginVertical: "6%",
  },
  title: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.5),
    marginBottom: 8,
    color: "black",
  },
  itemDetailsContainer: {
    marginVertical: "1%",
  },
  detailsTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.2),
    color: "#000",
    marginBottom: 4,
  },
  detailsText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.8),
    color: "#666",
  },
  itemMetaContainer: {
    marginTop: hp(1.5),
  },
  metaText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2),
    color: "#000",
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.7),
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: "5%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f3f4",
    borderRadius: 4,
    flex: 1,
    marginHorizontal: "2%",
    elevation: 2,
    height: hp(7),
    gap: 4,
  },
  buttonText: {
    fontFamily: "Nunito-SemiBold",
    color: "#000",
    marginLeft: 4,
  },
  similarItemsSection: {
    marginVertical: "3%",
  },
  similarItemsTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.3),
    color: "#000000",
    marginVertical: "5%",
  },
  similarItemsContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  similarItemContainer: {
    width: wp(45),
    height: hp(26),
    alignItems: "center",
    marginVertical: "1%",
  },
  similarItemCard: {
    width: wp(43),
    height: hp(26),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#fff",
  },
  similarItemImage: {
    width: wp(43),
    height: hp(13),
    borderRadius: 5,
  },
  heartIcon: {
    position: "absolute",
    right: "2%",
    top: "2%",
  },
  similarItemDescriptionContainer: {
    paddingHorizontal: "3%",
    marginTop: "2%",
  },
  similarItemDescription: {
    fontFamily: "Nunito-SemiBold",
    color: "#000",
    fontSize: hp(1.5),
  },
  similarItemPriceContainer: {
    position: "absolute",
    bottom: "2%",
    paddingHorizontal: "3%",
  },
  similarItemDiscountPrice: {
    fontFamily: "Nunito-Bold",
    color: "#000",
    fontSize: hp(1.8),
  },
  similarItemPriceText: {
    color: "red",
  },
  similarItemOriginalPrice: {
    fontFamily: "Nunito-Bold",
    color: "#808488",
    fontSize: hp(1.8),
    textDecorationLine: "line-through",
  },
});