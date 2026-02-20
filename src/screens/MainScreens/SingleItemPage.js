import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ImageBackground,
  StatusBar,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Heart_Icon from "../../../assets/heart_icon.svg";
import Share_Icon from "../../../assets/share_icon.svg";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import useStore from "../../store";

const { width } = Dimensions.get("window");

const SingleItemPage = ({ route }) => {
  const navigation = useNavigation();
  const { productId, section, data } = route.params || {};
  const { product, fetchProductById } = useStore();
  const [similarItems, setSimilarItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        if (productId) {
          await fetchProductById(productId);
        }
      } catch (error) {
        console.error("Load product error:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();

    if (data && data.length > 0) {
      const filteredData = data.filter((item) => item.id !== productId);
      const randomItems = filteredData
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setSimilarItems(randomItems);
    }
  }, [productId, section, data, fetchProductById]);

  const myFavourites = [
    {
      id: 1,
      image: require("../../../assets/gray_img.png"),
      description: `IWC Schaffhausen 2021 Pilot's Watch "SIHH 2019" 44mm`,
      discountPrice: "$65",
      originalPrice: "$151",
      totalDiscount: "60% off",
    },
    {
      id: 2,
      image: require("../../../assets/gray_img.png"),
      description: `IWC Schaffhausen 2021 Pilot's Watch "SIHH 2019" 44mm`,
      discountPrice: "$65",
      originalPrice: "$151",
      totalDiscount: "60% off",
    },
  ];

  if (isLoading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent={true} backgroundColor={"transparent"} />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
        resizeMode="stretch"
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
            <Text style={styles.headerText}>Item</Text>
          </View>
          <View style={styles.headerIcons}>
            <Pressable onPress={() => navigation.goBack()}>
              <Heart_Icon height={hp(4)} />
            </Pressable>
            <Pressable onPress={() => navigation.goBack()}>
              <Share_Icon height={hp(4)} />
            </Pressable>
          </View>
        </View>
        <View style={styles.mainImageContainer}>
          <Image source={{ uri: product.pic }} style={styles.mainImage} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.ratingWrapper}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Ionicons name="star" size={18} color="#FFD700" />
              <Ionicons name="star" size={18} color="#FFD700" />
              <Ionicons name="star" size={18} color="#FFD700" />
              <Ionicons name="star-half" size={18} color="#FFD700" />
              <Text style={styles.ratingText}>56,890</Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>₹{product.price}</Text>
            <Text style={styles.discountedPrice}>₹{product.offer_price}</Text>
            <Text style={styles.discount}>
              {product.price && product.offer_price
                ? `${Math.round(
                    ((product.price - product.offer_price) / product.price) *
                      100
                  )}% Off`
                : ""}
            </Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{product.title}</Text>
            <View style={styles.itemDetailsContainer}>
              <Text style={styles.detailsTitle}>Item Details</Text>
              <Text style={styles.detailsText}>
                {product.description || "No description available"} More.....
              </Text>
            </View>
            <View style={styles.itemMetaContainer}>
              <Text style={styles.metaText}>
                Category: <Text style={styles.metaValue}>Electronics</Text>
              </Text>
              <Text style={styles.metaText}>
                UPC #: <Text style={styles.metaValue}>2233243432432</Text>
              </Text>
              <Text style={styles.metaText}>
                Tags - <Text style={styles.metaValue}>"Summer Collection"</Text>
              </Text>
              <Text style={styles.metaText}>
                Date and time -{" "}
                <Text style={styles.metaValue}>{product.date || "N/A"}</Text>
              </Text>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("EditPhotoScreen")}
            >
              <Text style={styles.buttonText}>Edit</Text>
              <FontAwesome name="edit" size={18} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Replace</Text>
              <MaterialCommunityIcons
                name="file-replace"
                size={18}
                color="#000"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Delete</Text>
              <AntDesign name="delete" size={18} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.similarItemsSection}>
            <Text style={styles.similarItemsTitle}>SIMILAR ITEMS</Text>
            <View style={styles.similarItemsContainer}>
              <FlatList
                data={myFavourites}
                renderItem={renderMyFavourites}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
              />
            </View>
          </View>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

const renderMyFavourites = ({ item }) => (
  <View style={styles.similarItemContainer}>
    <View style={styles.similarItemCard}>
      <Image source={item.image} style={styles.similarItemImage} />
      <Ionicons
        name="heart"
        size={hp(3)}
        color={"#EE2525"}
        style={styles.heartIcon}
      />
      <View style={styles.similarItemDescriptionContainer}>
        <Text style={styles.similarItemDescription}>{item.description}</Text>
      </View>
      <View style={styles.similarItemPriceContainer}>
        <View>
          <Text style={styles.similarItemDiscountPrice}>
            {item.discountPrice}
          </Text>
          <Text style={styles.similarItemPriceText}>
            <Text style={styles.similarItemOriginalPrice}>
              {item.originalPrice}
            </Text>
            {"  "}
            {item.totalDiscount}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: wp(100),
    height: hp(100),
    backgroundColor: "#E6F3F5",
  },
  vector: {
    flex: 1,
    width: wp(100),
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
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "23%",
  },
  mainImageContainer: {
    width: "90%",
    height: hp(27),
    marginHorizontal: "5%",
    borderRadius: 10,
    marginVertical: "5%",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  contentContainer: {
    paddingHorizontal: "5%",
  },
  ratingWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontFamily: "Nunito-Regular",
    marginLeft: 4,
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "1%",
    marginTop: "3.5%",
  },
  originalPrice: {
    fontFamily: "Nunito-Regular",
    fontSize: 16,
    textDecorationLine: "line-through",
    color: "#666",
    marginRight: 8,
  },
  discountedPrice: {
    fontFamily: "Nunito-Bold",
    fontSize: 18,
    color: "#000",
    marginRight: 8,
  },
  discount: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: "#e63946",
  },
  detailsContainer: {
    marginVertical: "6%",
  },
  title: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.5),
    marginBottom: 8,
    color: "black",
  },
  itemDetailsContainer: {
    marginVertical: "1%",
  },
  detailsTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.2),
    color: "#000",
    marginBottom: 4,
  },
  detailsText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.8),
    color: "#666",
  },
  itemMetaContainer: {
    marginVertical: "1%",
  },
  metaText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2),
    color: "#000",
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.7),
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: "5%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f3f4",
    borderRadius: 4,
    flex: 1,
    marginHorizontal: "2%",
    elevation: 2,
    height: hp(7),
    gap: 4,
  },
  buttonText: {
    fontFamily: "Nunito-SemiBold",
    color: "#000",
    marginLeft: 4,
  },
  similarItemsSection: {
    marginVertical: "3%",
  },
  similarItemsTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.3),
    color: "#000000",
    marginVertical: "5%",
  },
  similarItemsContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  similarItemContainer: {
    width: wp(45),
    height: hp(26),
    alignItems: "center",
    marginVertical: "1%",
  },
  similarItemCard: {
    width: wp(43),
    height: hp(26),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#fff",
  },
  similarItemImage: {
    width: wp(43),
    height: hp(13),
    borderRadius: 5,
  },
  heartIcon: {
    position: "absolute",
    right: "2%",
    top: "2%",
  },
  similarItemDescriptionContainer: {
    paddingHorizontal: "1%",
  },
  similarItemDescription: {
    fontFamily: "Nunito-SemiBold",
    color: "#000",
    fontSize: hp(1.7),
    margin: "0.5%",
  },
  similarItemPriceContainer: {
    position: "absolute",
    bottom: "2%",
    paddingHorizontal: "3%",
  },
  similarItemDiscountPrice: {
    fontFamily: "Nunito-Bold",
    color: "#000",
    fontSize: hp(1.8),
  },
  similarItemPriceText: {
    color: "red",
  },
  similarItemOriginalPrice: {
    fontFamily: "Nunito-Bold",
    color: "#808488",
    fontSize: hp(1.8),
    textDecorationLine: "line-through",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SingleItemPage;
// import { useNavigation } from "@react-navigation/native";
// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   FlatList,
//   Dimensions,
//   ImageBackground,
//   StatusBar,
//   Pressable,
//   Image,
// } from "react-native";
// import {
//   heightPercentageToDP as hp,
//   widthPercentageToDP as wp,
// } from "react-native-responsive-screen";
// import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import Heart_Icon from "../../../assets/heart_icon.svg";
// import Share_Icon from "../../../assets/share_icon.svg";
// import FontAwesome from "react-native-vector-icons/FontAwesome";
// import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
// import AntDesign from "react-native-vector-icons/AntDesign";

// const { width } = Dimensions.get("window");

// const SingleItemPage = () => {
//   const navigation = useNavigation();

//   const myFavourites = [
//     {
//       id: 1,
//       image: require("../../../assets/gray_img.png"),
//       description: `IWC Schaffhausen 2021 Pilot's Watch "SIHH 2019" 44mm`,
//       discountPrice: "$65",
//       originalPrice: "$151",
//       totalDiscount: "60% off",
//     },
//     {
//       id: 2,
//       image: require("../../../assets/gray_img.png"),
//       description: `IWC Schaffhausen 2021 Pilot's Watch "SIHH 2019" 44mm`,
//       discountPrice: "$65",
//       originalPrice: "$151",
//       totalDiscount: "60% off",
//     },
//   ];

//   const renderMyFavourites = ({ item }) => (
//     <View style={styles.similarItemContainer}>
//       <View style={styles.similarItemCard}>
//         <Image source={item.image} style={styles.similarItemImage} />
//         <Ionicons
//           name="heart"
//           size={hp(3)}
//           color={"#EE2525"}
//           style={styles.heartIcon}
//         />
//         <View style={styles.similarItemDescriptionContainer}>
//           <Text style={styles.similarItemDescription}>{item.description}</Text>
//         </View>
//         <View style={styles.similarItemPriceContainer}>
//           <View>
//             <Text style={styles.similarItemDiscountPrice}>
//               {item.discountPrice}
//             </Text>
//             <Text style={styles.similarItemPriceText}>
//               <Text style={styles.similarItemOriginalPrice}>
//                 {item.originalPrice}
//               </Text>
//               {"  "}
//               {item.totalDiscount}
//             </Text>
//           </View>
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <ScrollView style={styles.container}>
//       <StatusBar translucent={true} backgroundColor={"transparent"} />
//       <ImageBackground
//         source={require("../../../assets/vector_1.png")}
//         style={styles.vector}
//         resizeMode="stretch"
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
//             <Text style={styles.headerText}>Item</Text>
//           </View>
//           <View style={styles.headerIcons}>
//             <Pressable onPress={() => navigation.goBack()}>
//               <Heart_Icon height={hp(4)} />
//             </Pressable>
//             <Pressable onPress={() => navigation.goBack()}>
//               <Share_Icon height={hp(4)} />
//             </Pressable>
//           </View>
//         </View>
//         <View style={styles.mainImageContainer}>
//           <Image
//             source={require("../../../assets/specific_item.png")}
//             style={styles.mainImage}
//           />
//         </View>
//         <View style={styles.contentContainer}>
//           <View style={styles.ratingWrapper}>
//             <View style={styles.ratingContainer}>
//               <Ionicons name="star" size={18} color="#FFD700" />
//               <Ionicons name="star" size={18} color="#FFD700" />
//               <Ionicons name="star" size={18} color="#FFD700" />
//               <Ionicons name="star" size={18} color="#FFD700" />
//               <Ionicons name="star-half" size={18} color="#FFD700" />
//               <Text style={styles.ratingText}>56,890</Text>
//             </View>
//           </View>
//           <View style={styles.priceContainer}>
//             <Text style={styles.originalPrice}>₹2,999</Text>
//             <Text style={styles.discountedPrice}>₹1,500</Text>
//             <Text style={styles.discount}>50% Off</Text>
//           </View>
//           <View style={styles.detailsContainer}>
//             <Text style={styles.title}>
//               Wireless Bluetooth Mouse with USB Receiver
//             </Text>
//             <View style={styles.itemDetailsContainer}>
//               <Text style={styles.detailsTitle}>Item Details</Text>
//               <Text style={styles.detailsText}>
//                 A high-quality wireless mouse compatible with PCs, laptops, and
//                 tablets. Features a sleek design, USB receiver, and adjustable
//                 DPI settings for smooth navigation. More.....
//               </Text>
//             </View>
//             <View style={styles.itemMetaContainer}>
//               <Text style={styles.metaText}>
//                 Category: <Text style={styles.metaValue}>Electronics</Text>
//               </Text>
//               <Text style={styles.metaText}>
//                 UPC #: <Text style={styles.metaValue}>2233243432432</Text>
//               </Text>
//               <Text style={styles.metaText}>
//                 Tags - <Text style={styles.metaValue}>"Summer Collection"</Text>
//               </Text>
//               <Text style={styles.metaText}>
//                 Date and time -{" "}
//                 <Text style={styles.metaValue}>14/11/24, 12.30</Text>
//               </Text>
//             </View>
//           </View>
//           <View style={styles.buttonContainer}>
//             <TouchableOpacity
//               style={styles.button}
//               onPress={() => navigation.navigate("EditPhotoScreen")}
//             >
//               <Text style={styles.buttonText}>Edit</Text>
//               <FontAwesome name="edit" size={18} color="#000" />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.button}>
//               <Text style={styles.buttonText}>Replace</Text>
//               <MaterialCommunityIcons
//                 name="file-replace"
//                 size={18}
//                 color="#000"
//               />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.button}>
//               <Text style={styles.buttonText}>Delete</Text>
//               <AntDesign name="delete" size={18} color="#000" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.similarItemsSection}>
//             <Text style={styles.similarItemsTitle}>SIMILAR ITEMS</Text>
//             <View style={styles.similarItemsContainer}>
//               <FlatList
//                 data={myFavourites}
//                 renderItem={renderMyFavourites}
//                 keyExtractor={(item) => item.id.toString()}
//                 numColumns={2}
//               />
//             </View>
//           </View>
//         </View>
//       </ImageBackground>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     width: wp(100),
//     height: hp(100),
//     backgroundColor: "#E6F3F5",
//   },
//   vector: {
//     flex: 1,
//     width: wp(100),
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
//   headerIcons: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     width: "23%",
//   },
//   mainImageContainer: {
//     width: "90%",
//     height: hp(27),
//     marginHorizontal: "5%",
//     borderRadius: 10,
//     marginVertical: "5%",
//   },
//   mainImage: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 10,
//   },
//   contentContainer: {
//     paddingHorizontal: "5%",
//   },
//   ratingWrapper: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     alignItems: "center",
//   },
//   ratingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   ratingText: {
//     fontFamily: "Nunito-Regular",
//     marginLeft: 4,
//     color: "#666",
//   },
//   priceContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: "1%",
//     marginTop: "3.5%",
//   },
//   originalPrice: {
//     fontFamily: "Nunito-Regular",
//     fontSize: 16,
//     textDecorationLine: "line-through",
//     color: "#666",
//     marginRight: 8,
//   },
//   discountedPrice: {
//     fontFamily: "Nunito-Bold",
//     fontSize: 18,
//     color: "#000",
//     marginRight: 8,
//   },
//   discount: {
//     fontFamily: "Nunito-Bold",
//     fontSize: 14,
//     color: "#e63946",
//   },
//   detailsContainer: {
//     marginVertical: "6%",
//   },
//   title: {
//     fontFamily: "Nunito-Bold",
//     fontSize: hp(2.5),
//     marginBottom: 8,
//     color: "black",
//   },
//   itemDetailsContainer: {
//     marginVertical: "1%",
//   },
//   detailsTitle: {
//     fontFamily: "Nunito-Bold",
//     fontSize: hp(2.2),
//     color: "#000",
//     marginBottom: 4,
//   },
//   detailsText: {
//     fontFamily: "Nunito-Regular",
//     fontSize: hp(1.8),
//     color: "#666",
//   },
//   itemMetaContainer: {
//     marginVertical: "1%",
//   },
//   metaText: {
//     fontFamily: "Nunito-Bold",
//     fontSize: hp(2),
//     color: "#000",
//     marginBottom: 4,
//   },
//   metaValue: {
//     fontFamily: "Nunito-SemiBold",
//     fontSize: hp(1.7),
//     color: "#666",
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginVertical: "5%",
//   },
//   button: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#f1f3f4",
//     borderRadius: 4,
//     flex: 1,
//     marginHorizontal: "2%",
//     elevation: 2,
//     height: hp(7),
//     gap: 4,
//   },
//   buttonText: {
//     fontFamily: "Nunito-SemiBold",
//     color: "#000",
//     marginLeft: 4,
//   },
//   similarItemsSection: {
//     marginVertical: "3%",
//   },
//   similarItemsTitle: {
//     fontFamily: "Nunito-Bold",
//     fontSize: hp(2.3),
//     color: "#000000",
//     marginVertical: "5%",
//   },
//   similarItemsContainer: {
//     flex: 1,
//     width: "100%",
//     alignItems: "center",
//   },
//   similarItemContainer: {
//     width: wp(45),
//     height: hp(26),
//     alignItems: "center",
//     marginVertical: "1%",
//   },
//   similarItemCard: {
//     width: wp(43),
//     height: hp(26),
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: "#e6e6e6",
//     backgroundColor: "#fff",
//   },
//   similarItemImage: {
//     width: wp(43),
//     height: hp(13),
//     borderRadius: 5,
//   },
//   heartIcon: {
//     position: "absolute",
//     right: "2%",
//     top: "2%",
//   },
//   similarItemDescriptionContainer: {
//     paddingHorizontal: "1%",
//   },
//   similarItemDescription: {
//     fontFamily: "Nunito-SemiBold",
//     color: "#000",
//     fontSize: hp(1.7),
//     margin: "0.5%",
//   },
//   similarItemPriceContainer: {
//     position: "absolute",
//     bottom: "2%",
//     paddingHorizontal: "3%",
//   },
//   similarItemDiscountPrice: {
//     fontFamily: "Nunito-Bold",
//     color: "#000",
//     fontSize: hp(1.8),
//   },
//   similarItemPriceText: {
//     color: "red",
//   },
//   similarItemOriginalPrice: {
//     fontFamily: "Nunito-Bold",
//     color: "#808488",
//     fontSize: hp(1.8),
//     textDecorationLine: "line-through",
//   },
// });

// export default SingleItemPage;
