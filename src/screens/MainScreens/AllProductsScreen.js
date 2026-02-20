import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ImageBackground,
  StatusBar,
  Pressable,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SearchIcon from "../../../assets/SearchIcon.svg";
import { useNavigation, useRoute } from "@react-navigation/native";

const AllProductsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { section = "Activity Feed", data = [] } = route.params || {};

  const renderItem = ({ item }) => (
    <Pressable style={styles.itemPressable}>
      <View
        style={[
          styles.itemCard,
          { height: section === "Trending Products" ? hp(26) : hp(23) },
        ]}
      >
        <Image source={item.image} style={styles.itemImage} />
        {section === "Activity Feed" && (
          <Ionicons
            name="heart"
            size={hp(3)}
            color={"#EE2525"}
            style={styles.heartIcon}
          />
        )}

        <View style={styles.itemDescriptionContainer}>
          <Text style={styles.itemDescription}>{item.description}</Text>
        </View>
        {item.discountPrice && item.originalPrice && item.totalDiscount && (
          <View style={styles.itemPriceContainer}>
            <View>
              <Text style={styles.itemDiscountPrice}>{item.discountPrice}</Text>
              <Text style={styles.itemPriceText}>
                <Text style={styles.itemOriginalPrice}>
                  {item.originalPrice}
                </Text>
                {"  "}
                {item.totalDiscount}
              </Text>
            </View>
          </View>
        )}
        {item.title && item.price && (
          <View style={styles.itemPriceContainer}>
            <View>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
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
            <Text style={styles.headerText}>{section}</Text>
          </View>
        </View>
        <View style={styles.searchParent}>
          <Pressable style={styles.searchContainer}>
            <View style={styles.cameraButton}>
              <SearchIcon />
            </View>
            <TextInput
              style={styles.input}
              placeholder="search for anything"
              placeholderTextColor={"#C4C4C4"}
            />
          </Pressable>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="filter" size={hp(3)} color={"white"} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.flatListContainer}>
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

export default AllProductsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F3F5",
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: hp(50),
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
  searchParent: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: "3%",
    marginVertical: "5%",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    marginRight: 10,
    borderColor: "#99ABC678",
    height: hp(6.5),
    backgroundColor: "#F2F2F2",
    paddingHorizontal: "3%",
  },
  cameraButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: hp(2.2),
    fontFamily: "Nunito-Regular",
    paddingVertical: 8,
    color: "#999",
  },
  menuButton: {
    backgroundColor: "#130160",
    padding: 10,
    borderRadius: 12,
    height: hp(6.5),
    width: wp(14),
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    marginTop: "5%",
  },
  flatListContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: "2.5%",
  },
  itemPressable: {
    width: wp(47),
    height: hp(26),
    alignItems: "center",
    marginVertical: "1%",
  },
  itemCard: {
    width: wp(45),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#fff",
  },
  itemImage: {
    width: wp(45),
    height: hp(13),
    borderRadius: 5,
  },
  heartIcon: {
    position: "absolute",
    right: "2%",
    top: "2%",
  },
  itemDescriptionContainer: {
    paddingHorizontal: "1%",
  },
  itemDescription: {
    fontFamily: "Nunito-SemiBold",
    color: "#000",
    fontSize: hp(1.7),
    margin: "0.5%",
  },
  itemPriceContainer: {
    position: "absolute",
    bottom: "2%",
    paddingHorizontal: "3%",
  },
  itemDiscountPrice: {
    fontFamily: "Nunito-Bold",
    color: "#000",
    fontSize: hp(1.8),
  },
  itemPriceText: {
    color: "red",
  },
  itemOriginalPrice: {
    fontFamily: "Nunito-Bold",
    color: "#808488",
    fontSize: hp(1.8),
    textDecorationLine: "line-through",
  },
  itemTitle: {
    fontFamily: "Nunito-SemiBold",
    color: "#0049AF",
    fontSize: hp(1.6),
  },
  itemPrice: {
    fontFamily: "Nunito-Bold",
    color: "#000",
    fontSize: hp(1.5),
  },
});
