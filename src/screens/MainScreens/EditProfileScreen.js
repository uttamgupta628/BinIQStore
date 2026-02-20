// src/screens/EditProfileScreen.js
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  StatusBar,
  Dimensions,
  Pressable,
  Image,
  TextInput,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import EditImage from "../../../assets/EditImage.svg";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useStore from "../../store";

const { width, height } = Dimensions.get("window");

export default function EditProfileScreen({ openDrawer }) {
  const navigation = useNavigation();
  const { fetchStoreDetails, saveStoreDetails, user } = useStore();

  const [openStartDay, setOpenStartDay] = useState(false);
  const [openEndDay, setOpenEndDay] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [valueStartDay, setValueStartDay] = useState("Monday");
  const [valueEndDay, setValueEndDay] = useState("Sunday");
  const [valueStartTime, setValueStartTime] = useState(new Date());
  const [valueEndTime, setValueEndTime] = useState(new Date());
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [storeName, setStoreName] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [businessDays, setBusinessDays] = useState("");
  const [businessTiming, setBusinessTiming] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [twitterLink, setTwitterLink] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [days, setDays] = useState([
    { label: "Monday", value: "Monday" },
    { label: "Tuesday", value: "Tuesday" },
    { label: "Wednesday", value: "Wednesday" },
    { label: "Thursday", value: "Thursday" },
    { label: "Friday", value: "Friday" },
    { label: "Saturday", value: "Saturday" },
    { label: "Sunday", value: "Sunday" },
  ]);

  const API_KEY = "AIzaSyCY-8_-SbCN29nphT9QFtbzWV5H3asJQ4Q"; // Replace with your Google Maps API key

  useEffect(() => {
    const loadStoreDetails = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          throw new Error("User not logged in");
        }
        const store = await fetchStoreDetails();
        console.log("Store: ", store);
        setStoreName(store.store_name || "");
        setAddress(store.address || "");
        setCity(store.city || "");
        setState(store.state || "");
        setZipCode(store.zip_code || "");
        setCountry(store.country || "");
        setGoogleMapsLink(store.google_maps_link || "");
        setPhoneNumber(store.phone_number || "");
        setStoreEmail(store.store_email || "");
        setFacebookLink(store.facebook_link || "");
        setInstagramLink(store.instagam_link || "");
        setTwitterLink(store.twitter_link || "");

        // Parse business_days (e.g., "Monday - Saturday")
        if (store.business_days) {
          const [startDay, endDay] = store.business_days.split(" - ");
          setValueStartDay(startDay || "Monday");
          setValueEndDay(endDay || "Sunday");
        }

        // Parse business_timing (e.g., "10:00AM - 7:00PM")
        if (store.business_timing) {
          const [startTimeStr, endTimeStr] = store.business_timing.split(" - ");
          const startTime = new Date();
          const [startHour, startMinute] = startTimeStr
            .match(/(\d+):(\d+)/)
            .slice(1)
            .map(Number);
          startTime.setHours(startHour, startMinute);
          setValueStartTime(startTime);

          const endTime = new Date();
          const [endHour, endMinute] = endTimeStr
            .match(/(\d+):(\d+)/)
            .slice(1)
            .map(Number);
          endTime.setHours(endHour, endMinute);
          setValueEndTime(endTime);
        }
      } catch (error) {
        console.error("Error loading store details:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) loadStoreDetails();
  }, [fetchStoreDetails, user]);

  const fetchSuggestions = async (input) => {
    if (!input) {
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
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    setAddress(suggestion.description);
    setSuggestions([]);
    const details = await geocodeAddress(suggestion.description);
    if (details) {
      setCity(details.city || "");
      setState(details.state || "");
      setZipCode(details.zipCode || "");
      setCountry(details.country || "");
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
        const components = data.results[0].address_components;
        let city = "";
        let state = "";
        let zipCode = "";
        let country = "";

        components.forEach((component) => {
          if (component.types.includes("locality")) city = component.long_name;
          if (component.types.includes("administrative_area_level_1"))
            state = component.long_name;
          if (component.types.includes("postal_code"))
            zipCode = component.long_name;
          if (component.types.includes("country"))
            country = component.long_name;
        });

        return { city, state, zipCode, country };
      }
      return null;
    } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
    }
  };

  const handleOpenDropdown = (setOpen, isOpen, key) => {
    if (isOpen) {
      setOpen(false);
    } else {
      setOpen(true);
      if (key !== "startDay") setOpenStartDay(false);
      if (key !== "endDay") setOpenEndDay(false);
    }
  };

  const handleTimeChange = (event, selectedDate, setTime, setShowPicker) => {
    const currentDate = selectedDate || new Date();
    setShowPicker(Platform.OS === "ios");
    setTime(currentDate);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const storeData = {
        store_name: storeName,
        address,
        city,
        state,
        zip_code: zipCode,
        country,
        google_maps_link: googleMapsLink,
        business_days: `${valueStartDay} - ${valueEndDay}`,
        business_timing: `${formatTime(valueStartTime)} - ${formatTime(
          valueEndTime
        )}`,
        phone_number: phoneNumber,
        store_email: storeEmail,
        facebook_link: facebookLink,
        instagam_link: instagramLink,
        twitter_link: twitterLink,
      };
      const response = await saveStoreDetails(storeData);
      console.log("Save response:", response.message);
      Alert.alert("Success", response.message);
    } catch (error) {
      console.error("Save error:", error.message);
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
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={23} />
            </Pressable>
            <Text style={styles.headerText}>Edit Profile</Text>
          </View>
        </View>
        <View style={styles.profileSection}>
          <Image
            source={require("../../../assets/profile_img.png")}
            style={styles.profilePicture}
          />
          <TouchableOpacity style={styles.editBtn}>
            <EditImage width={wp(3)} />
          </TouchableOpacity>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Store Details</Text>
          <Text style={styles.label}>Store Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Hidden Finds"
              value={storeName}
              onChangeText={setStoreName}
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>
          <Text style={styles.label}>Address</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter your complete store address"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                fetchSuggestions(text);
              }}
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(item)}
                  >
                    <Text style={styles.suggestionText}>
                      {item.description}
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.suggestionList}
              />
            </View>
          )}
          <View style={styles.inputRow}>
            <View style={styles.inputContainerHalf}>
              <Text style={styles.label}>City</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={styles.inputContainerHalf}>
              <Text style={styles.label}>State</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="State"
                  value={state}
                  onChangeText={setState}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputContainerHalf}>
              <Text style={styles.label}>Zip Code</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Zip Code"
                  value={zipCode}
                  onChangeText={setZipCode}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={styles.inputContainerHalf}>
              <Text style={styles.label}>Country</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Country"
                  value={country}
                  onChangeText={setCountry}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>
          <Text style={styles.label}>Google Maps Link</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Google Maps Links"
              value={googleMapsLink}
              onChangeText={setGoogleMapsLink}
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>
          <Text style={styles.label}>Website Url</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Add website url"
              // value={googleMapsLink}
              // onChangeText={setGoogleMapsLink}
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Business Address Details</Text>
          <Text style={styles.label}>Working Days</Text>
          <View style={styles.dropdownRow}>
            <View style={[styles.dropdownContainer, { zIndex: 600 }]}>
              <DropDownPicker
                open={openStartDay}
                value={valueStartDay}
                items={days}
                setOpen={(isOpen) =>
                  handleOpenDropdown(setOpenStartDay, openStartDay, "startDay")
                }
                setValue={setValueStartDay}
                setItems={setDays}
                placeholder="Start Day"
                style={styles.dropdown}
                textStyle={styles.dropdownText}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                ArrowDownIconComponent={() => (
                  <SimpleLineIcons name="arrow-down" size={20} color="#000" />
                )}
                onSelectItem={() => setOpenStartDay(false)}
              />
            </View>
            <View style={[styles.dropdownContainer, { zIndex: 500 }]}>
              <DropDownPicker
                open={openEndDay}
                value={valueEndDay}
                items={days}
                setOpen={(isOpen) =>
                  handleOpenDropdown(setOpenEndDay, openEndDay, "endDay")
                }
                setValue={setValueEndDay}
                setItems={setDays}
                placeholder="End Day"
                style={styles.dropdown}
                textStyle={styles.dropdownText}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                ArrowDownIconComponent={() => (
                  <SimpleLineIcons name="arrow-down" size={20} color="#000" />
                )}
                onSelectItem={() => setOpenEndDay(false)}
              />
            </View>
          </View>
          <Text style={styles.label}>Working Time</Text>
          <View style={styles.dropdownRow}>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.timePickerText}>
                {formatTime(valueStartTime)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.timePickerText}>
                {formatTime(valueEndTime)}
              </Text>
            </TouchableOpacity>
          </View>
          {showStartTimePicker && (
            <DateTimePicker
              value={valueStartTime}
              mode="time"
              display="default"
              onChange={(event, date) =>
                handleTimeChange(
                  event,
                  date,
                  setValueStartTime,
                  setShowStartTimePicker
                )
              }
            />
          )}
          {showEndTimePicker && (
            <DateTimePicker
              value={valueEndTime}
              mode="time"
              display="default"
              onChange={(event, date) =>
                handleTimeChange(
                  event,
                  date,
                  setValueEndTime,
                  setShowEndTimePicker
                )
              }
            />
          )}
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="+97 23342234244"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>
          <Text style={styles.label}>Store Email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter your store email"
              value={storeEmail}
              onChangeText={setStoreEmail}
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Social Media Links</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Facebook link"
              value={facebookLink}
              onChangeText={setFacebookLink}
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Instagram Link"
              value={instagramLink}
              onChangeText={setInstagramLink}
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Twitter Link"
              value={twitterLink}
              onChangeText={setTwitterLink}
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>
        </View>
        <View style={styles.divider} />
        <TouchableOpacity
          style={[styles.gettingStarted, isLoading && styles.disabledButton]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </ImageBackground>
      <View style={styles.bottomSpacer} />
      <ImageBackground
        source={require("../../../assets/vector_2.png")}
        style={styles.vector2}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  vector: {
    flex: 1,
    width: wp(100),
  },
  vector2: {
    width: wp(100),
    height: height * 2,
    position: "absolute",
    bottom: 0,
    zIndex: -1,
  },
  header: {
    width: wp(100),
    height: hp(7),
    marginTop: "10%",
    paddingHorizontal: "5%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerChild: {
    flexDirection: "row",
    alignItems: "center",
    width: wp(50),
  },
  headerText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(3.2),
    textAlign: "left",
    color: "#0D0140",
    marginLeft: "3%",
  },
  profileSection: {
    alignItems: "center",
    borderBottomColor: "#f0f0f0",
    justifyContent: "center",
    marginTop: "3%",
  },
  profilePicture: {
    width: wp(26),
    height: wp(26),
    borderRadius: 40,
  },
  editBtn: {
    width: wp(7.5),
    height: wp(7.5),
    backgroundColor: "#130160",
    position: "absolute",
    bottom: 0,
    right: "36.5%",
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#fbfdff",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionContainer: {
    padding: "5%",
  },
  sectionTitle: {
    fontFamily: "Nunito-SemiBold",
    fontSize: wp(5),
    color: "#000000",
    marginBottom: "5%",
  },
  label: {
    color: "black",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.8),
    marginTop: "1.5%",
  },
  inputContainer: {
    backgroundColor: "#fff",
    width: "100%",
    height: hp(6.5),
    alignSelf: "center",
    borderRadius: 8,
    marginVertical: "2%",
    paddingHorizontal: "5%",
    justifyContent: "center",
    borderWidth: 0.4,
    borderColor: "#524B6B",
  },
  inputContainerHalf: {
    width: "48%",
  },
  input: {
    fontFamily: "Nunito-Regular",
    color: "#000",
    fontSize: hp(2.2),
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: "2%",
  },
  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: "2%",
  },
  dropdownContainer: {
    width: "48%",
    alignSelf: "center",
    borderRadius: 8,
    justifyContent: "center",
    borderWidth: 0.1,
    borderColor: "#524B6B",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderColor: "#524B6B",
    height: hp(6),
    borderRadius: 6,
    borderWidth: 0.3,
  },
  dropdownText: {
    fontFamily: "Nunito-Regular",
    fontSize: 16,
    color: "#000",
  },
  dropdownContainerStyle: {
    borderColor: "#524B6B",
    backgroundColor: "#fff",
  },
  timePickerButton: {
    backgroundColor: "#fff",
    width: "48%",
    height: hp(6),
    borderRadius: 6,
    borderWidth: 0.3,
    borderColor: "#524B6B",
    justifyContent: "center",
    alignItems: "center",
  },
  timePickerText: {
    fontFamily: "Nunito-Regular",
    fontSize: 16,
    color: "#000",
  },
  divider: {
    borderWidth: 0.3,
    borderColor: "#C4C4C4",
    width: wp(90),
    alignSelf: "center",
    marginTop: "6%",
  },
  gettingStarted: {
    backgroundColor: "#130160",
    width: "90%",
    height: hp(7),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: "5%",
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: "Nunito-SemiBold",
    color: "#fff",
    fontSize: hp(2.5),
  },
  bottomSpacer: {
    height: hp(7),
  },
  suggestionsContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    maxHeight: hp(20),
    marginTop: 5,
    zIndex: 1000,
  },
  suggestionList: {
    width: "100%",
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  suggestionText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.8),
    color: "#000",
  },
});
