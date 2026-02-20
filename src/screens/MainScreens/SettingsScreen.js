import { useNavigation } from "@react-navigation/native"
import React from "react"
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Dimensions,
  Pressable
} from "react-native"
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen"
import Ionicons from "react-native-vector-icons/Ionicons"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import ProfileIcon from '../../../assets/ProfileIcon';
import NotificationIcon from '../../../assets/NotificationIcon'
import ChangePasswordIcon from '../../../assets/ChangePasswordIcon'
import LanguageIcon from '../../../assets/LanguageIcon'
import ThemeIcon from '../../../assets/ThemeIcon'
import DeleteIcon from '../../../assets/DeleteIcon'
import PrivacyIcon from '../../../assets/PrivacyIcon'
import TermsAndConditionIcon from '../../../assets/TermsAndConditionIcon'
import HelpCenterIcon from '../../../assets/HelpCenterIcon'
import SupportIcon from '../../../assets/SupportIcon'
import AboutIcon from '../../../assets/AboutIcon'


const { width, height } = Dimensions.get('window')
export default function SettingsScreen({ openDrawer }) {
  const [isEnabled, setIsEnabled] = React.useState(false)
  const toggleSwitch = () => setIsEnabled(previousState => !previousState)
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name='arrow-back-ios' color={'#0D0D26'} size={25} />
            </Pressable>
            <Text style={styles.headerText}>Settings</Text>
          </View>
        </View>
        <View style={styles.content}>
          <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#95969D', fontSize: wp(4.6), marginVertical: '1%' }}>Applications</Text>
          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('UserProfileScreen')}>
            <View style={styles.settingLeft}>
              <ProfileIcon />
              <Text style={styles.settingText}>My Profile</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <NotificationIcon />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#56CD54" }}
              thumbColor={"#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('HelpAndSupport')}>
            <View style={styles.settingLeft}>
              <ChangePasswordIcon />
              <Text style={styles.settingText}>Change Passoword</Text>
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <LanguageIcon />
              <Text style={styles.settingText}>Language</Text>
            </View>
            <Ionicons name="chevron-forward" size={hp(3.1)} color="#150B3D" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <ThemeIcon />
              <Text style={styles.settingText}>Theme</Text>
            </View>
            <Ionicons name="chevron-forward" size={hp(3.1)} color="#150B3D" />
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <DeleteIcon />
              <Text style={styles.settingText}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={hp(3.1)} color="#150B3D" />
          </TouchableOpacity>



          {/* about  */}

          {/* <View style={{ height: hp(3) }} /> */}
          {/* <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#95969D', fontSize: wp(4.6), marginVertical: '1%' }}>About</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <PrivacyIcon />
              <Text style={styles.settingText}>Privacy</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <TermsAndConditionIcon />
              <Text style={styles.settingText}>Terms and Conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={hp(3.1)} color="#150B3D" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <HelpCenterIcon />
              <Text style={styles.settingText}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={hp(3.1)} color="#150B3D" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <SupportIcon />
              <Text style={styles.settingText}>Support</Text>
            </View> */}
          {/* <Ionicons name="chevron-forward" size={hp(3.1)} color="#150B3D" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <AboutIcon />
              <Text style={styles.settingText}>About</Text>
            </View>
            <Ionicons name="chevron-forward" size={hp(3.1)} color="#150B3D" />
          </TouchableOpacity> */}
          <View style={{ height: hp(8) }} />
        </View>
      </ImageBackground>
      <ImageBackground source={require('../../../assets/vector_2.png')} style={styles.vector2} />
    </ScrollView >
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover"
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: hp(104),
  },
  vector2: {
    flex: 1,
    width: wp(100),
    height: height * 0.5,
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
  header: {
    width: wp(100),
    height: hp(7),
    marginTop: '10%',
    paddingHorizontal: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerChild: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp(35),
    justifyContent: 'space-between'
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3.2),
    textAlign: 'left',
    color: '#0D0140'
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: '4%',
    elevation: 1,
    backgroundColor: '#fff',
    marginVertical: '2%',
    borderRadius: 10,
    paddingHorizontal: '5%'
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  settingText: {
    marginLeft: 16,
    fontSize: hp(2),
    color: '#150B3D',
    fontFamily: 'DMSans-Regular'
  }
})
