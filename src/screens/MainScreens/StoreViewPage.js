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
  FlatList,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import React, { useState, useCallback, useRef } from "react";
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
const CAROUSEL_WIDTH = width;
const CAROUSEL_HEIGHT = hp(30);

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

// ── Store Images Carousel ─────────────────────────────────────────────────────
const StoreImageCarousel = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  if (!images || images.length === 0) return null;

  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CAROUSEL_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={carouselStyles.wrapper}>
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={images}
        keyExtractor={(_, i) => `carousel-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={carouselStyles.slide}>
            <Image
              source={{ uri: item }}
              style={carouselStyles.image}
              resizeMode="cover"
            />
            {/* Gradient overlay at bottom */}
            <View style={carouselStyles.overlay} />
          </View>
        )}
      />

      {/* Dot indicators */}
      {images.length > 1 && (
        <View style={carouselStyles.dotsRow}>
          {images.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: i, animated: true });
                setActiveIndex(i);
              }}
              style={[
                carouselStyles.dot,
                i === activeIndex && carouselStyles.dotActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Counter badge */}
      <View style={carouselStyles.counter}>
        <MaterialIcons name="photo-library" size={12} color="#fff" />
        <Text style={carouselStyles.counterText}>
          {activeIndex + 1} / {images.length}
        </Text>
      </View>
    </View>
  );
};

const carouselStyles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: CAROUSEL_HEIGHT,
    backgroundColor: "#0a0a1a",
  },
  slide: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: hp(8),
    backgroundColor: "transparent",
    // Simulates a gradient fade — use expo-linear-gradient if available
  },
  dotsRow: {
    position: "absolute",
    bottom: hp(1.8),
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  counter: {
    position: "absolute",
    top: hp(1.5),
    right: wp(3.5),
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: wp(2.5),
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  counterText: {
    color: "#fff",
    fontSize: hp(1.4),
    fontFamily: "Nunito-SemiBold",
  },
});

// ── Main Component ────────────────────────────────────────────────────────────
const StoreViewPage = () => {
  const navigation = useNavigation();
  const { fetchStoreDetails, fetchTrendingProducts, fetchPromotions, user } =
    useStore();

  const [store, setStore] = useState(null);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Verification logic ────────────────────────────────────────────────────
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

  // ── Refresh on focus ──────────────────────────────────────────────────────
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

  // ── Social icon helper ────────────────────────────────────────────────────
  const SocialIcon = ({ url, children }) => {
    if (url) {
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      return (
        <TouchableOpacity
          onPress={() => Linking.openURL(fullUrl).catch(() => {})}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.socialIconBtn}
        >
          {children}
        </TouchableOpacity>
      );
    }
    return <View style={[styles.socialIconBtn, { opacity: 0.3 }]}>{children}</View>;
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
            {/* Status badge over image */}
            <View style={styles.promotionBadge}>
              <Text style={styles.promotionBadgeText}>
                {item.status || "Active"}
              </Text>
            </View>
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
            <View style={styles.promotionDateRow}>
              <GiftIcon width={12} height={12} />
              <Text style={styles.promotionDate}>
                {item.start_date
                  ? new Date(item.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : ""}
                {" – "}
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
        <Text style={[styles.loadingText, { textAlign: "center", marginTop: 12 }]}>
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

  // Normalise store_images — filter out empty/null values
  const storeImages =
    Array.isArray(store?.store_images)
      ? store.store_images.filter((img) => typeof img === "string" && img.trim())
      : [];

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

        {/* Verify button */}
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

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <View style={styles.divider} />

      {/* ── Store Gallery (MOVED HERE — before Trending Products) ─────────── */}
      {storeImages.length > 0 && (
        <View style={styles.gallerySection}>
          {/* Gallery header */}
          <View style={styles.gallerySectionHeader}>
            <View style={styles.galleryTitleRow}>
              <View style={styles.galleryIconBadge}>
                <MaterialIcons name="photo-library" size={16} color="#fff" />
              </View>
              <Text style={styles.gallerySectionTitle}>Store Gallery</Text>
            </View>
            <View style={styles.galleryCountBadge}>
              <Text style={styles.galleryCountText}>
                {storeImages.length} Photo{storeImages.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          {/* Carousel */}
          <View style={styles.galleryCarouselWrapper}>
            <StoreImageCarousel images={storeImages} />
          </View>
        </View>
      )}

      {/* ── Trending Products ─────────────────────────────────────────────── */}
      {trendingProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionAccentBar, { backgroundColor: "#130160" }]} />
              <Text style={styles.sectionTitle}>Trending Products</Text>
            </View>
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
            contentContainerStyle={{ paddingRight: wp(3) }}
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
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionAccentBar, { backgroundColor: "#14BA9C" }]} />
              <Text style={styles.sectionTitle}>Promotions</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.flatListPad}
            contentContainerStyle={{ paddingRight: wp(3) }}
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
  container: { flex: 1, backgroundColor: "#F7F8FC" },
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
    borderBottomEndRadius: 24,
    borderBottomLeftRadius: 24,
    backgroundColor: "#130160",
    overflow: "hidden",
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
    borderRadius: 14,
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
    marginTop: hp(2.5),
    height: hp(7),
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editProfileBtn: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#130160",
    height: "90%",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: "5%",
    backgroundColor: "#fff",
    shadowColor: "#130160",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  verifyBtn: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#130160",
    height: "90%",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: "5%",
    backgroundColor: "#fff",
    shadowColor: "#130160",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
    marginTop: hp(2.5),
  },
  storeName: {
    fontFamily: "Nunito-Bold",
    color: "#0a0a2e",
    fontSize: hp(2.4),
    letterSpacing: 0.8,
  },
  contentDetails: {
    width: "90%",
    marginHorizontal: "5%",
    marginTop: "2%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: wp(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  detailText: {
    color: "#333",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.8),
    marginVertical: hp(0.8),
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(0.5),
  },
  socialMediaIcons: { flexDirection: "row", gap: 8, alignItems: "center" },
  socialIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F8",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: {
    width: "90%",
    alignSelf: "center",
    height: 1,
    backgroundColor: "#E8E8F0",
    marginTop: hp(2.5),
  },

  // ── Gallery Section ───────────────────────────────────────────────────────
  gallerySection: {
    width: "90%",
    alignSelf: "center",
    marginTop: hp(2.5),
    borderRadius: 16,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#130160",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  gallerySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.4),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F8",
  },
  galleryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  galleryIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#130160",
    justifyContent: "center",
    alignItems: "center",
  },
  gallerySectionTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2),
    color: "#0a0a2e",
  },
  galleryCountBadge: {
    backgroundColor: "#F0F0F8",
    paddingHorizontal: wp(2.5),
    paddingVertical: 4,
    borderRadius: 20,
  },
  galleryCountText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.5),
    color: "#524B6B",
  },
  galleryCarouselWrapper: {
    width: "100%",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
  },

  // ── Sections ─────────────────────────────────────────────────────────────
  section: {
    width: "94%",
    marginTop: hp(2.5),
    marginHorizontal: "3%",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
    paddingRight: "1%",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionAccentBar: {
    width: 4,
    height: hp(2.4),
    borderRadius: 2,
  },
  sectionTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.3),
    color: "#0a0a2e",
  },
  viewAllText: {
    color: "#524B6B",
    fontSize: hp(1.8),
    fontFamily: "Nunito-SemiBold",
    textDecorationLine: "underline",
  },
  flatListPad: { marginVertical: hp(0.5) },

  // ── Shared card image wrapper ─────────────────────────────────────────────
  cardImageWrapper: {
    width: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },

  // ── Trending cards ────────────────────────────────────────────────────────
  favouritePressable: {
    width: wp(44),
    marginRight: wp(3),
    marginVertical: hp(0.8),
  },
  favouriteCard: {
    width: "100%",
    borderRadius: 12,
    elevation: 3,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  favouriteImage: { width: "100%", height: hp(15) },
  favouriteDescriptionContainer: { padding: wp(2.5) },
  favouriteDescription: {
    fontFamily: "Nunito-SemiBold",
    color: "#222",
    fontSize: hp(1.5),
    marginBottom: hp(0.4),
    lineHeight: hp(2.1),
  },
  favouriteDiscountPrice: {
    fontFamily: "Nunito-Bold",
    color: "#130160",
    fontSize: hp(1.9),
    marginBottom: hp(0.2),
  },
  favouritePriceText: {
    color: "red",
    fontSize: hp(1.4),
    fontFamily: "Nunito-Regular",
  },
  favouriteOriginalPrice: {
    fontFamily: "Nunito-Bold",
    color: "#aaa",
    fontSize: hp(1.4),
    textDecorationLine: "line-through",
  },

  // ── Promotion cards ───────────────────────────────────────────────────────
  promotionPressable: {
    width: wp(46),
    marginRight: wp(3),
    marginVertical: hp(0.8),
  },
  promotionCard: {
    width: "100%",
    borderRadius: 12,
    elevation: 3,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  promotionImage: { width: "100%", height: hp(16) },
  promotionBadge: {
    position: "absolute",
    top: hp(1),
    left: wp(2),
    backgroundColor: "#14BA9C",
    paddingHorizontal: wp(2),
    paddingVertical: 3,
    borderRadius: 20,
  },
  promotionBadgeText: {
    fontFamily: "Nunito-Bold",
    color: "#fff",
    fontSize: hp(1.3),
  },
  promotionContent: { padding: wp(2.5) },
  promotionTitle: {
    fontFamily: "DMSans-Bold",
    color: "#0a0a2e",
    fontSize: hp(1.6),
    marginBottom: hp(0.3),
  },
  promotionDescription: {
    fontFamily: "Nunito-SemiBold",
    color: "#555",
    fontSize: hp(1.35),
    marginBottom: hp(0.4),
    lineHeight: hp(1.9),
  },
  promotionDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: hp(0.4),
  },
  promotionDate: {
    fontFamily: "Nunito-SemiBold",
    color: "#524B6B",
    fontSize: hp(1.3),
  },
});