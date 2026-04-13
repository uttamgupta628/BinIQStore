import React, {useCallback} from 'react';
import {
  View, Text, StyleSheet, Pressable,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useStore from '../../store';

const formatExpiry = dateStr => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date)) return null;
  return date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'});
};

const getDaysRemaining = dateStr => {
  if (!dateStr) return null;
  const expiry = new Date(dateStr);
  const today  = new Date();
  expiry.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

const getTotalDays = dateStr => {
  if (!dateStr) return 365;
  const expiry = new Date(dateStr);
  const start  = new Date(expiry);
  start.setFullYear(start.getFullYear() - 1);
  const total = Math.ceil((expiry - start) / (1000 * 60 * 60 * 24));
  return total > 0 ? total : 365;
};

const Dashboard4 = () => {
  const navigation       = useNavigation();
  const user             = useStore(state => state.user);
  const fetchUserProfile = useStore(state => state.fetchUserProfile);

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, []),
  );

  const isVerified =
    user?.verified === true ||
    user?.status   === 'approved' ||
    (user?.subscription?.status === 'completed' &&
      user?.subscription_end_time &&
      new Date(user.subscription_end_time) > new Date());

  const sub        = user?.subscription;
  const expiryDate = user?.subscription_end_time;
  const expiryStr  = formatExpiry(expiryDate);
  const daysLeft   = getDaysRemaining(expiryDate);
  const totalDays  = getTotalDays(expiryDate);

  const isExpired      = daysLeft !== null && daysLeft < 0;
  const isExpiringSoon = !isExpired && daysLeft !== null && daysLeft <= 7;

  const bannerColor = isExpired ? '#FF4444' : isExpiringSoon ? '#E8A020' : '#14BA9C';
  const iconName    = isExpired
    ? 'close-circle-outline'
    : isExpiringSoon
    ? 'warning-outline'
    : 'checkmark-circle-outline';

  const progressPercent = !isExpired && daysLeft !== null
    ? Math.min(100, Math.max(0, (daysLeft / totalDays) * 100))
    : 0;

  const billingLabel = sub?.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly';
  const amountLabel  = sub?.amount ? `$${(sub.amount / 1).toLocaleString()}` : '$1,997';
  const orderLabel   = sub?.order_id || '—';

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Welcome, <Text style={styles.name}>{user?.full_name || 'User'}</Text>
        </Text>
        <Text style={styles.subtext}>Your verification & plan details</Text>
      </View>

      {isVerified ? (
        <>
          {/* ── Status Card ── */}
          <View style={[styles.statusCard, {borderColor: bannerColor}]}>
            <View style={styles.statusCardTop}>
              <View style={[styles.iconBadge, {backgroundColor: bannerColor + '18'}]}>
                <Ionicons name={iconName} size={18} color={bannerColor} />
              </View>
              <View style={{flex: 1, marginLeft: 10}}>
                <Text style={[styles.statusTitle, {color: bannerColor}]}>
                  {isExpired
                    ? 'Verification Expired'
                    : isExpiringSoon
                    ? 'Expiring Soon'
                    : '✓ Verified — Active'}
                </Text>
                <Text style={styles.statusSub}>Annual Verification Plan</Text>
              </View>
              {!isExpired && (
                <View style={[styles.pill, {backgroundColor: bannerColor + '18', borderColor: bannerColor}]}>
                  <Text style={[styles.pillText, {color: bannerColor}]}>
                    {isExpiringSoon ? 'Expiring' : 'Active'}
                  </Text>
                </View>
              )}
            </View>

            {/* Progress bar */}
            {!isExpired && daysLeft !== null && (
              <View style={styles.progressWrapper}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabel}>Validity</Text>
                  <Text style={[styles.progressPct, {color: bannerColor}]}>
                    {Math.round(progressPercent)}%
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, {
                    width: `${progressPercent}%`,
                    backgroundColor: bannerColor,
                  }]} />
                </View>
                <Text style={styles.progressSub}>
                  {daysLeft} of {totalDays} days remaining
                </Text>
              </View>
            )}
          </View>

          {/* ── Plan Details Grid ── */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Plan Details</Text>
            <View style={styles.grid}>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Order ID</Text>
                <Text style={styles.gridValue} numberOfLines={1}>{orderLabel}</Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Billing</Text>
                <Text style={styles.gridValue}>{billingLabel}</Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Amount Paid</Text>
                <Text style={styles.gridValue}>{amountLabel}</Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Renewal Date</Text>
                <Text style={styles.gridValue}>{expiryStr || '—'}</Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Days Left</Text>
                <Text style={[styles.gridValue, {
                  color: isExpired ? '#FF4444' : isExpiringSoon ? '#E8A020' : '#130160',
                }]}>
                  {isExpired
                    ? 'Expired'
                    : daysLeft !== null
                    ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                    : '—'}
                </Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Duration</Text>
                <Text style={styles.gridValue}>365 days</Text>
              </View>

            </View>
          </View>

          {/* ── Renew CTA ── */}
          {(isExpired || isExpiringSoon) && (
            <Pressable
              style={[styles.renewBtn, {backgroundColor: bannerColor}]}
              onPress={() => navigation.navigate('GetVerified')}>
              <Text style={styles.renewBtnText}>
                {isExpired ? '🔄 Renew Verification' : "⚡ Renew Early — Don't Lose Your Badge"}
              </Text>
            </Pressable>
          )}
        </>
      ) : (
        /* ── Not Verified ── */
        <View style={styles.notVerifiedCard}>
          <Ionicons name="shield-outline" size={44} color="#C4C4C4" />
          <Text style={styles.notVerifiedTitle}>Not Verified</Text>
          <Text style={styles.notVerifiedSub}>
            Get verified to unlock your store badge, priority placement, and promotional tools.
          </Text>
          <Pressable
            style={styles.getVerifiedBtn}
            onPress={() => navigation.navigate('GetVerified')}>
            <Text style={styles.getVerifiedBtnText}>🏆 Get Verified Now</Text>
          </Pressable>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingVertical: 0},
  header:    {marginBottom: 12},
  greeting:  {fontSize: hp(2.4), fontFamily: 'Nunito-Bold', color: '#000'},
  name:      {color: '#000', fontFamily: 'Nunito-Bold', textDecorationLine: 'underline'},
  subtext:   {fontSize: wp(3.5), color: '#666', fontFamily: 'Nunito-Regular', marginTop: 2},

  // Status card
  statusCard: {
    borderWidth: 1.5, borderRadius: 14, padding: 14, marginBottom: 10,
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 4,
  },
  statusCardTop: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  iconBadge:     {width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center'},
  statusTitle:   {fontFamily: 'Nunito-Bold', fontSize: hp(1.9)},
  statusSub:     {fontFamily: 'Nunito-Regular', fontSize: hp(1.45), color: '#888', marginTop: 1},
  pill:          {borderWidth: 1, borderRadius: 20, paddingHorizontal: wp(2.5), paddingVertical: hp(0.3)},
  pillText:      {fontFamily: 'Nunito-Bold', fontSize: hp(1.35)},

  // Progress
  progressWrapper:  {marginTop: 2},
  progressLabelRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5},
  progressLabel:    {fontFamily: 'Nunito-SemiBold', fontSize: hp(1.4), color: '#555'},
  progressPct:      {fontFamily: 'Nunito-Bold', fontSize: hp(1.4)},
  progressTrack:    {height: 7, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden'},
  progressFill:     {height: '100%', borderRadius: 4},
  progressSub:      {fontFamily: 'Nunito-Regular', fontSize: hp(1.3), color: '#aaa', marginTop: 3},

  // Details card
  detailsCard: {
    borderRadius: 14, padding: 14, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    marginBottom: 10,
  },
  detailsTitle: {fontFamily: 'Nunito-Bold', fontSize: hp(1.8), color: '#130160', marginBottom: 10},
  grid:         {flexDirection: 'row', flexWrap: 'wrap'},
  gridItem:     {width: '50%', paddingVertical: 5, paddingRight: 8},
  gridLabel:    {fontFamily: 'Nunito-Regular', fontSize: hp(1.4), color: '#999'},
  gridValue:    {fontFamily: 'Nunito-Bold', fontSize: hp(1.75), color: '#130160', marginTop: 2},

  // Renew button
  renewBtn:     {borderRadius: 9, paddingVertical: hp(1.1), alignItems: 'center'},
  renewBtnText: {fontFamily: 'Nunito-Bold', fontSize: hp(1.8), color: '#fff'},

  // Not verified
  notVerifiedCard: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F8F8F8', borderRadius: 16, padding: 24,
  },
  notVerifiedTitle:   {fontFamily: 'Nunito-Bold', fontSize: hp(2.4), color: '#333', marginTop: hp(1.5)},
  notVerifiedSub:     {fontFamily: 'Nunito-Regular', fontSize: hp(1.7), color: '#888', textAlign: 'center', marginTop: hp(1), lineHeight: hp(2.6)},
  getVerifiedBtn:     {marginTop: hp(2.5), backgroundColor: '#130160', paddingHorizontal: wp(8), paddingVertical: hp(1.3), borderRadius: 10},
  getVerifiedBtnText: {fontFamily: 'Nunito-Bold', fontSize: hp(1.9), color: '#fff'},
});

export default Dashboard4;