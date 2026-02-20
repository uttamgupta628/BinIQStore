import React, { useState } from "react";
import {
  Dimensions,
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
import { useNavigation, useRoute, StackActions } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import axios from "axios";

const { width, height } = Dimensions.get("window");

const ResetPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, otp } = route.params || {};  

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Reset Password API call:", "https://api.biniq.net/api/users/reset-password");
      const response = await axios.post(
        "https://api.biniq.net/api/users/reset-password",
        {
          email,
          otp,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = response.data;
      console.log("Reset Password response:", data);

      Alert.alert("Success", "Password reset successfully", [
        {
          text: "OK",
          onPress: () => navigation.dispatch(StackActions.replace("Login")),
        },
      ]);
    } catch (error) {
      console.error("Reset Password error:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      const message =
        error.response?.data?.message ||
        Object.values(error.response?.data || {})?.[0]?.[0] ||
        error.message ||
        "Failed to reset password";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent={true} backgroundColor={"transparent"} />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" color={"#0D0D26"} size={25} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Reset Password</Text>
          <Text style={styles.subHeaderText}>
            Enter your new password below to reset your account password.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* New Password */}
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
              placeholderTextColor={"gray"}
              secureTextEntry={!showNew}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNew(!showNew)}
            >
              <MaterialIcons
                name={showNew ? "visibility" : "visibility-off"}
                size={20}
                color="#524B6B"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              placeholderTextColor={"gray"}
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirm(!showConfirm)}
            >
              <MaterialIcons
                name={showConfirm ? "visibility" : "visibility-off"}
                size={20}
                color="#524B6B"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.resetButton, isLoading && styles.disabledButton]}
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.resetButtonText}>Reset Password</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Remember your password? </Text>
          <TouchableOpacity
            onPress={() => navigation.dispatch(StackActions.replace("Login"))}
          >
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: hp(100),
  },
  header: {
    width: wp(100),
    height: hp(7),
    marginTop: "10%",
    paddingHorizontal: "5%",
    justifyContent: "center",
  },
  headerContainer: {
    width: wp(100),
    paddingHorizontal: "5%",
    marginTop: "2%",
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
    marginTop: "3%",
  },
  formContainer: {
    paddingHorizontal: "5%",
    marginTop: "5%",
  },
  label: {
    color: "black",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(2.2),
    marginTop: "3%",
  },
  inputContainer: {
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    fontFamily: "Nunito-Regular",
    color: "#000",
    fontSize: hp(2.2),
  },
  eyeIcon: {
    position: "absolute",
    right: "5%",
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  resetButton: {
    backgroundColor: "#130160",
    width: "90%",
    height: hp(7),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: "8%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  resetButtonText: {
    fontFamily: "Nunito-SemiBold",
    color: "#fff",
    fontSize: hp(2.5),
  },
  loginLinkContainer: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: "5%",
  },
  loginText: {
    color: "#524B6B",
    fontSize: hp(2.3),
    fontFamily: "Nunito-SemiBold",
  },
  loginLink: {
    color: "#14BA9C",
    fontSize: hp(2.3),
    fontFamily: "Nunito-SemiBold",
    textDecorationLine: "underline",
  },
});