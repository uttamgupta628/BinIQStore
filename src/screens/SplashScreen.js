// src/screens/SplashScreen.js
import {
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import useStore from "../store";
import Splash from "../../assets/Splash.svg";
import City from "../../assets/City.svg";

const SplashScreen = () => {
  const navigation = useNavigation();
  const { isFirstOpen, setFirstOpen, user } = useStore();

  useEffect(() => {
    console.log("SplashScreen: isFirstOpen =", isFirstOpen, "user =", !!user); // Debug log
    const timer = setTimeout(() => {
      if (user) {
        console.log("Navigating to HomeScreen"); // Debug log
        navigation.replace("HomeNavigataor");
      } else if (isFirstOpen) {
        console.log("Navigating to OnBoarding"); // Debug log
        setFirstOpen();
        navigation.replace("OnBoarding");
      } else {
        console.log("Navigating to SignUp"); // Debug log
        navigation.replace("SignUp");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isFirstOpen, setFirstOpen, user, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={"transparent"} />
      <ImageBackground
        source={require("../../assets/vector_1.png")}
        style={styles.vector}
      >
        <View style={styles.logoContainer}>
          <View>
            <Splash width={wp(38)} />
          </View>
        </View>
        <Text style={styles.logoText}>
          The Largest Amazon Bin Store Network
        </Text>
        <City style={styles.cityVector} />
      </ImageBackground>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: hp(100),
  },
  logoText: {
    fontFamily: "Nunito-SemiBold",
    color: "#000",
    fontSize: hp(2),
    alignSelf: "center",
    bottom: "42%",
    width: "90%",
    textAlign: "center",
  },
  cityVector: {
    position: "absolute",
    width: wp(50),
    bottom: 0,
  },
});
// // src/screens/SplashScreen.js
// import {
//   Image,
//   ImageBackground,
//   StatusBar,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import React, { useEffect } from "react";
// import { useNavigation } from "@react-navigation/native";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import useStore from "../store";
// import Splash from "../../assets/Splash.svg";
// import City from "../../assets/City.svg";

// const SplashScreen = () => {
//   const navigation = useNavigation();
//   const { isFirstOpen, setFirstOpen } = useStore();

//   useEffect(() => {
//     console.log("SplashScreen: isFirstOpen =", isFirstOpen); // Debug log
//     const timer = setTimeout(() => {
//       if (isFirstOpen) {
//         console.log("Navigating to OnBoarding"); // Debug log
//         setFirstOpen();
//         navigation.replace("OnBoarding");
//       } else {
//         console.log("Navigating to SignUp"); // Debug log
//         navigation.replace("SignUp");
//       }
//     }, 2500);

//     return () => clearTimeout(timer); // Cleanup timer
//   }, [isFirstOpen, setFirstOpen, navigation]);

//   return (
//     <View style={styles.container}>
//       <StatusBar translucent={true} backgroundColor={"transparent"} />
//       <ImageBackground
//         source={require("../../assets/vector_1.png")}
//         style={styles.vector}
//       >
//         <View style={styles.logoContainer}>
//           <View>
//             <Splash width={wp(38)} />
//           </View>
//         </View>
//         <Text style={styles.logoText}>
//           The Largest Amazon Bin Store Network
//         </Text>
//         <City style={styles.cityVector} />
//       </ImageBackground>
//     </View>
//   );
// };

// export default SplashScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   logoContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   logo: {
//     width: wp(40),
//     height: hp(10.5),
//   },
//   vector: {
//     flex: 1,
//     width: wp(100),
//     height: hp(100),
//   },
//   logoText: {
//     fontFamily: "Nunito-SemiBold",
//     color: "#000",
//     fontSize: hp(2),
//     alignSelf: "center",
//     bottom: "42%",
//     width: "90%",
//     textAlign: "center",
//   },
//   cityVector: {
//     position: "absolute",
//     width: wp(50),
//     bottom: 0,
//   },
// });
