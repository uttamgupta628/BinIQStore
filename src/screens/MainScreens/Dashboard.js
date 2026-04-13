import React, {useCallback} from 'react';
import {
  View, Text, StyleSheet, Image,
  Pressable,
} from 'react-native';
import {Circle} from 'react-native-progress';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import ProgressBar from '../../Components/ProgressBar';
import useStore from '../../store';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

const PLACEHOLDER = require('../../../assets/dashboard_profile.png');

const Dashboard = () => {
  const navigation        = useNavigation();
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

  const displayName = user?.full_name || user?.name || 'User';

  // ── Verification status ────────────────────────────────────────
  const isVerified =
    store?.verified === true ||
    user?.verified  === true ||
    user?.status    === 'approved' ||
    (user?.subscription?.status === 'completed' &&
      user?.subscription_end_time &&
      new Date(user.subscription_end_time) > new Date());

  const daysLeft = (() => {
    if (!user?.subscription_end_time) return null;
    const expiry = new Date(user.subscription_end_time);
    const today  = new Date();
    expiry.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  })();

  const isExpired      = daysLeft !== null && daysLeft < 0;
  const isExpiringSoon = !isExpired && daysLeft !== null && daysLeft <= 7;

  const verifyBtnColor = isExpired ? '#FF4444' : isExpiringSoon ? '#E8A020' : '#130160';
  const verifyBtnLabel = isVerified && !isExpired
    ? isExpiringSoon ? '⚡ Renew Early — Expiring Soon' : null
    : isExpired      ? '🔄 Renew Verification'
    :                  '🏆 Get Verified';
  const showVerifyBtn = !isVerified || isExpired || isExpiringSoon;

  // ── Real stats ─────────────────────────────────────────────────
  const followers    = store?.followers    ?? 0;
  const likes        = store?.likes        ?? 0;
  const ratingCount  = store?.rating_count ?? 0;
  const monthlyViews = store?.monthly_views ?? store?.views_count ?? store?.views ?? 0;

  const weeklyVisitors  = store?.views_this_week ?? store?.weekly_views ?? store?.views_count ?? 0;
  const visitorProgress = monthlyViews > 0
    ? Math.min(weeklyVisitors / monthlyViews, 1)
    : 0;

  const followerProgress = Math.min(followers / 10000, 1);
  const viewProgress     = Math.min(monthlyViews / 100000, 1) * 100;

  const usedPromos  = user?.used_promotions ?? 0;

  // ── -1 means unlimited, show ∞ ────────────────────────────────
  const isUnlimited = user?.total_promotions === -1 || user?.total_promotions >= 9999;
  const totalPromos = isUnlimited ? '∞' : (user?.total_promotions ?? 0);

  const formatCount = n => {
    if (!n && n !== 0) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
    return `${n}`;
  };

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{flex: 1}}>
          <Text style={styles.greeting}>
            Hello, <Text style={styles.name}>{displayName}</Text>
          </Text>
          <Text style={styles.subtext}>Here's what you've been up to lately!</Text>
        </View>
        <Image
          source={store?.store_image ? {uri: store.store_image} : PLACEHOLDER}
          style={styles.profileImage}
          resizeMode="cover"
        />
      </View>

      {/* ── Stat Cards ── */}
      <View style={styles.cardsContainer}>

        {/* Followers */}
        <View style={styles.card}>
          <Text style={styles.uppercardTitle}>TOTAL{'\n'}FOLLOWERS</Text>
          <Circle
            size={hp(6.5)} progress={followerProgress}
            showsText={false} thickness={5}
            color="#00B813" unfilledColor="#DDF4DF"
            style={styles.circleSpacing}
          />
          <Text style={styles.statHighlight}>{formatCount(followers)}</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardSubText}>
              Unlock visibility &amp; connect with customers
            </Text>
          </View>
        </View>

        {/* Monthly views */}
        <View style={styles.middleCardStyle}>
          <Text style={styles.uppercardTitle}>MONTHLY{'\n'}PROFILE VIEWS</Text>
          <View style={{height: hp(2.5)}} />
          <ProgressBar progress={viewProgress} />
          <View style={{height: hp(1.5)}} />
          <Text style={styles.viewCountText}>{formatCount(monthlyViews)} views</Text>
          <Text style={styles.cardSubText}>{formatCount(likes)} likes total</Text>
        </View>

        {/* 7-day visitors */}
        <View style={styles.card}>
          <Text style={styles.uppercardTitle}>7 DAY{'\n'}VISITORS</Text>
          <View style={styles.circleSpacing}>
            <Circle
              size={hp(6.5)} progress={visitorProgress}
              showsText={false} thickness={5}
              color="#00B813" unfilledColor="#DDF4DF"
            />
            <View style={styles.circleOverlay}>
              <Text style={styles.circleOverlayNum}>{formatCount(weeklyVisitors)}</Text>
            </View>
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardSubText}>
              {ratingCount > 0 ? `${ratingCount} ratings` : 'No ratings yet'} — weekly trend
            </Text>
          </View>
        </View>

      </View>

      {/* ── Promo Stats Row ── */}
      <View style={styles.statsRow}>

        <View style={styles.statDivider} />

        <View style={styles.statTile}>
          <Text style={styles.statTileVal}>{usedPromos}</Text>
          <Text style={styles.statTileLabel}>Promos Used</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statTile}>
          {/* ∞ gets a larger font size for visual impact */}
          <Text style={[
            styles.statTileVal,
            isUnlimited && styles.infinityText,
          ]}>
            {totalPromos}
          </Text>
          <Text style={styles.statTileLabel}>Total Promos</Text>
        </View>

        <View style={styles.statDivider} />

      </View>

      {/* ── Verification status banner ── */}
      {isVerified && !isExpired && !isExpiringSoon && (
        <View style={styles.verifiedBanner}>
          <Text style={styles.verifiedBannerText}>
            ✓ Verified Store · Active
            {daysLeft !== null ? `  ·  ${daysLeft} days left` : ''}
          </Text>
        </View>
      )}

      {/* ── Get Verified / Renew button ── */}
      {showVerifyBtn && verifyBtnLabel && (
        <View style={styles.btnContainer}>
          <Pressable
            style={[styles.libButton, {backgroundColor: verifyBtnColor}]}
            onPress={() => navigation.navigate('GetVerified')}>
            <Text style={styles.liBbuttonText}>{verifyBtnLabel}</Text>
          </Pressable>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingVertical: 16},

  // Header
  header:       {flexDirection: 'row', alignItems: 'center', marginBottom: 14},
  greeting:     {fontSize: hp(2.4), fontFamily: 'Nunito-Bold', color: '#000'},
  name:         {color: '#000', fontFamily: 'Nunito-Bold', textDecorationLine: 'underline'},
  subtext:      {fontSize: wp(3.2), color: '#555', fontFamily: 'Nunito-Regular', marginTop: 2},
  profileImage: {width: wp(11), height: wp(11), borderRadius: wp(5.5)},

  // Stat cards row
  cardsContainer: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
  },
  card: {
    flex: 1, height: hp(22),
    backgroundColor: '#F2F5F8', borderRadius: 8, marginHorizontal: 3,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    paddingVertical: hp(1.2), alignItems: 'center', paddingHorizontal: 4,
  },
  middleCardStyle: {
    flex: 1, height: hp(22),
    backgroundColor: '#F2F5F8', borderRadius: 8, marginHorizontal: 3,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    paddingVertical: hp(1.2), alignItems: 'center', paddingHorizontal: 6,
  },
  uppercardTitle: {
    fontSize: wp(2.5), color: '#130160',
    fontFamily: 'Nunito-SemiBold', textAlign: 'center', lineHeight: hp(1.9),
  },
  circleSpacing: {marginTop: hp(1), marginBottom: hp(0.5)},
  statHighlight: {
    color: '#130160', fontFamily: 'Nunito-Bold',
    fontSize: hp(1.7), marginBottom: hp(0.5),
  },
  cardText:     {paddingHorizontal: 4, marginTop: 2},
  cardSubText:  {
    color: '#524B6B', fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.05), textAlign: 'center',
  },
  viewCountText:{
    color: '#130160', fontFamily: 'Nunito-Bold',
    fontSize: hp(1.7), textAlign: 'center', marginBottom: 3,
  },

  // Circle overlay for 7-day visitors
  circleOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  circleOverlayNum: {
    fontFamily: 'Nunito-Bold', fontSize: hp(1.6), color: '#130160',
  },

  // Promo stats row
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F2F5F8', borderRadius: 10,
    paddingVertical: hp(1.2), marginBottom: 10,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  statTile:      {flex: 1, alignItems: 'center'},
  statTileVal:   {fontFamily: 'Nunito-Bold', fontSize: hp(2.1), color: '#130160'},
  infinityText:  {fontSize: hp(2.8), color: '#14BA9C'},   // ∞ bigger + green
  statTileLabel: {fontFamily: 'Nunito-Regular', fontSize: hp(1.2), color: '#888', marginTop: 1},
  statDivider:   {width: 1, height: hp(3.5), backgroundColor: '#D8D8D8'},

  // Verified banner
  verifiedBanner: {
    backgroundColor: '#14BA9C18', borderWidth: 1, borderColor: '#14BA9C',
    borderRadius: 8, paddingVertical: hp(0.8), paddingHorizontal: wp(3),
    marginBottom: 8, alignItems: 'center',
  },
  verifiedBannerText: {
    fontFamily: 'Nunito-Bold', fontSize: hp(1.5), color: '#14BA9C',
  },

  // CTA button
  btnContainer: {
    width: wp(95), alignSelf: 'center',
    justifyContent: 'center', alignItems: 'center',
  },
  libButton: {
    width: '95%', height: hp(3.5), borderRadius: 7, justifyContent: 'center',
  },
  liBbuttonText: {
    color: 'white', fontSize: hp(1.4),
    fontFamily: 'Nunito-Bold', textAlign: 'center',
  },
});

export default Dashboard;