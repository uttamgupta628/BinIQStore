import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  StatusBar,
  Pressable,
  Image,
  ActivityIndicator,
  Share,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Share_Icon from "../../../assets/share_icon.svg";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "react-native-vector-icons/AntDesign";

const PLACEHOLDER = require("../../../assets/slider_1.png");

// ── Image source resolver ─────────────────────────────────────────────────────
// Promotion items from fetchPromotions are already mapped:
//   item.image = { uri: "..." } | null
// So we just need to handle that shape + fallback.
const getImageSource = (value) => {
  if (!value) return PLACEHOLDER;
  if (typeof value === "object" && value.uri) return { uri: value.uri };
  if (typeof value === "string" && value.length > 0) return { uri: value };
  if (typeof value === "number") return value;
  return PLACEHOLDER;
};

const PromotionScreen = ({ route }) => {
  const navigation = useNavigation();
  const { data } = route.params || {};

  // promotions list for the "Similar Promotions" section
  const [promotions, setPromotions] = useState(data || []);
  // selected promotion — default to first item
  const [product, setProduct] = useState(data?.[0] || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data && data.length > 0) {
      setPromotions(data);
      setProduct(data[0]);
    }
  }, [data]);

  // ── Share handler ─────────────────────────────────────────────────────────
  const handleShare = async () => {
    try {
      const title = product?.title || "Check out this promotion";
      const description = product?.shortDescription
        ? `${product.shortDescription}\n\n`
        : "";
      const priceText = product?.price ? `Price: ${product.price}` : "";

      await Share.share({
        title,
        message: `${title}\n\n${description}${priceText}`.trim(),
      });
    } catch (error) {
      console.error("Share error:", error.message);
    }
  };

  // ── Loading / empty states ────────────────────────────────────────────────
  if (isLoading && !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading promotion...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Promotion not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text
            style={[styles.loadingText, { color: "#130160", marginTop: 10 }]}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Format dates from ISO strings ─────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ── Similar promotions card renderer ──────────────────────────────────────
  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => setProduct(item)} // tap similar card to preview it
    >
      <View style={styles.cardImageWrapper}>
        <Image
          source={getImageSource(item.image)}
          style={styles.cardImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1} ellipsizeMode="tail">
          {item.title || "Untitled"}
        </Text>
        <Text
          style={styles.cardSubtitle}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.shortDescription || "No description"}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.rating}>4.5</Text>
          <Text style={styles.reviews}>50 Reviews</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar translucent={true} backgroundColor={"transparent"} />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
        resizeMode="stretch"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons
                name="arrow-back-ios"
                color={"#0D0D26"}
                size={25}
              />
            </Pressable>
            <Text style={styles.headerText}>Promotion</Text>
          </View>
          <Pressable onPress={handleShare} style={styles.shareButton}>
            <Share_Icon height={hp(4)} />
          </Pressable>
        </View>

        {/* ── Main image ─────────────────────────────────────────────────── */}
        <View style={styles.mainImageContainer}>
          <Image
            source={getImageSource(product.image)}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <View style={styles.contentContainer}>
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{product.title || "Untitled"}</Text>

            {/* Status badge */}
            <Text style={styles.statusBadge}>{product.status || "Active"}</Text>

            <View style={styles.descriptionContainer}>
              <Text style={styles.detailsTitle}>Description</Text>
              <Text style={styles.detailsText}>
                {product.shortDescription || "No description available"}{" "}
                {/* ✅ shortDescription */}
              </Text>
            </View>

            <View style={styles.metaContainer}>
              <Text style={styles.metaText}>
                Price —{" "}
                <Text style={styles.metaValue}>
                  {product.price || "N/A"}{" "}
                  {/* ✅ already formatted e.g. "$10" or "$10 - $8" */}
                </Text>
              </Text>
              <Text style={styles.metaText}>
                Start date —{" "}
                <Text style={styles.metaValue}>
                  {formatDate(product.start_date)}{" "}
                  {/* ✅ start_date from mapped object */}
                </Text>
              </Text>
              <Text style={styles.metaText}>
                End date —{" "}
                <Text style={styles.metaValue}>
                  {formatDate(product.end_date)}{" "}
                  {/* ✅ end_date from mapped object */}
                </Text>
              </Text>
            </View>
          </View>

          {/* ── Action buttons ────────────────────────────────────────────── */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("EditPhotoScreen")}
            >
              <Text style={styles.buttonText}>Edit</Text>
              <FontAwesome name="edit" size={18} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Reactivate</Text>
              <MaterialCommunityIcons
                name="file-replace"
                size={18}
                color="#000"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Delete</Text>
              <AntDesign name="delete" size={18} color="#000" />
            </TouchableOpacity>
          </View>

          {/* ── Similar Promotions ────────────────────────────────────────── */}
          {promotions.length > 1 && (
            <View style={styles.similarPromotionsSection}>
              <Text style={styles.similarPromotionsTitle}>
                Similar Promotions
              </Text>
              <View style={styles.similarPromotionsContainer}>
                <FlatList
                  data={promotions
                    .filter((p) => p.id !== product.id)
                    .slice(0, 6)}
                  renderItem={renderItem}
                  keyExtractor={(item, index) =>
                    item.id ? item.id.toString() : `promo-${index}`
                  }
                  numColumns={3}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
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

  // ── Header ────────────────────────────────────────────────────────────────
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
  shareButton: {
    padding: 4,
  },

  // ── Main image ────────────────────────────────────────────────────────────
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
  },

  // ── Content ───────────────────────────────────────────────────────────────
  contentContainer: {
    paddingHorizontal: "5%",
  },
  detailsContainer: {
    marginVertical: "4%",
  },
  title: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.5),
    marginBottom: 6,
    color: "black",
  },
  statusBadge: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(1.6),
    color: "#14BA9C",
    marginBottom: 10,
  },
  descriptionContainer: {
    marginVertical: "2%",
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
  metaContainer: {
    marginVertical: "2%",
    gap: 6,
  },
  metaText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2),
    color: "#000",
  },
  metaValue: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.7),
    color: "#666",
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
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
    elevation: 2,
    height: hp(7),
    gap: 4,
    paddingHorizontal: "2%",
    flex: 1,
    marginHorizontal: "1%",
  },
  buttonText: {
    fontFamily: "Nunito-SemiBold",
    color: "#000",
  },

  // ── Similar Promotions ────────────────────────────────────────────────────
  similarPromotionsSection: {
    marginVertical: "3%",
  },
  similarPromotionsTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.3),
    color: "#000000",
    marginBottom: "4%",
  },
  similarPromotionsContainer: {
    width: "100%",
    marginBottom: "5%",
  },

  // ── Similar promotion card ────────────────────────────────────────────────
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: wp(1),
    marginBottom: hp(1.5),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: "hidden",
  },
  cardImageWrapper: {
    width: "100%",
    overflow: "hidden",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardImage: {
    width: "100%",
    height: hp(10),
  },
  cardContent: {
    padding: wp(2),
  },
  cardName: {
    fontSize: hp(1.5),
    color: "#000",
    fontFamily: "Nunito-SemiBold",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: hp(1.3),
    color: "#14BA9C",
    fontFamily: "Nunito-SemiBold",
    marginBottom: hp(0.5),
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: 3,
    fontSize: hp(1.3),
    fontFamily: "Nunito-Bold",
    color: "#000",
  },
  reviews: {
    marginLeft: 3,
    fontSize: hp(1.2),
    color: "#666",
    fontFamily: "Nunito-Regular",
  },
});

export default PromotionScreen;
