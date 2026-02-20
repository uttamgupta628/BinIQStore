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
import PieGraph from "../../Components/PieGraph";
import { useNavigation } from "@react-navigation/native";
import Graph from "../../../assets/Graph.svg";
import useStore from "../../store";

const Dashboard3 = ({ percentage = 70 }) => {
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
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            Welcome, <Text style={styles.name}>{user.name}</Text>
          </Text>
          <Text style={styles.subtext}>
            Showcase your best content to highlight your store’s identity
          </Text>
        </View>
      </View>

      {/* Main Cards */}
      <View style={styles.cardsContainer}>
        <View style={styles.smallCard}>
          <Text
            style={{
              fontSize: wp(3.3),
              color: "#130160",
              fontFamily: "Nunito-SemiBold",
              textAlign: "center",
            }}
          >
            TOTAL UPLOADS
          </Text>
          <View
            style={{
              width: "70%",
              height: "40%",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "20%",
            }}
          >
            <Circle
              size={hp(10)}
              progress={0.8}
              showsText={true}
              thickness={5}
              color="#00B813"
              unfilledColor="#DDF4DF"
              textStyle={styles.progressText}
              style={styles.firstCardProgressBar}
            />
          </View>
        </View>
        <View style={styles.smallCard2}>
          <Text style={styles.bottomcard2Title}>CREATE NEW PROMOTION</Text>
          <View style={{ height: hp(1.7) }} />
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate("NewPromotionScreen")}
          >
            <Text
              style={{
                color: "#fff",
                fontFamily: "Nunito-SemiBold",
                fontSize: hp(1.4),
                textAlign: "center",
              }}
            >
              Create
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Cards */}
      <View style={styles.bottomCardsContainer}>
        {/* Current Plan */}
        <View
          style={{
            flexDirection: "column",
            width: "49%",
            height: hp(10),
            justifyContent: "space-between",
          }}
        >
          <View style={styles.bottomCard1}>
            <Text style={styles.bottomcard2Title}>Quick Upload</Text>
            <View style={{ height: hp(1.7) }} />
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => navigation.navigate("AddProduct")}
            >
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "Nunito-SemiBold",
                  fontSize: hp(1.4),
                  textAlign: "center",
                }}
              >
                Quick Upload
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flexDirection: "column",
            width: "49%",
            height: hp(10),
            justifyContent: "space-between",
          }}
        >
          <View style={styles.bottomCard1}>
            <Text style={styles.bottomcard2Title}>MANAGE MY LIBRARY</Text>
            <View style={{ height: hp(1.7) }} />
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => navigation.navigate("MyLibrary")}
            >
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "Nunito-SemiBold",
                  fontSize: hp(1.4),
                  textAlign: "center",
                }}
              >
                MANAGE
              </Text>
            </TouchableOpacity>
          </View>
          {/* <View style={styles.bottomCard1}>
            <Text style={styles.bottomcard2Title}>Quick Upload</Text>
            <View style={{ height: hp(1.7) }} />
            <View style={styles.cardButton}>
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "Nunito-SemiBold",
                  fontSize: hp(1.4),
                  textAlign: "center",
                }}
              >
                Quick Upload
              </Text>
            </View>
          </View> */}
        </View>

        {/* Education Level */}
        {/* <View style={styles.middleCard}>
                    <Text style={styles.bottomcard2Title}>VERIFIED</Text>
                    <View style={{ height: hp(4) }} />
                    <View style={styles.cardButton}>
                        <Text style={{ color: '#fff', fontFamily: 'Nunito-SemiBold', fontSize: hp(1.4), textAlign: 'center' }}>VERIFIED NOW</Text>
                    </View>
                </View> */}

        {/* Inventory Level */}
        {/* <View style={styles.smallCard}>
                    <Text style={{ fontSize: wp(3), color: '#130160', fontFamily: 'Nunito-SemiBold', textAlign: 'center' }}>NEXT SHIPMENT</Text>
                    <View style={{ marginTop: '20%' }}>
                        <Text style={{ color: '#000', fontFamily: 'Nunito-SemiBold', textDecorationLine: 'underline', fontSize: hp(1.4) }}>EST. DATE</Text>
                        <Text style={{ color: '#000', fontFamily: 'Nunito-SemiBold', fontSize: hp(1.3) }}>31-10-2024</Text>
                    </View>
                </View> */}
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
    height: hp(18),
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
    // padding: 10,
    // marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    width: "48%",
    height: hp(20),
    // justifyContent: 'space-between'
  },
  smallCard2: {
    // flex: 1,
    backgroundColor: "#F2F5F8",
    borderRadius: 6,
    // padding: 10,
    // marginHorizontal: 5,
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
  bottomCard1: {
    backgroundColor: "#F2F5F8",
    borderRadius: 6,
    padding: 10,
    // marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    width: "100%",
    height: hp(9.3),
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
    width: "38%",
    height: hp(15),
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
    flexDirection: "row",
    justifyContent: "center",
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
    width: "75%",
    height: hp(3),
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
    fontSize: wp(3),
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

export default Dashboard3;
