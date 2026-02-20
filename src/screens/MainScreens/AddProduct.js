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
  Alert,
  ActivityIndicator,
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

const AddProduct = () => {
  const navigation = useNavigation();
  const { fetchCategories, addProduct } = useStore();

  const [openAddType, setOpenAddType] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [valueAddType, setValueAddType] = useState(null);
  const [valueCategory, setValueCategory] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [bannerImage, setBannerImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Error loading categories:", error.message);
        Alert.alert("Error", "Failed to load categories. Please try again.");
      } finally {
        setIsCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  const addTypeOptions = [
    { label: "Activity Feed", value: "activity" },
    { label: "Promotion", value: "promotion" },
    { label: "Trending", value: "trending" },
  ];

  const handleOpenDropdown = (setOpen, isOpen, key) => {
    if (isOpen) {
      setOpen(false);
    } else {
      setOpen(true);
      if (key !== "addType") setOpenAddType(false);
      if (key !== "category") setOpenCategory(false);
    }
  };

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
                if (response.didCancel) return;
                if (response.errorCode) {
                  Alert.alert("Error", response.errorMessage);
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
                if (response.didCancel) return;
                if (response.errorCode) {
                  Alert.alert("Error", response.errorMessage);
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

  const handleAddProduct = async () => {
    if (!valueCategory || !title || !description || !price || !quantity || !bannerImage) {
      Alert.alert("Error", "Please fill all fields and select an image.");
      return;
    }

    setIsLoading(true);
    try {
      const productData = {
        category_id: valueCategory,
        title,
        description,
        price,
        offer_price: offerPrice,
        quantity,
        type: valueAddType,
        pic: bannerImage,
      };

      const response = await addProduct(productData);
      console.log("Add product response:", response);

      Alert.alert("Success", "Product added successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setTitle("");
            setDescription("");
            setPrice("");
            setOfferPrice("");
            setQuantity("");
            setValueCategory(null);
            setValueAddType(null);
            setBannerImage(null);
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Add product error:", error.message);
      const message =
        error.response?.data?.message ||
        Object.values(error.response?.data || {})?.[0]?.[0] ||
        error.message ||
        "Failed to add product";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={!openCategory && !openAddType}
    >
      <StatusBar translucent={true} backgroundColor={"transparent"} />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
      >
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color={"#0D0D26"} size={25} />
            </Pressable>
            <Text style={styles.headerText}>Add Product</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.sectionContainer}>
          <Text style={styles.label}>Title</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Product title"
              value={title}
              onChangeText={setTitle}
              style={styles.inputText}
              placeholderTextColor={"#999"}
            />
          </View>

          <Text style={styles.label}>Description</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Product description"
              value={description}
              onChangeText={setDescription}
              style={styles.inputText}
              placeholderTextColor={"#999"}
            />
          </View>

          <Text style={styles.label}>What do you want to add?</Text>
          <View style={[styles.dropdownContainer, { zIndex: 600 }]}>
            <DropDownPicker
              open={openAddType}
              value={valueAddType}
              items={addTypeOptions}
              setOpen={() => handleOpenDropdown(setOpenAddType, openAddType, "addType")}
              setValue={setValueAddType}
              setItems={() => {}}
              placeholder="Select type"
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownContainerStyle}
              ArrowDownIconComponent={() => (
                <SimpleLineIcons name="arrow-down" size={20} color="#000" />
              )}
              onSelectItem={() => setOpenAddType(false)}
              dropDownMaxHeight={hp(20)}
            />
          </View>

          <Text style={styles.label}>Product Category</Text>
          <View style={[styles.dropdownContainer, { zIndex: 500 }]}>
            {isCategoriesLoading ? (
              <ActivityIndicator
                size="small"
                color="#130160"
                style={{ marginVertical: hp(1) }}
              />
            ) : (
              <DropDownPicker
                open={openCategory}
                value={valueCategory}
                items={categories}
                setOpen={() => handleOpenDropdown(setOpenCategory, openCategory, "category")}
                setValue={setValueCategory}
                setItems={setCategories}
                placeholder="Select category"
                style={styles.dropdown}
                textStyle={styles.dropdownText}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                ArrowDownIconComponent={() => (
                  <SimpleLineIcons name="arrow-down" size={20} color="#000" />
                )}
                onSelectItem={() => setOpenCategory(false)}
                dropDownMaxHeight={hp(40)}
                scrollViewProps={{ showsVerticalScrollIndicator: true }}
              />
            )}
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

          <Text style={styles.label}>Offer Price (Optional)</Text>
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

          <Text style={styles.label}>Quantity</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter quantity"
              value={quantity}
              onChangeText={setQuantity}
              style={styles.inputText}
              placeholderTextColor={"#999"}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.label}>Banner</Text>
          <TouchableOpacity style={styles.bannerContainer} onPress={handleImagePick}>
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
          onPress={handleAddProduct}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Add Product</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ImageBackground>
    </ScrollView>
  );
};

export default AddProduct;

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
    height: hp(6.5),
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