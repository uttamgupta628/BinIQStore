import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Pressable,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const UploadChoiceScreen = () => {
  const navigation = useNavigation();

  // Entrance animations
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slide1Anim = useRef(new Animated.Value(60)).current;
  const slide2Anim = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(slide1Anim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.spring(slide2Anim, { toValue: 0, tension: 80, friction: 10, delay: 80, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Dim background — tap to go back */}
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />

      <Animated.View style={[styles.sheet, { opacity: fadeAnim }]}>
        {/* Handle bar */}
        <View style={styles.handle} />

        <Text style={styles.title}>What would you like to add?</Text>
        <Text style={styles.subtitle}>Choose a content type to get started</Text>

        {/* ── Upload Product ──────────────────────────────────── */}
        <Animated.View style={{ transform: [{ translateY: slide1Anim }] }}>
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#130160' }]}>
              <MaterialIcons name="inventory-2" size={28} color="#fff" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Upload Product</Text>
              <Text style={styles.cardDesc}>Add a trending item or activity feed post</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#C4C4C4" />
          </TouchableOpacity>
        </Animated.View>

        {/* ── New Promotion ───────────────────────────────────── */}
        <Animated.View style={{ transform: [{ translateY: slide2Anim }] }}>
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('NewPromotionScreen')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#14BA9C' }]}>
              <MaterialIcons name="local-offer" size={28} color="#fff" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>New Promotion</Text>
              <Text style={styles.cardDesc}>Create a discount, deal or campaign</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#C4C4C4" />
          </TouchableOpacity>
        </Animated.View>

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default UploadChoiceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: wp(6),
    paddingBottom: hp(5),
    paddingTop: hp(1.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: hp(2.5),
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.6),
    color: '#0D0140',
    marginBottom: hp(0.6),
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.7),
    color: '#888',
    marginBottom: hp(3),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8FF',
    borderRadius: 16,
    padding: hp(2),
    marginBottom: hp(1.8),
    borderWidth: 1,
    borderColor: '#EBEBF5',
  },
  iconCircle: {
    width: 52, height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.1),
    color: '#0D0140',
    marginBottom: 3,
  },
  cardDesc: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.6),
    color: '#888',
  },
  cancelBtn: {
    marginTop: hp(1),
    alignSelf: 'center',
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(10),
  },
  cancelText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(2),
    color: '#999',
  },
});