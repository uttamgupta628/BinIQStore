import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Circle } from "react-native-progress";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import useStore from "../../store";

// Max uploads used for progress circle (adjust if needed)
const MAX_UPLOADS = 100;

const Dashboard3 = () => {
  const navigation = useNavigation();
  const { user, fetchTrendingProducts, fetchActivityFeed } = useStore();
  const displayName = user?.full_name || user?.name || "User";

  const [totalUploads, setTotalUploads] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        // ✅ Fetch both trending + activity feed and sum them up
        const [trending, activity] = await Promise.all([
          fetchTrendingProducts(),
          fetchActivityFeed(),
        ]);
        const count = (trending?.length || 0) + (activity?.length || 0);
        setTotalUploads(count);
      } catch (err) {
        console.error("Dashboard3 fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCounts();
  }, []);

  // Circle progress: 0–1 scale, capped at MAX_UPLOADS
  const uploadProgress = Math.min(totalUploads / MAX_UPLOADS, 1);

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

        {/* ✅ Total Uploads — real count */}
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
              style={styles.firstCardProgressBar}
            />
            {/* Custom center text showing actual number */}
            <View style={styles.circleTextOverlay}>
              <Text style={styles.circleNumber}>
                {loading ? "…" : totalUploads}
              </Text>
              <Text style={styles.circleLabel}>uploads</Text>
            </View>
          </View>
          <Text style={styles.circleSubtext}>
            of {MAX_UPLOADS} max
          </Text>
        </View>

        {/* Create New Promotion */}
        <View style={styles.smallCard2}>
          <Text style={styles.bottomcard2Title}>CREATE NEW PROMOTION</Text>
          <View style={{ height: hp(1.7) }} />
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate("NewPromotionScreen")}
          >
            <Text style={styles.cardButtonText}>Create</Text>
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

  cardsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },

  smallCard: {
    backgroundColor: "#F2F5F8", borderRadius: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    alignItems: "center", width: "48%", height: hp(20),
    paddingTop: "4%",
  },
  smallCard2: {
    backgroundColor: "#F2F5F8", borderRadius: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    alignItems: "center", width: "48%", height: hp(20),
    justifyContent: "center",
  },

  cardTitle: { fontSize: wp(3.3), color: "#130160", fontFamily: "Nunito-SemiBold", textAlign: "center" },

  // Circle with number overlay
  circleWrapper: { width: hp(10), height: hp(10), justifyContent: "center", alignItems: "center", marginTop: "8%" },
  firstCardProgressBar: {},
  circleTextOverlay: { position: "absolute", justifyContent: "center", alignItems: "center" },
  circleNumber: { fontFamily: "Nunito-Bold", fontSize: hp(2.4), color: "#130160" },
  circleLabel: { fontFamily: "Nunito-Regular", fontSize: hp(1.1), color: "#524B6B" },
  circleSubtext: { fontFamily: "Nunito-Regular", fontSize: hp(1.2), color: "#999", marginTop: "4%" },

  bottomcard2Title: { fontSize: wp(3), textAlign: "center", color: "#130160", fontFamily: "Nunito-SemiBold" },

  cardButton: { backgroundColor: "#00B813", width: "75%", height: hp(3), borderRadius: 5, justifyContent: "center" },
  cardButtonText: { color: "#fff", fontFamily: "Nunito-SemiBold", fontSize: hp(1.4), textAlign: "center" },

  bottomCardsContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  bottomHalf: { flexDirection: "column", width: "49%", height: hp(10), justifyContent: "space-between" },
  bottomCard1: {
    backgroundColor: "#F2F5F8", borderRadius: 6, padding: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    alignItems: "center", width: "100%", height: hp(9.3),
  },

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

export default Dashboard3;