import { Dimensions, Image, ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const IQPortal = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name='arrow-back-ios' color={'#0D0D26'} size={25} />
            </Pressable>
            <Text style={styles.headerText}>Reseller Iq Portal</Text>
          </View>
        </View>
        <ScrollView style={{ flex: 1, width: '100%', height: '100%' }}>
          <View style={{ paddingHorizontal: '5%' }}>
            <View style={{ marginVertical: '7%' }}>
              <Text style={{ fontFamily: 'Nunito-Bold', color: '#130160', fontSize: hp(2.3) }}>ADDITIONAL SERVICES</Text>
            </View>
            <View style={{ backgroundColor: '#fff', width: wp(90), height: hp(6.5), borderRadius: 5, justifyContent: 'center', paddingHorizontal: '5%', elevation: 3, marginBottom: '4%' }}>
              <Text style={{ color: '#524B6B', fontFamily: 'Nunito-SemiBold', fontSize: hp(2) }}>Verify My Bin Store $195.99 Annually</Text>
            </View>
            <View style={{ backgroundColor: '#fff', width: wp(90), height: hp(6.5), borderRadius: 5, justifyContent: 'center', paddingHorizontal: '5%', elevation: 3, marginBottom: '4%' }}>
              <Text style={{ color: '#524B6B', fontFamily: 'Nunito-SemiBold', fontSize: hp(2) }}>Scale your business: $185.00</Text>
            </View>
            <View style={{ backgroundColor: '#fff', width: wp(90), height: hp(6.5), borderRadius: 5, justifyContent: 'center', paddingHorizontal: '5%', elevation: 3, marginBottom: '4%' }}>
              <Text style={{ color: '#524B6B', fontFamily: 'Nunito-SemiBold', fontSize: hp(2), textAlign: 'left' }}>Weekly live training:$50.00/Session </Text>
            </View>
            <View style={{ backgroundColor: '#fff', width: wp(90), height: hp(6.5), borderRadius: 5, justifyContent: 'center', paddingHorizontal: '5%', elevation: 3, marginBottom: '4%' }}>
              <Text style={{ color: '#524B6B', fontFamily: 'Nunito-SemiBold', fontSize: hp(2) }}>Bookkeeping/Taxes/Accounting Help: Price per request </Text>
            </View>
            <View style={{ backgroundColor: '#fff', width: wp(90), height: hp(6.5), borderRadius: 5, justifyContent: 'center', paddingHorizontal: '5%', elevation: 3, marginBottom: '4%' }}>
              <Text style={{ color: '#524B6B', fontFamily: 'Nunito-SemiBold', fontSize: hp(2) }}>Consulting: $500 per session </Text>
            </View>
            <View style={{ backgroundColor: '#fff', width: wp(90), height: hp(6.5), borderRadius: 5, justifyContent: 'center', paddingHorizontal: '5%', elevation: 3, marginBottom: '4%' }}>
              <Text style={{ color: '#524B6B', fontFamily: 'Nunito-SemiBold', fontSize: hp(2) }}>101 30 Day Mentorship Training Plan:$2,000.00</Text>
            </View>
            <View style={{ backgroundColor: '#fff', width: wp(90), height: hp(6.5), borderRadius: 5, justifyContent: 'center', paddingHorizontal: '5%', elevation: 3, marginBottom: '4%' }}>
              <Text style={{ color: '#524B6B', fontFamily: 'Nunito-SemiBold', fontSize: hp(2) }}>Direct Contact Holder Portal:$250.00 </Text>
            </View>
          </View>
          <View style={{ marginVertical: '3%', paddingHorizontal: '5%' }}>
            <View style={{ marginVertical: '1%' }}>
              <Text style={{ fontFamily: 'Nunito-Bold', color: '#130160', fontSize: hp(2.4) }}>Courses</Text>
            </View>
            <View style={{ width: '100%', height: hp(30), flexDirection: 'row', marginTop: '4%', justifyContent: 'space-between' }}>
              <Pressable style={{ width: wp(44), height: hp(30), borderRadius: 5, borderWidth: 0.5, borderColor: '#e6e6e6', backgroundColor: '#fff' }} onPress={() => navigation.navigate('CourseDetails')}>
                <Image source={require('../../../assets/reseller_training.png')} style={{ width: wp(44), height: hp(13), borderRadius: 5 }} />
                <View style={{ margin: '6%', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontFamily: 'Nunito-ExtraBold', color: '#0049AF', fontSize: hp(1.7) }}>Start a Bin Store</Text>
                    <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.9) }}>How to start a bin store Intro to reselling video</Text>
                    <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#14BA9C', fontSize: hp(1.5), marginTop: '5%' }}>Full Video • With PDF</Text>
                  </View>
                </View>
              </Pressable>
              <Pressable style={{ width: wp(44), height: hp(30), borderRadius: 5, borderWidth: 0.5, borderColor: '#e6e6e6', backgroundColor: '#fff' }} onPress={() => navigation.navigate('CourseDetails')}>
                <Image source={require('../../../assets/reseller_training.png')} style={{ width: wp(44), height: hp(13), borderRadius: 5 }} />
                <View style={{ margin: '6%', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontFamily: 'Nunito-ExtraBold', color: '#0049AF', fontSize: hp(1.6) }}>Free Reseller Training</Text>
                    <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.9) }}>Resellers BluePrint Method</Text>
                    <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#14BA9C', fontSize: hp(1.5), marginTop: '5%' }}>1 Video • With PDF</Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </View>
          <View style={{ paddingHorizontal: '5%' }}>
            <View style={{ width: '100%', height: hp(25), flexDirection: 'row', marginTop: '4%', justifyContent: 'space-between' }}>
              <Pressable style={{ width: wp(44), height: hp(25), borderRadius: 5, borderWidth: 0.5, borderColor: '#e6e6e6', backgroundColor: '#fff' }} onPress={() => navigation.navigate('CourseDetails')}>
                <Image source={require('../../../assets/reseller_training.png')} style={{ width: wp(44), height: hp(13), borderRadius: 5 }} />
                <View style={{ margin: '6%', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontFamily: 'Nunito-ExtraBold', color: '#0049AF', fontSize: hp(1.7) }}>Reseller BluePrint</Text>
                    <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.9) }}>How to Buy Pallets</Text>
                    <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#14BA9C', fontSize: hp(1.5), marginTop: '5%' }}>3 Video • With PDF</Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </View>
          <View style={{ height: hp(3) }} />
        </ScrollView>
      </ImageBackground>
      <ImageBackground source={require('../../../assets/vector_2.png')} style={styles.vector2} />
    </View>
  )
}

export default IQPortal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  vector: {
    // flex: 1,
    width: wp(100),
    height: '100%',
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
    justifyContent: 'space-between'
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.9),
    textAlign: 'left',
    color: '#0D0140'
  },
  vector2: {
    // flex: 1,
    width: wp(100),
    height: hp(50),
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
})