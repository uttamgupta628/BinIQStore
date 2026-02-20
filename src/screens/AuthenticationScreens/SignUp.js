import React, { useState } from "react";
import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, StackActions } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import useStore from "../../store";

const SignUp = () => {
  const navigation = useNavigation();
  const { signup } = useStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [userLat, setUserLat] = useState(null);
  const [userLong, setUserLong] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_KEY = "AIzaSyCY-8_-SbCN29nphT9QFtbzWV5H3asJQ4Q";

  const fetchSuggestions = async (input) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${API_KEY}`;
    try {
      const response = await axios.get(url);
      const data = response.data;
      if (data.status === "OK") {
        setSuggestions(data.predictions);
        setError("");
      } else {
        setSuggestions([]);
        setError("No suggestions found");
      }
    } catch (error) {
      setError("Error fetching suggestions");
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  const geocodeAddress = async (address) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`;
    try {
      const response = await axios.get(url);
      const data = response.data;
      if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }
      setError("No coordinates found for this address");
      return null;
    } catch (error) {
      setError("Error geocoding address");
      console.error("Error geocoding address:", error);
      return null;
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    setAddress(suggestion.description);
    setSuggestions([]);
    const coords = await geocodeAddress(suggestion.description);
    if (coords) {
      setUserLat(coords.lat);
      setUserLong(coords.lng);
    }
  };

  const handleSignUp = async () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !mobile ||
      !address ||
      !storeName ||
      !password
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (!userLat || !userLong) {
      Alert.alert("Error", "Please select a valid address from suggestions");
      return;
    }

    setIsLoading(true);
    try {
      const response = await signup({
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        phone_number: mobile.trim(),
        address: address.trim(),
        store_name: storeName.trim(),
        password,
        confirm_password: password,
        role: 3,
      });

      if (response && response.email) {
        console.log("Signup success:", response);
        navigation.dispatch(StackActions.replace("Login"));
      } else {
        Alert.alert("Error", response?.message || "Signup failed");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || error.message || "Signup failed";
      Alert.alert("Error", message);
      console.error("Signup error:", error?.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(item)}
    >
      <Text style={styles.suggestionText}>{item.description}</Text>
    </TouchableOpacity>
  );

  // Full form rendered as FlatList header to avoid nested VirtualizedList warning
  const ListHeader = () => (
    <ImageBackground
      source={require("../../../assets/vector_1.png")}
      style={styles.vector}
    >
      <View style={{ height: hp(6) }} />
      <View style={styles.introContainer}>
        <Text style={styles.introTitle}>Start My BinIQ Profile</Text>
        <Text style={styles.introText}>
          Register your account today and gain access to comprehensive tools and
          resources designed to optimize your reselling journey.
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>First Name</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="John"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
            placeholderTextColor="#666"
          />
        </View>

        <Text style={styles.label}>Last Name</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Doe"
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
            placeholderTextColor="#666"
          />
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="johndoe@gmail.com"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Mobile</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="+1 123-456-7890"
            value={mobile}
            onChangeText={setMobile}
            style={styles.input}
            placeholderTextColor="#666"
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>Address</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter your address"
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              fetchSuggestions(text);
            }}
            style={styles.input}
            placeholderTextColor="#666"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.label}>Store Name</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Hidden Finds"
            value={storeName}
            onChangeText={setStoreName}
            style={styles.input}
            placeholderTextColor="#666"
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={20}
              color="#524B6B"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.signUpButton, isLoading && styles.disabledButton]}
        onPress={handleSignUp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <View style={styles.loginLinkContainer}>
        <Text style={styles.loginText}>Have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );

  return (
    <>
      <StatusBar translucent={true} backgroundColor="transparent" />
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        data={suggestions}
        renderItem={renderSuggestion}
        keyExtractor={(item) => item.place_id}
        ListHeaderComponent={ListHeader }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F3F5",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(10),
  },
  vector: {
    flex: 1,
    width: wp(100),
  },
  introContainer: {
    height: hp(15),
    width: wp(100),
    paddingHorizontal: "5%",
  },
  introTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(3.6),
    color: "#14BA9C",
  },
  introText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.7),
    color: "#524B6B",
    marginTop: "5%",
  },
  formContainer: {
    paddingHorizontal: "5%",
  },
  label: {
    color: "#000",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(2.2),
    marginTop: "3%",
  },
  inputContainer: {
    backgroundColor: "#fff",
    width: "100%",
    height: hp(7),
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
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
    paddingHorizontal: "5%",
  },
  suggestionText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.8),
    color: "#000",
  },
  errorText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.8),
    color: "#EE2525",
    marginVertical: "2%",
  },
  signUpButton: {
    backgroundColor: "#130160",
    width: "90%",
    height: hp(6.7),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: "3%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  signUpButtonText: {
    fontFamily: "Nunito-SemiBold",
    color: "#fff",
    fontSize: hp(2.5),
  },
  loginLinkContainer: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: "5%",
    marginBottom: "5%",
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