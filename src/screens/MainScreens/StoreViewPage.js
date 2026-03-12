import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Linking,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import React, { useState, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LocationIcon from "../../../assets/LocationIcon.svg";
import FacebookIcon from "../../../assets/FacebookIcon.svg";
import TwitterIcon from "../../../assets/TwitterIcon.svg";
import WhatsappIcon from "../../../assets/WhatsappIcon.svg";
import LinkedinIcon from "../../../assets/LinkedinIcon.svg";
import HiddenFindsImg from "../../../assets/hidden_find_img.svg";
import BoldTick from "../../../assets/bold_tick.svg";
import GiftIcon from "../../../assets/promo_Date.svg";
import useStore from "../../store";

const { width } = Dimensions.get("window");
const PLACEHOLDER = require("../../../assets/slider_1.png");

// ── Image resolver ────────────────────────────────────────────────────────────
const getImageSource = (value) => {
  if (!value) return PLACEHOLDER;
  if (typeof value === "object" && value.uri) return { uri: value.uri };
  if (typeof value === "string" && value.length > 0) return { uri: value };
  if (typeof value === "number") return value;
  return PLACEHOLDER;
};

// ── Promotion normaliser ──────────────────────────────────────────────────────
const normalisePromotion = (item) => ({
  id: item._id || item.id,
  _id: item._id || item.id,
  product_id: item.product_id || null,
  image: item.banner_image
    ? { uri: item.banner_image }
    : item.image && typeof item.image === "string"
    ? { uri: item.image }
    : item.image || null,
  product_image: item.banner_image || item.image || null,
  title: item.title || item.name,
  description: item.description || "",
  shortDescription: item.description,
  status: item.status,
  start_date: item.start_date,
  end_date: item.end_date,
  price: item.price || 0,
  original_price: item.original_price || null,
  rating: item.rating || null,
  review_count: item.review_count || null,
  tags: item.tags || [],
  category_id: item.category_id || null,
  upc_id: item.upc_id || null,
});

const StoreViewPage = () => {
  const navigation = useNavigation();
  const { fetchStoreDetails, fetchTrendingProducts, fetchPromotions, user } =
    useStore();

  const [store, setStore] = useState(null);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Verification logic — same as Dashboard2 ───────────────────────────────
  const isVerified =
    store?.verified === true ||
    user?.verified === true ||
    user?.status === "approved" ||
    (user?.subscription?.status === "completed" &&
      user?.subscription_end_time &&
      new Date(user.subscription_end_time) > new Date());

  const daysLeft = user?.subscription_end_time
    ? Math.ceil(
        (new Date(user.subscription_end_time) - new Date()) /
          (1000 * 60 * 60 * 24),
      )
    : null;
  const isExpired = daysLeft !== null && daysLeft < 0;

  // ── Refresh on screen focus ───────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [storeData, trending, promo] = await Promise.all([
            fetchStoreDetails(),
            fetchTrendingProducts(),
            fetchPromotions(),
          ]);
          if (storeData) setStore(storeData);
          setTrendingProducts(trending || []);
          setPromotions(promo || []);
        } catch (error) {
          console.error("StoreViewPage fetch error:", error.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, []),
  );

  const formatCount = (n) => {
    if (!n) return "0";
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return `${n}`;
  };

  // ── Social icon helper — tappable if URL exists ───────────────────────────
  const SocialIcon = ({ url, children }) => {
    if (url) {
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      return (
        <TouchableOpacity
          onPress={() => Linking.openURL(fullUrl).catch(() => {})}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          {children}
        </TouchableOpacity>
      );
    }
    return <View style={{ opacity: 0.35 }}>{children}</View>;
  };

  // ── Trending card ─────────────────────────────────────────────────────────
  const renderTrendingItem = ({ item }) => (
    <Pressable
      style={styles.favouritePressable}
      onPress={() =>
        navigation.navigate("SinglePageItem", {
          productId: item.id,
          section: "Trending Products",
          data: trendingProducts,
        })
      }
    >
      <View style={styles.favouriteCard}>
        <View style={styles.cardImageWrapper}>
          <Image
            source={getImageSource(item.image)}
            style={styles.favouriteImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.favouriteDescriptionContainer}>
          <Text
            style={styles.favouriteDescription}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.description || item.title}
          </Text>
          <Text style={styles.favouriteDiscountPrice}>
            {item.discountPrice || (item.price ? `$${item.price}` : "")}
          </Text>
          {item.originalPrice ? (
            <Text style={styles.favouritePriceText}>
              <Text style={styles.favouriteOriginalPrice}>
                {item.originalPrice}
              </Text>
              {"  "}
              {item.totalDiscount}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );

  // ── Promotion card ────────────────────────────────────────────────────────
  const renderPromotionItem = ({ item: rawItem }) => {
    const item = normalisePromotion(rawItem);
    return (
      <Pressable
        style={styles.promotionPressable}
        onPress={() =>
          navigation.navigate("PromotionScreen", {
            section: "Promotions",
            data: promotions,
          })
        }
      >
        <View style={styles.promotionCard}>
          <View style={styles.cardImageWrapper}>
            <Image
              source={item.image || PLACEHOLDER}
              style={styles.promotionImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.promotionContent}>
            <Text
              style={styles.promotionTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.title}
            </Text>
            <Text
              style={styles.promotionDescription}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.shortDescription || item.description}
            </Text>
            <Text style={styles.promotionStatus}>
              {item.status || "Active"}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 2,
              }}
            >
              <GiftIcon width={12} height={12} />
              <Text style={[styles.promotionDate, { marginLeft: 4 }]}>
                {item.start_date
                  ? new Date(item.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : ""}
                {" to "}
                {item.end_date
                  ? new Date(item.end_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : ""}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading store...</Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="store" size={64} color="#ccc" />
        <Text
          style={[styles.loadingText, { textAlign: "center", marginTop: 12 }]}
        >
          {"Store not found.\nGo to Edit Profile to set up your store."}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.goBackBtn}
        >
          <Text style={styles.goBackBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* ── Hero Banner ───────────────────────────────────────────────────── */}
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.imgBg}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#C4C4C4" size={25} />
            </Pressable>
            <Text style={styles.headerText}>
              {store?.store_name || "Store"}
            </Text>
          </View>
        </View>

        {/* Store profile row */}
        <View style={styles.profileRow}>
          <View style={styles.profileImageContainer}>
            {store?.store_image ? (
              <Image
                source={{ uri: store.store_image }}
                style={styles.storeImage}
              />
            ) : (
              <HiddenFindsImg width="95%" />
            )}
          </View>

          <View style={styles.profileStats}>
            <View style={styles.storeNameRow}>
              <Text style={styles.storeNameText} numberOfLines={1}>
                {store?.store_name || "Store"}
              </Text>
              {/* Blue tick — only when verified and not expired */}
              {isVerified && !isExpired && <BoldTick width={20} />}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatCount(store?.followers)}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatCount(store?.likes)}
                </Text>
                <Text style={styles.statLabel}>Likes</Text>
              </View>
            </View>

            <Text style={styles.storeWebsite} numberOfLines={1}>
              {store?.website_url || store?.store_email || ""}
            </Text>

            {store?.working_days && (
              <Text style={styles.workingHours} numberOfLines={1}>
                🕐 {store.working_days}
              </Text>
            )}
            {store?.working_time && (
              <Text style={styles.workingHours} numberOfLines={1}>
                {store.working_time}
              </Text>
            )}
          </View>
        </View>
      </ImageBackground>

      {/* ── Action buttons ────────────────────────────────────────────────── */}
      <View style={styles.actionRow}>
        {/* Edit Profile */}
        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => navigation.navigate("EditProfileScreen")}
        >
          <MaterialIcons name="edit" size={18} color="#130160" />
          <Text style={styles.actionBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Verify button — mirrors Dashboard2 logic exactly */}
        <TouchableOpacity
          style={[
            styles.verifyBtn,
            isVerified && !isExpired && styles.verifiedBtn,
            isExpired && styles.expiredBtn,
          ]}
          onPress={() => {
            if (!isVerified || isExpired) navigation.navigate("GetVerified");
          }}
          disabled={isVerified && !isExpired}
        >
          {isExpired ? (
            <>
              <MaterialIcons name="refresh" size={18} color="#FF4444" />
              <Text style={[styles.actionBtnText, { color: "#FF4444" }]}>
                Renew Verification
              </Text>
            </>
          ) : isVerified ? (
            <>
              <MaterialIcons name="check-circle" size={18} color="#00B813" />
              <Text style={[styles.actionBtnText, { color: "#00B813" }]}>
                Verified
              </Text>
            </>
          ) : (
            <>
              <MaterialIcons name="verified-user" size={18} color="#130160" />
              <Text style={styles.actionBtnText}>Verify My Bin</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Store info ────────────────────────────────────────────────────── */}
      <View style={styles.contentHeader}>
        <Text style={styles.storeName}>
          {store?.store_name?.toUpperCase() || "STORE"}
        </Text>
      </View>

      <View style={styles.contentDetails}>
        {store?.address ? (
          <Text style={styles.detailText}>📍 {store.address}</Text>
        ) : null}
        {store?.phone_number ? (
          <Text style={styles.detailText}>📞 {store.phone_number}</Text>
        ) : null}
        {store?.store_email ? (
          <Text style={styles.detailText}>✉️ {store.store_email}</Text>
        ) : null}

        {/* Social media */}
        <View style={styles.socialRow}>
          <Text style={styles.detailText}>Social Media</Text>
          <View style={styles.socialMediaIcons}>
            <SocialIcon url={store?.facebook_link}>
              <FacebookIcon />
            </SocialIcon>
            <SocialIcon url={store?.twitter_link}>
              <TwitterIcon />
            </SocialIcon>
            <SocialIcon
              url={
                store?.whatsapp_link
                  ? `https://wa.me/${store.whatsapp_link.replace(/\D/g, "")}`
                  : null
              }
            >
              <WhatsappIcon />
            </SocialIcon>
            <SocialIcon url={store?.instagram_link || store?.linkedin_link}>
              <LinkedinIcon />
            </SocialIcon>
          </View>
        </View>
      </View>

      {/* ── Trending Products ─────────────────────────────────────────────── */}
      {trendingProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Products</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("AllProductsScreen", {
                  section: "Trending Products",
                  data: trendingProducts,
                })
              }
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.flatListPad}
          >
            {trendingProducts.slice(0, 7).map((item, i) => (
              <React.Fragment key={item.id?.toString() || `t-${i}`}>
                {renderTrendingItem({ item })}
              </React.Fragment>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Promotions ────────────────────────────────────────────────────── */}
      {promotions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PROMOTIONS</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.flatListPad}
          >
            {promotions.slice(0, 7).map((item, i) => (
              <React.Fragment key={item.id?.toString() || `p-${i}`}>
                {renderPromotionItem({ item })}
              </React.Fragment>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={{ height: hp(5) }} />
    </ScrollView>
  );
};

export default StoreViewPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    minHeight: hp(100),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    color: "#524B6B",
    fontFamily: "Nunito-Regular",
    fontSize: hp(2),
  },
  goBackBtn: {
    marginTop: 20,
    backgroundColor: "#130160",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goBackBtnText: {
    color: "#fff",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(2),
  },

  // ── Hero ─────────────────────────────────────────────────────────────────
  imgBg: {
    width: "100%",
    minHeight: hp(41),
    borderBottomEndRadius: 20,
    borderBottomLeftRadius: 20,
    backgroundColor: "#130160",
  },
  header: {
    width: wp(100),
    height: hp(7),
    marginTop: "10%",
    paddingHorizontal: "5%",
    flexDirection: "row",
    alignItems: "center",
  },
  headerChild: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerText: { fontFamily: "Nunito-Bold", fontSize: hp(3), color: "#C4C4C4" },

  // ── Profile row ──────────────────────────────────────────────────────────
  profileRow: {
    width: "95%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: hp(23),
    marginTop: "4%",
    marginBottom: "4%",
  },
  profileImageContainer: {
    width: "43%",
    justifyContent: "center",
    alignItems: "center",
  },
  storeImage: {
    width: "95%",
    height: hp(18),
    borderRadius: 12,
    resizeMode: "cover",
  },
  profileStats: {
    width: "55%",
    justifyContent: "space-around",
    paddingLeft: "2%",
  },
  storeNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  storeNameText: {
    fontFamily: "Roboto-SemiBold",
    color: "#fff",
    fontSize: hp(2.6),
    flex: 1,
  },
  statsRow: { flexDirection: "row", marginTop: "3%" },
  statItem: { width: "50%", paddingLeft: "2%" },
  statNumber: {
    fontFamily: "Roboto-ExtraBold",
    color: "#fff",
    fontSize: hp(3.2),
  },
  statLabel: { fontFamily: "Roboto-Regular", color: "#fff", fontSize: hp(1.8) },
  storeWebsite: {
    fontFamily: "Roboto-Thin",
    color: "#F8F8F8",
    fontSize: hp(1.7),
    marginTop: "4%",
  },
  workingHours: {
    fontFamily: "Roboto-Thin",
    color: "#ddd",
    fontSize: hp(1.5),
    marginTop: "1%",
  },

  // ── Action buttons ───────────────────────────────────────────────────────
  actionRow: {
    width: "90%",
    marginTop: "5%",
    height: hp(7),
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editProfileBtn: {
    width: "48%",
    borderWidth: 0.8,
    borderColor: "#130160",
    height: "90%",
    borderRadius: 7,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: "5%",
  },
  verifyBtn: {
    width: "48%",
    borderWidth: 0.8,
    borderColor: "#130160",
    height: "90%",
    borderRadius: 7,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: "5%",
  },
  verifiedBtn: {
    borderColor: "#00B813",
    backgroundColor: "#f0fff4",
  },
  expiredBtn: {
    borderColor: "#FF4444",
    backgroundColor: "#fff5f5",
  },
  actionBtnText: {
    fontFamily: "Nunito-SemiBold",
    color: "#000",
    fontSize: hp(1.9),
  },

  // ── Store info ───────────────────────────────────────────────────────────
  contentHeader: {
    width: "90%",
    marginHorizontal: "5%",
    marginTop: "5%",
  },
  storeName: { fontFamily: "Nunito-Bold", color: "#000", fontSize: hp(2.4) },
  contentDetails: { width: "90%", marginHorizontal: "5%", marginTop: "3%" },
  detailText: {
    color: "#000",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.8),
    marginVertical: "1.5%",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: "1%",
  },
  socialMediaIcons: { flexDirection: "row", gap: 10 },

  // ── Sections ─────────────────────────────────────────────────────────────
  section: {
    flex: 1,
    width: "94%",
    marginTop: hp(2),
    marginHorizontal: "3%",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: "2.5%",
    paddingRight: "3%",
  },
  sectionTitle: { fontFamily: "Nunito-Bold", fontSize: hp(2.3), color: "#000" },
  viewAllText: {
    color: "#524B6B",
    fontSize: hp(1.9),
    textDecorationLine: "underline",
  },
  flatListPad: { marginVertical: "1%" },

  // ── Shared card image wrapper ─────────────────────────────────────────────
  cardImageWrapper: {
    width: "100%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
  },

  // ── Trending cards ────────────────────────────────────────────────────────
  favouritePressable: {
    width: wp(46),
    marginRight: wp(3),
    marginVertical: hp(1),
  },
  favouriteCard: {
    width: "100%",
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  favouriteImage: {
    width: "100%",
    height: hp(15),
  },
  favouriteDescriptionContainer: {
    padding: wp(2.5),
  },
  favouriteDescription: {
    fontFamily: "Nunito-SemiBold",
    color: "#000",
    fontSize: hp(1.5),
    marginBottom: hp(0.4),
  },
  favouriteDiscountPrice: {
    fontFamily: "Nunito-Bold",
    color: "#000",
    fontSize: hp(1.8),
    marginBottom: hp(0.2),
  },
  favouritePriceText: {
    color: "red",
    fontSize: hp(1.4),
    fontFamily: "Nunito-Regular",
  },
  favouriteOriginalPrice: {
    fontFamily: "Nunito-Bold",
    color: "#808488",
    fontSize: hp(1.5),
    textDecorationLine: "line-through",
  },

  // ── Promotion cards ───────────────────────────────────────────────────────
  promotionPressable: {
    width: wp(46),
    marginRight: wp(3),
    marginVertical: hp(1),
  },
  promotionCard: {
    width: "100%",
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  promotionImage: {
    width: "100%",
    height: hp(16),
  },
  promotionContent: {
    padding: wp(2.5),
  },
  promotionTitle: {
    fontFamily: "DMSans-Bold",
    color: "#000",
    fontSize: hp(1.5),
    marginBottom: hp(0.3),
  },
  promotionDescription: {
    fontFamily: "Nunito-SemiBold",
    color: "#000",
    fontSize: hp(1.3),
    marginBottom: hp(0.2),
  },
  promotionStatus: {
    fontFamily: "Nunito-Bold",
    color: "#14BA9C",
    fontSize: hp(1.5),
    marginTop: hp(0.5),
  },
  promotionDate: {
    fontFamily: "Nunito-SemiBold",
    color: "#000",
    fontSize: hp(1.3),
    marginTop: hp(0.3),
  },
});
