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
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import DropDownPicker from "react-native-dropdown-picker";
import Upload_Photo_Icon from "../../../assets/Upload_Photo_Icon.svg";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import useStore from "../../store";

const NewPromotionScreen = () => {
  const navigation = useNavigation();
  const { fetchCategories, addProduct } = useStore();
  const [openCategory, setOpenCategory] = useState(false);
  const [valueCategory, setValueCategory] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [bannerImage, setBannerImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Error loading categories:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, [fetchCategories]);

  // Handle image picker
  const handleImagePick = () => {
    Alert.alert(
      "Select Image",
      "Choose an option to upload an image",
      [
        {
          text: "Camera",
          onPress: () =>
            launchCamera(
              { mediaType: "photo", maxWidth: 800, maxHeight: 600 },
              (response) => {
                if (response.didCancel) {
                  console.log("User cancelled camera");
                } else if (response.errorCode) {
                  console.error("Camera Error: ", response.errorMessage);
                } else if (response.assets) {
                  setBannerImage(response.assets[0].uri);
                }
              }
            ),
        },
        {
          text: "Gallery",
          onPress: () =>
            launchImageLibrary(
              { mediaType: "photo", maxWidth: 800, maxHeight: 600 },
              (response) => {
                if (response.didCancel) {
                  console.log("User cancelled gallery");
                } else if (response.errorCode) {
                  console.error("Gallery Error: ", response.errorMessage);
                } else if (response.assets) {
                  setBannerImage(response.assets[0].uri);
                }
              }
            ),
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const handleAddPromotion = async () => {
    if (
      !valueCategory ||
      !title ||
      !description ||
      !price ||
      !offerPrice ||
      !bannerImage
    ) {
      Alert.alert("Error", "Please fill all fields and select an image.");
      return;
    }

    setIsLoading(true);
    try {
      const promotionData = {
        category_id: valueCategory,
        title,
        description,
        price,
        offer_price: offerPrice,
        type: 2, // Hardcoded type 3 for promotion
        pic: bannerImage,
      };
      const response = await addProduct(promotionData);
      Alert.alert("Success", response.message, [
        { text: "OK", onPress: () => navigation.replace("NewPromotionScreen") },
      ]);
    } catch (error) {
      console.error("Add promotion error:", error.message);
      if (error.response) {
        Alert.alert(
          "Error",
          error.response.data.message || "Failed to add promotion"
        );
      } else {
        Alert.alert("Error", "Failed to add promotion");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={!openCategory} // Disable main ScrollView when dropdown is open
    >
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
            <Text style={styles.headerText}>New Promotion</Text>
          </View>
        </View>
        <View style={styles.spacer} />
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Create a New Promotion</Text>
          <Text style={styles.sectionSubtitle}>
            Engage your customers with exciting offers and discounts
          </Text>
        </View>
        <View style={styles.spacer} />
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>
            Promotions Section (Add new promotion)
          </Text>
          <Text style={styles.label}>Title</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Buy One, Get One Free"
              value={title}
              onChangeText={setTitle}
              style={styles.inputText}
              placeholderTextColor={"#999"}
            />
          </View>
          <Text style={styles.label}>Description</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Free shipping on orders over $50"
              value={description}
              onChangeText={setDescription}
              style={styles.inputText}
              placeholderTextColor={"#999"}
            />
          </View>
          <Text style={styles.label}>Product Category</Text>
          <View style={[styles.dropdownContainer, { zIndex: 500 }]}>
            <DropDownPicker
              open={openCategory}
              value={valueCategory}
              items={categories}
              setOpen={setOpenCategory}
              setValue={setValueCategory}
              setItems={setCategories}
              placeholder="Select category"
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={[
                styles.dropdownContainerStyle,
                { maxHeight: hp(6.5) * 4 },
              ]}
              scrollable={true} // Enable internal scrolling for dropdown
              ArrowDownIconComponent={() => (
                <SimpleLineIcons name="arrow-down" size={20} color="#000" />
              )}
              onSelectItem={() => setOpenCategory(false)}
              disabled={isLoading}
            />
          </View>
          <Text style={styles.label}>Price</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter price"
              value={price}
              onChangeText={setPrice}
              style={styles.inputText}
              placeholderTextColor={"#999"}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.label}>Offer Price</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter offer price"
              value={offerPrice}
              onChangeText={setOfferPrice}
              style={styles.inputText}
              placeholderTextColor={"#999"}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.label}>Banner</Text>
          <TouchableOpacity
            style={styles.bannerContainer}
            onPress={handleImagePick}
          >
            {bannerImage ? (
              <Image
                source={{ uri: bannerImage }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ) : (
              <Upload_Photo_Icon width="50%" height="50%" />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.disabledButton]}
          onPress={handleAddPromotion}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Add Promotion</Text>
          )}
        </TouchableOpacity>
        <View style={styles.bottomSpacer} />
      </ImageBackground>
    </ScrollView>
  );
};

export default NewPromotionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  vector: {
    width: wp(100),
    minHeight: hp(100),
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
  sectionContainer: {
    paddingHorizontal: "5%",
  },
  sectionTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.8),
    color: "#14BA9C",
  },
  sectionSubtitle: {
    color: "#524B6B",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.7),
    marginTop: "2%",
  },
  sectionHeader: {
    color: "#000000",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.9),
    marginTop: "2%",
  },
  spacer: {
    height: hp(2),
  },
  inputContainer: {
    backgroundColor: "#fff",
    width: "100%",
    height: hp(6.5),
    borderRadius: 8,
    marginVertical: "2%",
    paddingHorizontal: "5%",
    justifyContent: "center",
    borderWidth: 0.4,
    borderColor: "#524B6B",
  },
  inputText: {
    fontFamily: "Nunito-Regular",
    color: "#000",
    fontSize: hp(2.2),
  },
  label: {
    color: "black",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.7),
    marginTop: "3%",
  },
  dropdownContainer: {
    width: "100%",
    marginVertical: "2%",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderColor: "#524B6B",
    // height: hp(6.5),
    borderRadius: 8,
    borderWidth: 0.4,
  },
  dropdownText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(2.2),
    color: "#000",
  },
  dropdownContainerStyle: {
    borderColor: "#524B6B",
    backgroundColor: "#fff",
  },
  bannerContainer: {
    backgroundColor: "#fff",
    width: "100%",
    height: hp(23),
    borderRadius: 8,
    marginVertical: "2%",
    borderWidth: 0.4,
    borderColor: "#524B6B",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  buttonContainer: {
    width: "90%",
    marginTop: "5%",
    height: hp(7),
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteButton: {
    width: "48%",
    height: "90%",
    borderRadius: 7,
    borderWidth: 0.8,
    borderColor: "gray",
    justifyContent: "center",
    alignItems: "center",
  },
  createButton: {
    width: "48%",
    height: "90%",
    borderRadius: 7,
    borderWidth: 0.8,
    borderColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Nunito-SemiBold",
    color: "#000",
    fontSize: hp(1.9),
  },
  bottomSpacer: {
    height: hp(5),
  },
  loginButton: {
    backgroundColor: "#130160",
    width: "90%",
    height: hp(7),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: hp(2),
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontFamily: "Nunito-SemiBold",
    color: "#fff",
    fontSize: hp(2.5),
  },
});
// import {
//   Image,
//   ImageBackground,
//   Pressable,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Alert,
// } from "react-native";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import React, { useState } from "react";
// import { useNavigation } from "@react-navigation/native";
// import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
// import DropDownPicker from "react-native-dropdown-picker";
// import Upload_Photo_Icon from "../../../assets/Upload_Photo_Icon.svg";
// import { launchCamera, launchImageLibrary } from "react-native-image-picker";

// const NewPromotionScreen = () => {
//   const navigation = useNavigation();
//   const [openCategory, setOpenCategory] = useState(false);
//   const [valueCategory, setValueCategory] = useState(null);
//   const [price, setPrice] = useState("");
//   const [offerPrice, setOfferPrice] = useState("");
//   const [bannerImage, setBannerImage] = useState(null);

//   const categoryOptions = [
//     { label: "Electronics", value: "electronics" },
//     { label: "Clothing", value: "clothing" },
//     { label: "Accessories", value: "accessories" },
//     { label: "Home & Garden", value: "home_garden" },
//     { label: "Beauty & Personal Care", value: "beauty_personal_care" },
//     { label: "Sports & Outdoors", value: "sports_outdoors" },
//     { label: "Books & Stationery", value: "books_stationery" },
//     { label: "Toys & Games", value: "toys_games" },
//     { label: "Health & Wellness", value: "health_wellness" },
//     { label: "Automotive", value: "automotive" },
//     { label: "Jewelry", value: "jewelry" },
//     { label: "Food & Beverages", value: "food_beverages" },
//   ];

//   // Handle image picker
//   const handleImagePick = () => {
//     Alert.alert(
//       "Select Image",
//       "Choose an option to upload an image",
//       [
//         {
//           text: "Camera",
//           onPress: () =>
//             launchCamera(
//               { mediaType: "photo", maxWidth: 800, maxHeight: 600 },
//               (response) => {
//                 if (response.didCancel) {
//                   console.log("User cancelled camera");
//                 } else if (response.errorCode) {
//                   console.error("Camera Error: ", response.errorMessage);
//                 } else if (response.assets) {
//                   setBannerImage(response.assets[0].uri);
//                 }
//               }
//             ),
//         },
//         {
//           text: "Gallery",
//           onPress: () =>
//             launchImageLibrary(
//               { mediaType: "photo", maxWidth: 800, maxHeight: 600 },
//               (response) => {
//                 if (response.didCancel) {
//                   console.log("User cancelled gallery");
//                 } else if (response.errorCode) {
//                   console.error("Gallery Error: ", response.errorMessage);
//                 } else if (response.assets) {
//                   setBannerImage(response.assets[0].uri);
//                 }
//               }
//             ),
//         },
//         { text: "Cancel", style: "cancel" },
//       ],
//       { cancelable: true }
//     );
//   };

//   return (
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={styles.scrollContent}
//       keyboardShouldPersistTaps="handled"
//       scrollEnabled={!openCategory} // Disable main ScrollView when dropdown is open
//     >
//       <StatusBar translucent={true} backgroundColor={"transparent"} />
//       <ImageBackground
//         source={require("../../../assets/vector_1.png")}
//         style={styles.vector}
//       >
//         <View style={styles.header}>
//           <View style={styles.headerChild}>
//             <Pressable onPress={() => navigation.goBack()}>
//               <MaterialIcons
//                 name="arrow-back-ios"
//                 color={"#0D0D26"}
//                 size={25}
//               />
//             </Pressable>
//             <Text style={styles.headerText}>New Promotion</Text>
//           </View>
//         </View>
//         <View style={styles.spacer} />
//         <View style={styles.sectionContainer}>
//           <Text style={styles.sectionTitle}>Create a New Promotion</Text>
//           <Text style={styles.sectionSubtitle}>
//             Engage your customers with exciting offers and discounts
//           </Text>
//         </View>
//         <View style={styles.spacer} />
//         <View style={styles.sectionContainer}>
//           <Text style={styles.sectionHeader}>
//             Promotions Section (Add new promotion)
//           </Text>
//           <Text style={styles.label}>Title</Text>
//           <View style={styles.inputContainer}>
//             <TextInput
//               placeholder="Buy One, Get One Free"
//               style={styles.inputText}
//               placeholderTextColor={"#999"}
//             />
//           </View>
//           <Text style={styles.label}>Description</Text>
//           <View style={styles.inputContainer}>
//             <TextInput
//               placeholder="Free shipping on orders over $50"
//               style={styles.inputText}
//               placeholderTextColor={"#999"}
//             />
//           </View>
//           <Text style={styles.label}>Product Category</Text>
//           <View style={[styles.dropdownContainer, { zIndex: 500 }]}>
//             <DropDownPicker
//               open={openCategory}
//               value={valueCategory}
//               items={categoryOptions}
//               setOpen={setOpenCategory}
//               setValue={setValueCategory}
//               setItems={() => {}}
//               placeholder="Select category"
//               style={styles.dropdown}
//               textStyle={styles.dropdownText}
//               dropDownContainerStyle={[
//                 styles.dropdownContainerStyle,
//                 { maxHeight: hp(6.5) * 4 },
//               ]}
//               scrollable={true} // Enable internal scrolling for dropdown
//               ArrowDownIconComponent={() => (
//                 <SimpleLineIcons name="arrow-down" size={20} color="#000" />
//               )}
//               onSelectItem={() => setOpenCategory(false)}
//             />
//           </View>
//           <Text style={styles.label}>Price</Text>
//           <View style={styles.inputContainer}>
//             <TextInput
//               placeholder="Enter price"
//               value={price}
//               onChangeText={setPrice}
//               style={styles.inputText}
//               placeholderTextColor={"#999"}
//               keyboardType="numeric"
//             />
//           </View>
//           <Text style={styles.label}>Offer Price</Text>
//           <View style={styles.inputContainer}>
//             <TextInput
//               placeholder="Enter offer price"
//               value={offerPrice}
//               onChangeText={setOfferPrice}
//               style={styles.inputText}
//               placeholderTextColor={"#999"}
//               keyboardType="numeric"
//             />
//           </View>
//           <Text style={styles.label}>Banner</Text>
//           <TouchableOpacity
//             style={styles.bannerContainer}
//             onPress={handleImagePick}
//           >
//             {bannerImage ? (
//               <Image
//                 source={{ uri: bannerImage }}
//                 style={styles.bannerImage}
//                 resizeMode="cover"
//               />
//             ) : (
//               <Upload_Photo_Icon width="50%" height="50%" />
//             )}
//           </TouchableOpacity>
//         </View>
//         <TouchableOpacity style={styles.loginButton}>
//           <Text style={styles.loginButtonText}>Add Promotion</Text>
//         </TouchableOpacity>
//         <View style={styles.bottomSpacer} />
//       </ImageBackground>
//     </ScrollView>
//   );
// };

// export default NewPromotionScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   vector: {
//     width: wp(100),
//     minHeight: hp(100),
//   },
//   header: {
//     width: wp(100),
//     height: hp(7),
//     marginTop: "10%",
//     paddingHorizontal: "5%",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   headerChild: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   headerText: {
//     fontFamily: "Nunito-Bold",
//     fontSize: hp(3),
//     textAlign: "left",
//     color: "#0D0140",
//   },
//   sectionContainer: {
//     paddingHorizontal: "5%",
//   },
//   sectionTitle: {
//     fontFamily: "Nunito-Bold",
//     fontSize: hp(2.8),
//     color: "#14BA9C",
//   },
//   sectionSubtitle: {
//     color: "#524B6B",
//     fontFamily: "Nunito-SemiBold",
//     fontSize: hp(1.7),
//     marginTop: "2%",
//   },
//   sectionHeader: {
//     color: "#000000",
//     fontFamily: "Nunito-SemiBold",
//     fontSize: hp(1.9),
//     marginTop: "2%",
//   },
//   spacer: {
//     height: hp(2),
//   },
//   inputContainer: {
//     backgroundColor: "#fff",
//     width: "100%",
//     height: hp(6.5),
//     borderRadius: 8,
//     marginVertical: "2%",
//     paddingHorizontal: "5%",
//     justifyContent: "center",
//     borderWidth: 0.4,
//     borderColor: "#524B6B",
//   },
//   inputText: {
//     fontFamily: "Nunito-Regular",
//     color: "#000",
//     fontSize: hp(2.2),
//   },
//   label: {
//     color: "black",
//     fontFamily: "Nunito-SemiBold",
//     fontSize: hp(1.7),
//     marginTop: "3%",
//   },
//   dropdownContainer: {
//     width: "100%",
//     marginVertical: "2%",
//   },
//   dropdown: {
//     backgroundColor: "#fff",
//     borderColor: "#524B6B",
//     // height: hp(6.5),
//     borderRadius: 8,
//     borderWidth: 0.4,
//   },
//   dropdownText: {
//     fontFamily: "Nunito-Regular",
//     fontSize: hp(2.2),
//     color: "#000",
//   },
//   dropdownContainerStyle: {
//     borderColor: "#524B6B",
//     backgroundColor: "#fff",
//   },
//   bannerContainer: {
//     backgroundColor: "#fff",
//     width: "100%",
//     height: hp(23),
//     borderRadius: 8,
//     marginVertical: "2%",
//     borderWidth: 0.4,
//     borderColor: "#524B6B",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   bannerImage: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 8,
//   },
//   buttonContainer: {
//     width: "90%",
//     marginTop: "5%",
//     height: hp(7),
//     alignSelf: "center",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   deleteButton: {
//     width: "48%",
//     height: "90%",
//     borderRadius: 7,
//     borderWidth: 0.8,
//     borderColor: "gray",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   createButton: {
//     width: "48%",
//     height: "90%",
//     borderRadius: 7,
//     borderWidth: 0.8,
//     borderColor: "red",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   buttonText: {
//     fontFamily: "Nunito-SemiBold",
//     color: "#000",
//     fontSize: hp(1.9),
//   },
//   bottomSpacer: {
//     height: hp(5),
//   },
//   loginButton: {
//     backgroundColor: "#130160",
//     width: "90%",
//     height: hp(7),
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//     alignSelf: "center",
//     marginTop: hp(2),
//   },
//   disabledButton: {
//     opacity: 0.6,
//   },
//   loginButtonText: {
//     fontFamily: "Nunito-SemiBold",
//     color: "#fff",
//     fontSize: hp(2.5),
//   },
// });
