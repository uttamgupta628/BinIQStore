import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
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
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Star, Heart } from "lucide-react-native";
import SearchIcon from "../../../assets/SearchIcon.svg";
import CameraIcon from "../../../assets/CameraIcon.svg";
import FilterIcon from "../../../assets/FilterIcon.svg";
import VictoryPie from "victory-native";
import Svg, { Text as SvgText } from "react-native-svg";
// import PieGraph from '../../Components/PieGraph';
import PieGraph from "../../../assets/PieGraph.svg";
import SettingsIcon from "../../../assets/SettingsIcon.svg";
import Filter_NewIcon from "../../../assets/Filter_NewIcon.svg";
import * as Progress from "react-native-progress";
import Graph from "../../../assets/Graph.svg";

const { width } = Dimensions.get("window");
const ScanHistoryScreen = () => {
  const navigation = useNavigation();
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("SinglePageItem")}
      >
        <Image
          source={require("../../../assets/dummy_product.png")}
          style={styles.image}
        />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <View style={styles.ratingContainer}>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>{item.reviews} Reviews</Text>
        </View>
        <TouchableOpacity style={styles.heartButton}>
          <Heart size={13} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ width: "100%" }}>
      <View
        style={{ width: "95%", alignSelf: "center", marginVertical: "2%" }}
      />
      <View style={{ ...styles.searchParent, marginBottom: "4%" }}>
        <Pressable style={styles.searchContainer}>
          <View style={styles.cameraButton}>
            <SearchIcon />
          </View>
          <Text style={styles.input}>search for anything</Text>
        </Pressable>
        <TouchableOpacity style={styles.menuButton}>
          <Filter_NewIcon />
        </TouchableOpacity>
      </View>
      <View style={styles.graphCard}>
        <Text
          style={{
            fontSize: wp(3.7),
            color: "#130160",
            fontFamily: "Nunito-Bold",
          }}
        >
          VIEWS
        </Text>
        <Graph width={"98%"} height={"90%"} />
      </View>
      <TouchableOpacity
        style={styles.gettingStarted}
        onPress={() => navigation.navigate("UploadScreen")}
      >
        <Text
          style={{
            fontFamily: "Nunito-SemiBold",
            color: "#fff",
            fontSize: hp(2),
          }}
        >
          Upload New Content
        </Text>
      </TouchableOpacity>
      <View style={{ height: hp(38), flexDirection: "row" }}>
        <View
          style={{
            width: "72%",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <View style={{ width: "80%" }}>
            <Text
              style={{
                color: "#130160",
                fontFamily: "Nunito-SemiBold",
                fontSize: hp(2),
                textDecorationLine: "underline",
              }}
            >
              UPLOADS CATEGORY
            </Text>
          </View>
          <View>
            <PieGraph />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "90%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: wp(4),
                  height: hp(1.2),
                  backgroundColor: "#0049AF",
                  borderRadius: 3,
                }}
              />
              <Text
                style={{
                  color: "#000",
                  fontWeight: "semibold",
                  fontSize: hp(1.4),
                }}
              >
                {" "}
                Category 1
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: wp(4),
                  height: hp(1.2),
                  backgroundColor: "#FFBB36",
                  borderRadius: 3,
                }}
              />
              <Text
                style={{
                  color: "#000",
                  fontWeight: "semibold",
                  fontSize: hp(1.4),
                }}
              >
                {" "}
                Category 1
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: wp(4),
                  height: hp(1.2),
                  backgroundColor: "#70B6C1",
                  borderRadius: 3,
                }}
              />
              <Text
                style={{
                  color: "#000",
                  fontWeight: "semibold",
                  fontSize: hp(1.4),
                }}
              >
                {" "}
                Category 1
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            width: "28%",
            height: "60%",
            alignSelf: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ height: "18%", width: "100%" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 13,
                  height: 13,
                  backgroundColor: "#0049AF",
                  borderRadius: 20,
                }}
              />
              <Text
                style={{
                  color: "gray",
                  fontWeight: "semibold",
                  fontSize: hp(1.9),
                }}
              >
                Category 1
              </Text>
            </View>
            <View
              style={{
                width: "68%",
                height: "69%",
                alignItems: "flex-start",
                alignSelf: "flex-end",
                paddingVertical: "1%",
              }}
            >
              <Text
                style={{ color: "#000", fontWeight: "600", fontSize: hp(2.2) }}
              >
                45%
              </Text>
            </View>
          </View>
          <View style={{ height: "18%", width: "100%", paddingRight: "4%" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 13,
                  height: 13,
                  backgroundColor: "#70B6C1",
                  borderRadius: 20,
                }}
              />
              <Text
                style={{
                  color: "gray",
                  fontWeight: "semibold",
                  fontSize: hp(1.9),
                }}
              >
                Category 2
              </Text>
            </View>
            <View
              style={{
                width: "68%",
                height: "69%",
                alignItems: "flex-start",
                alignSelf: "flex-end",
                paddingVertical: "1%",
              }}
            >
              <Text
                style={{ color: "#000", fontWeight: "600", fontSize: hp(2.2) }}
              >
                45%
              </Text>
            </View>
          </View>
          <View style={{ height: "18%", width: "100%", paddingRight: "4%" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 13,
                  height: 13,
                  backgroundColor: "#6F19C2",
                  borderRadius: 20,
                }}
              />
              <Text
                style={{
                  color: "gray",
                  fontWeight: "semibold",
                  fontSize: hp(1.9),
                }}
              >
                Category 3
              </Text>
            </View>
            <View
              style={{
                width: "68%",
                height: "100%",
                alignItems: "flex-start",
                alignSelf: "flex-end",
                paddingVertical: "1%",
              }}
            >
              <Text
                style={{ color: "#000", fontWeight: "600", fontSize: hp(2.2) }}
              >
                45%
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: "8%",
          paddingHorizontal: "2%",
        }}
      >
        <Text
          style={{
            color: "#000000",
            fontFamily: "Nunito-Bold",
            fontSize: hp(2.4),
          }}
        >
          RECENT UPLOADS
        </Text>
        {/* <Text style={{ color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline' }}>View All</Text> */}
      </View>
      <View style={{ flex: 1, width: "100%" }}>
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: "8%",
          paddingHorizontal: "2%",
        }}
      >
        <Text
          style={{
            color: "#000000",
            fontFamily: "Nunito-Bold",
            fontSize: hp(2.4),
          }}
        >
          OLDEST UPLOADS
        </Text>
        {/* <Text style={{ color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline' }}>View All</Text> */}
      </View>
      <View style={{ flex: 1, width: "100%", marginBottom: "10%" }}>
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
        />

        <Text
          style={{
            color: "#524B6B",
            fontSize: hp(1.9),
            textDecorationLine: "underline",
            textAlign: "center",
            marginVertical: "7%",
          }}
        >
          View Details
        </Text>
      </View>
    </View>
  );
};

const MyItemsScreen = () => {
  const navigation = useNavigation();
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("SinglePageItem")}
      >
        <Image
          source={require("../../../assets/dummy_product.png")}
          style={styles.image}
        />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <View style={styles.ratingContainer}>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>{item.reviews} Reviews</Text>
        </View>
        <TouchableOpacity style={styles.heartButton}>
          <Heart size={13} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ width: "100%" }}>
      <View
        style={{ width: "95%", alignSelf: "center", marginVertical: "2%" }}
      />
      <View style={{ ...styles.searchParent, marginBottom: "4%" }}>
        <Pressable style={styles.searchContainer}>
          <View style={styles.cameraButton}>
            <SearchIcon />
          </View>
          <Text style={styles.input}>search for anything</Text>
        </Pressable>
        <TouchableOpacity style={styles.menuButton}>
          <Filter_NewIcon />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.gettingStarted}>
        <Text
          style={{
            fontFamily: "Nunito-SemiBold",
            color: "#fff",
            fontSize: hp(2),
          }}
        >
          Create New Promotion
        </Text>
      </TouchableOpacity>
      <View style={{ height: hp(38), flexDirection: "row" }}>
        <View
          style={{
            width: "72%",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <View style={{ width: "80%" }}>
            <Text
              style={{
                color: "#130160",
                fontFamily: "Nunito-SemiBold",
                fontSize: hp(2),
                textDecorationLine: "underline",
              }}
            >
              UPLOADS CATEGORY
            </Text>
          </View>
          <View>
            <PieGraph />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "90%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: wp(4),
                  height: hp(1.2),
                  backgroundColor: "#0049AF",
                  borderRadius: 3,
                }}
              />
              <Text
                style={{
                  color: "#000",
                  fontWeight: "semibold",
                  fontSize: hp(1.4),
                }}
              >
                {" "}
                Category 1
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: wp(4),
                  height: hp(1.2),
                  backgroundColor: "#FFBB36",
                  borderRadius: 3,
                }}
              />
              <Text
                style={{
                  color: "#000",
                  fontWeight: "semibold",
                  fontSize: hp(1.4),
                }}
              >
                {" "}
                Category 1
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: wp(4),
                  height: hp(1.2),
                  backgroundColor: "#70B6C1",
                  borderRadius: 3,
                }}
              />
              <Text
                style={{
                  color: "#000",
                  fontWeight: "semibold",
                  fontSize: hp(1.4),
                }}
              >
                {" "}
                Category 1
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            width: "28%",
            height: "60%",
            alignSelf: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ height: "18%", width: "100%" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 13,
                  height: 13,
                  backgroundColor: "#0049AF",
                  borderRadius: 20,
                }}
              />
              <Text
                style={{
                  color: "gray",
                  fontWeight: "semibold",
                  fontSize: hp(1.9),
                }}
              >
                Category 1
              </Text>
            </View>
            <View
              style={{
                width: "68%",
                height: "69%",
                alignItems: "flex-start",
                alignSelf: "flex-end",
                paddingVertical: "1%",
              }}
            >
              <Text
                style={{ color: "#000", fontWeight: "600", fontSize: hp(2.2) }}
              >
                45%
              </Text>
            </View>
          </View>
          <View style={{ height: "18%", width: "100%", paddingRight: "4%" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 13,
                  height: 13,
                  backgroundColor: "#70B6C1",
                  borderRadius: 20,
                }}
              />
              <Text
                style={{
                  color: "gray",
                  fontWeight: "semibold",
                  fontSize: hp(1.9),
                }}
              >
                Category 2
              </Text>
            </View>
            <View
              style={{
                width: "68%",
                height: "69%",
                alignItems: "flex-start",
                alignSelf: "flex-end",
                paddingVertical: "1%",
              }}
            >
              <Text
                style={{ color: "#000", fontWeight: "600", fontSize: hp(2.2) }}
              >
                45%
              </Text>
            </View>
          </View>
          <View style={{ height: "18%", width: "100%", paddingRight: "4%" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 13,
                  height: 13,
                  backgroundColor: "#6F19C2",
                  borderRadius: 20,
                }}
              />
              <Text
                style={{
                  color: "gray",
                  fontWeight: "semibold",
                  fontSize: hp(1.9),
                }}
              >
                Category 3
              </Text>
            </View>
            <View
              style={{
                width: "68%",
                height: "100%",
                alignItems: "flex-start",
                alignSelf: "flex-end",
                paddingVertical: "1%",
              }}
            >
              <Text
                style={{ color: "#000", fontWeight: "600", fontSize: hp(2.2) }}
              >
                45%
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: "8%",
          paddingHorizontal: "2%",
        }}
      >
        <Text
          style={{
            color: "#000000",
            fontFamily: "Nunito-Bold",
            fontSize: hp(2.4),
          }}
        >
          RECENT UPLOADS
        </Text>
        {/* <Text style={{ color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline' }}>View All</Text> */}
      </View>
      <View style={{ flex: 1, width: "100%" }}>
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: "8%",
          paddingHorizontal: "2%",
        }}
      >
        <Text
          style={{
            color: "#000000",
            fontFamily: "Nunito-Bold",
            fontSize: hp(2.4),
          }}
        >
          OLDEST UPLOADS
        </Text>
        {/* <Text style={{ color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline' }}>View All</Text> */}
      </View>
      <View style={{ flex: 1, width: "100%", marginBottom: "10%" }}>
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
        />
        <Text
          style={{
            color: "#524B6B",
            fontSize: hp(1.9),
            textDecorationLine: "underline",
            textAlign: "center",
            marginVertical: "7%",
          }}
        >
          View Details
        </Text>
      </View>
    </View>
  );
};
const AllTotalScans = () => {
  const navigation = useNavigation();
  const [active, setActive] = useState(false);
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("PromotionScreen")}
      >
        <Image
          source={require("../../../assets/dummy_product.png")}
          style={styles.image}
        />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <View style={styles.ratingContainer}>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>{item.reviews} Reviews</Text>
        </View>
        <TouchableOpacity style={styles.heartButton}>
          <Heart size={13} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ width: "100%" }}>
      <View style={{ width: "95%", alignSelf: "center", marginVertical: "5%" }}>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            height: 50,
            backgroundColor: "#DDF4F3",
            borderRadius: 5,
          }}
        >
          {/* Active Promotions Tab */}
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 5,
              margin: 5,
              backgroundColor: active ? "#FFFFFF" : "transparent",
              elevation: active ? 3 : 0,
              shadowColor: active ? "#000" : "transparent",
              shadowOffset: active ? { width: 0, height: 2 } : null,
              shadowOpacity: active ? 0.25 : 0,
              shadowRadius: active ? 3.84 : 0,
            }}
            onPress={() => setActive(true)}
          >
            <Text
              style={{
                fontFamily: "Nunito-Regular",
                fontSize: 14,
                color: active ? "#000" : "#000",
                fontWeight: active ? "600" : "normal",
                opacity: active ? 1 : 0.6,
              }}
            >
              Active Promotions
            </Text>
          </TouchableOpacity>

          {/* Expired Promotions Tab */}
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 5,
              margin: 5,
              backgroundColor: !active ? "#FFFFFF" : "transparent",
              elevation: !active ? 3 : 0,
              shadowColor: !active ? "#000" : "transparent",
              shadowOffset: !active ? { width: 0, height: 2 } : null,
              shadowOpacity: !active ? 0.25 : 0,
              shadowRadius: !active ? 3.84 : 0,
            }}
            onPress={() => setActive(false)}
          >
            <Text
              style={{
                fontFamily: "Nunito-Regular",
                fontSize: 14,
                color: !active ? "red" : "#000",
                fontWeight: !active ? "600" : "normal",
                opacity: !active ? 1 : 0.6,
              }}
            >
              Expired Promotions
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ ...styles.searchParent, marginBottom: "4%" }}>
        <Pressable style={styles.searchContainer}>
          <View style={styles.cameraButton}>
            <SearchIcon />
          </View>
          <Text style={styles.input}>search for anything</Text>
        </Pressable>
      </View>
      <View style={{ height: hp(38), flexDirection: "row" }}>
        <View
          style={{
            width: "72%",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <View style={{ width: "80%" }}>
            <Text
              style={{
                color: "#130160",
                fontFamily: "Nunito-SemiBold",
                fontSize: hp(2),
                textDecorationLine: "underline",
              }}
            >
              UPLOADS CATEGORY
            </Text>
          </View>
          <View>
            <PieGraph />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "90%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: wp(4),
                  height: hp(1.2),
                  backgroundColor: "#0049AF",
                  borderRadius: 3,
                }}
              />
              <Text
                style={{
                  color: "#000",
                  fontWeight: "semibold",
                  fontSize: hp(1.4),
                }}
              >
                {" "}
                Category 1
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: wp(4),
                  height: hp(1.2),
                  backgroundColor: "#FFBB36",
                  borderRadius: 3,
                }}
              />
              <Text
                style={{
                  color: "#000",
                  fontWeight: "semibold",
                  fontSize: hp(1.4),
                }}
              >
                {" "}
                Category 1
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: wp(4),
                  height: hp(1.2),
                  backgroundColor: "#70B6C1",
                  borderRadius: 3,
                }}
              />
              <Text
                style={{
                  color: "#000",
                  fontWeight: "semibold",
                  fontSize: hp(1.4),
                }}
              >
                {" "}
                Category 1
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            width: "28%",
            height: "60%",
            alignSelf: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ height: "18%", width: "100%" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 13,
                  height: 13,
                  backgroundColor: "#0049AF",
                  borderRadius: 20,
                }}
              />
              <Text
                style={{
                  color: "gray",
                  fontWeight: "semibold",
                  fontSize: hp(1.9),
                }}
              >
                Category 1
              </Text>
            </View>
            <View
              style={{
                width: "68%",
                height: "69%",
                alignItems: "flex-start",
                alignSelf: "flex-end",
                paddingVertical: "1%",
              }}
            >
              <Text
                style={{ color: "#000", fontWeight: "600", fontSize: hp(2.2) }}
              >
                45%
              </Text>
            </View>
          </View>
          <View style={{ height: "18%", width: "100%", paddingRight: "4%" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 13,
                  height: 13,
                  backgroundColor: "#70B6C1",
                  borderRadius: 20,
                }}
              />
              <Text
                style={{
                  color: "gray",
                  fontWeight: "semibold",
                  fontSize: hp(1.9),
                }}
              >
                Category 2
              </Text>
            </View>
            <View
              style={{
                width: "68%",
                height: "69%",
                alignItems: "flex-start",
                alignSelf: "flex-end",
                paddingVertical: "1%",
              }}
            >
              <Text
                style={{ color: "#000", fontWeight: "600", fontSize: hp(2.2) }}
              >
                45%
              </Text>
            </View>
          </View>
          <View style={{ height: "18%", width: "100%", paddingRight: "4%" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 13,
                  height: 13,
                  backgroundColor: "#6F19C2",
                  borderRadius: 20,
                }}
              />
              <Text
                style={{
                  color: "gray",
                  fontWeight: "semibold",
                  fontSize: hp(1.9),
                }}
              >
                Category 3
              </Text>
            </View>
            <View
              style={{
                width: "68%",
                height: "100%",
                alignItems: "flex-start",
                alignSelf: "flex-end",
                paddingVertical: "1%",
              }}
            >
              <Text
                style={{ color: "#000", fontWeight: "600", fontSize: hp(2.2) }}
              >
                45%
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: "8%",
          paddingHorizontal: "2%",
        }}
      >
        <Text
          style={{
            color: "#000000",
            fontFamily: "Nunito-Bold",
            fontSize: hp(2.4),
          }}
        >
          RECENT UPLOADS
        </Text>
        {/* <Text style={{ color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline' }}>View All</Text> */}
      </View>
      <View style={{ flex: 1, width: "100%" }}>
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: "8%",
          paddingHorizontal: "2%",
        }}
      >
        <Text
          style={{
            color: "#000000",
            fontFamily: "Nunito-Bold",
            fontSize: hp(2.4),
          }}
        >
          OLDEST UPLOADS
        </Text>
        {/* <Text style={{ color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline' }}>View All</Text> */}
      </View>
      <View style={{ flex: 1, width: "100%", marginBottom: "10%" }}>
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity
          style={styles.gettingStarted}
          onPress={() => navigation.navigate("NewPromotionScreen")}
        >
          <Text
            style={{
              fontFamily: "Nunito-SemiBold",
              color: "#fff",
              fontSize: hp(2),
            }}
          >
            Create New Create
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            color: "#524B6B",
            fontSize: hp(1.9),
            textDecorationLine: "underline",
            textAlign: "center",
            marginVertical: "7%",
          }}
        >
          View Details
        </Text>
      </View>
    </View>
  );
};
const ProductCard = ({ product }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("SinglePageItem")}
    >
      <Image
        source={require("../../../assets/dummy_product.png")}
        style={styles.image}
      />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.subtitle}>{product.subtitle}</Text>
      <View style={styles.ratingContainer}>
        <Star size={12} color="#FFD700" fill="#FFD700" />
        <Text style={styles.rating}>{product.rating}</Text>
        <Text style={styles.reviews}>{product.reviews} Reviews</Text>
      </View>
      <TouchableOpacity style={styles.heartButton}>
        <Heart size={15} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
const progress = 0.2; // 20% progress
const maxBalance = 100;
const currentBalance = progress * maxBalance;
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
  {
    id: "4",
    name: "TMA-2 HD Wireless",
    subtitle: "ANC Store",
    rating: 4.8,
    reviews: 88,
    image: "https://placeholder.com/150",
  },
  {
    id: "5",
    name: "TMA-2 HD Wireless",
    subtitle: "Best Sells Store",
    rating: 4.8,
    reviews: 88,
    image: "/placeholder.svg?height=150&width=150",
  },
  {
    id: "6",
    name: "TMA-2 HD Wireless",
    subtitle: "ANC Store",
    rating: 4.8,
    reviews: 88,
    image: "https://placeholder.com/150",
  },
];
const topBins = [
  {
    id: 1,
    image: require("../../../assets/flip_find.png"),
    title: "FLIP $ FIND",
    location: "Florida US",
    distance: "3.4KM",
    review: "4.2",
  },
  {
    id: 2,
    image: require("../../../assets/hidden_finds.png"),
    title: "HIDDED FINDS",
    location: "Florida US",
    distance: "3.4KM",
    review: "4.2",
  },
  {
    id: 3,
    image: require("../../../assets/flip_find.png"),
    title: "FLIP $ FIND",
    location: "Florida US",
    distance: "3.4KM",
    review: "4.2",
  },
  {
    id: 4,
    image: require("../../../assets/hidden_finds.png"),
    title: "HIDDED FINDS",
    location: "Florida US",
    distance: "3.4KM",
    review: "4.2",
  },
  {
    id: 5,
    image: require("../../../assets/flip_find.png"),
    title: "FLIP $ FIND",
    location: "Florida US",
    distance: "3.4KM",
    review: "4.2",
  },
  {
    id: 6,
    image: require("../../../assets/hidden_finds.png"),
    title: "HIDDED FINDS",
    location: "Florida US",
    distance: "3.4KM",
    review: "4.2",
  },
  {
    id: 7,
    image: require("../../../assets/flip_find.png"),
    title: "FLIP $ FIND",
    location: "Florida US",
    distance: "3.4KM",
    review: "4.2",
  },
  {
    id: 8,
    image: require("../../../assets/hidden_finds.png"),
    title: "HIDDED FINDS",
    location: "Florida US",
    distance: "3.4KM",
    review: "4.2",
  },
];
const MyLibrary = () => {
  const [activeTab, setActiveTab] = useState("scan");
  const navigation = useNavigation();

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
            <Text style={styles.headerText}>My Library</Text>
          </View>
        </View>
        {/* Tab navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "scan" && styles.activeTab]}
            onPress={() => setActiveTab("scan")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "scan" && styles.activeTabText,
              ]}
            >
              Feed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "items" && styles.activeTab]}
            onPress={() => setActiveTab("items")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "items" && styles.activeTabText,
              ]}
            >
              Items
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all_scans" && styles.activeTab]}
            onPress={() => setActiveTab("all_scans")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all_scans" && styles.activeTabText,
              ]}
            >
              Promotion
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content for the active tab */}
        <ScrollView style={styles.content}>
          {activeTab === "scan" && <ScanHistoryScreen />}
          {activeTab === "items" && <MyItemsScreen />}
          {activeTab === "all_scans" && <AllTotalScans />}
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F3F5",
  },
  backgroundTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  backgroundBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
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
  backButton: {
    fontSize: 24,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "gray",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    // marginBottom: 16,
    width: "100%",
    paddingHorizontal: "5%",
    height: hp(6),
    marginTop: "3%",
  },
  tab: {
    // paddingVertical: '3%',
    // paddingHorizontal: '4.5%',
    borderRadius: 9,
    borderWidth: 0.5,
    borderColor: "gray",
    marginHorizontal: "1%",
    width: "30%",
    justifyContent: "center",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#2CCCA6",
    borderColor: "#2CCCA6",
  },
  tabText: {
    fontSize: hp(1.9),
    fontFamily: "Nunito-SemiBold",
    color: "#000",
    justifyContent: "center",
  },
  activeTabText: {
    color: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: "2%",
    paddingVertical: "2%",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "gray",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: hp(2.2),
    fontFamily: "Nunito-Bold",
    color: "#1E1E1E",
  },
  itemSubtitle: {
    fontSize: hp(1.9),
    fontFamily: "Nunito-SemiBold",
    color: "#666",
  },
  heartIcon: {
    padding: 8,
  },
  list: {
    marginBottom: 100,
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: hp(50),
  },
  card: {
    width: "20%", // Adjust the width to allow space between columns
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: "2%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: "0.85%",
    marginBottom: "5%", // Add spacing between rows
  },
  graphCard: {
    flex: 1,
    width: "95%",
    height: hp(18),
    backgroundColor: "#F2F5F8",
    borderRadius: 6,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingVertical: "2.5%",
    alignItems: "center",
    alignSelf: "center",
  },
  image: {
    width: "100%",
    marginBottom: 10,
  },
  name: {
    fontSize: hp(1.36),
    marginBottom: 4,
    color: "#000",
    fontFamily: "DMSans-SemiBold",
  },
  subtitle: {
    fontSize: hp(1.5),
    color: "#14BA9C",
    fontFamily: "DMSans-SemiBold",
    marginBottom: "8%",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  rating: {
    // marginLeft: 4,
    fontSize: hp(1.3),
    fontWeight: "bold",
    color: "#000",
  },
  reviews: {
    marginLeft: 4,
    fontSize: hp(1.2),
    color: "#666",
  },
  heartButton: {
    position: "absolute",
    bottom: "2%",
    right: "1%",
    borderRadius: 15,
    padding: 5,
  },
  searchParent: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: "3%",
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
    width: "100%",
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
  gettingStarted: {
    backgroundColor: "#130160",
    width: "90%",
    height: hp(6),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: "3%",
  },
});

export default MyLibrary;
