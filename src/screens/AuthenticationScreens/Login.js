// src/screens/Login.js
import React, { useEffect, useState } from "react";
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
import Ionicons from "react-native-vector-icons/Ionicons";
import { API_BASE_URL } from "../../config/constants";
import useStore from "../../store";

const { width, height } = Dimensions.get("window");

const Login = () => {
  const navigation = useNavigation();
  const { login, fetchUserProfile } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("API_BASE_URL:", API_BASE_URL);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setIsLoading(true);
    try {
      await login({ email, password, role: 3 });

      try {
        await fetchUserProfile();
      } catch (profileError) {
        console.warn("Profile fetch failed (non-fatal):", profileError.message);
      }

      navigation.replace("HomeNavigataor");
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert(
        "Login Failed",
        error.message || "Invalid email or password"
      );
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
        {/* Top spacer */}
        <View style={styles.headerSpacer} />

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Back */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>WELCOME BACK</Text>
        </View>

        {/* Inputs */}
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

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Password"
              style={styles.input}
              placeholderTextColor="gray"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={togglePasswordVisibility}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={hp(3)}
                color="#524B6B"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.line} />
        </View>

        {/* Google */}
        <View style={styles.socialContainer}>
          <View style={styles.socialButton}>
            <Image
              source={require("../../../assets/google.jpg")}
              style={styles.socialIcon}
            />
          </View>
        </View>

        {/* Register */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerPrompt}>Haven't an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: hp(4) }} />
      </ImageBackground>
    </ScrollView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  vector: {
    flex: 1,
    width: wp(100),
    minHeight: hp(100),
  },
  headerSpacer: {
    height: hp(6),
  },

  // Logo
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(1.5),
  },
  logo: {
    width: wp(45),
    height: hp(10),
  },

  // Welcome
  welcomeContainer: {
    alignItems: "center",
    marginBottom: hp(1),
  },
  welcomeText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(3.6),
    color: "#14BA9C",
  },

  // Inputs
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
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontFamily: "Nunito-Regular",
    color: "#000",
    fontSize: hp(2.2),
  },
  eyeIcon: {
    padding: wp(2),
  },

  // Login button
  loginButton: {
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
  loginButtonText: {
    fontFamily: "Nunito-SemiBold",
    color: "#fff",
    fontSize: hp(2.5),
  },

  // Forgot password
  forgotPasswordButton: {
    backgroundColor: "transparent",
    justifyContent: "center",
    marginVertical: "5%",
  },
  forgotPasswordText: {
    color: "#356899",
    fontSize: 17,
    fontFamily: "Nunito-SemiBold",
    textAlign: "center",
  },

  // Divider
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: "5%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#C0C0C0",
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontFamily: "Nunito-SemiBold",
    color: "#A9A9A9",
  },

  // Social
  socialContainer: {
    marginHorizontal: "5%",
    marginVertical: "5%",
    height: height * 0.08,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  socialButton: {
    width: wp(17),
    height: "100%",
    backgroundColor: "#D9D9D93B",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: "2%",
  },
  socialIcon: {
    width: 45,
    height: 45,
  },

  // Register
  registerContainer: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: "2%",
  },
  registerPrompt: {
    fontSize: hp(2.3),
    color: "#AFB0B6",
    fontFamily: "Nunito-SemiBold",
  },
  registerLink: {
    fontSize: hp(2.3),
    color: "#14BA9C",
    fontFamily: "Nunito-SemiBold",
    textDecorationLine: "underline",
  },
});