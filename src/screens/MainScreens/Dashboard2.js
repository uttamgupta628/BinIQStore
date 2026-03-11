import React, {useCallback} from 'react';
import {
  View, Text, StyleSheet, Image,
  TouchableOpacity, ImageBackground, Pressable,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import useStore from '../../store';

const PLACEHOLDER_STORE = require('../../../assets/store_profile.png');

const getDaysRemaining = dateStr => {
  if (!dateStr) return null;
  const expiry = new Date(dateStr);
  const today  = new Date();
  expiry.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

const Dashboard2 = () => {
  const navigation = useNavigation();

  const user              = useStore(state => state.user);
  const store             = useStore(state => state.store);
  const fetchStoreDetails = useStore(state => state.fetchStoreDetails);
  const fetchUserProfile  = useStore(state => state.fetchUserProfile);

  useFocusEffect(
    useCallback(() => {
      fetchStoreDetails();
      fetchUserProfile();
    }, []),
  );

  const formatCount = n => {
    if (!n && n !== 0) return '—';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000)    return `${(n / 1000).toFixed(1)}K`;
    return `${n}`;
  };

  const isVerified =
    store?.verified === true ||
    user?.verified  === true ||
    user?.status    === 'approved' ||
    (user?.subscription?.status === 'completed' &&
      user?.subscription_end_time &&
      new Date(user.subscription_end_time) > new Date());

  const daysLeft  = getDaysRemaining(user?.subscription_end_time);
  const isExpired = daysLeft !== null && daysLeft < 0;
  const showGetVerifiedButton = !isVerified || isExpired;

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Welcome, <Text style={styles.name}>{user?.full_name || 'User'}</Text>
        </Text>
        <Text style={styles.subtext}>
          Customize your store's details to attract and engage customers.
        </Text>
      </View>

      {/* ── Store Profile Card ── */}
      <ImageBackground
        source={require('../../../assets/hidden_find_dashboard.png')}
        style={styles.cardsContainer}>

        <View style={styles.leftColumn}>
          <View style={styles.storeImageWrapper}>
            <Image
              source={store?.store_image ? {uri: store.store_image} : PLACEHOLDER_STORE}
              style={styles.storeImage}
              resizeMode="cover"
            />
          </View>
        </View>

        <View style={styles.rightColumn}>
          <View style={styles.infoContainer}>

            <View style={styles.nameRow}>
              <Text style={styles.storeName} numberOfLines={1}>
                {store?.store_name || 'Hidden Finds'}
              </Text>
              {isVerified && !isExpired && (
                <Image
                  source={require('../../../assets/bluetick.png')}
                  style={styles.bluetick}
                />
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{formatCount(store?.followers)}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{formatCount(store?.likes)}</Text>
                <Text style={styles.statLabel}>Likes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{formatCount(store?.views_count || store?.views || 0)}</Text>
                <Text style={styles.statLabel}>Viewers</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoText} numberOfLines={1}>
                {store?.website_url || store?.store_email || 'www.hiddenfinds.com'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoText} numberOfLines={1}>
                {store?.address
                  ? store.address.length > 30
                    ? store.address.slice(0, 30) + '...'
                    : store.address
                  : '104, St. Plymoth, UK'}
              </Text>
            </View>

            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('EditProfileScreen')}>
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
              <View style={styles.socialIcons}>
                <Image source={require('../../../assets/fb.png')}        style={styles.socialIcon} />
                <Image source={require('../../../assets/x.png')}         style={styles.socialIcon} />
                <Image source={require('../../../assets/whatsapp.png')}  style={styles.socialIcon} />
                <Image source={require('../../../assets/telegram.png')}  style={styles.socialIcon} />
                <Image source={require('../../../assets/messenger.png')} style={styles.socialIcon} />
                <Image source={require('../../../assets/ln.png')}        style={styles.socialIcon} />
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* ── Get Verified CTA ── */}
      {showGetVerifiedButton && (
        <View style={styles.enrollNowContainer}>
          <Pressable
            style={[styles.libButton, {backgroundColor: isExpired ? '#FF4444' : '#130160'}]}
            onPress={() => navigation.navigate('GetVerified')}>
            <Text style={styles.liBbuttonText}>
              {isExpired ? '🔄 Renew Verification' : '🏆 Get Verified'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingVertical: 16},
  header:    {marginBottom: 12},
  greeting:  {fontSize: hp(2.4), fontFamily: 'Nunito-Bold', color: '#000'},
  name:      {color: '#000', fontFamily: 'Nunito-Bold', textDecorationLine: 'underline'},
  subtext:   {fontSize: wp(3.5), color: '#000', fontFamily: 'Nunito-Bold'},

  cardsContainer:    {flexDirection: 'row', width: '100%', height: hp(35), borderRadius: 7},
  leftColumn:        {width: '40%', height: '100%', justifyContent: 'center', alignItems: 'center'},
  storeImageWrapper: {width: wp(30), height: wp(30), borderRadius: wp(15), overflow: 'hidden'},
  storeImage:        {width: '100%', height: '100%'},
  rightColumn:       {width: '60%', height: '100%', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'},
  infoContainer:     {width: '97%', height: '75%', flexDirection: 'column'},
  nameRow: {
    height: '23%', flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: '2%', width: '93%',
  },
  storeName: {fontFamily: 'Roboto-SemiBold', color: '#14BA9C', fontSize: hp(3), flex: 1},
  bluetick:  {width: wp(7), height: wp(7)},
  statsRow:  {height: '35%', flexDirection: 'row'},
  statItem:  {width: '33%', paddingLeft: '1%', justifyContent: 'center'},
  statNumber:{fontFamily: 'Roboto-ExtraBold', color: '#fff', fontSize: hp(2.5)},
  statLabel: {fontFamily: 'Roboto-Regular', color: '#fff', fontSize: hp(1.3)},
  infoRow:   {height: '15%', justifyContent: 'center'},
  infoText:  {fontFamily: 'Roboto-Thin', color: '#fff', fontSize: hp(1.5)},
  actionContainer: {height: '23%', marginTop: '3%', justifyContent: 'center', width: '85%'},
  editBtn: {
    width: '100%', height: hp(3), backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', marginTop: hp(2),
  },
  editBtnText: {color: '#000', fontSize: hp(1.7), fontFamily: 'DMSans-SemiBold'},
  socialIcons: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: hp(1), width: '100%',
  },
  socialIcon: {width: wp(3.5), height: wp(3.5)},

  enrollNowContainer: {
    width: wp(95), alignSelf: 'center',
    justifyContent: 'flex-start', alignItems: 'center', marginTop: hp(1),
  },
  libButton:     {width: '95%', height: hp(3.5), borderRadius: 7, justifyContent: 'center'},
  liBbuttonText: {color: 'white', fontSize: hp(1.4), fontFamily: 'Nunito-Bold', textAlign: 'center'},
});

export default Dashboard2;