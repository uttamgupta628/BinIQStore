import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import useStore from "../../store";

const { width, height } = Dimensions.get("window");

const ForgotPassword = () => {
  const navigation = useNavigation();
  const { forgotPassword } = useStore();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      const response = await forgotPassword({ email });
      console.log("Forgot password response:", response);

      // Navigate to OTP screen passing email for verification
      navigation.navigate("OTPEntry", { email });
    } catch (error) {
      Alert.alert("Error", error.message || "Request failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
      >
        <View style={styles.headerSpacer} />
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Forgot Password?</Text>
          <Text style={styles.subHeaderText}>
            Enter your email, we will send you a verification code.
          </Text>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../../assets/forgot_pass.png")}
            style={styles.forgotPassImage}
          />
        </View>
      </ImageBackground>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Email"
            style={styles.input}
            placeholderTextColor="gray"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.sendCodeButton, isLoading && styles.disabledButton]}
        onPress={handleSendCode}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.sendCodeText}>Send Code</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  vector: {
    width: wp(100),
    height: hp(50),
  },
  headerSpacer: {
    height: hp(7),
  },
  headerContainer: {
    height: hp(15),
    width: wp(100),
    padding: "5%",
  },
  headerText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(3.6),
    color: "#14BA9C",
  },
  subHeaderText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(2),
    color: "#524B6B",
    marginTop: "5%",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: "10%",
  },
  forgotPassImage: {
    width: wp(48),
    height: hp(18),
  },
  inputContainer: {
    padding: "5%",
  },
  label: {
    color: "black",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(2.2),
    marginTop: "3%",
  },
  inputWrapper: {
    backgroundColor: "#fff",
    width: "100%",
    height: hp(7.5),
    alignSelf: "center",
    borderRadius: 8,
    marginVertical: "2%",
    paddingHorizontal: "5%",
    justifyContent: "center",
    borderWidth: 0.4,
    borderColor: "#524B6B",
  },
  input: {
    fontFamily: "Nunito-Regular",
    color: "#000",
    fontSize: hp(2.2),
  },
  sendCodeButton: {
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
  sendCodeText: {
    fontFamily: "Nunito-SemiBold",
    color: "#fff",
    fontSize: hp(2.5),
  },
});