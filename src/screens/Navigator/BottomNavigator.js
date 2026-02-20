// import {
//   Animated,
//   Dimensions,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import React, { useRef } from "react";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { heightPercentageToDP as hp } from "react-native-responsive-screen";
// import HomeScreenMain from "../MainScreens/HomeScreenMain";
// import PlusIcon from "../../../assets/plus_icon.svg";
// import Home from "../../../assets/Home.svg";
// import HomeFocused from "../../../assets/HomeFocused.svg";
// import User from "../../../assets/User.svg";
// import UserFocused from "../../../assets/user_focus.svg";
// import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// import StoreViewPage from "../MainScreens/StoreViewPage";

// const Tab = createBottomTabNavigator();
// const BottomNavigator = () => {
//   const tabOffsetValue = useRef(new Animated.Value(0)).current;
//   function getWidth() {
//     let width = Dimensions.get("window").width;
//     width = width - 100;
//     return width / 5;
//   }
//   return (
//     <>
//       <Tab.Navigator
//         screenOptions={{
//           headerShown: false,
//           tabBarStyle: {
//             backgroundColor: "#fff",
//             position: "absolute",
//             height: hp(8),
//             borderRadius: 10,
//             shadowColor: "#000",
//             shadowOpacity: 0.06,
//             shadowOffset: {
//               width: 10,
//               height: 10,
//             },
//           },
//         }}
//       >
//         <Tab.Screen
//           name="HomeScreen"
//           component={HomeScreenMain}
//           options={{
//             tabBarShowLabel: false,
//             tabBarIcon: ({ focused }) => (
//               <View style={{ position: "absolute" }}>
//                 {focused ? (
//                   <HomeFocused height={hp(3.5)} />
//                 ) : (
//                   <Home size={hp(3.5)} />
//                 )}
//               </View>
//             ),
//           }}
//           listeners={({ navigation, route }) => ({
//             tabPress: (e) => {
//               Animated.spring(tabOffsetValue, {
//                 toValue: 0,
//                 useNativeDriver: true,
//               }).start();
//             },
//           })}
//         />
//         <Tab.Screen
//           name="MapScreen"
//           component={() => null}
//           options={{
//             tabBarShowLabel: false,
//             tabBarButton: (props) => (
//               <TouchableOpacity {...props} onPress={() => launchCamera()}>
//                 <View
//                   style={{
//                     width: 65,
//                     height: 65,
//                     backgroundColor: "#14BA9C",
//                     borderRadius: 50,
//                     justifyContent: "center",
//                     alignItems: "center",
//                     marginBottom: 30,
//                   }}
//                 >
//                   <PlusIcon size={hp(4.2)} color={"white"} />
//                 </View>
//               </TouchableOpacity>
//             ),
//           }}
//         />
//         <Tab.Screen
//           name="StoreViewPage"
//           component={StoreViewPage}
//           options={{
//             tabBarShowLabel: false,
//             tabBarIcon: ({ focused }) => (
//               <View style={{ position: "absolute" }}>
//                 {focused ? (
//                   <UserFocused height={hp(3.5)} />
//                 ) : (
//                   <User size={hp(3.5)} />
//                 )}
//               </View>
//             ),
//             tabBarStyle: { display: "none" },
//           }}
//           listeners={({ navigation, route }) => ({
//             tabPress: (e) => {
//               Animated.spring(tabOffsetValue, {
//                 toValue: getWidth() * 4,
//                 useNativeDriver: true,
//               }).start();
//             },
//           })}
//         />
//       </Tab.Navigator>
//     </>
//   );
// };

// export default BottomNavigator;

// const styles = StyleSheet.create({});
import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  PanResponder,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreenMain from "../MainScreens/HomeScreenMain";
import StoreViewPage from "../MainScreens/StoreViewPage";
import PlusIcon from "../../../assets/plus_icon.svg";
import Home from "../../../assets/Home.svg";
import HomeFocused from "../../../assets/HomeFocused.svg";
import User from "../../../assets/User.svg";
import UserFocused from "../../../assets/user_focus.svg";
import { launchCamera } from "react-native-image-picker";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get("window");
const CIRCLE_RADIUS = wp(28);
const ICON_SIZE = hp(3.5);
const BUTTON_COUNT = 4; // Only Home and StoreViewPage
const SCAN_BUTTON_RADIUS = 65 / 2; // Central button is 65x65
const ICON_RADIUS =
  (CIRCLE_RADIUS - SCAN_BUTTON_RADIUS) / 2 + SCAN_BUTTON_RADIUS;

const BottomNavigator = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const lastAngle = useRef(0);
  const velocity = useRef(0);

  const routes = [
    { name: "HomeScreen", component: HomeScreenMain },
    { name: "StoreViewPage", component: StoreViewPage },
  ];

  const icons = [
    {
      unfocused: <Home height={ICON_SIZE} />,
      focused: <HomeFocused height={ICON_SIZE} />,
      color: "#FF6347", // Home icon color (adjust if needed)
    },
    {
      unfocused: <User height={ICON_SIZE} />,
      focused: <UserFocused height={ICON_SIZE} />,
      color: "#32CD32", // User icon color (adjust if needed)
    },
  ];

  const handlePress = (index, navigation) => {
    setSelectedIndex(index);
    const currentAngle = index * (360 / BUTTON_COUNT);
    const targetAngle = -currentAngle;
    Animated.spring(rotateAnim, {
      toValue: targetAngle,
      useNativeDriver: true,
    }).start();
    navigation.navigate(routes[index].name);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;
        const angleChange = (dx / CIRCLE_RADIUS) * (180 / Math.PI);
        const newAngle = lastAngle.current + angleChange;
        rotateAnim.setValue(newAngle);
        velocity.current = gestureState.vx;
      },
      onPanResponderRelease: (evt, gestureState) => {
        lastAngle.current = rotateAnim._value;
        Animated.decay(rotateAnim, {
          velocity: velocity.current * 10,
          deceleration: 0.997,
          useNativeDriver: true,
        }).start(() => {
          lastAngle.current = rotateAnim._value;
          const finalAngle = rotateAnim._value;
          const nearestIndex =
            Math.round(finalAngle / (360 / BUTTON_COUNT)) % BUTTON_COUNT;
          const adjustedIndex =
            nearestIndex < 0 ? BUTTON_COUNT + nearestIndex : nearestIndex;
          handlePress(adjustedIndex, navigation);
        });
      },
    })
  ).current;

  const renderButtons = (navigation) => {
    return icons.map((icon, index) => {
      const angle = (index * (360 / BUTTON_COUNT) - 90) * (Math.PI / 180);
      const x = ICON_RADIUS * Math.cos(angle);
      const y = ICON_RADIUS * Math.sin(angle);

      return (
        <Animated.View
          key={index}
          style={[
            styles.iconContainer,
            {
              transform: [
                { translateX: x },
                { translateY: y },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [-360, 360],
                    outputRange: ["360deg", "-360deg"],
                  }),
                },
              ],
            },
          ]}
        >
          {selectedIndex === index && (
            <View style={styles.selectedBackground} />
          )}
          <TouchableOpacity onPress={() => handlePress(index, navigation)}>
            {selectedIndex === index ? icon.focused : icon.unfocused}
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
      tabBar={({ navigation }) => (
        <View style={styles.tabBarContainer}>
          <Animated.View
            style={[
              styles.circle,
              {
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [-360, 360],
                      outputRange: ["-360deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            {renderButtons(navigation)}
            <TouchableOpacity onPress={() => launchCamera()}>
              <View style={styles.scanButton}>
                <PlusIcon size={hp(4.2)} color={"white"} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    >
      <Tab.Screen name="HomeScreen" component={HomeScreenMain} />
      <Tab.Screen name="StoreViewPage" component={StoreViewPage} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: hp(-10),
    width: width,
    height: CIRCLE_RADIUS * 2 + hp(2),
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS,
    backgroundColor: "rgba(164, 163, 163, 0.4)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    position: "absolute",
    width: ICON_SIZE,
    height: ICON_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  scanButton: {
    width: 65,
    height: 65,
    backgroundColor: "#14BA9C",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedBackground: {
    position: "absolute",
    width: ICON_SIZE + 12,
    height: ICON_SIZE + 12,
    borderRadius: (ICON_SIZE + 12) / 2,
    backgroundColor: "#130160",
    zIndex: -10,
  },
});

export default BottomNavigator;
