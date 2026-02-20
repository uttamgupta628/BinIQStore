import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import React, { useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import OTPTextView from "react-native-otp-textinput";
import axios from "axios";

const { width, height } = Dimensions.get("window");

const OTPEntry = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {};  

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert("Error", "Please enter the complete OTP");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Verify OTP API call:", "https://api.biniq.net/api/users/verify-otp");
      const response = await axios.post(
        "https://api.biniq.net/api/users/verify-otp",
        {
          email,
          otp,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = response.data;
      console.log("Verify OTP response:", data);

      // Navigate to ResetPassword passing email for the next step
      navigation.navigate("ResetPassword", { email,otp  });
    } catch (error) {
      console.error("Verify OTP error:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      const message =
        error.response?.data?.message ||
        Object.values(error.response?.data || {})?.[0]?.[0] ||
        error.message ||
        "OTP verification failed";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={"transparent"} />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
      >
        <View style={{ height: hp(7) }} />
        <View style={{ height: hp(15), width: wp(100), padding: "5%" }}>
          <Text style={{ fontFamily: "Nunito-Bold", fontSize: hp(3.6), color: "#14BA9C" }}>
            Enter OTP
          </Text>
          <Text style={{ fontFamily: "Nunito-Regular", fontSize: hp(2), color: "#524B6B", marginTop: "5%" }}>
            Verification code has been sent to your email. Please verify!
          </Text>
        </View>

        <View
          style={{
            width: "90%",
            height: hp(7.5),
            alignSelf: "center",
            borderRadius: 8,
            justifyContent: "center",
            marginVertical: "10%",
          }}
        >
          <OTPTextView
            inputCount={6}
            inputCellLength={1}
            tintColor={"gray"}
            textInputStyle={{
              borderWidth: 0.4,
              borderBottomWidth: 1,
              backgroundColor: "#fff",
              borderRadius: 5,
            }}
            handleTextChange={(code) => setOtp(code)}  // ✅ capture OTP value
          />
        </View>

        <TouchableOpacity
          style={[styles.gettingStarted, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontFamily: "Nunito-SemiBold", color: "#fff", fontSize: hp(2.5) }}>
              Submit
            </Text>
          )}
        </TouchableOpacity>
      </ImageBackground>
      <ImageBackground
        source={require("../../../assets/vector_2.png")}
        style={styles.vector2}
      />
    </View>
  );
};

export default OTPEntry;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: hp(50),
  },
  label: {
    color: "black",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(2.2),
    marginTop: "3%",
  },
  gettingStarted: {
    backgroundColor: "#130160",
    width: "90%",
    height: hp(7),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#C0C0C0",
  },
  text: {
    marginHorizontal: 10,
    fontSize: 16,
    fontFamily: "Nunito-SemiBold",
    color: "#A9A9A9",
  },
  vector2: {
    flex: 1,
    width: wp(100),
    height: height * 0.5,
    position: "absolute",
    bottom: 0,
    zIndex: -1,
  },
});