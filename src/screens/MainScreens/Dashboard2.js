import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Pressable,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import useStore from "../../store";

const PLACEHOLDER_STORE = require("../../../assets/store_profile.png");

const Dashboard2 = ({ percentage = 70 }) => {
  const navigation = useNavigation();
  const { user, fetchStoreDetails } = useStore();
  const store = useStore((state) => state.store);

  React.useEffect(() => {
    fetchStoreDetails();
  }, []);

  const formatCount = (n) => {
    if (!n && n !== 0) return "—";
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
            Welcome, <Text style={styles.name}>{user?.name || "User"}</Text>
          </Text>
          <Text style={styles.subtext}>
            Customize your store's details to attract and engage customers.
          </Text>
        </View>
      </View>

      {/* Main Card */}
      <ImageBackground
        source={require("../../../assets/hidden_find_dashboard.png")}
        style={styles.cardsContainer}
      >
        {/* Left: Store Image */}
        <View style={styles.leftColumn}>
          <View style={styles.storeImageWrapper}>
            {store?.store_image ? (
              // ✅ Real store image from backend (Cloudinary URL)
              <Image
                source={{ uri: store.store_image }}
                style={styles.storeImage}
                resizeMode="cover"
              />
            ) : (
              // Fallback to placeholder if no image set
              <Image
                source={PLACEHOLDER_STORE}
                style={styles.storeImage}
                resizeMode="cover"
              />
            )}
          </View>
        </View>

        {/* Right: Store Info */}
        <View style={styles.rightColumn}>
          <View style={styles.infoContainer}>

            {/* Store Name + Verified */}
            <View style={styles.nameRow}>
              <Text style={styles.storeName} numberOfLines={1}>
                {store?.store_name || "Hidden Finds"}
              </Text>
              <Image
                source={require("../../../assets/bluetick.png")}
                style={styles.bluetick}
              />
            </View>

            {/* ✅ Real stats from backend */}
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
                <Text style={styles.statNumber}>{formatCount(store?.views || 0)}</Text>
                <Text style={styles.statLabel}>Viewers</Text>
              </View>
            </View>

            {/* Email */}
            <View style={styles.infoRow}>
              <Text style={styles.infoText} numberOfLines={1}>
                {store?.website_url || store?.store_email || "www.hiddenfinds.com"}
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

              <View style={styles.socialIcons}>
                <Image source={require("../../../assets/fb.png")} style={styles.socialIcon} />
                <Image source={require("../../../assets/x.png")} style={styles.socialIcon} />
                <Image source={require("../../../assets/whatsapp.png")} style={styles.socialIcon} />
                <Image source={require("../../../assets/telegram.png")} style={styles.socialIcon} />
                <Image source={require("../../../assets/messenger.png")} style={styles.socialIcon} />
                <Image source={require("../../../assets/ln.png")} style={styles.socialIcon} />
              </View>
            </View>

          </View>
        </View>
      </ImageBackground>

      {/* Get Verified Button */}
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

  cardsContainer: {
    flexDirection: "row",
    width: "100%",
    height: hp(35),
    borderRadius: 7,
  },

  // Left column
  leftColumn: { width: "40%", height: "100%", justifyContent: "center", alignItems: "center" },
  storeImageWrapper: { width: wp(30), height: wp(30), borderRadius: wp(15), overflow: "hidden" },
  storeImage: { width: "100%", height: "100%" },

  // Right column
  rightColumn: { width: "60%", height: "100%", justifyContent: "center", alignItems: "center", overflow: "hidden" },
  infoContainer: { width: "97%", height: "75%", flexDirection: "column" },

  nameRow: {
    height: "23%", flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: "2%", width: "93%",
  },
  storeName: { fontFamily: "Roboto-SemiBold", color: "#14BA9C", fontSize: hp(3), flex: 1 },
  bluetick: { width: wp(7), height: wp(7) },

  statsRow: { height: "35%", flexDirection: "row" },
  statItem: { width: "33%", paddingLeft: "1%", justifyContent: "center" },
  statNumber: { fontFamily: "Roboto-ExtraBold", color: "#fff", fontSize: hp(2.5) },
  statLabel: { fontFamily: "Roboto-Regular", color: "#fff", fontSize: hp(1.3) },

  infoRow: { height: "15%", justifyContent: "center" },
  infoText: { fontFamily: "Roboto-Thin", color: "#fff", fontSize: hp(1.5) },

  actionContainer: { height: "23%", marginTop: "3%", justifyContent: "center", width: "85%" },
  editBtn: {
    width: "100%", height: hp(3), backgroundColor: "#fff",
    justifyContent: "center", alignItems: "center", marginTop: hp(2),
  },
  editBtnText: { color: "#000", fontSize: hp(1.7), fontFamily: "DMSans-SemiBold" },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(1),
    width: "100%",
  },
  socialIcon: { width: wp(3.5), height: wp(3.5) },

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

export default Dashboard2;