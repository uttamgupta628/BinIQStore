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
import React, { useState, useEffect, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import LocationIcon from "../../../assets/LocationIcon.svg";
import FacebookIcon from "../../../assets/FacebookIcon.svg";
import TwitterIcon from "../../../assets/TwitterIcon.svg";
import WhatsappIcon from "../../../assets/WhatsappIcon.svg";
import LinkedinIcon from "../../../assets/LinkedinIcon.svg";
import HiddenFindsImg from "../../../assets/hidden_find_img.svg";
import BoldTick from "../../../assets/bold_tick.svg";
import GreenTick from "../../../assets/green_tick.svg";
import GiftIcon from "../../../assets/promo_Date.svg";
import useStore from "../../store";

const { width } = Dimensions.get("window");
const PLACEHOLDER = require("../../../assets/slider_1.png");

const StoreViewPage = () => {
  const navigation = useNavigation();
  const {
    fetchStoreDetails,
    fetchTrendingProducts,
    fetchPromotions,
  } = useStore();

  const [store, setStore] = useState(null);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ useFocusEffect: refreshes when user navigates back from EditProfile
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
    }, []) // ✅ empty — fetch functions are stable references from Zustand
  );

  // ─── Render helpers ───────────────────────────────────────────────

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
        <Image
          source={item.image || PLACEHOLDER}
          style={styles.favouriteImage}
        />
        <View style={styles.favouriteDescriptionContainer}>
          <Text style={styles.favouriteDescription} numberOfLines={2}>
            {item.description || item.title}
          </Text>
        </View>
        <View style={styles.favouritePriceContainer}>
          <Text style={styles.favouriteDiscountPrice}>{item.discountPrice || `$${item.price}`}</Text>
          {item.originalPrice ? (
            <Text style={styles.favouritePriceText}>
              <Text style={styles.favouriteOriginalPrice}>{item.originalPrice}</Text>
              {"  "}{item.totalDiscount}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );

  const renderPromotionItem = ({ item }) => (
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
        <Image
          source={item.image || PLACEHOLDER}
          style={styles.promotionImage}
        />
        <View style={styles.promotionContent}>
          <Text style={styles.promotionTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.promotionDescription} numberOfLines={1}>{item.shortDescription || item.description}</Text>
          <Text style={styles.promotionStatus}>Active</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
            <GiftIcon width={12} height={12} />
            <Text style={[styles.promotionDate, { marginLeft: 4 }]}>
              {item.dateRange || "Limited time"}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  // ─── Stars helper ────────────────────────────────────────────────
  const renderStars = (rating = 0) => {
    const full = Math.floor(rating);
    return [1, 2, 3, 4, 5].map((i) => (
      <FontAwesome
        key={i}
        name="star"
        size={15}
        color={i <= full ? "#FFD700" : "#e6e6e6"}
      />
    ));
  };

  const formatCount = (n) => {
    if (!n) return "0";
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return `${n}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={{ marginTop: 12, color: "#524B6B", fontFamily: "Nunito-Regular", fontSize: 16 }}>
          Loading store...
        </Text>
      </View>
    );
  }

  // ✅ Guard: if store couldn't be loaded, show a friendly message
  if (!store) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="store" size={64} color="#ccc" />
        <Text style={{ marginTop: 12, color: "#524B6B", fontFamily: "Nunito-SemiBold", fontSize: 16, textAlign: "center" }}>
          {"Store not found.\nGo to Edit Profile to set up your store."}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20, backgroundColor: "#130160", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
        >
          <Text style={{ color: "#fff", fontFamily: "Nunito-SemiBold", fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* ── Hero Banner ─────────────────────────────────────── */}
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
          {/* Left: store image or placeholder SVG */}
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

          {/* Right: stats */}
          <View style={styles.profileStats}>
            {/* Name + verified */}
            <View style={styles.storeNameRow}>
              <Text style={styles.storeNameText} numberOfLines={1}>
                {store?.store_name || "Store"}
              </Text>
              {store?.verified && <BoldTick width={20} />}
            </View>

            {/* Followers + Likes */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{formatCount(store?.followers)}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{formatCount(store?.likes)}</Text>
                <Text style={styles.statLabel}>Likes</Text>
              </View>
            </View>

            {/* Email / website */}
            <Text style={styles.storeWebsite} numberOfLines={1}>
              {store?.website_url || store?.store_email || ""}
            </Text>

            {/* Working hours */}
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

      {/* ── Action buttons ───────────────────────────────────── */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.checkInBtn}>
          <LocationIcon />
          <Text style={styles.actionBtnText}>Check In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.verifyBtn}>
          <GreenTick />
          <Text style={styles.actionBtnText}>Verify My Bin</Text>
        </TouchableOpacity>
      </View>

      {/* ── Store info ───────────────────────────────────────── */}
      <View style={styles.contentHeader}>
        <Text style={styles.storeName}>{store?.store_name?.toUpperCase() || "STORE"}</Text>
        <View style={styles.review}>
          {renderStars(store?.ratings)}
          <Text style={styles.reviewCount}> {store?.rating_count || 0}</Text>
        </View>
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
            {store?.facebook_link ? (
              <TouchableOpacity onPress={() => Linking.openURL(store.facebook_link).catch(() => {})}>
                <FacebookIcon />
              </TouchableOpacity>
            ) : <FacebookIcon />}
            {store?.twitter_link ? (
              <TouchableOpacity onPress={() => Linking.openURL(store.twitter_link).catch(() => {})}>
                <TwitterIcon />
              </TouchableOpacity>
            ) : <TwitterIcon />}
            {store?.whatsapp_link ? (
              <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${store.whatsapp_link}`).catch(() => {})}>
                <WhatsappIcon />
              </TouchableOpacity>
            ) : <WhatsappIcon />}
            {store?.instagram_link ? (
              <TouchableOpacity onPress={() => Linking.openURL(store.instagram_link).catch(() => {})}>
                <LinkedinIcon />
              </TouchableOpacity>
            ) : <LinkedinIcon />}
          </View>
        </View>
      </View>

      {/* ── Trending Products ────────────────────────────────── */}
      {trendingProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Products</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AllProductsScreen", {
                section: "Trending Products", data: trendingProducts,
              })}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.flatListPad}>
            {trendingProducts.slice(0, 7).map((item, i) => (
              <React.Fragment key={item.id?.toString() || `t-${i}`}>
                {renderTrendingItem({ item })}
              </React.Fragment>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Promotions ───────────────────────────────────────── */}
      {promotions.length > 0 && (
        <View style={[styles.section, { height: hp(30) }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PROMOTIONS</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.flatListPad}>
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
  loadingContainer: { height: hp(100), justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },

  // Hero
  imgBg: { width: "100%", minHeight: hp(41), borderBottomEndRadius: 20, borderBottomLeftRadius: 20, backgroundColor: "#130160" },
  header: { width: wp(100), height: hp(7), marginTop: "10%", paddingHorizontal: "5%", flexDirection: "row", alignItems: "center" },
  headerChild: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerText: { fontFamily: "Nunito-Bold", fontSize: hp(3), color: "#C4C4C4" },

  // Profile row
  profileRow: { width: "95%", alignSelf: "center", flexDirection: "row", justifyContent: "space-between", minHeight: hp(23), marginTop: "4%", marginBottom: "4%" },
  profileImageContainer: { width: "43%", justifyContent: "center", alignItems: "center" },
  storeImage: { width: "95%", height: hp(18), borderRadius: 12, resizeMode: "cover" },
  profileStats: { width: "55%", justifyContent: "space-around", paddingLeft: "2%" },
  storeNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  storeNameText: { fontFamily: "Roboto-SemiBold", color: "#fff", fontSize: hp(2.6), flex: 1 },
  statsRow: { flexDirection: "row", marginTop: "3%" },
  statItem: { width: "50%", paddingLeft: "2%" },
  statNumber: { fontFamily: "Roboto-ExtraBold", color: "#fff", fontSize: hp(3.2) },
  statLabel: { fontFamily: "Roboto-Regular", color: "#fff", fontSize: hp(1.8) },
  storeWebsite: { fontFamily: "Roboto-Thin", color: "#F8F8F8", fontSize: hp(1.7), marginTop: "4%" },
  workingHours: { fontFamily: "Roboto-Thin", color: "#ddd", fontSize: hp(1.5), marginTop: "1%" },

  // Actions
  actionRow: { width: "90%", marginTop: "5%", height: hp(7), alignSelf: "center", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  checkInBtn: { width: "48%", borderWidth: 0.8, borderColor: "red", height: "90%", borderRadius: 7, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: "9%" },
  verifyBtn: { width: "48%", borderWidth: 0.8, borderColor: "#00B813", height: "90%", borderRadius: 7, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: "5%" },
  actionBtnText: { fontFamily: "Nunito-SemiBold", color: "#000", fontSize: hp(1.9) },

  // Info
  contentHeader: { width: "90%", marginHorizontal: "5%", marginTop: "5%", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  storeName: { fontFamily: "Nunito-Bold", color: "#000", fontSize: hp(2.4) },
  review: { flexDirection: "row", alignItems: "center" },
  reviewCount: { fontFamily: "Nunito-SemiBold", color: "#828282", fontSize: hp(1.8) },
  contentDetails: { width: "90%", marginHorizontal: "5%", marginTop: "3%" },
  detailText: { color: "#000", fontFamily: "Nunito-SemiBold", fontSize: hp(1.8), marginVertical: "1.5%" },
  socialRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: "1%" },
  socialMediaIcons: { flexDirection: "row", gap: 10 },

  // Sections
  section: { flex: 1, width: "94%", marginTop: hp(2), marginHorizontal: "3%" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginVertical: "2.5%", paddingRight: "3%" },
  sectionTitle: { fontFamily: "Nunito-Bold", fontSize: hp(2.3), color: "#000" },
  viewAllText: { color: "#524B6B", fontSize: hp(1.9), textDecorationLine: "underline" },
  flatListPad: { marginVertical: "2%" },

  // Trending
  favouritePressable: { width: wp(45), height: hp(26), marginRight: wp(2) },
  favouriteCard: { width: wp(43), height: hp(25), borderRadius: 5, elevation: 2, backgroundColor: "#fff" },
  favouriteImage: { width: wp(43), height: hp(13), borderRadius: 5 },
  favouriteDescriptionContainer: { paddingHorizontal: "3%", marginTop: "2%" },
  favouriteDescription: { fontFamily: "Nunito-SemiBold", color: "#000", fontSize: hp(1.5) },
  favouritePriceContainer: { position: "absolute", bottom: "3%", paddingHorizontal: "3%" },
  favouriteDiscountPrice: { fontFamily: "Nunito-Bold", color: "#000", fontSize: hp(1.8) },
  favouritePriceText: { color: "red" },
  favouriteOriginalPrice: { fontFamily: "Nunito-Bold", color: "#808488", fontSize: hp(1.8), textDecorationLine: "line-through" },

  // Promotions
  promotionPressable: { width: wp(33), height: hp(23), marginRight: wp(1) },
  promotionCard: { width: wp(30), height: hp(22), borderRadius: 10, elevation: 4, backgroundColor: "#fff" },
  promotionImage: { width: "100%", height: hp(12), borderRadius: 10 },
  promotionContent: { paddingHorizontal: "5%", marginTop: "4%" },
  promotionTitle: { fontFamily: "Nunito-Bold", color: "#000", fontSize: hp(1.4) },
  promotionDescription: { fontFamily: "Nunito-SemiBold", color: "#555", fontSize: hp(1.3) },
  promotionStatus: { fontFamily: "Nunito-Bold", color: "#14BA9C", fontSize: hp(1.4), marginTop: "4%" },
  promotionDate: { fontFamily: "Nunito-SemiBold", color: "#000", fontSize: hp(1.3) },
});