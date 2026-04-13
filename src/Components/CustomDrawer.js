// src/components/CustomDrawer.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import useStore from "../store"; // ← adjust path if needed

const { width } = Dimensions.get("window");

const PLAN_META = {
  free:  { label: "Free Plan", color: "#14BA9C", bg: "#E4F3EE" },
  tier1: { label: "Tier 1",    color: "#14BA9C", bg: "#E4F3EE" },
  tier2: { label: "Tier 2",    color: "#7B5EA7", bg: "#F3EEF9" },
  tier3: { label: "Tier 3",    color: "#E8A020", bg: "#FFF3E0" },
};

const getPlanKey = (user) => {
  const sub = user?.subscription;
  if (!sub) return "free";
  if (typeof sub === "object") return sub.plan || "free";
  return "free";
};

const formatExpiry = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date)) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getDaysRemaining = (dateStr) => {
  if (!dateStr) return null;
  const expiry = new Date(dateStr);
  const today = new Date();
  expiry.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

const CustomDrawer = ({ isOpen, closeDrawer }) => {
  const navigation = useNavigation();
  const translateX = React.useRef(new Animated.Value(-width)).current;

  const { user, logout, fetchUserProfile } = useStore();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  // Animate open/close
  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  // Fetch fresh profile every time drawer opens
  useEffect(() => {
    if (isOpen) loadProfile();
  }, [isOpen]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const fresh = await fetchUserProfile();
      setProfile(fresh || user);
    } catch (err) {
      console.warn("Drawer profile fetch failed:", err.message);
      setProfile(user);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuPress = (screen) => {
    closeDrawer();
    navigation.navigate(screen);
  };

  const handleLogout = () => {
    closeDrawer();
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          navigation.replace("Login");
        },
      },
    ]);
  };

  const handleRenewPress = () => {
    closeDrawer();
    navigation.navigate("SelectPremiumPlan", {
      isUpgrade: true,
      currentPlan: getPlanKey(profile),
    });
  };

  // ── Derived plan info ──────────────────────────────────────────────────────
  const planKey        = getPlanKey(profile);
  const planMeta       = PLAN_META[planKey] ?? PLAN_META.free;
  const isFree         = planKey === "free";
  const isTier3        = planKey === "tier3";
  const expiryStr      = formatExpiry(profile?.subscription_end_time);
  const daysLeft       = getDaysRemaining(profile?.subscription_end_time);
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
  const isExpired      = daysLeft !== null && daysLeft < 0;

  const menuItems = [
    {
      icon: "person-outline",
      label: "Edit Profile",
      screen: "EditProfileScreen",
      color: "#130160",
    },
    {
      icon: "lock-closed-outline",
      label: "Change Password",
      screen: "ChangePassword",
      color: "#130160",
    },
    {
      icon: "help-circle-outline",
      label: "Help & Support",
      screen: "HelpAndSupport",
      color: "#130160",
    },
    {
      icon: "gift-outline",
      label: "Referral Program",
      screen: "ReferFriend",
      color: "#130160",
    },
    {
      icon: "settings-outline",
      label: "Settings",
      screen: "SettingsScreen",
      color: "#130160",
    },
    {
      icon: "chatbubble-ellipses-outline",
      label: "Feedback",
      screen: "Feedback",
      color: "#130160",
    },
  ];

  // ── Scan usage bar ─────────────────────────────────────────────────────────
  const totalScans = profile?.total_scans ?? 0;
  const usedScans  = profile?.scans_used?.length ?? 0;
  const scanPct    = totalScans > 0 ? Math.min(usedScans / totalScans, 1) : 0;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX }] }]}
    >
      {/* ── Close button ──────────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.closeBtn} onPress={closeDrawer}>
        <Ionicons name="close" size={hp(3.2)} color="#333" />
      </TouchableOpacity>

      {/* ── Profile section ───────────────────────────────────────────────── */}
      <View style={styles.profileSection}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#130160" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <>
            {/* Avatar */}
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={() => handleMenuPress("EditProfileScreen")}
              activeOpacity={0.8}
            >
              <Image
                source={
                  profile?.profile_image
                    ? { uri: profile.profile_image }
                    : require("../../assets/profile_img.png")
                }
                style={styles.avatar}
              />
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={13} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Name & email */}
            <Text style={styles.profileName} numberOfLines={1}>
              {profile?.full_name || profile?.store_name || "Store Owner"}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {profile?.email || ""}
            </Text>

            {/* Stats row */}
            {/* <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{usedScans}</Text>
                <Text style={styles.statLabel}>Scans Used</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalScans}</Text>
                <Text style={styles.statLabel}>Total Scans</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {profile?.used_promotions ?? 0}
                </Text>
                <Text style={styles.statLabel}>Promos</Text>
              </View>
            </View> */}

            {/* Scan usage bar */}
            {/* {totalScans > 0 && (
              <View style={styles.scanBarWrapper}>
                <View style={styles.scanBarBg}>
                  <View
                    style={[
                      styles.scanBarFill,
                      {
                        width: `${Math.round(scanPct * 100)}%`,
                        backgroundColor:
                          scanPct >= 0.9 ? "#FF4444" : "#14BA9C",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.scanBarLabel}>
                  {usedScans}/{totalScans} scans used
                </Text>
              </View>
            )} */}

            {/* Plan badge */}
            {/* <View
              style={[
                styles.planBadge,
                {
                  backgroundColor: planMeta.bg,
                  borderColor: planMeta.color,
                },
              ]}
            >
              <Ionicons
                name={isFree ? "leaf-outline" : "star"}
                size={12}
                color={planMeta.color}
              />
              <Text style={[styles.planLabel, { color: planMeta.color }]}>
                {planMeta.label}
              </Text>
            </View> */}

            {/* Expiry info — paid plans only */}
            {!isFree && expiryStr && (
              <View
                style={[
                  styles.expiryBox,
                  isExpired && styles.expiryBoxExpired,
                  isExpiringSoon && !isExpired && styles.expiryBoxWarning,
                ]}
              >
                <Ionicons
                  name={
                    isExpired
                      ? "close-circle-outline"
                      : isExpiringSoon
                      ? "warning-outline"
                      : "time-outline"
                  }
                  size={13}
                  color={
                    isExpired ? "#FF4444" : isExpiringSoon ? "#E8A020" : "#666"
                  }
                />
                <View style={{ marginLeft: 6 }}>
                  {isExpired ? (
                    <Text style={styles.expiryExpiredText}>Plan expired</Text>
                  ) : isExpiringSoon ? (
                    <>
                      <Text style={styles.expiryWarningText}>
                        Expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                      </Text>
                      <Text style={styles.expiryDate}>{expiryStr}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.expirySubLabel}>Renews on</Text>
                      <Text style={styles.expiryDate}>{expiryStr}</Text>
                    </>
                  )}
                </View>
              </View>
            )}

            {/* Renew button — only when expired or expiring soon */}
            {!isFree && (isExpired || isExpiringSoon) && (
              <TouchableOpacity
                style={[
                  styles.renewBtn,
                  { borderColor: isExpired ? "#FF4444" : "#E8A020" },
                ]}
                onPress={handleRenewPress}
              >
                <Text
                  style={[
                    styles.renewBtnText,
                    { color: isExpired ? "#FF4444" : "#E8A020" },
                  ]}
                >
                  {isExpired ? "⚠ Renew Plan" : "⚡ Renew Early"}
                </Text>
              </TouchableOpacity>
            )}

            {/* Top tier badge — only when active (not expired / expiring soon) */}
            {isTier3 && !isExpired && !isExpiringSoon && (
              <View style={styles.topTierBadge}>
                <Ionicons name="trophy-outline" size={13} color="#E8A020" />
                <Text style={styles.topTierText}>You're on the top tier!</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* ── Menu items ────────────────────────────────────────────────────── */}
      <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name={item.icon} size={hp(2.6)} color={item.color} />
            </View>
            <Text style={styles.menuItemText}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
        ))}

        {/* ── Logout ──────────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <View style={styles.menuIconBox}>
            <Ionicons name="log-out-outline" size={hp(2.6)} color="#e74c3c" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* ── Version ─────────────────────────────────────────────────────── */}
        <View style={styles.versionBox}>
          <Text style={styles.versionText}>BinIQ Store v1.0.0</Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: "#fff",
    paddingTop: hp(6),
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 20,
  },

  // ── Close ───────────────────────────────────────────────────────────────
  closeBtn: {
    position: "absolute",
    top: hp(5),
    right: 16,
    zIndex: 1,
    padding: 6,
  },

  // ── Profile ─────────────────────────────────────────────────────────────
  profileSection: {
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  loadingBox: {
    paddingVertical: hp(3),
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.8),
    color: "#999",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: hp(1),
  },
  avatar: {
    width: wp(22),
    height: wp(22),
    borderRadius: wp(11),
    borderWidth: 3,
    borderColor: "#130160",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#14BA9C",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileName: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.2),
    color: "#0D0D26",
    marginBottom: 4,
    textAlign: "center",
  },
  profileEmail: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.6),
    color: "#888",
    marginBottom: hp(1.5),
    textAlign: "center",
  },

  // ── Stats ────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: hp(1.2),
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.2),
    color: "#130160",
  },
  statLabel: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.3),
    color: "#888",
    marginTop: 2,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#ddd",
  },

  // ── Scan bar ─────────────────────────────────────────────────────────────
  scanBarWrapper: {
    width: "100%",
    marginBottom: hp(1),
  },
  scanBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "#EBEBEB",
    borderRadius: 4,
    overflow: "hidden",
  },
  scanBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  scanBarLabel: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.4),
    color: "#888",
    marginTop: 4,
    textAlign: "right",
  },

  // ── Plan badge ───────────────────────────────────────────────────────────
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: hp(1),
    gap: 5,
  },
  planLabel: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(1.4),
  },

  // ── Expiry ───────────────────────────────────────────────────────────────
  expiryBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: hp(1),
    width: "100%",
    borderWidth: 1,
    borderColor: "#eee",
  },
  expiryBoxWarning: {
    backgroundColor: "#FFF8E7",
    borderColor: "#E8A020",
  },
  expiryBoxExpired: {
    backgroundColor: "#FFEBEE",
    borderColor: "#FF4444",
  },
  expirySubLabel: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.3),
    color: "#999",
  },
  expiryDate: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(1.6),
    color: "#130160",
  },
  expiryWarningText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(1.6),
    color: "#E8A020",
  },
  expiryExpiredText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(1.6),
    color: "#FF4444",
  },

  // ── Renew ────────────────────────────────────────────────────────────────
  renewBtn: {
    marginBottom: hp(1),
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    width: "100%",
    alignItems: "center",
  },
  renewBtnText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(1.7),
  },

  // ── Top tier ─────────────────────────────────────────────────────────────
  topTierBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8A020",
    gap: 5,
  },
  topTierText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(1.4),
    color: "#E8A020",
  },

  // ── Menu list ────────────────────────────────────────────────────────────
  menuList: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.8),
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F4F6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuItemText: {
    flex: 1,
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(2),
    color: "#0D0D26",
  },

  // ── Logout ───────────────────────────────────────────────────────────────
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(2),
    marginTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  logoutText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(2),
    color: "#e74c3c",
  },

  // ── Version ──────────────────────────────────────────────────────────────
  versionBox: {
    alignItems: "center",
    paddingVertical: hp(2.5),
  },
  versionText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.4),
    color: "#bbb",
  },
});