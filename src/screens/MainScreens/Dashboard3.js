import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Circle } from "react-native-progress";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import useStore from "../../store";

const MAX_UPLOADS = 100;

const Dashboard3 = () => {
  const navigation = useNavigation();
  const user = useStore((state) => state.user);
  const fetchUserProfile = useStore((state) => state.fetchUserProfile);
  const { fetchTrendingProducts, fetchActivityFeed } = useStore();

  const displayName = user?.full_name || user?.name || "User";

  const [totalUploads, setTotalUploads] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
      const loadCounts = async () => {
        try {
          const [trending, activity] = await Promise.all([
            fetchTrendingProducts(),
            fetchActivityFeed(),
          ]);
          setTotalUploads((trending?.length || 0) + (activity?.length || 0));
        } catch (err) {
          console.error("Dashboard3 fetch error:", err.message);
        } finally {
          setLoading(false);
        }
      };
      loadCounts();
    }, []),
  );

  // ── Verification status ────────────────────────────────────────
  const isVerified =
    user?.verified === true ||
    user?.status === "approved" ||
    (user?.subscription?.status === "completed" &&
      user?.subscription_end_time &&
      new Date(user.subscription_end_time) > new Date());

  const daysLeft = (() => {
    if (!user?.subscription_end_time) return null;
    const expiry = new Date(user.subscription_end_time);
    const today = new Date();
    expiry.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  })();
  const isExpired = daysLeft !== null && daysLeft < 0;
  const isExpiringSoon = !isExpired && daysLeft !== null && daysLeft <= 7;

  const verifyBtnColor = isExpired
    ? "#FF4444"
    : isExpiringSoon
    ? "#E8A020"
    : "#130160";
  const verifyBtnLabel =
    isVerified && !isExpired
      ? isExpiringSoon
        ? "⚡ Renew Early"
        : null // null = hide button if active
      : isExpired
      ? "🔄 Renew Verification"
      : "🏆 Get Verified";
  const showVerifyBtn = !isVerified || isExpired || isExpiringSoon;

  const uploadProgress = Math.min(totalUploads / MAX_UPLOADS, 1);

  // ── Real promotion stats ───────────────────────────────────────
  const usedPromos = user?.used_promotions ?? 0;
  const totalPromos = user?.total_promotions ?? 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            Welcome, <Text style={styles.name}>{displayName}</Text>
          </Text>
          <Text style={styles.subtext}>
            Showcase your best content to highlight your store's identity
          </Text>
        </View>
      </View>

      {/* Main Cards */}
      <View style={styles.cardsContainer}>
        {/* Uploads circle */}
        <View style={styles.smallCard}>
          <Text style={styles.cardTitle}>TOTAL UPLOADS</Text>
          <View style={styles.circleWrapper}>
            <Circle
              size={hp(10)}
              progress={loading ? 0 : uploadProgress}
              showsText={false}
              thickness={5}
              color="#00B813"
              unfilledColor="#DDF4DF"
            />
            <View style={styles.circleTextOverlay}>
              <Text style={styles.circleNumber}>
                {loading ? "…" : totalUploads}
              </Text>
              <Text style={styles.circleLabel}>uploads</Text>
            </View>
          </View>
          <Text style={styles.circleSubtext}>of {MAX_UPLOADS} max</Text>
        </View>

        {/* Promotions stats + create */}
        <View style={styles.smallCard2}>
          <Text style={styles.bottomcard2Title}>PROMOTIONS</Text>
          <View style={styles.promoStatsRow}>
            <View style={styles.promoStat}>
              <Text style={styles.promoStatVal}>{usedPromos}</Text>
              <Text style={styles.promoStatLabel}>Used</Text>
            </View>
            <View style={styles.promoStatDivider} />
            <View style={styles.promoStat}>
              <Text style={styles.promoStatVal}>{totalPromos}</Text>
              <Text style={styles.promoStatLabel}>Total</Text>
            </View>
          </View>
          <View style={{ height: hp(1) }} />
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate("NewPromotionScreen")}
          >
            <Text style={styles.cardButtonText}>+ Create New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Cards */}
      <View style={styles.bottomCardsContainer}>
        <View style={styles.bottomHalf}>
          <View style={styles.bottomCard1}>
            <Text style={styles.bottomcard2Title}>Quick Upload</Text>
            <View style={{ height: hp(1.7) }} />
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => navigation.navigate("UploadScreen")}
            >
              <Text style={styles.cardButtonText}>Quick Upload</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomHalf}>
          <View style={styles.bottomCard1}>
            <Text style={styles.bottomcard2Title}>MANAGE MY LIBRARY</Text>
            <View style={{ height: hp(1.7) }} />
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => navigation.navigate("MyLibrary")}
            >
              <Text style={styles.cardButtonText}>MANAGE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Get Verified / Renew button */}
      {showVerifyBtn && verifyBtnLabel && (
        <View style={styles.enrollNowContainer}>
          <Pressable
            style={[styles.libButton, { backgroundColor: verifyBtnColor }]}
            onPress={() => navigation.navigate("GetVerified")}
          >
            <Text style={styles.liBbuttonText}>{verifyBtnLabel}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  greeting: { fontSize: hp(2.4), fontFamily: "Nunito-Bold", color: "#000" },
  name: {
    color: "#000",
    fontFamily: "Nunito-Bold",
    textDecorationLine: "underline",
  },
  subtext: { fontSize: wp(3.5), color: "#000", fontFamily: "Nunito-Bold" },

  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  smallCard: {
    backgroundColor: "#F2F5F8",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    width: "48%",
    height: hp(20),
    paddingTop: "4%",
  },
  smallCard2: {
    backgroundColor: "#F2F5F8",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    width: "48%",
    height: hp(20),
    justifyContent: "center",
  },

  cardTitle: {
    fontSize: wp(3.3),
    color: "#130160",
    fontFamily: "Nunito-SemiBold",
    textAlign: "center",
  },
  circleWrapper: {
    width: hp(10),
    height: hp(10),
    justifyContent: "center",
    alignItems: "center",
    marginTop: "8%",
  },
  circleTextOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  circleNumber: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.4),
    color: "#130160",
  },
  circleLabel: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.1),
    color: "#524B6B",
  },
  circleSubtext: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.2),
    color: "#999",
    marginTop: "4%",
  },

  // Promo stats
  promoStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp(1),
  },
  promoStat: { alignItems: "center", paddingHorizontal: wp(3) },
  promoStatVal: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.4),
    color: "#130160",
  },
  promoStatLabel: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.3),
    color: "#888",
  },
  promoStatDivider: { width: 1, height: hp(4), backgroundColor: "#D0D0D0" },

  bottomcard2Title: {
    fontSize: wp(3),
    textAlign: "center",
    color: "#130160",
    fontFamily: "Nunito-SemiBold",
  },
  cardButton: {
    backgroundColor: "#00B813",
    width: "75%",
    height: hp(3),
    borderRadius: 5,
    justifyContent: "center",
  },
  cardButtonText: {
    color: "#fff",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.4),
    textAlign: "center",
  },

  bottomCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  bottomHalf: {
    flexDirection: "column",
    width: "49%",
    height: hp(10),
    justifyContent: "space-between",
  },
  bottomCard1: {
    backgroundColor: "#F2F5F8",
    borderRadius: 6,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    width: "100%",
    height: hp(9.3),
  },

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

export default Dashboard3;
