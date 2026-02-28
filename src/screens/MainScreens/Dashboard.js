import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import { Circle } from "react-native-progress";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import ProgressBar from "../../Components/ProgressBar";
import useStore from "../../store";

const PLACEHOLDER = require("../../../assets/dashboard_profile.png");

const Dashboard = ({ percentage = 70 }) => {
  const size = Dimensions.get("window").width * 0.2;
  const strokeWidth = wp(2);
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;

  const { user, fetchStoreDetails } = useStore();
  const store = useStore((state) => state.store);

  React.useEffect(() => {
    fetchStoreDetails();
  }, []);

  const displayName = user?.full_name || user?.name || "User";

  // ── Derived stats from backend ──────────────────────────────────
  const followers     = store?.followers     ?? 0;
  const likes         = store?.likes         ?? 0;
  const ratingCount   = store?.rating_count  ?? 0;

  // Follower progress: cap at 100 for circle (assume 10K = 100%)
  const followerProgress = Math.min(followers / 10000, 1);

  // Monthly views: use rating_count as proxy if no views field
  const monthlyViews  = store?.monthly_views ?? store?.views ?? 0;
  // Profile view progress: cap at 100K
  const viewProgress  = Math.min(monthlyViews / 100000, 1) * 100;

  // 7-day visitor growth — use rating or rating_count as proxy
  const visitorGrowth = store?.ratings ?? 0;
  const visitorProgress = Math.min(visitorGrowth / 5, 1); // 5 stars = 100%

  const formatCount = (n) => {
    if (!n && n !== 0) return "0";
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return `${n}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            Hello, <Text style={styles.name}>{displayName}</Text>
          </Text>
          <Text style={styles.subtext}>
            Here's what you've been up to lately!
          </Text>
        </View>
        {/* ✅ Real store image from backend, fallback to placeholder */}
        {store?.store_image ? (
          <Image
            source={{ uri: store.store_image }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={PLACEHOLDER}
            style={styles.profileImage}
            resizeMode="cover"
          />
        )}
      </View>

      {/* Main Cards */}
      <View style={styles.cardsContainer}>

        {/* ✅ Total Follower Count — real data */}
        <View style={styles.card}>
          <Text style={styles.uppercardTitle}>TOTAL FOLLOWER COUNT</Text>
          <Circle
            size={hp(6.5)}
            progress={followerProgress}
            showsText={true}
            thickness={5}
            color="#00B813"
            unfilledColor="#DDF4DF"
            textStyle={styles.progressText}
            style={styles.firstCardProgressBar}
          />
          <Text style={styles.statHighlight}>{formatCount(followers)}</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardSubText}>
              Unlock Visibility, Connect with Customers, Gain Access to
              Reseller's Community, Competitive Edge and Boost Sales
            </Text>
          </View>
        </View>

        {/* ✅ Monthly Profile View — real data */}
        <View style={styles.middleCardStyle}>
          <Text style={styles.uppercardTitle}>MONTHLY PROFILE VIEW</Text>
          <View style={{ height: hp(4) }} />
          <ProgressBar progress={viewProgress} />
          <View style={{ height: hp(2) }} />
          <View style={styles.card2Text}>
            <Text style={styles.viewCountText}>
              {formatCount(monthlyViews)} views
            </Text>
          </View>
          <View style={{ height: hp(1) }} />
          <View style={styles.card2Text}>
            <Text style={styles.cardSubText}>
              {formatCount(likes)} likes total
            </Text>
          </View>
        </View>

        {/* ✅ 7 Day Visitor Growth — real rating data */}
        <View style={styles.card}>
          <Text style={styles.uppercardTitle}>7 DAY VISITOR GROWTH</Text>
          <Circle
            size={hp(5.5)}
            progress={visitorProgress}
            showsText={true}
            thickness={4}
            color="#00B813"
            unfilledColor="#DDF4DF"
            textStyle={styles.progressText}
            style={styles.firstCardProgressBar}
          />
          <Text style={styles.statHighlight}>{visitorGrowth.toFixed(1)}★</Text>
          <View style={styles.card2Text}>
            <Text style={styles.cardSubText}>
              {ratingCount} ratings — Analyze user visits, engagement, and
              trends over the past 7 days.
            </Text>
          </View>
        </View>

      </View>

      {/* Bottom */}
      <View style={styles.bottomCardsContainer} />
      <View style={styles.enrollNowContainer}>
        <Pressable style={styles.libButton}>
          <Text style={styles.liBbuttonText}>Get verified</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  greeting: { fontSize: hp(2.4), fontFamily: "Nunito-Bold", color: "#000" },
  name: { color: "#000", fontFamily: "Nunito-Bold", textDecorationLine: "underline" },
  subtext: { fontSize: wp(3.5), color: "#000", fontFamily: "Nunito-Bold" },
  profileImage: { width: wp(11), height: wp(11), borderRadius: wp(5.5) },

  cardsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  card: {
    flex: 1, width: "33.3%", height: hp(23),
    backgroundColor: "#F2F5F8", borderRadius: 6, marginHorizontal: 5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    paddingVertical: "2.5%", alignItems: "center",
  },
  middleCardStyle: {
    flex: 1, width: "33.3%", height: hp(23),
    backgroundColor: "#F2F5F8", borderRadius: 6, marginHorizontal: 5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    paddingVertical: "2.5%", alignItems: "center", paddingHorizontal: "2%",
  },
  uppercardTitle: { fontSize: wp(2.6), color: "#130160", fontFamily: "Nunito-SemiBold", textAlign: "center" },
  statHighlight: { color: "#130160", fontFamily: "Nunito-Bold", fontSize: hp(1.6), marginBottom: "2%" },
  cardText: { padding: "1%", paddingHorizontal: "3%" },
  card2Text: { paddingHorizontal: "5%", width: "100%" },
  cardSubText: { color: "#524B6B", fontFamily: "Nunito-SemiBold", fontSize: hp(1), textAlign: "center" },
  viewCountText: { color: "#000", fontFamily: "Nunito-SemiBold", textDecorationLine: "underline", fontSize: hp(1.7), textAlign: "center" },
  progressText: { fontSize: 16, fontWeight: "bold" },
  firstCardProgressBar: { marginTop: "5%", marginBottom: "5%" },

  bottomCardsContainer: { flexDirection: "row", justifyContent: "space-between" },
  enrollNowContainer: {
    width: wp(95), height: hp(13), alignSelf: "center",
    borderTopRightRadius: 10, borderTopLeftRadius: 10,
    justifyContent: "flex-start", alignItems: "center",
  },
  libButton: {
    backgroundColor: "#130160", width: "95%", height: hp(3.5),
    borderRadius: 7, justifyContent: "center", marginTop: "2.5%",
  },
  liBbuttonText: { color: "white", fontSize: hp(1.4), fontFamily: "Nunito-Bold", textAlign: "center" },
});

export default Dashboard;