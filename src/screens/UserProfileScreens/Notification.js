import {
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import React, {useState, useCallback} from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import useStore from '../../store';

const NotificationScreen = () => {
  const navigation = useNavigation();

  const notifications        = useStore(state => state.notifications);
  const fetchNotifications   = useStore(state => state.fetchNotifications);
  const markNotificationRead = useStore(state => state.markNotificationRead);

  const [isLoading,  setIsLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch on focus ─────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, []),
  );

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      await fetchNotifications();
    } catch (e) {
      console.error('Fetch notifications error:', e.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  // ── Mark as read ───────────────────────────────────────────────────────────
  const handleMarkAsRead = async (notification) => {
    if (notification.read) return;
    try {
      await markNotificationRead(notification._id);
      // Re-fetch to update state
      await fetchNotifications();
    } catch (e) {
      console.error('Mark as read error:', e.message);
    }
  };

  // ── Mark all as read ───────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    const unread = notifList.filter(n => !n.read);
    if (!unread.length) return;
    try {
      await Promise.all(unread.map(n => markNotificationRead(n._id)));
      await fetchNotifications();
    } catch (e) {
      console.error('Mark all read error:', e.message);
    }
  };

  // ── Normalize notifications from store ────────────────────────────────────
  // store.notifications could be array or object with todays/yesturdays/olders
  const notifList = (() => {
    if (!notifications) return [];
    if (Array.isArray(notifications)) return notifications;
    const {todays = [], yesturdays = [], olders = []} = notifications;
    return [...todays, ...yesturdays, ...olders];
  })();

  // Sort newest first
  const sorted = [...notifList].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
  );

  // Group into Today / Yesterday / Older
  const groupNotifications = (list) => {
    const today     = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const todays     = [];
    const yesturdays = [];
    const olders     = [];

    list.forEach(n => {
      const date = new Date(n.created_at || 0);
      if (date.toDateString() === today.toDateString()) {
        todays.push(n);
      } else if (date.toDateString() === yesterday.toDateString()) {
        yesturdays.push(n);
      } else {
        olders.push(n);
      }
    });

    return {todays, yesturdays, olders};
  };

  const {todays, yesturdays, olders} = groupNotifications(sorted);
  const isEmpty    = sorted.length === 0;
  const unreadCount = sorted.filter(n => !n.read).length;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatTime = (time) => {
    if (!time) return 'Just now';
    try {
      const date    = new Date(time);
      const now     = new Date();
      const diffMin = Math.floor((now - date) / 60000);

      if (diffMin < 1)  return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;

      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;

      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Recently';
    }
  };

  const getIconAndColor = (notification) => {
    switch (notification.type) {
      case 'store_owner':
        return {icon: 'storefront-outline',       color: '#14BA9C'};
      case 'reseller':
        return {icon: 'person-outline',           color: '#0049AF'};
      case 'subscription':
        return {icon: 'checkmark-circle-outline', color: '#14BA9C'};
      case 'promotion':
        return {icon: 'pricetag-outline',         color: '#FFBB36'};
      case 'warning':
        return {icon: 'warning-outline',          color: '#FF9F40'};
      case 'verification':
        return {icon: 'shield-checkmark-outline', color: '#130160'};
      default:
        return {icon: 'notifications-outline',    color: '#130160'};
    }
  };

  // ── Notification Item ──────────────────────────────────────────────────────
  const NotificationItem = ({notification}) => {
    const {icon, color} = getIconAndColor(notification);
    const isUnread = !notification.read;

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          isUnread && styles.notificationItemUnread,
        ]}
        onPress={() => handleMarkAsRead(notification)}
        activeOpacity={0.7}>

        <View style={[styles.iconContainer, {backgroundColor: color + '20'}]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {notification.heading || notification.title || 'Notification'}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.notificationDescription} numberOfLines={2}>
            {notification.content || notification.description || ''}
          </Text>

          <View style={styles.notificationFooter}>
            <Text style={styles.notificationTime}>
              {formatTime(notification.created_at || notification.time)}
            </Text>
            {isUnread && (
              <TouchableOpacity onPress={() => handleMarkAsRead(notification)}>
                <Text style={styles.markReadText}>Mark read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Section ────────────────────────────────────────────────────────────────
  const Section = ({title, data}) => {
    if (!data || data.length === 0) return null;
    return (
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {data.map(n => (
          <NotificationItem key={n._id || n.id} notification={n} />
        ))}
      </View>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#130160']}
        />
      }>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
        resizeMode="stretch">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={25} />
            </Pressable>
            <Text style={styles.headerText}>Notifications</Text>
          </View>

          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
                <TouchableOpacity onPress={handleMarkAllRead}>
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {isLoading ? (
            <ActivityIndicator
              size="large" color="#130160" style={styles.loader}
            />
          ) : isEmpty ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
              <Text style={styles.noNotifications}>No notifications yet</Text>
              <Text style={styles.noNotificationsSub}>
                You're all caught up! New notifications will appear here.
              </Text>
            </View>
          ) : (
            <>
              <Section title="Today"     data={todays}     />
              <Section title="Yesterday" data={yesturdays} />
              <Section title="Older"     data={olders}     />
            </>
          )}
        </View>

        <View style={{height: hp(10)}} />
      </ImageBackground>
    </ScrollView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container:   {flex: 1, backgroundColor: '#E6F3F5'},
  vector:      {flex: 1, width: wp(100), minHeight: hp(100)},

  // Header
  header: {
    width: wp(100), height: hp(7),
    marginTop: '10%', paddingHorizontal: '5%',
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerChild: {flexDirection: 'row', alignItems: 'center', gap: 6},
  headerRight: {flexDirection: 'row', alignItems: 'center', gap: 8},
  headerText:  {fontFamily: 'Nunito-Bold', fontSize: hp(3), color: '#0D0140'},

  badge: {
    backgroundColor: '#FF3B30', borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 3,
    minWidth: 24, alignItems: 'center',
  },
  badgeText:    {color: '#fff', fontSize: 12, fontFamily: 'Nunito-Bold'},
  markAllText:  {
    fontSize: hp(1.5), color: '#130160',
    fontFamily: 'Nunito-SemiBold', textDecorationLine: 'underline',
  },

  body:   {marginVertical: hp(2), paddingBottom: hp(4)},
  loader: {marginTop: hp(10)},

  // Empty
  emptyContainer: {alignItems: 'center', marginTop: hp(12), paddingHorizontal: wp(10)},
  noNotifications: {
    fontFamily: 'Nunito-Bold', fontSize: hp(2.2),
    color: '#666', marginTop: hp(2),
  },
  noNotificationsSub: {
    fontFamily: 'Nunito-Regular', fontSize: hp(1.8),
    color: '#999', marginTop: hp(1), textAlign: 'center',
  },

  // Section title
  sectionTitle: {
    fontFamily: 'Nunito-Bold', fontSize: hp(2.1),
    color: '#0D0140', marginLeft: wp(5),
    marginTop: hp(2), marginBottom: hp(0.5),
  },

  // Notification card
  notificationItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: wp(5), marginVertical: hp(0.8),
    borderRadius: 12, padding: '4%',
    shadowColor: '#000', shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  notificationItemUnread: {
    backgroundColor: '#F0F6FF',
    borderLeftWidth: 4, borderLeftColor: '#130160',
  },
  iconContainer: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  notificationContent: {flex: 1},
  notificationHeader:  {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 3,
  },
  notificationTitle: {
    fontSize: hp(1.9), fontFamily: 'Nunito-SemiBold',
    color: '#000', flex: 1,
  },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#130160', marginLeft: 8,
  },
  notificationDescription: {
    fontSize: hp(1.6), color: '#666',
    fontFamily: 'Nunito-Regular', lineHeight: hp(2.4), marginBottom: 4,
  },
  notificationFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  notificationTime: {
    fontSize: hp(1.4), color: '#9A9A9A', fontFamily: 'Nunito-Regular',
  },
  markReadText: {
    fontSize: hp(1.4), color: '#130160', fontFamily: 'Nunito-SemiBold',
  },
});