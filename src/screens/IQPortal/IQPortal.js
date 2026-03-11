import { Dimensions, Image, ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const SERVICES = [
  "Verify My Bin Store $195.99 Annually",
  "Scale your business: $185.00",
  "Weekly live training: $50.00/Session",
  "Bookkeeping/Taxes/Accounting Help: Price per request",
  "Consulting: $500 per session",
  "101 30 Day Mentorship Training Plan: $2,000.00",
  "Direct Contact Holder Portal: $250.00",
];

const COURSES = [
  {
    title: "Start a Bin Store",
    description: "How to start a bin store — Intro to reselling video",
    meta: "Full Video • With PDF",
  },
  {
    title: "Free Reseller Training",
    description: "Resellers BluePrint Method",
    meta: "1 Video • With PDF",
  },
  {
    title: "Reseller BluePrint",
    description: "How to Buy Pallets",
    meta: "3 Videos • With PDF",
  },
  {
    title: "Advanced Reselling",
    description: "Scaling your bin store to the next level",
    meta: "5 Videos • With PDF",
  },
];

const IQPortal = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={25} />
            </Pressable>
            <Text style={styles.headerText}>Reseller IQ Portal</Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: '5%' }}>

            {/* ── Additional Services ─────────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ADDITIONAL SERVICES</Text>
            </View>

            {SERVICES.map((service, i) => (
              <View key={i} style={styles.serviceRow}>
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}

            {/* ── Courses ─────────────────────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Courses</Text>
            </View>

            {/* Grid: 2 columns */}
            <View style={styles.courseGrid}>
              {COURSES.map((course, i) => (
                <Pressable
                  key={i}
                  style={styles.courseCard}
                  onPress={() => navigation.navigate('CourseDetails')}
                >
                  <Image
                    source={require('../../../assets/reseller_training.png')}
                    style={styles.courseImage}
                  />
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseCategory}>{course.title}</Text>
                    <Text style={styles.courseDescription}>{course.description}</Text>
                    <Text style={styles.courseMeta}>{course.meta}</Text>
                  </View>
                </Pressable>
              ))}
            </View>

          </View>
          <View style={{ height: hp(5) }} />
        </ScrollView>
      </ImageBackground>

      <ImageBackground
        source={require('../../../assets/vector_2.png')}
        style={styles.vector2}
      />
    </View>
  );
};

export default IQPortal;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  vector: { width: wp(100), height: '100%' },
  vector2: { width: wp(100), height: hp(50), position: 'absolute', bottom: 0, zIndex: -1 },

  header: {
    width: wp(100), height: hp(7), marginTop: '10%',
    paddingHorizontal: '5%', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  headerChild: { flexDirection: 'row', alignItems: 'center' },
  headerText: {
    fontFamily: 'Nunito-Bold', fontSize: hp(2.9),
    color: '#0D0140', marginLeft: '3%',
  },

  sectionHeader: { marginTop: '7%', marginBottom: '4%' },
  sectionTitle: { fontFamily: 'Nunito-Bold', color: '#130160', fontSize: hp(2.4) },

  // Services
  serviceRow: {
    backgroundColor: '#fff', width: '100%', height: hp(6.5),
    borderRadius: 5, justifyContent: 'center', paddingHorizontal: '5%',
    elevation: 3, marginBottom: '3%',
  },
  serviceText: { color: '#524B6B', fontFamily: 'Nunito-SemiBold', fontSize: hp(1.9) },

  // Courses grid
  courseGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  courseCard: {
    width: wp(44), borderRadius: 5,
    borderWidth: 0.5, borderColor: '#e6e6e6',
    backgroundColor: '#fff', marginBottom: hp(2),
  },
  courseImage: { width: '100%', height: hp(13), borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  courseInfo: { padding: '6%' },
  courseCategory: { fontFamily: 'Nunito-ExtraBold', color: '#0049AF', fontSize: hp(1.7) },
  courseDescription: { fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.8), marginTop: '2%' },
  courseMeta: { fontFamily: 'Nunito-SemiBold', color: '#14BA9C', fontSize: hp(1.5), marginTop: '5%' },
});