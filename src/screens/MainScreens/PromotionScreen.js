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

const PromotionScreen = ({ route }) => {
  const navigation = useNavigation();
  const { section, data } = route.params || {};
  const [promotions, setPromotions] = useState(data || []);
  const { product, fetchProductById } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        if (data && data.length > 0) {
          await fetchProductById(data[0].id); // Fetch details for the first promotion using product ID
        }
      } catch (error) {
        console.error("Load product error:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
    if (data) {
      setPromotions(data);
    }
  }, [data, fetchProductById]);

  if (isLoading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  const products = [
    {
      id: "1",
      name: "TMA-2 HD Wireless",
      subtitle: "Hidden Finds",
      rating: 4.8,
      reviews: 88,
      image: "https://placeholder.com/150",
    },
    {
      id: "2",
      name: "TMA-2 HD Wireless",
      subtitle: "ANC Store",
      rating: 4.8,
      reviews: 88,
      image: "https://placeholder.com/150",
    },
    {
      id: "3",
      name: "TMA-2 HD Wireless",
      subtitle: "Hidden Finds",
      rating: 4.8,
      reviews: 88,
      image: "https://placeholder.com/150",
    },
  ];
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      //   onPress={() =>
      //     navigation.navigate("PromotionScreen", {
      //       section: "Promotions", // Corrected to match the section
      //       data: promotions,
      //     })
      //   }
      onPress={() =>
        navigation.navigate("PromotionScreen", {
          productId: item.id,
          section: "Promotions",
          item: {
            image: item.image,
            title: item.title,
            shortDescription: item.shortDescription,
            price: item.price,
          },
        })
      }
    >
      <Image
        source={item.image}
        style={styles.image}
        onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
      />
      <Text style={styles.name}>{item.title}</Text>
      <Text style={styles.subtitle}>
        {item.shortDescription || "No subtitle"}
      </Text>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={12} color="#FFD700" />
        <Text style={styles.rating}>4.5</Text>
        <Text style={styles.reviews}>50 Reviews</Text>
      </View>
      <TouchableOpacity style={styles.heartButton}>
        <Ionicons name="heart" size={13} color="#EE2525" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
            <Text style={styles.headerText}>Promotion</Text>
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
          <Image
            source={{ uri: product.pic }} // Using 'pic' as image field from product API
            style={styles.mainImage}
          />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{product.title}</Text>
            <View style={styles.descriptionContainer}>
              <Text style={styles.detailsTitle}>Description</Text>
              <Text style={styles.detailsText}>
                {product.description || "No description available"} More.....
              </Text>
            </View>
            <View style={styles.metaContainer}>
              <Text style={styles.metaText}>
                Discount -{" "}
                <Text style={styles.metaValue}>
                  {product.offer_price
                    ? `${(
                        (1 - product.offer_price / product.price) *
                        100
                      ).toFixed(0)}% off`
                    : "N/A"}
                </Text>
              </Text>
              <Text style={styles.metaText}>
                Date and time - <Text style={styles.metaValue}>{"N/A"}</Text>{" "}
                {/* Add date field if available in API */}
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
              <Text style={styles.buttonText}>Reactive Promotion</Text>
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
          <View style={styles.similarPromotionsSection}>
            <Text style={styles.similarPromotionsTitle}>
              Similar Promotions
            </Text>
            <View style={styles.similarPromotionsContainer}>
              <FlatList
                data={promotions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                numColumns={3} // Adjusted for single row
              />
            </View>
          </View>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

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
  detailsContainer: {
    marginVertical: "6%",
  },
  title: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.5),
    marginBottom: 8,
    color: "black",
  },
  descriptionContainer: {
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
  metaContainer: {
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
    elevation: 2,
    height: hp(7),
    gap: 4,
    paddingHorizontal: "2%",
    flex: 1,
    marginHorizontal: "1%",
  },
  buttonText: {
    fontFamily: "Nunito-SemiBold",
    marginLeft: 4,
    color: "#000",
  },
  similarPromotionsSection: {
    marginVertical: "3%",
  },
  similarPromotionsTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.3),
    color: "#000000",
    marginVertical: "5%",
  },
  similarPromotionsContainer: {
    flex: 1,
    width: "100%",
    marginBottom: "10%",
  },
  card: {
    width: wp(28), // Adjusted for single row
    // flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: "2%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: "1.5%",
    marginBottom: "5%",
  },
  image: {
    width: "100%",
    height: hp(10), // Increased height for better visibility in single row
    borderRadius: 8,
  },
  name: {
    fontSize: hp(1.6),
    marginBottom: 4,
    color: "#000",
    fontFamily: "Nunito-SemiBold",
  },
  subtitle: {
    fontSize: hp(1.5),
    color: "#14BA9C",
    fontFamily: "Nunito-SemiBold",
    marginBottom: "8%",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  rating: {
    marginLeft: 4,
    fontSize: hp(1.3),
    fontFamily: "Nunito-Bold",
    color: "#000",
  },
  reviews: {
    marginLeft: 4,
    fontSize: hp(1.2),
    color: "#666",
    fontFamily: "Nunito-Regular",
  },
  heartButton: {
    position: "absolute",
    bottom: "4%",
    right: "1%",
    borderRadius: 15,
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PromotionScreen;
// import { useNavigation } from "@react-navigation/native";
// import React, { useState, useEffect } from "react";
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

// const PromotionScreen = ({ route }) => {
//   const navigation = useNavigation();
//   const { section, data } = route.params || {};
//   const [promotions, setPromotions] = useState(data || []);

//   useEffect(() => {
//     if (data) {
//       setPromotions(data);
//     }
//   }, [data]);

//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() =>
//         navigation.navigate("SingleItemPage", {
//           productId: item.id,
//           section: "Promotions", // Set to "Promotions" for consistency
//           item: {
//             image: item.image,
//             title: item.title,
//             shortDescription: item.shortDescription,
//             price: item.price,
//           },
//         })
//       }
//     >
//       <Image
//         source={item.image}
//         style={styles.image}
//         onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
//       />
//       <Text style={styles.name}>{item.title}</Text>
//       <Text style={styles.subtitle}>
//         {item.shortDescription || "No subtitle"}
//       </Text>
//       <View style={styles.ratingContainer}>
//         <Ionicons name="star" size={12} color="#FFD700" />
//         <Text style={styles.rating}>4.5</Text>
//         <Text style={styles.reviews}>50 Reviews</Text>
//       </View>
//       <TouchableOpacity style={styles.heartButton}>
//         <Ionicons name="heart" size={13} color="#EE2525" />
//       </TouchableOpacity>
//     </TouchableOpacity>
//   );

//   const products = data || []; // Fallback to empty array if no data

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
//             <Text style={styles.headerText}>Promotion</Text>
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
//             source={require("../../../assets/promotion_img.png")}
//             style={styles.mainImage}
//           />
//         </View>
//         <View style={styles.contentContainer}>
//           <View style={styles.detailsContainer}>
//             <Text style={styles.title}>Title - 50% Off</Text>
//             <View style={styles.descriptionContainer}>
//               <Text style={styles.detailsTitle}>Description</Text>
//               <Text style={styles.detailsText}>
//                 Perhaps the most iconic sneaker of all-time, this original
//                 "Chicago"? colorway is the cornerstone to any sneaker
//                 collection. Made famous in 1985 by Michael Jordan, the shoe has
//                 stood the test of time, becoming the most famous colorway of the
//                 Air Jordan 1. This 2015 release saw the ...More
//               </Text>
//             </View>
//             <View style={styles.metaContainer}>
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
//               <Text style={styles.buttonText}>Reactive Promotion</Text>
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
//           <View style={styles.similarPromotionsSection}>
//             <Text style={styles.similarPromotionsTitle}>
//               Similar Promotions
//             </Text>
//             <View style={styles.similarPromotionsContainer}>
//               <FlatList
//                 data={promotions}
//                 renderItem={renderItem}
//                 keyExtractor={(item) => item.id.toString()}
//                 numColumns={3}
//                 showsVerticalScrollIndicator={false}
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
//   detailsContainer: {
//     marginVertical: "6%",
//   },
//   title: {
//     fontFamily: "Nunito-Bold",
//     fontSize: hp(2.5),
//     marginBottom: 8,
//     color: "black",
//   },
//   descriptionContainer: {
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
//   metaContainer: {
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
//     elevation: 2,
//     height: hp(7),
//     gap: 4,
//     paddingHorizontal: "2%",
//     flex: 1,
//     marginHorizontal: "1%",
//   },
//   buttonText: {
//     fontFamily: "Nunito-SemiBold",
//     marginLeft: 4,
//     color: "#000",
//   },
//   similarPromotionsSection: {
//     marginVertical: "3%",
//   },
//   similarPromotionsTitle: {
//     fontFamily: "Nunito-Bold",
//     fontSize: hp(2.3),
//     color: "#000000",
//     marginVertical: "5%",
//   },
//   similarPromotionsContainer: {
//     flex: 1,
//     width: "100%",
//     marginBottom: "10%",
//   },
//   card: {
//     width: wp(30),
//     flex: 1,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     padding: "2%",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     marginHorizontal: "1.5%",
//     marginBottom: "5%",
//   },
//   image: {
//     width: "100%",
//     height: hp(10),
//     borderRadius: 8,
//   },
//   name: {
//     fontSize: hp(1.6),
//     marginBottom: 4,
//     color: "#000",
//     fontFamily: "Nunito-SemiBold",
//   },
//   subtitle: {
//     fontSize: hp(1.5),
//     color: "#14BA9C",
//     fontFamily: "Nunito-SemiBold",
//     marginBottom: "8%",
//   },
//   ratingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   rating: {
//     marginLeft: 4,
//     fontSize: hp(1.3),
//     fontFamily: "Nunito-Bold",
//     color: "#000",
//   },
//   reviews: {
//     marginLeft: 4,
//     fontSize: hp(1.2),
//     color: "#666",
//     fontFamily: "Nunito-Regular",
//   },
//   heartButton: {
//     position: "absolute",
//     bottom: "4%",
//     right: "1%",
//     borderRadius: 15,
//     padding: 5,
//   },
// });

// export default PromotionScreen;
