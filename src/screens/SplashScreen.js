import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import useStore from "../store";
import Splash from "../../assets/Splash.svg";
import City from "../../assets/City.svg";

const SplashScreen = () => {
  const navigation = useNavigation();
  const { isFirstOpen, setFirstOpen, user, accessToken } = useStore();
  const hasNavigated = useRef(false); // ✅ prevents double navigation

  useEffect(() => {
    console.log("SplashScreen: isFirstOpen =", isFirstOpen, "user =", !!user);

    const timer = setTimeout(() => {
      if (hasNavigated.current) return; // ✅ guard against double fire
      hasNavigated.current = true;

      try {
        if (accessToken && user) {
          console.log("Navigating to HomeScreen");
          navigation.replace("HomeNavigataor");
        } else if (isFirstOpen) {
          console.log("Navigating to OnBoarding");
          setFirstOpen();
          navigation.replace("OnBoarding");
        } else {
          console.log("Navigating to Login"); // ✅ Login, not SignUp
          navigation.replace("Login");
        }
      } catch (error) {
        // ✅ catches the unhandled promise rejection
        console.error("Navigation error:", error);
        navigation.replace("Login");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []); // ✅ empty deps — run once only, no re-trigger loop

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={"transparent"} />
      <ImageBackground
        source={require("../../assets/vector_1.png")}
        style={styles.vector}
      >
        <View style={styles.logoContainer}>
          <View>
            <Splash width={wp(38)} />
          </View>
        </View>
        <Text style={styles.logoText}>
          The Largest Amazon Bin Store Network
        </Text>
        <City style={styles.cityVector} />
      </ImageBackground>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: hp(100),
  },
  logoText: {
    fontFamily: "Nunito-SemiBold",
    color: "#000",
    fontSize: hp(2),
    alignSelf: "center",
    bottom: "42%",
    width: "90%",
    textAlign: "center",
  },
  cityVector: {
    position: "absolute",
    width: wp(50),
    bottom: 0,
  },
});