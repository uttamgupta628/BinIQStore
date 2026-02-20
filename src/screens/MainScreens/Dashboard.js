import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";
import { Circle } from "react-native-progress"; // For circular progress
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Svg, { Line, Path } from "react-native-svg"; // For horizontal progress (e.g., Education Level)
import ProgressBar from "../../Components/ProgressBar";
import useStore from "../../store";

const Dashboard = ({ percentage = 70 }) => {
  const size = Dimensions.get("window").width * 0.2;
  const strokeWidth = wp(2);
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const { user } = useStore();

  // Calculate the path for the semi-circle
  const semiCircle = `
      M ${strokeWidth / 2} ${center}
      A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}
    `;

  // Calculate the progress
  const progressLength = circumference * (percentage / 100);
  const strokeDasharray = `${progressLength} ${circumference}`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            Hello, <Text style={styles.name}>{user.name}</Text>
          </Text>
          <Text style={styles.subtext}>
            Here's what you've been up to lately!
          </Text>
        </View>
        <Image
          source={require("../../../assets/dashboard_profile.png")} // Replace with profile picture
          style={styles.profileImage}
        />
      </View>

      {/* Main Cards */}
      <View style={styles.cardsContainer}>
        {/* Upgrade Storage */}
        <View style={styles.card}>
          <Text
            style={{
              fontSize: wp(2.6),
              color: "#130160",
              fontFamily: "Nunito-SemiBold",
            }}
          >
            TOTAL FOLLOWER COUNT
          </Text>
          <Circle
            size={hp(6.5)}
            progress={0.8}
            showsText={true}
            thickness={5}
            color="#00B813"
            unfilledColor="#DDF4DF"
            textStyle={styles.progressText}
            style={styles.firstCardProgressBar}
          />
          <View style={styles.cardText}>
            <Text
              style={{
                color: "#524B6B",
                fontFamily: "Nunito-SemiBold",
                fontSize: hp(1.1),
              }}
            >
              Unlock Visibility, Connect with Customers, Gain Access to
              Reseller’s Community, Competitive Edge and Boost Sales
            </Text>
          </View>
        </View>

        {/* Unlock Education */}
        <View
          style={{
            flex: 1,
            width: "33.3%",
            height: hp(23),
            backgroundColor: "#F2F5F8",
            borderRadius: 6,
            marginHorizontal: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
            paddingVertical: "2.5%",
            alignItems: "center",
            // justifyContent: 'space-between',
            paddingHorizontal: "2%",
          }}
        >
          <Text style={styles.uppercardTitle}>MONTHLY PROFILE VIEW</Text>
          <View style={{ height: hp(4) }} />
          <ProgressBar progress={50} />
          <View style={{ height: hp(4) }} />
          <View style={styles.card2Text}>
            <Text
              style={{
                color: "#000",
                fontFamily: "Nunito-SemiBold",
                textDecorationLine: "underline",
                fontSize: hp(1.7),
              }}
            >
              20,000 views
            </Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.uppercardTitle}>7 DAY VISITOR GROWTH</Text>
          <Circle
            size={hp(5.5)}
            progress={0.3}
            showsText={true}
            thickness={4}
            color="#00B813"
            unfilledColor="#DDF4DF"
            textStyle={styles.progressText}
            style={styles.firstCardProgressBar}
          />
          <View style={styles.card2Text}>
            <Text
              style={{
                color: "#524B6B",
                fontFamily: "Nunito-SemiBold",
                fontSize: hp(1),
              }}
            >
              Analyze user visits, engagement, and trends for your store over
              the past 7 days.
            </Text>
          </View>
          {/* <View style={styles.cardButton}>
                        <Text style={{ color: '#fff', fontFamily: 'Nunito-SemiBold', fontSize: hp(1.4), textAlign: 'center' }}>KEEP GOING</Text>
                    </View> */}
        </View>
      </View>

      {/* Bottom Cards */}
      <View style={styles.bottomCardsContainer}></View>
      <View style={styles.enrollNowContainer}>
        <Pressable style={styles.libButton}>
          <Text style={styles.liBbuttonText}>Get verified</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f8f9fa",
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: {
    fontSize: hp(2.4),
    fontFamily: "Nunito-Bold",
    color: "#000",
  },
  name: {
    color: "#000",
    fontFamily: "Nunito-Bold",
    textDecorationLine: "underline",
  },
  subtext: {
    fontSize: wp(3.5),
    color: "#000",
    fontFamily: "Nunito-Bold",
  },
  profileImage: {
    width: wp(11),
    height: wp(11),
    borderRadius: 25,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    flex: 1,
    width: "33.3%",
    height: hp(23),
    backgroundColor: "#F2F5F8",
    borderRadius: 6,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingVertical: "2.5%",
    alignItems: "center",
  },
  uppercardTitle: {
    fontSize: wp(3.3),
    color: "#130160",
    fontFamily: "Nunito-SemiBold",
    // marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 16,
  },
  highlight: {
    color: "#4B9CD3",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#4B9CD3",
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  smallCard: {
    // flex: 1,
    backgroundColor: "#F2F5F8",
    borderRadius: 6,
    padding: 10,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    width: "26%",
    height: hp(15),
  },
  middleCard: {
    // flex: 1,
    backgroundColor: "#F2F5F8",
    borderRadius: 6,
    padding: 16,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    width: "100%",
    height: hp(10),
  },
  smallCardTitle: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 8,
  },
  smallCardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  svg: {
    marginVertical: 8,
  },
  firstCardProgressBar: {
    marginTop: "5%",
    marginBottom: "5%",
  },
  graphDetailsView: {
    width: "100%",
    height: hp(2),
    flexDirection: "column",
    justifyContent: "center",
    marginVertical: "6%",
  },
  cardText: {
    padding: "1%",
    paddingHorizontal: "3%",
  },
  card2Text: {
    paddingHorizontal: "5%",
  },
  cardButton: {
    backgroundColor: "#00B813",
    width: "100%",
    height: hp(3),
    // margin: "10%",
    // bottom: "10%",
    borderRadius: 5,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A4B",
    marginBottom: 40,
  },
  progressContainer: {
    // position: 'absolute',
    alignItems: "center",
    bottom: 3,
  },
  percentageText: {
    position: "absolute",
    bottom: 0,
    fontSize: wp(3.5),
    fontWeight: "bold",
    color: "#000",
  },
  bottomcard2Title: {
    fontSize: wp(3.5),
    textAlign: "center",
    color: "#130160",
    fontFamily: "Nunito-SemiBold",
  },
  enrollNowContainer: {
    width: wp(95),
    height: hp(13),
    bottom: 0,
    alignSelf: "center",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  libButton: {
    backgroundColor: "#130160",
    width: "95%",
    height: hp(3.5),
    borderRadius: 7,
    justifyContent: "center",
    marginTop: "2.5%",
  },
  liBbuttonText: {
    color: "white",
    fontSize: hp(1.4),
    fontFamily: "Nunito-Bold",
    textAlign: "center",
  },
});

export default Dashboard;
