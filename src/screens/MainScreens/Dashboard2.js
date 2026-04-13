import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Pressable,
  Linking,
  ActivityIndicator,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import useStore from "../../store";

const PLACEHOLDER_STORE = require("../../../assets/store_profile.png");

const SOCIAL_CONFIG = [
  { key: "facebook_link", icon: require("../../../assets/fb.png") },
  { key: "twitter_link", icon: require("../../../assets/x.png") },
  { key: "whatsapp_link", icon: require("../../../assets/whatsapp.png") },
  { key: "telegram_link", icon: require("../../../assets/telegram.png") },
  { key: "messenger_link", icon: require("../../../assets/messenger.png") },
  { key: "linkedin_link", icon: require("../../../assets/ln.png") },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const getDaysRemaining = (dateStr) => {
  if (!dateStr) return null;
  const expiry = new Date(dateStr);
  const today = new Date();
  expiry.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

const Dashboard2 = () => {
  const navigation = useNavigation();

  const { fetchStoreDetails, fetchUserProfile, user } = useStore();
  const [store, setStore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [storeData] = await Promise.all([
            fetchStoreDetails(),
            fetchUserProfile(),
          ]);
          if (storeData) setStore(storeData);
        } catch (error) {
          console.error("Dashboard2 fetch error:", error.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, []),
  );

  const formatCount = (n) => {
    if (!n && n !== 0) return "—";
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return `${n}`;
  };

  const isVerified =
    store?.verified === true ||
    user?.verified === true ||
    user?.status === "approved" ||
    (user?.subscription?.status === "completed" &&
      user?.subscription_end_time &&
      new Date(user.subscription_end_time) > new Date());

  const daysLeft = getDaysRemaining(user?.subscription_end_time);
  const isExpired = daysLeft !== null && daysLeft < 0;
  const showGetVerifiedButton = !isVerified || isExpired;

  const activeSocialLinks = SOCIAL_CONFIG.filter((s) => store?.[s.key]?.trim());

  const handleSocialPress = (url) => {
    if (!url) return;
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    Linking.openURL(fullUrl).catch(() => {});
  };

  const activeDailyRates = DAYS.filter((day) => store?.daily_rates?.[day]);

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Welcome, <Text style={styles.name}>{user?.full_name || "User"}</Text>
        </Text>
        <Text style={styles.subtext}>
          Customize your store's details to attract and engage customers.
        </Text>
      </View>

      {/* ── Store Profile Card ── */}
      {isLoading ? (
        <View style={styles.cardLoading}>
          <ActivityIndicator size="large" color="#130160" />
        </View>
      ) : !store ? (
        <View style={styles.cardLoading}>
          <Text style={styles.noStoreText}>No store data found.</Text>
        </View>
      ) : (
        <ImageBackground
          source={require("../../../assets/hidden_find_dashboard.png")}
          style={styles.cardsContainer}
          borderRadius={7}
        >
          {/* ── Top half: image + bio ── */}
          <View style={styles.topRow}>

            {/* Left: Store Image */}
            <View style={styles.leftColumn}>
              <View style={styles.storeImageWrapper}>
                <Image
                  source={
                    store?.store_image
                      ? { uri: store.store_image }
                      : PLACEHOLDER_STORE
                  }
                  style={styles.storeImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Right: Store Info */}
            <View style={styles.rightColumn}>

              {/* Store Name + Bluetick */}
              <View style={styles.nameRow}>
                <Text style={styles.storeName} numberOfLines={1}>
                  {store?.store_name || "Hidden Finds"}
                </Text>
                {isVerified && !isExpired && (
                  <Image
                    source={require("../../../assets/bluetick.png")}
                    style={styles.bluetick}
                  />
                )}
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatCount(store?.followers)}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatCount(store?.likes)}</Text>
                  <Text style={styles.statLabel}>Likes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatCount(store?.views_count || store?.views || 0)}</Text>
                  <Text style={styles.statLabel}>Viewers</Text>
                </View>
              </View>

              {/* Address */}
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoText} numberOfLines={1}>
                  {store?.address || "No address set"}
                </Text>
              </View>

              {/* Phone */}
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📞</Text>
                <Text style={styles.infoText} numberOfLines={1}>
                  {store?.phone_number || "No phone set"}
                </Text>
              </View>

              {/* Edit Profile + Social Icons */}
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate("EditProfileScreen")}
                >
                  <Text style={styles.editBtnText}>Edit Profile</Text>
                </TouchableOpacity>

                {activeSocialLinks.length > 0 && (
                  <View style={styles.socialIcons}>
                    {activeSocialLinks.map((social) => (
                      <TouchableOpacity
                        key={social.key}
                        onPress={() => handleSocialPress(store[social.key])}
                        activeOpacity={0.7}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Image
                          source={social.icon}
                          style={styles.socialIcon}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

            </View>
          </View>

          {/* ── Daily Rates — INSIDE the card, full width below top row ── */}
          {activeDailyRates.length > 0 && (
            <View style={styles.dailyRatesInCard}>
              <View style={styles.dailyRatesDivider} />
              <Text style={styles.dailyRatesTitleInCard}>💰 Daily Rates</Text>
              <View style={styles.ratesGrid}>
                {activeDailyRates.map((day) => (
                  <View key={day} style={styles.rateCard}>
                    <Text style={styles.rateDay}>{day.slice(0, 3)}</Text>
                    <Text style={styles.rateValue}>{store.daily_rates[day]}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        </ImageBackground>
      )}

      {/* ── Get Verified CTA ── */}
      {showGetVerifiedButton && (
        <View style={styles.enrollNowContainer}>
          <Pressable
            style={[
              styles.libButton,
              { backgroundColor: isExpired ? "#FF4444" : "#130160" },
            ]}
            onPress={() => navigation.navigate("GetVerified")}
          >
            <Text style={styles.liBbuttonText}>
              {isExpired ? "🔄 Renew Verification" : "🏆 Get Verified"}
            </Text>
          </Pressable>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 0},
  header: { marginBottom: 12 },
  greeting: { fontSize: hp(2.4), fontFamily: "Nunito-Bold", color: "#000" },
  name: {
    color: "#000",
    fontFamily: "Nunito-Bold",
    textDecorationLine: "underline",
  },
  subtext: { fontSize: wp(3.5), color: "#000", fontFamily: "Nunito-Bold" },

  cardLoading: {
    width: "100%",
    height: hp(20),
    borderRadius: 7,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  noStoreText: {
    fontFamily: "Nunito-Regular",
    color: "#888",
    fontSize: hp(1.8),
  },

  // Card grows to fit all content including daily rates
  cardsContainer: {
    width: "100%",
    borderRadius: 7,
    paddingBottom: hp(1.5),
  },

  // Top half: image left + info right
  topRow: {
    flexDirection: "row",
    width: "100%",
    paddingVertical: hp(1.5),
  },

  leftColumn: {
    width: "38%",
    justifyContent: "center",
    alignItems: "center",
  },
  storeImageWrapper: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    overflow: "hidden",
  },
  storeImage: { width: "100%", height: "100%" },

  rightColumn: {
    width: "62%",
    justifyContent: "center",
    paddingRight: wp(2),
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.5),
    paddingRight: wp(2),
  },
  storeName: {
    fontFamily: "Roboto-SemiBold",
    color: "#14BA9C",
    fontSize: hp(2.6),
    flex: 1,
  },
  bluetick: { width: wp(6), height: wp(6) },

  statsRow: {
    flexDirection: "row",
    marginBottom: hp(0.8),
  },
  statItem: { width: "33%", paddingLeft: "1%" },
  statNumber: {
    fontFamily: "Roboto-ExtraBold",
    color: "#fff",
    fontSize: hp(2.2),
  },
  statLabel: {
    fontFamily: "Roboto-Regular",
    color: "#fff",
    fontSize: hp(1.2),
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.5),
    paddingRight: wp(2),
  },
  infoIcon: { fontSize: hp(1.5), marginRight: 5 },
  infoText: {
    fontFamily: "Roboto-Thin",
    color: "#fff",
    fontSize: hp(1.45),
    flex: 1,
  },

  actionContainer: {
    marginTop: hp(0.8),
    width: "88%",
  },
  editBtn: {
    width: "100%",
    height: hp(3),
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  editBtnText: {
    color: "#000",
    fontSize: hp(1.7),
    fontFamily: "DMSans-SemiBold",
  },
  socialIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(0.8),
    gap: wp(2.5),
    flexWrap: "wrap",
  },
  socialIcon: { width: wp(5), height: wp(5) },

  // ── Daily Rates inside card ──
  dailyRatesInCard: {
    width: "100%",
    paddingHorizontal: wp(4),
    paddingBottom: hp(1),
  },
  dailyRatesDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: hp(1),
  },
  dailyRatesTitleInCard: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(1.8),
    color: "#fff",
    marginBottom: hp(1),
  },
  ratesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
  },
  rateCard: {
    width: wp(18),
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    paddingVertical: hp(0.8),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  rateDay: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(1),
    color: "#fff",
    marginBottom: 2,
  },
  rateValue: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1),
    color: "#14BA9C",
  },

  enrollNowContainer: {
    width: wp(95),
    alignSelf: "center",
    alignItems: "center",
    marginTop: hp(0.8),
  },
  libButton: {
    width: "95%",
    height: hp(3),
    borderRadius: 7,
    justifyContent: "center",
  },
  liBbuttonText: {
    color: "white",
    fontSize: hp(1.4),
    fontFamily: "Nunito-Bold",
    textAlign: "center",
  },
});

export default Dashboard2;