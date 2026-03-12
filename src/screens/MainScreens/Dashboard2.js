import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Pressable,
  Linking,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import useStore from "../../store";

const PLACEHOLDER_STORE = require("../../../assets/store_profile.png");

// ─────────────────────────────────────────────────────────────────────────────
// Social platform config — maps store field → icon asset
// Only platforms where the store has a saved link will be rendered
// ─────────────────────────────────────────────────────────────────────────────
const SOCIAL_CONFIG = [
  { key: "facebook_link", icon: require("../../../assets/fb.png") },
  { key: "twitter_link", icon: require("../../../assets/x.png") },
  { key: "whatsapp_link", icon: require("../../../assets/whatsapp.png") },
  { key: "telegram_link", icon: require("../../../assets/telegram.png") },
  { key: "messenger_link", icon: require("../../../assets/messenger.png") },
  { key: "linkedin_link", icon: require("../../../assets/ln.png") },
];

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

  const user = useStore((state) => state.user);
  const store = useStore((state) => state.store);
  const fetchStoreDetails = useStore((state) => state.fetchStoreDetails);
  const fetchUserProfile = useStore((state) => state.fetchUserProfile);

  // Refresh on every screen focus
  useFocusEffect(
    useCallback(() => {
      fetchStoreDetails();
      fetchUserProfile();
    }, []),
  );

  const formatCount = (n) => {
    if (!n && n !== 0) return "—";
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return `${n}`;
  };

  // ── Verified / expiry logic ──
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

  // ── Social links — only render icons for platforms with a saved URL ──
  const activeSocialLinks = SOCIAL_CONFIG.filter((s) => store?.[s.key]?.trim());

  const handleSocialPress = (url) => {
    if (!url) return;
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    Linking.openURL(fullUrl).catch(() => {});
  };

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
      <ImageBackground
        source={require("../../../assets/hidden_find_dashboard.png")}
        style={styles.cardsContainer}
      >
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
          <View style={styles.infoContainer}>
            {/* Store Name + Bluetick (only when verified and not expired) */}
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
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatCount(store?.views_count || store?.views || 0)}
                </Text>
                <Text style={styles.statLabel}>Viewers</Text>
              </View>
            </View>

            {/* Website / Email */}
            <View style={styles.infoRow}>
              <Text style={styles.infoText} numberOfLines={1}>
                {store?.website_url ||
                  store?.store_email ||
                  "www.hiddenfinds.com"}
              </Text>
            </View>

            {/* Address */}
            <View style={styles.infoRow}>
              <Text style={styles.infoText} numberOfLines={1}>
                {store?.address
                  ? store.address.length > 30
                    ? store.address.slice(0, 30) + "..."
                    : store.address
                  : "104, St. Plymoth, UK"}
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

              {/* Dynamic social icons — only renders platforms with a saved URL.
                  Tapping opens the link in the device browser. */}
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
      </ImageBackground>

      {/* ── Get Verified CTA (smart: shows only when needed, red if expired) ── */}
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
  container: { flex: 1, paddingVertical: 16 },
  header: { marginBottom: 12 },
  greeting: { fontSize: hp(2.4), fontFamily: "Nunito-Bold", color: "#000" },
  name: {
    color: "#000",
    fontFamily: "Nunito-Bold",
    textDecorationLine: "underline",
  },
  subtext: { fontSize: wp(3.5), color: "#000", fontFamily: "Nunito-Bold" },

  // Fixed height card; overflow NOT hidden on rightColumn so icons aren't clipped
  cardsContainer: {
    flexDirection: "row",
    width: "100%",
    height: hp(35),
    borderRadius: 7,
  },
  leftColumn: {
    width: "40%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  storeImageWrapper: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    overflow: "hidden",
  },
  storeImage: { width: "100%", height: "100%" },
  rightColumn: {
    width: "60%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  // height 85% (was 75%) — extra room for social icons row
  infoContainer: { width: "97%", height: "85%", flexDirection: "column" },

  nameRow: {
    height: "18%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: "2%",
    width: "93%",
  },
  storeName: {
    fontFamily: "Roboto-SemiBold",
    color: "#14BA9C",
    fontSize: hp(3),
    flex: 1,
  },
  bluetick: { width: wp(7), height: wp(7) },

  statsRow: { height: "28%", flexDirection: "row" },
  statItem: { width: "33%", paddingLeft: "1%", justifyContent: "center" },
  statNumber: {
    fontFamily: "Roboto-ExtraBold",
    color: "#fff",
    fontSize: hp(2.5),
  },
  statLabel: { fontFamily: "Roboto-Regular", color: "#fff", fontSize: hp(1.3) },

  infoRow: { height: "12%", justifyContent: "center" },
  infoText: { fontFamily: "Roboto-Thin", color: "#fff", fontSize: hp(1.5) },

  // No fixed height — content sizes naturally, icons never cut off
  actionContainer: {
    marginTop: hp(0.5),
    justifyContent: "flex-start",
    width: "85%",
  },
  editBtn: {
    width: "100%",
    height: hp(3),
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  editBtnText: {
    color: "#000",
    fontSize: hp(1.7),
    fontFamily: "DMSans-SemiBold",
  },

  // Social row: wraps on small screens so nothing overflows
  socialIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1),
    gap: wp(2.5),
    flexWrap: "wrap",
  },
  socialIcon: { width: wp(5), height: wp(5) },

  enrollNowContainer: {
    width: wp(95),
    alignSelf: "center",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: hp(1),
  },
  libButton: {
    width: "95%",
    height: hp(3.5),
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
