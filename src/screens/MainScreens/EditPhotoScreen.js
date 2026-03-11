import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import CameraIcon from "../../../assets/CameraIcon.svg";
import SearchIcon from "../../../assets/SearchIcon.svg";
import GalleryIcon from "../../../assets/gallery_icon.svg";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const EditPhotoScreen = () => {
  const navigation = useNavigation();
  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent={true} backgroundColor={"transparent"} />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
      >
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons
                name="arrow-back-ios"
                color={"#0D0D26"}
                size={25}
              />
            </Pressable>
            <Text style={styles.headerText}>Bin Finder</Text>
          </View>
        </View>
        <View style={{ height: hp(3) }} />
        <View style={{ width: wp(100), paddingHorizontal: "5%" }}>
          <Text
            style={{
              fontFamily: "Nunito-Bold",
              fontSize: hp(3),
              color: "#14BA9C",
            }}
          >
            Nike Sneakers
          </Text>
        </View>
        <View style={{ paddingHorizontal: "5%" }}>
          <Text style={styles.label}>Title</Text>
          <View
            style={{
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
            }}
          >
            <TextInput
              placeholder="New Arrival – Sneakers"
              style={{
                fontFamily: "Nunito-Regular",
                color: "#000",
                fontSize: hp(2.2),
              }}
              placeholderTextColor={"gray"}
            />
          </View>
          <Text style={styles.label}>Description</Text>
          <View
            style={{
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
            }}
          >
            <TextInput
              placeholder="short caption or product details"
              style={{
                fontFamily: "Nunito-Regular",
                color: "#000",
                fontSize: hp(2.2),
              }}
              placeholderTextColor={"gray"}
            />
          </View>
          <View
            style={{
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
            }}
          >
            <TextInput
              placeholder="Add Tags"
              style={{
                fontFamily: "Nunito-Regular",
                color: "#000",
                fontSize: hp(2.2),
              }}
              placeholderTextColor={"gray"}
            />
          </View>
          <Text style={styles.label}>Upload Photo</Text>
          <View style={styles.uploadContainer}>
            <Pressable style={styles.searchContainer}>
              <View style={styles.cameraButton}>
                <CameraIcon />
              </View>
              <Text style={styles.input}>take a photo</Text>
              <View style={styles.searchButton}>
                <GalleryIcon />
              </View>
            </Pressable>
          </View>
          <Text style={styles.label}>Cover Photo</Text>
          <View style={styles.uploadContainer}>
            <Pressable style={styles.searchContainer}>
              <View style={styles.cameraButton}>
                <CameraIcon />
              </View>
              <Text style={styles.input}>take a photo</Text>
              <View style={styles.searchButton}>
                <GalleryIcon />
              </View>
            </Pressable>
          </View>
        </View>
        <TouchableOpacity
          style={styles.gettingStarted}
          onPress={() => navigation.navigate("UploadSuccess")}
        >
          <Text
            style={{
              fontFamily: "Nunito-SemiBold",
              color: "#fff",
              fontSize: hp(2),
            }}
          >
            Save Changes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.navigate("UploadSuccess")}
        >
          <Text
            style={{
              fontFamily: "Nunito-SemiBold",
              color: "red",
              fontSize: hp(2.2),
            }}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      </ImageBackground>
    </ScrollView>
  );
};

export default EditPhotoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  uploadContainer: {
    flexDirection: "row",
    alignItems: "center",
    // marginHorizontal: '3%',
    marginVertical: "2%",
    width: "100%",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: 'trasparent',
    borderWidth: 1,
    borderRadius: 12,
    // marginRight: 10,
    borderColor: "#99ABC678",
    alignSelf: "center",
    height: hp(7),
    backgroundColor: "#fff",
  },
  cameraButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: hp(2),
    fontFamily: "Nunito-Regular",
    paddingVertical: 8,
    color: "#000",
    textAlign: "left",
  },
  searchButton: {
    padding: 10,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: wp(40),
    height: hp(10.5),
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: hp(100),
  },
  logoText: {
    fontFamily: "Nunito-SemiBold",
    color: "#000",
    fontSize: hp(2.5),
  },
  cityVector: {
    position: "absolute",
    width: wp(100),
    bottom: 0,
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
    height: hp(6.7),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: "4%",
  },
  cancelBtn: {
    width: "90%",
    height: hp(6.5),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: "4%",
    borderWidth: 1,
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
    justifyContent: "space-between",
  },
  headerText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(3),
    textAlign: "left",
    color: "#0D0140",
  },
});
