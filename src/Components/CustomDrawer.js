import { useNavigation } from "@react-navigation/native"
import React from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions
} from "react-native"
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen"
import Ionicons from "react-native-vector-icons/Ionicons"
import EditProfile from '../../assets/EditProfile.svg';
import Feedback from '../../assets/FeedBack.svg';
import ChangePassword from '../../assets/ChangePassword.svg';
import Help from '../../assets/Help.svg';
import ReferallProgram from '../../assets/ReferallProgram.svg';
import Settings from '../../assets/Settings.svg';


const { width } = Dimensions.get("window")

const CustomDrawer = ({ isOpen, closeDrawer }) => {
  const navigation = useNavigation();
  const translateX = React.useRef(new Animated.Value(-width)).current

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -width,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [isOpen])

  const menuItems = [
    { icon: <EditProfile />, label: "Edit Profile", goto: 'EditProfileScreen' },
    { icon: <Feedback />, label: "Feedback", goto: 'Feedback' },
    { icon: <ChangePassword />, label: "Change Password", goto: 'ChangePassword' },
    { icon: <Help />, label: "Help", goto: 'HelpAndSupport' },
    { icon: <ReferallProgram />, label: "Referral Program", goto: 'ReferFriend' },
    { icon: <Settings />, label: "Settings", goto: 'SettingsScreen' },
  ]

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX }] }]}>
      <TouchableOpacity style={styles.closeButton} onPress={closeDrawer}>
        <Ionicons name="close" size={hp(3.4)} color="black" />
      </TouchableOpacity>
      <View style={styles.profileSection}>
        <Image
          source={require("../../assets/profile_img.png")}
          style={styles.profilePicture}
        />
        <Text style={styles.profileName}>User Name</Text>
      </View>
      <ScrollView style={styles.menuItems}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={() => navigation.navigate(item.goto)}>
            <View style={{ width: '9%' }}>
              {item.icon}
            </View>
            <View>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="red" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: "white",
    paddingTop: 50,
    paddingHorizontal: 20
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    paddingVertical: '5%'
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 20
  },
  profilePicture: {
    width: wp(20),
    height: wp(20),
    borderRadius: 40,
    marginBottom: 10
  },
  profileName: {
    fontSize: hp(2.2),
    color: '#0D0D26',
    fontFamily: 'Nunito-Bold'
  },
  menuItems: {
    flex: 1
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: '4.5%'
  },
  menuItemLabel: {
    marginLeft: 15,
    fontSize: hp(2),
    color: '#0D0D26',
    fontFamily: 'Nunito-SemiBold'
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopColor: "#f0f0f0"
  },
  logoutText: {
    marginLeft: 15,
    color: "red",
    fontSize: hp(2),
    fontFamily: 'Nunito-SemiBold'
  }
})

export default CustomDrawer
