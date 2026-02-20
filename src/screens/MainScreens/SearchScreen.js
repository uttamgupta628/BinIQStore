import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Dimensions,
  AccessibilityInfo,
  StatusBar,
  ImageBackground,
  Pressable,
  ScrollView,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Slider from "@react-native-community/slider";
import { Navigation } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import SearchIcon from "../../../assets/SearchIcon.svg";
import CameraIcon from "../../../assets/CameraIcon.svg";
import { Star, Heart } from "lucide-react-native";
import FilterIcon from "../../../assets/FilterIcon.svg";

const { width } = Dimensions.get("window");

const dummyRecentSearches = ["Toothpaste", "Body Lotion", "Hair Oil"];
const dummyPopularStores = ["Reseller 1", "Reseller 2", "Reseller 3"];
const dummyCategories = [
  "Books",
  "Pan",
  "Bedsheet",
  "Bins",
  "Chopper",
  "Clocks",
];

const SearchScreen = () => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState("active");
  const [value, setValue] = useState(0);
  const navigation = useNavigation();
  // const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const renderRecentSearch = ({ item }) => (
    <View style={styles.recentSearchItem}>
      <Ionicons name="time-outline" size={hp(3)} color="#95969D" />
      <Text style={styles.recentSearchText}>{item}</Text>
      <TouchableOpacity
        accessibilityLabel={`Remove ${item} from recent searches`}
        accessibilityRole="button"
      >
        <EvilIcons name="close" size={hp(3)} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderPopularStore = ({ item }) => (
    <TouchableOpacity
      style={styles.popularStoreItem}
      accessibilityLabel={`View ${item}`}
      accessibilityRole="button"
    >
      <View style={{ width: "100%", height: "60%" }}>
        <Image
          source={require("../../../assets/dummy_product.png")}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
      <View style={{ width: "100%", height: "23%" }}>
        <Text
          style={{
            fontFamily: "DMSans-SemiBold",
            color: "#130160",
            fontSize: hp(1.6),
          }}
        >
          FLIP $ FIND
        </Text>
        <Text
          style={{
            fontFamily: "DMSans-SemiBold",
            color: "#14BA9C",
            fontSize: hp(1.2),
          }}
        >
          Florida, US
        </Text>
      </View>
      <View style={styles.ratingContainer}>
        <Text style={styles.reviews}>3-4KM </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text style={styles.rating}>4.6</Text>
        </View>
        <TouchableOpacity style={styles.heartButton}>
          <Heart size={13} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const toggleCategory = (category) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((c) => c !== category)
        : [...prevCategories, category]
    );
  };

  const handleFilterButtonPress = () => {
    setShowFilterModal(true);
    AccessibilityInfo.announceForAccessibility("Filter modal opened");
  };

  const handleCloseFilterModal = () => {
    setShowFilterModal(false);
    AccessibilityInfo.announceForAccessibility("Filter modal closed");
  };

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
            <Text style={styles.headerText}>Search</Text>
          </View>
        </View>
        <View style={styles.searchParent}>
          <Pressable style={styles.searchContainer}>
            <View style={styles.cameraButton}>
              <SearchIcon />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Search"
              placeholderTextColor={"#C4C4C4"}
            />
            <View style={styles.searchButton}>
              <CameraIcon />
            </View>
          </Pressable>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleFilterButtonPress}
          >
            <FilterIcon size={10} />
          </TouchableOpacity>
        </View>
        <View style={{ marginHorizontal: "5%" }}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          {dummyRecentSearches.length > 0 ? (
            <FlatList
              data={dummyRecentSearches}
              renderItem={renderRecentSearch}
              keyExtractor={(item) => item}
              accessibilityLabel="List of recent searches"
            />
          ) : (
            <Text style={styles.noHistoryText}>
              You don't have any search history
            </Text>
          )}

          <Text style={styles.sectionTitle}>Top Bin stores</Text>
          <FlatList
            data={dummyPopularStores}
            renderItem={renderPopularStore}
            keyExtractor={(item) => item}
            numColumns={3}
            accessibilityLabel="List of popular bin stores"
          />

          <Modal
            visible={showFilterModal}
            animationType="slide"
            transparent={true}
            onRequestClose={handleCloseFilterModal}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={handleCloseFilterModal}
                    accessibilityLabel="Close filter modal"
                    accessibilityRole="button"
                  >
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Filters</Text>
                  <TouchableOpacity
                    accessibilityLabel="Apply filters"
                    accessibilityRole="button"
                  >
                    <Text style={styles.doneButton}>Done</Text>
                  </TouchableOpacity>
                </View>
                <Text
                  style={{
                    fontSize: hp(2.2),
                    fontFamily: "Nunito-Bold",
                    color: "#524B6B",
                  }}
                >
                  Search
                </Text>
                {/* Search Input */}
                <TextInput
                  style={styles.categoryInput}
                  placeholder="Add a categories"
                  placeholderTextColor="#999"
                  accessibilityLabel="Add a category"
                />
                <Text
                  style={{
                    fontSize: hp(2),
                    fontFamily: "Nunito-Bold",
                    color: "#524B6B",
                    marginVertical: "5%",
                  }}
                >
                  Quick Filter
                </Text>
                <View style={styles.quickFilters}>
                  <View
                    style={{
                      width: "100%",
                      height: hp(5),
                      flexDirection: "row",
                      borderRadius: 20,
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    {["Active Items", "Sold Items", "New Arrivals"].map(
                      (filter) => (
                        <TouchableOpacity
                          key={filter}
                          style={[
                            styles.filterChip,
                            activeFilter === filter.toLowerCase() &&
                              styles.activeFilterChip,
                          ]}
                          onPress={() => setActiveFilter(filter.toLowerCase())}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              activeFilter === filter.toLowerCase() &&
                                styles.activeFilterChipText,
                            ]}
                          >
                            {filter}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>
                {/* Price Range */}
                <View style={{ marginVertical: "5%" }}>
                  <Text
                    style={{
                      fontSize: hp(2),
                      fontFamily: "Nunito-Bold",
                      color: "#524B6B",
                      marginVertical: "5%",
                    }}
                  >
                    Price Range
                  </Text>
                  <View style={styles.priceInputs}>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Min"
                      keyboardType="numeric"
                      placeholderTextColor={"#666"}
                    />
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Max"
                      keyboardType="numeric"
                      placeholderTextColor={"#666"}
                    />
                  </View>
                  <View style={styles.priceRangeContainer}>
                    <Text style={styles.price}>${value}</Text>

                    <Text style={styles.price}>$10,00</Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1000}
                    step={1}
                    value={value}
                    onValueChange={(value) => setValue(value)}
                    minimumTrackTintColor="#14BA9C"
                    maximumTrackTintColor="#E4E5E7"
                    thumbTintColor="#14BA9C"
                  />
                </View>
                {/* Category Chips */}
                <Text
                  style={{
                    fontSize: hp(2),
                    fontFamily: "Nunito-Bold",
                    color: "#524B6B",
                    marginVertical: "5%",
                  }}
                >
                  Categories
                </Text>
                <View style={styles.categoriesContainer}>
                  {dummyCategories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        selectedCategories.includes(category) &&
                          styles.selectedCategoryChip,
                      ]}
                      onPress={() => toggleCategory(category)}
                      accessibilityLabel={`${category} category ${
                        selectedCategories.includes(category)
                          ? "selected"
                          : "unselected"
                      }`}
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: selectedCategories.includes(category),
                      }}
                    >
                      <Text style={styles.categoryChipText}>{category}</Text>
                      {selectedCategories.includes(category) && (
                        <Ionicons
                          name="close"
                          size={16}
                          color="#007AFF"
                          style={styles.categoryCloseIcon}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Reset and Apply Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    accessibilityLabel="Reset filters"
                    accessibilityRole="button"
                  >
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.applyButton}
                    accessibilityLabel="Apply filters"
                    accessibilityRole="button"
                  >
                    <Text style={styles.applyButtonText}>APPLY</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F3F5",
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
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "gray",
    marginRight: "2%",
    borderColor: "#356899",
    height: hp(6.5),
    width: wp(70),
    fontFamily: "Nunito-Regular",
    fontSize: hp(2.2),
  },
  filterButton: {
    backgroundColor: "#14BA9C",
    width: wp(13),
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: hp(2.4),
    fontFamily: "Nunito-Bold",
    marginVertical: "4%",
    color: "#0D0D26",
  },
  noHistoryText: {
    color: "#666",
    fontStyle: "italic",
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "4.5%",
    paddingHorizontal: "2%",
    borderBottomWidth: 1,
    borderColor: "#CACBCE",
  },
  recentSearchText: {
    marginLeft: "4%",
    flex: 1,
    fontFamily: "Nunito-Regular",
    color: "#95969D",
    fontSize: hp(2.1),
  },
  popularStoreItem: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 8,
    width: wp(85) / 3,
    alignItems: "center",
    marginVertical: "2%",
    marginHorizontal: "1%",
    justifyContent: "space-between",
    borderWidth: 0.5,
    borderColor: "#C4C4C4",
    height: hp(22),
  },
  popularStoreText: {
    textAlign: "center",
    color: "#0D0D26",
    fontFamily: "Nunito-Regular",
  },
  applyButton: {
    flex: 1,
    height: 40,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  searchParent: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: "3%",
    marginVertical: "3%",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 12,
    marginRight: 10,
    borderColor: "#356899",
    height: hp(6.3),
  },
  cameraButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: hp(2.2),
    fontFamily: "Nunito-Regular",
    paddingVertical: 8,
    color: "#0D0140",
  },
  searchButton: {
    padding: 10,
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

  //New search filter styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Darken background when modal is open
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: hp(2.3),
    fontFamily: "Nunito-Bold",
    color: "#000",
  },
  doneButton: {
    fontFamily: "Nunito-SemiBold",
    color: "#356899",
    fontSize: hp(2),
  },
  categoryInput: {
    height: hp(6.1),
    borderColor: "#AFB0B6",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: hp(2.1),
    fontFamily: "Nunito-SemiBold",
    color: "#333",
    marginVertical: "4%",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAEAEA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedCategoryChip: {
    backgroundColor: "#D9E6F2",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#333",
  },
  categoryCloseIcon: {
    marginLeft: 8,
  },
  priceRangeTitle: {
    fontFamily: "Nunito-SemiBold",
    color: "#95969D",
    fontSize: hp(2.2),
  },
  priceRangeSubtitle: {
    fontFamily: "Nunito-SemiBold",
    color: "#494A50",
    fontSize: hp(2.1),
  },
  priceRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceRangeValue: {
    fontSize: 16,
    color: "#000",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  resetButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 10,
  },
  resetButtonText: {
    color: "#FF6C6C",
    fontSize: 14,
    fontWeight: "500",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#001B6E",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  price: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2),
    color: "#14BA9C",
  },
  slider: {
    width: "100%",
    marginVertical: "2%",
    borderColor: "#000",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    width: "100%",
    justifyContent: "space-between",
  },
  rating: {
    // marginLeft: 4,
    fontSize: hp(1.5),
    fontWeight: "bold",
    color: "#000",
  },
  reviews: {
    // marginLeft: 4,
    fontSize: hp(1.4),
    color: "#000",
  },
  heartButton: {
    // position: "absolute",
    // bottom: "2%",
    // right: "1%",
    borderRadius: 15,
    // padding: 5
  },
  filterChip: {
    paddingVertical: 8,
    // paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
    width: "32%",
    justifyContent: "center",
    alignItems: "center",
  },
  activeFilterChip: {
    backgroundColor: "#00BFA5",
  },
  filterChipText: {
    color: "#666",
    fontSize: hp(1.7),
    fontFamily: "Nunito-SemiBold",
  },
  activeFilterChipText: {
    color: "white",
  },
  quickFilters: {
    flexDirection: "row",
  },
  priceInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  priceInput: {
    width: "48%",
    paddingHorizontal: "3%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    color: "#000",
    height: hp(6),
  },
});

export default SearchScreen;
