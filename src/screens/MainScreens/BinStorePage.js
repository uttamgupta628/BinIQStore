import {
  Image, Linking, Pressable,
  ScrollView, Share, StatusBar, StyleSheet, Text,
  TouchableOpacity, View, ActivityIndicator,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LocationIcon from '../../../assets/LocationIcon.svg';
import FacebookIcon from '../../../assets/FacebookIcon.svg';
import TwitterIcon from '../../../assets/TwitterIcon.svg';
import WhatsappIcon from '../../../assets/WhatsappIcon.svg';
import LinkedinIcon from '../../../assets/LinkedinIcon.svg';
import HiddenFindsImg from '../../../assets/hidden_find_img.svg';
import BoldTick from '../../../assets/bold_tick.svg';
import GreenTick from '../../../assets/green_tick.svg';
import Heart_Icon from '../../../assets/heart_icon.svg';
import Share_Icon from '../../../assets/share_icon.svg';
import useStore from '../../store';

const PLACEHOLDER = require('../../../assets/gray_img.png');

// ── Build shareable store message ────────────────────────────────
const buildShareMessage = (store) => {
  const name    = store?.store_name   || 'our store';
  const address = store?.address      || '';
  const website = store?.website_url  || store?.store_email || '';
  const phone   = store?.phone_number || '';
  const hours   = store?.working_days && store?.working_time
    ? `\n⏰ ${store.working_days} · ${store.working_time}` : '';
  return (
    `🏪 ${name}\n` +
    (address ? `📍 ${address}\n` : '') +
    (phone   ? `📞 ${phone}\n`   : '') +
    hours +
    (website ? `\n🌐 ${website}` : '')
  ).trim();
};

// ── Native share sheet ───────────────────────────────────────────
const openNativeShare = async (store) => {
  try {
    const result = await Share.share({
      message: buildShareMessage(store),
      title: store?.store_name || 'Store Info',
    });
    console.log('Native share result:', result);
  } catch (e) {
    console.warn('Native share error:', e.message);
  }
};

// ── WhatsApp ─────────────────────────────────────────────────────
const shareOnWhatsApp = async (store) => {
  try {
    const msg = encodeURIComponent(buildShareMessage(store));
    // Use stored whatsapp number if available, else generic share
    if (store?.whatsapp_link && store.whatsapp_link !== 'null') {
      const phone = store.whatsapp_link.replace(/\D/g, '');
      const url = `https://wa.me/${phone}?text=${msg}`;
      console.log('Opening WhatsApp with number:', url);
      await Linking.openURL(url);
    } else {
      const url = `https://wa.me/?text=${msg}`;
      console.log('Opening WhatsApp generic:', url);
      await Linking.openURL(url);
    }
  } catch (e) {
    console.warn('WhatsApp error:', e.message);
    await openNativeShare(store);
  }
};

// ── Facebook ─────────────────────────────────────────────────────
const shareOnFacebook = async (store) => {
  try {
    // If a Facebook page URL is stored, open it; else native share
    if (store?.facebook_link &&
        store.facebook_link !== 'null' &&
        store.facebook_link.startsWith('http')) {
      await Linking.openURL(store.facebook_link);
    } else {
      await openNativeShare(store);
    }
  } catch (e) {
    console.warn('Facebook error:', e.message);
    await openNativeShare(store);
  }
};

// ── Twitter / X ──────────────────────────────────────────────────
const shareOnTwitter = async (store) => {
  try {
    const msg = encodeURIComponent(buildShareMessage(store));
    // If a Twitter profile URL is stored, open it; else tweet composer
    if (store?.twitter_link &&
        store.twitter_link !== 'null' &&
        store.twitter_link.startsWith('http')) {
      await Linking.openURL(store.twitter_link);
    } else {
      const url = `https://twitter.com/intent/tweet?text=${msg}`;
      console.log('Opening Twitter:', url);
      await Linking.openURL(url);
    }
  } catch (e) {
    console.warn('Twitter error:', e.message);
    await openNativeShare(store);
  }
};

// ── LinkedIn ─────────────────────────────────────────────────────
const shareOnLinkedIn = async (store) => {
  try {
    const msg = encodeURIComponent(buildShareMessage(store));
    const url = `https://www.linkedin.com/sharing/share-offsite/?summary=${msg}`;
    console.log('Opening LinkedIn:', url);
    await Linking.openURL(url);
  } catch (e) {
    console.warn('LinkedIn error:', e.message);
    await openNativeShare(store);
  }
};

const formatCount = (n) => {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
};

const BinStorePage = () => {
  const navigation = useNavigation();
  const { fetchStoreDetails, fetchTrendingProducts, fetchPromotions } = useStore();
  const store = useStore((state) => state.store);

  const [trendingProducts, setTrendingProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favouritePress, setFavouritePressed] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchStoreDetails(),
          fetchTrendingProducts().then(setTrendingProducts),
          fetchPromotions().then(setPromotions),
        ]);
      } catch (e) {
        console.error('BinStorePage load error:', e.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const renderStars = (rating = 0) => {
    return [1, 2, 3, 4, 5].map((i) => (
      <FontAwesome
        key={i}
        name="star"
        color={i <= Math.round(rating) ? '#FFD700' : '#e6e6e6'}
        size={16}
      />
    ));
  };

  const renderTrendingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.trendingCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('SinglePageItem', {
        productId: item.id,
        section: 'Trending',
        data: trendingProducts,
      })}
    >
      <Image
        source={item.image || PLACEHOLDER}
        style={styles.trendingImage}
        resizeMode="cover"
      />
      <View style={{ paddingHorizontal: '3%' }}>
        <Text style={styles.trendingDescription} numberOfLines={2}>
          {item.title || item.description || 'Product'}
        </Text>
      </View>
      <View style={styles.trendingPriceContainer}>
        <Text style={styles.trendingPrice}>{item.discountPrice || item.price || ''}</Text>
        {item.originalPrice ? (
          <Text style={styles.trendingOriginalPrice}>{item.originalPrice}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderPromotionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.promotionCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('PromotionScreen', {
        section: 'Promotions',
        data: promotions,
      })}
    >
      <Image
        source={item.image || PLACEHOLDER}
        style={styles.promotionImage}
        resizeMode="cover"
      />
      <View style={styles.promotionInfo}>
        <Text style={styles.promotionTitle} numberOfLines={1}>
          {item.title || 'Promotion'}
        </Text>
        <Text style={styles.promotionStatus}>Active</Text>
        {item.dateRange ? (
          <Text style={styles.promotionDate}>{item.dateRange}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <View style={styles.imgBg}>
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#768190" size={25} />
            </Pressable>
            <Text style={styles.headerText}>{store?.store_name || 'Hidden Finds'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(3) }}>
            <Pressable onPress={() => setFavouritePressed(!favouritePress)}>
              <Heart_Icon height={hp(4)} fill={favouritePress ? '#EE2525' : 'none'} pointerEvents="none" />
            </Pressable>
            <Pressable onPress={() => openNativeShare(store)}>
              <Share_Icon height={hp(4)} pointerEvents="none" />
            </Pressable>
          </View>
        </View>

        <View style={styles.heroContent}>
          {/* Left: Store image */}
          <View style={styles.heroLeft}>
            {store?.store_image ? (
              <Image
                source={{ uri: store.store_image }}
                style={styles.storeHeroImage}
                resizeMode="cover"
              />
            ) : (
              <HiddenFindsImg width="95%" pointerEvents="none" />
            )}
          </View>

          {/* Right: Stats */}
          <View style={styles.heroRight}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroStoreName} numberOfLines={1}>
                {store?.store_name || 'Hidden Finds'}
              </Text>
              <BoldTick width={20} pointerEvents="none" />
            </View>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>{formatCount(store?.followers)}</Text>
                <Text style={styles.heroStatLabel}>Followers</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>{formatCount(store?.likes)}</Text>
                <Text style={styles.heroStatLabel}>Likes</Text>
              </View>
            </View>

            <Text style={styles.heroWebsite} numberOfLines={1}>
              {store?.website_url || store?.store_email || 'www.hiddenfinds.com'}
            </Text>

            <TouchableOpacity style={styles.followBtn} activeOpacity={0.7}>
              <Text style={styles.followBtnText}>Follow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Check In / Verify ───────────────────────────────────── */}
      <View style={styles.actionRow}>
        <View style={styles.nearestStore}>
          <LocationIcon pointerEvents="none" />
          <Text style={styles.actionText}>Check In</Text>
        </View>
        <View style={styles.nearestStoreBtn2}>
          <GreenTick pointerEvents="none" />
          <Text style={styles.actionText}>Verify My Bin</Text>
        </View>
      </View>

      {/* ── Store Name + Rating ─────────────────────────────────── */}
      <View style={styles.contentHeader}>
        <View style={{ width: '50%' }}>
          <Text style={styles.storeTitleText}>
            {store?.store_name?.toUpperCase() || 'HIDDEN FINDS'}
          </Text>
        </View>
        <View style={styles.review}>
          {renderStars(store?.ratings || 0)}
          <Text style={styles.reviewCount}> {store?.rating_count || 0}</Text>
        </View>
      </View>

      {/* ── Store Details ───────────────────────────────────────── */}
      <View style={styles.contentDetails}>
        <Text style={styles.detailText}>Address: {store?.address || '—'}</Text>
        <Text style={styles.detailText}>Phone: {store?.phone_number || '—'}</Text>
        <Text style={styles.detailText}>Email: {store?.store_email || '—'}</Text>
        {store?.working_days ? (
          <Text style={styles.detailText}>
            Hours: {store.working_days} · {store.working_time}
          </Text>
        ) : null}

        {/* ── Social Share Icons ───────────────────────────────── */}
        <View style={styles.socialRow}>
          <Text style={styles.detailText}>Share via</Text>
          <View style={styles.socialMediaIcons}>

            {/* Facebook */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => shareOnFacebook(store)}
              style={styles.socialIconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FacebookIcon width={30} height={30} pointerEvents="none" />
            </TouchableOpacity>

            {/* Twitter / X */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => shareOnTwitter(store)}
              style={styles.socialIconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <TwitterIcon width={30} height={30} pointerEvents="none" />
            </TouchableOpacity>

            {/* WhatsApp */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => shareOnWhatsApp(store)}
              style={styles.socialIconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <WhatsappIcon width={30} height={30} pointerEvents="none" />
            </TouchableOpacity>

            {/* LinkedIn */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => shareOnLinkedIn(store)}
              style={styles.socialIconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <LinkedinIcon width={30} height={30} pointerEvents="none" />
            </TouchableOpacity>

          </View>
        </View>

        <Text style={styles.detailText}>Daily Rates: $10, $8, $6, $4, $2, $1</Text>
      </View>

      {/* ── Trending Products ───────────────────────────────────── */}
      {trendingProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Products</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AllProductsScreen', {
                section: 'Trending Products',
                data: trendingProducts,
              })}
            >
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trendingProducts.slice(0, 7).map((item, i) => (
              <View key={item.id || i}>{renderTrendingItem({ item })}</View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Promotions ──────────────────────────────────────────── */}
      {promotions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PROMOTIONS</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {promotions.slice(0, 7).map((item, i) => (
              <View key={item.id || i}>{renderPromotionItem({ item })}</View>
            ))}
          </ScrollView>
        </View>
      )}

      {isLoading && (
        <View style={{ alignItems: 'center', paddingVertical: hp(3) }}>
          <ActivityIndicator size="large" color="#130160" />
        </View>
      )}

      <View style={{ height: hp(5) }} />
    </ScrollView>
  );
};

export default BinStorePage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  imgBg: {
    width: '100%', height: hp(41),
    borderBottomEndRadius: 20, borderBottomLeftRadius: 20,
    backgroundColor: '#130160',
  },
  header: {
    width: wp(100), height: hp(7), marginTop: '10%',
    paddingHorizontal: '5%', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  headerChild: { flexDirection: 'row', alignItems: 'center' },
  headerText: { fontFamily: 'Nunito-Bold', fontSize: hp(3), color: '#C4C4C4', marginLeft: 4 },

  heroContent: {
    width: '95%', alignSelf: 'center', height: hp(23),
    flexDirection: 'row', marginTop: '5%',
  },
  heroLeft: { width: '45%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  storeHeroImage: { width: '90%', height: '90%', borderRadius: 12 },
  heroRight: { width: '55%', paddingLeft: '2%', justifyContent: 'center' },

  heroNameRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingRight: '7%', marginBottom: '4%',
  },
  heroStoreName: { fontFamily: 'Roboto-SemiBold', color: '#fff', fontSize: hp(2.8), flex: 1 },

  heroStatsRow: { flexDirection: 'row', marginBottom: '4%' },
  heroStat: { width: '50%' },
  heroStatNumber: { fontFamily: 'Roboto-ExtraBold', color: '#fff', fontSize: hp(3.2) },
  heroStatLabel: { fontFamily: 'Roboto-Regular', color: '#fff', fontSize: hp(1.8) },

  heroWebsite: { fontFamily: 'Roboto-Thin', color: '#F8F8F8', fontSize: hp(1.9), marginBottom: '4%' },

  followBtn: {
    width: '85%', paddingVertical: hp(0.8),
    backgroundColor: '#fff', borderRadius: 7,
    borderWidth: 2, borderColor: '#14BA9C',
    justifyContent: 'center', alignItems: 'center',
  },
  followBtnText: { color: '#14BA9C', fontSize: hp(2.3), fontFamily: 'DMSans-SemiBold' },

  actionRow: {
    width: '90%', marginTop: '5%', height: hp(7),
    alignSelf: 'center', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  nearestStore: {
    width: '48%', borderWidth: 0.8, borderColor: 'red', height: '90%',
    borderRadius: 7, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: '9%',
  },
  nearestStoreBtn2: {
    width: '48%', borderWidth: 0.8, borderColor: '#00B813', height: '90%',
    borderRadius: 7, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: '5%',
  },
  actionText: { fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.9) },

  contentHeader: {
    width: '90%', marginHorizontal: '5%', marginTop: '7%',
    marginBottom: '2%', flexDirection: 'row', alignItems: 'center',
  },
  storeTitleText: { fontFamily: 'Nunito-Bold', color: '#000', fontSize: hp(2.4) },
  review: { width: '50%', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  reviewCount: { fontFamily: 'Nunito-SemiBold', color: '#828282', fontSize: hp(2) },

  contentDetails: { width: '90%', marginHorizontal: '5%', marginBottom: '3%' },
  detailText: { color: '#000', fontFamily: 'Nunito-SemiBold', fontSize: hp(1.8), marginVertical: '1%' },

  socialRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginVertical: '1%',
  },
  socialMediaIcons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  socialIconBtn: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  section: { marginTop: '5%', paddingHorizontal: '5%' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: '3%' },
  sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: hp(2.3), color: '#000' },
  viewAll: { color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline' },

  trendingCard: {
    width: wp(45), height: hp(26), borderRadius: 5,
    borderWidth: 0.5, borderColor: '#e6e6e6', marginRight: wp(2),
  },
  trendingImage: { width: wp(45), height: hp(13), borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  trendingDescription: { fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.7), marginTop: '3%' },
  trendingPriceContainer: { position: 'absolute', bottom: '4%', paddingHorizontal: '3%' },
  trendingPrice: { fontFamily: 'Nunito-Bold', color: '#000', fontSize: hp(1.8) },
  trendingOriginalPrice: {
    fontFamily: 'Nunito-Bold', color: '#808488',
    fontSize: hp(1.6), textDecorationLine: 'line-through',
  },

  promotionCard: {
    width: wp(33), height: hp(22), borderRadius: 10,
    elevation: 3, backgroundColor: '#fff', marginRight: wp(2),
  },
  promotionImage: { width: '100%', height: hp(12), borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  promotionInfo: { padding: '6%' },
  promotionTitle: { fontFamily: 'DMSans-Bold', color: '#000', fontSize: hp(1.4) },
  promotionStatus: { fontFamily: 'Nunito-Bold', color: '#14BA9C', fontSize: hp(1.5), marginTop: '3%' },
  promotionDate: { fontFamily: 'Nunito-SemiBold', color: '#999', fontSize: hp(1.2), marginTop: '2%' },
});