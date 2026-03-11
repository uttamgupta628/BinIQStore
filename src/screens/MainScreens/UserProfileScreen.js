import { useNavigation } from "@react-navigation/native"
import React, { useEffect, useRef, useState } from "react"
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
  Pressable,
  Image,
  TextInput
} from "react-native"
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen"
import Ionicons from "react-native-vector-icons/Ionicons"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons"
import EditImage from '../../../assets/EditImage.svg'
import DropDownPicker from "react-native-dropdown-picker"
import { CreditCardInput } from "react-native-creditcard"
import DatePicker from 'react-native-date-picker'
import CalenderIcon from '../../../assets/CalenderIcon.svg'
import AntDesign from 'react-native-vector-icons/AntDesign';
import { format } from 'date-fns';
import PhoneInput from "react-native-phone-number-input"
import Feather from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window')
const UserProfileScreen = ({ openDrawer }) => {
  const [isEnabled, setIsEnabled] = React.useState(false)
  const toggleSwitch = () => setIsEnabled(previousState => !previousState)
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);
  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [value, setValue] = useState('Madhya Pradesh'); // Default selected value
  const [valueMonth, setValueMonth] = useState('January'); // Default selected value
  const [valueYear, setValueYear] = useState('1999'); // Default selected value
  const [date, setDate] = useState('')
  const [openDateModal, setOpenDateModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedValue, setFormattedValue] = useState(0);
  const phoneInput = useRef(null)
  const [selectedGender, setSelectedGender] = useState(null); // Tracks the selected gender

  const genders = [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
    { id: 'others', label: 'Others' },
  ];
  const [items, setItems] = useState([
    { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
    { label: 'Maharashtra', value: 'Maharashtra' },
    { label: 'Rajasthan', value: 'Rajasthan' },
    { label: 'Gujarat', value: 'Gujaat' },
  ]);
  const [month, setMonth] = useState([
    { label: "January", value: "January" },
    { label: "February", value: "February" },
    { label: "March", value: "March" },
    { label: "April", value: "April" },
    { label: "May", value: "May" },
    { label: "June", value: "June" },
    { label: "July", value: "July" },
    { label: "August", value: "August" },
    { label: "September", value: "September" },
    { label: "October", value: "October" },
    { label: "November", value: "November" },
    { label: "December", value: "December" },
  ]);
  const [year, setYear] = useState([])
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const expirationYears = Array.from({ length: 20 }, (_, i) => {
      const yearValue = currentYear + i;
      return { label: yearValue.toString(), value: yearValue.toString() };
    });
    setYear(expirationYears);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name='arrow-back-ios' color={'#0D0D26'} size={23} />
            </Pressable>
            <Text style={styles.headerText}>Profile</Text>
          </View>
          {/* <TouchableOpacity onPress={openDrawer}>
            <Feather name='settings' color='gray' size={22} />
          </TouchableOpacity> */}
        </View>
        <View style={styles.profileSection}>
          <Image
            source={require("../../../assets/profile_img.png")}
            style={styles.profilePicture}
          />
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfileScreen')}>
            <EditImage width={wp(3)} />
          </TouchableOpacity>
        </View>
        <View style={{ padding: '5%' }}>
          <View style={{ marginBottom: '5%', flexDirection: 'row' }}>
            <Text style={{ fontFamily: 'Nunito-Bold', fontSize: wp(5), color: '#14BA9C', textDecorationLine: 'underline' }}>Expertise Level:</Text>
            <Text style={{ fontFamily: 'Nunito-Regular', fontSize: wp(5), color: '#000' }}>{' '}Advanced</Text>
          </View>
          <Text style={styles.label}>Full name</Text>
          <View style={{ backgroundColor: '#fff', width: '100%', height: hp(6.5), alignSelf: 'center', borderRadius: 8, marginVertical: '2%', paddingHorizontal: '5%', justifyContent: 'center', borderWidth: 0.4, borderColor: '#524B6B' }}>
            <TextInput
              placeholder='John Doe'
              value='Jone Doe'
              style={{ fontFamily: 'Nunito-Regular', color: '#000', fontSize: hp(2.2) }}
              placeholderTextColor={'gray'}
            />
          </View>
          <Text style={styles.label}>Date of Birth</Text>
          <View style={{ backgroundColor: '#fff', width: '100%', height: hp(6.5), borderRadius: 8, marginVertical: '2%', paddingHorizontal: '4%', justifyContent: 'center', borderWidth: 0.4, borderColor: '#524B6B', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
            <TextInput
              placeholder='Select your DOB'
              value={date}
              style={{ fontFamily: 'Nunito-Regular', color: '#000', fontSize: hp(2.2), width: '48%' }}
              placeholderTextColor={'gray'}
              editable={false}
            />
            <TouchableOpacity onPress={() => setOpenDateModal(true)}>
              <AntDesign name='calendar' size={25} color={'#000'} />
            </TouchableOpacity>
            <DatePicker
              modal
              open={openDateModal}
              date={new Date()}
              onConfirm={(date) => {
                setOpenDateModal(false)
                setDate(format(date, 'dd-MM-yyyy'))
              }}
              onCancel={() => {
                setOpenDateModal(false)
              }}
              mode='date'
            />
          </View>
          <Text style={styles.label}>Email Address</Text>
          <View style={{ backgroundColor: '#fff', width: '100%', height: hp(6.5), alignSelf: 'center', borderRadius: 8, marginVertical: '2%', paddingHorizontal: '5%', justifyContent: 'center', borderWidth: 0.4, borderColor: '#524B6B' }}>
            <TextInput
              placeholder='johndoe@gmail.com'
              style={{ fontFamily: 'Nunito-Regular', color: '#000', fontSize: hp(2.2) }}
              placeholderTextColor={'gray'}
            />
          </View>
          <Text style={styles.label}>Gender</Text>
          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
            {genders.map((gender) => (
              <TouchableOpacity
                key={gender.id}
                onPress={() => setSelectedGender(gender.id)}
                style={{
                  backgroundColor: '#fff',
                  width: '32%',
                  height: hp(6.5),
                  alignSelf: 'center',
                  borderRadius: 8,
                  marginVertical: '2%',
                  paddingHorizontal: '5%',
                  justifyContent: 'center',
                  borderWidth: 0.4,
                  borderColor: '#524B6B',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <View
                  style={{
                    width: wp(6),
                    height: wp(6),
                    borderWidth: 1.5,
                    borderColor: '#000',
                    padding: '2%',
                    borderRadius: 10,
                  }}
                >
                  <View
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: selectedGender === gender.id ? '#14BA9C' : '#fff',
                      borderRadius: 10,
                    }}
                  />
                </View>
                <Text style={{ fontFamily: 'DMSans-Regular', color: '#000', fontSize: hp(2) }}>
                  {gender.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Phone Number</Text>
          <View style={{ backgroundColor: '#fff', width: '100%', height: hp(6.5), alignSelf: 'center', borderRadius: 8, marginVertical: '2%', paddingHorizontal: '5%', justifyContent: 'center', borderWidth: 0.4, borderColor: '#524B6B' }}>
            <TextInput
              placeholder='johndoe@gmail.com'
              value='+97 23342234244'
              style={{ fontFamily: 'Nunito-Regular', color: '#000', fontSize: hp(2.2) }}
              placeholderTextColor={'gray'}
            />
          </View>
          <Text style={styles.label}>Location</Text>
          <View style={{ backgroundColor: '#fff', width: '100%', height: hp(6.5), alignSelf: 'center', borderRadius: 8, marginVertical: '2%', paddingHorizontal: '5%', justifyContent: 'center', borderWidth: 0.4, borderColor: '#524B6B' }}>
            <TextInput
              placeholder='johndoe@gmail.com'
              value='Indore MP'
              style={{ fontFamily: 'Nunito-Regular', color: '#000', fontSize: hp(2.2) }}
              placeholderTextColor={'gray'}
            />
          </View>
        </View>
        {/* <View style={{ padding: '5%' }}>
          <View style={{ marginBottom: '5%' }}>
            <Text style={{ fontFamily: 'Nunito-SemiBold', fontSize: wp(5), color: '#000000' }}>Business Address Details</Text>
          </View>
          <Text style={styles.label}>Pincode</Text>
          <View style={{ backgroundColor: '#fff', width: '100%', height: hp(6.5), alignSelf: 'center', borderRadius: 8, marginVertical: '2%', paddingHorizontal: '5%', justifyContent: 'center', borderWidth: 0.4, borderColor: '#524B6B' }}>
            <TextInput
              placeholder='John Doe'
              value='450116'
              style={{ fontFamily: 'Nunito-Regular', color: '#000', fontSize: hp(2.2) }}
              placeholderTextColor={'gray'}
            />
          </View>
          <Text style={styles.label}>Password</Text>
          <View style={{ backgroundColor: '#fff', width: '100%', height: hp(6.5), alignSelf: 'center', borderRadius: 8, marginVertical: '2%', paddingHorizontal: '5%', justifyContent: 'center', borderWidth: 0.4, borderColor: '#524B6B' }}>
            <TextInput
              placeholder='johndoe@gmail.com'
              value="216 St Paul's Rd"
              style={{ fontFamily: 'Nunito-Regular', color: '#000', fontSize: hp(2.2) }}
              placeholderTextColor={'gray'}
            />
          </View>
          <Text style={styles.label}>City</Text>
          <View style={{ backgroundColor: '#fff', width: '100%', height: hp(6.5), alignSelf: 'center', borderRadius: 8, marginVertical: '2%', paddingHorizontal: '5%', justifyContent: 'center', borderWidth: 0.4, borderColor: '#524B6B' }}>
            <TextInput
              value='Indore'
              style={{ fontFamily: 'Nunito-Regular', color: '#000', fontSize: hp(2.2) }}
              placeholderTextColor={'gray'}
            />
          </View>
          <Text style={styles.label}>State</Text>
          <View style={styles.dropdownContainer}>
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              placeholder="Select a state"
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownContainerStyle}
              ArrowDownIconComponent={() => <SimpleLineIcons name="arrow-down" size={20} color="#000" />}
            />
          </View>
          <Text style={styles.label}>Country</Text>
          <View style={{ backgroundColor: '#fff', width: '100%', height: hp(6.5), alignSelf: 'center', borderRadius: 8, marginVertical: '2%', paddingHorizontal: '5%', justifyContent: 'center', borderWidth: 0.4, borderColor: '#524B6B' }}>
            <TextInput
              value='India'
              style={{ fontFamily: 'Nunito-Regular', color: '#000', fontSize: hp(2.2) }}
              placeholderTextColor={'gray'}
            />
          </View>
        </View> */}
        {/* <View style={{ borderWidth: 0.3, borderColor: '#C4C4C4', width: wp(90), alignSelf: 'center', marginTop: '6%' }} />
        <View style={{ padding: '5%' }}>
          <View style={{ marginBottom: '5%' }}>
            <Text style={{ fontFamily: 'Nunito-SemiBold', fontSize: wp(5), color: '#000000' }}>Card Information</Text>
          </View>
          <Text style={styles.label}>Card Number</Text>
          <View style={{ backgroundColor: '#fff', width: '100%', height: hp(6.5), alignSelf: 'center', borderRadius: 8, marginVertical: '2%', paddingHorizontal: '5%', justifyContent: 'center', borderWidth: 0.4, borderColor: '#524B6B' }}>
            <TextInput
              placeholder='John Doe'
              value='204356XXXXXXX'
              style={{ fontFamily: 'Nunito-Regular', color: '#000', fontSize: hp(2.2) }}
              placeholderTextColor={'gray'}
            />
          </View>
          <Text style={styles.label}>Card Holder’s Name</Text>
          <View style={{ backgroundColor: '#fff', width: '100%', height: hp(6.5), alignSelf: 'center', borderRadius: 8, marginVertical: '2%', paddingHorizontal: '5%', justifyContent: 'center', borderWidth: 0.4, borderColor: '#524B6B' }}>
            <TextInput
              placeholder='johndoe@gmail.com'
              value='Muskan Rathore'
              style={{ fontFamily: 'Nunito-Regular', color: '#000', fontSize: hp(2.2) }}
              placeholderTextColor={'gray'}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: '2%', }}>
            <View style={styles.monthDropContainer}>
              <DropDownPicker
                open={openMonth}
                value={valueMonth}
                items={month}
                setOpen={setOpenMonth}
                setValue={setValueMonth}
                setItems={setMonth}
                placeholder="Month"
                style={styles.dropdown}
                textStyle={styles.dropdownText}
                dropDownContainerStyle={[styles.dropdownContainerStyle, { maxHeight: 'auto' }]}
                ArrowDownIconComponent={() => <SimpleLineIcons name="arrow-down" size={20} color="#000" />}
              />
            </View>
            <View style={styles.monthDropContainer}>
              <DropDownPicker
                open={openYear}
                value={valueYear}
                items={year}
                setOpen={setOpenYear}
                setValue={setValueYear}
                setItems={setYear}
                placeholder="Year"
                style={styles.dropdown}
                textStyle={styles.dropdownText}
                dropDownContainerStyle={[styles.dropdownContainerStyle, { maxHeight: 'auto' }]}
                ArrowDownIconComponent={() => <SimpleLineIcons name="arrow-down" size={20} color="#000" />}
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="CVC"
              keyboardType="numeric"
              maxLength={4} // Restrict input to 3 digits
              style={styles.input}
              placeholderTextColor="gray"
            />
          </View>
        </View> */}
      </ImageBackground>
      <View style={{ borderWidth: 0.3, borderColor: '#C4C4C4', width: wp(90), alignSelf: 'center', marginTop: '10%' }} />
      <TouchableOpacity style={styles.gettingStarted} onPress={() => navigation.navigate('QuizScreen')}>
        <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#fff', fontSize: hp(2.5) }}>Update Profile</Text>
      </TouchableOpacity>
      <View style={{ height: hp(7) }} />
      <ImageBackground source={require('../../../assets/vector_2.png')} style={styles.vector2} />
    </ScrollView>
  )
}
export default UserProfileScreen;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover"
  },
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: hp(100)
  },
  vector2: {
    flex: 1,
    width: wp(100),
    height: height * 2,
    position: 'absolute',
    bottom: 0,
    zIndex: -1
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
    // justifyContent: 'space-between'
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3.2),
    textAlign: 'left',
    color: '#0D0140',
    marginLeft: '3%'
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
    paddingVertical: 16,
    elevation: 2,
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
    fontSize: hp(2.3),
    color: '#150B3D',
    fontFamily: 'Nunito-Regular'
  },
  profileSection: {
    alignItems: "center",
    borderBottomColor: "#f0f0f0",
    justifyContent: 'center',
    marginTop: '3%'
  },
  profilePicture: {
    width: wp(26),
    height: wp(26),
    borderRadius: 40,
  },
  profileName: {
    fontSize: hp(2.7),
    color: '#0D0D26',
    fontFamily: 'Nunito-Bold'
  },
  editBtn: {
    width: wp(7.5),
    height: wp(7.5),
    backgroundColor: '#130160',
    position: 'absolute',
    bottom: 0,
    right: '36.5%',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fbfdff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    color: 'black',
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.8),
    marginTop: '1.5%'
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    width: '100%',
    alignSelf: 'center',
    borderRadius: 8,
    marginVertical: '2%',
    justifyContent: 'center',
    borderWidth: 0.1,
    borderColor: '#524B6B',
    zIndex: 5
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#524B6B',
    height: hp(6),
    borderRadius: 6,
    borderWidth: 0.3,
    borderColor: '#000'
  },
  dropdownText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#000',
  },
  dropdownContainerStyle: {
    borderColor: '#524B6B',
    backgroundColor: '#fff',
    zIndex: 4,
  },
  monthDropContainer: {
    backgroundColor: '#fff',
    width: '48%',
    alignSelf: 'center',
    borderRadius: 8,
    marginVertical: '2%',
    justifyContent: 'center',
    borderWidth: 0.1,
    borderColor: '#524B6B',
    zIndex: 5
  },
  inputContainer: {
    backgroundColor: '#fff',
    width: '45%',
    height: hp(6.5),
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: '3%',
    marginVertical: '2%',
    justifyContent: 'center',
    borderWidth: 0.4,
    borderColor: '#524B6B',
  },
  input: {
    fontFamily: 'Nunito-Regular',
    color: '#000',
    fontSize: hp(2),
  },
  gettingStarted: {
    backgroundColor: '#130160',
    width: '90%',
    height: hp(7),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  }
})
