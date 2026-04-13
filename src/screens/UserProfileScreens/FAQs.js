import {
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

const BASE_URL = "https://biniq.onrender.com/api";

const Notifications = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState({
    todays: [],
    yesterdays: [],
    olders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${BASE_URL}/notification`);
        const data = await response.json();
        if (data.success) {
          setNotifications({
            todays: data.todays || [],
            yesterdays: data.yesterdays || [],
            olders: data.olders || [],
          });
        } else {
          Alert.alert("Error", "Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Notification fetch error:", error);
        Alert.alert("Error", "Network issue or server error");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Fix: delete works across ALL sections, not just olders
  const deleteNotification = (id) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setNotifications((prev) => ({
              todays: prev.todays.filter((item) => item.id !== id),
              yesterdays: prev.yesterdays.filter((item) => item.id !== id),
              olders: prev.olders.filter((item) => item.id !== id),
            }));
          },
        },
      ]
    );
  };

  const hasNoNotifications =
    notifications.todays.length === 0 &&
    notifications.yesterdays.length === 0 &&
    notifications.olders.length === 0;

  const NotificationItem = ({ id, title, time, description }) => (
    <View style={styles.notificationItem}>
      <View style={styles.iconContainer}>
        <Ionicons name="notifications-outline" size={22} color="#130160" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle} numberOfLines={2}>
          {title || "Notification"}
        </Text>
        {!!description && (
          <Text style={styles.notificationDescription} numberOfLines={2}>
            {description}
          </Text>
        )}
        <View style={styles.notificationFooter}>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={13} color="#8E8E93" />
            <Text style={styles.notificationTime}> {time || "Just now"}</Text>
          </View>
          <TouchableOpacity
            onPress={() => deleteNotification(id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <View style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={13} color="#FF3B30" />
              <Text style={styles.deleteText}> Delete</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const Section = ({ title, data }) => {
    if (!data || data.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionDot} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {data.map((item) => (
          <NotificationItem
            key={item.id}
            id={item.id}
            title={item.message}
            time={item.time_ago}
            description={item.description || ""}
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}>
      <StatusBar translucent={true} backgroundColor={"transparent"} />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
        resizeMode="stretch">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back-ios" color={"#0D0D26"} size={22} />
            </Pressable>
            <Text style={styles.headerText}>Notifications</Text>
          </View>
          {!loading && !hasNoNotifications && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Clear All", "Delete all notifications?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Clear All",
                    style: "destructive",
                    onPress: () =>
                      setNotifications({ todays: [], yesterdays: [], olders: [] }),
                  },
                ])
              }>
              <Text style={styles.clearAll}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Body */}
        <View style={styles.body}>
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#130160" />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : hasNoNotifications ? (
            <View style={styles.centered}>
              <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
              <Text style={styles.noNotifications}>No notifications yet</Text>
              <Text style={styles.noNotificationsSub}>
                You're all caught up! Check back later.
              </Text>
            </View>
          ) : (
            <>
              <Section title="Today" data={notifications.todays} />
              <Section title="Yesterday" data={notifications.yesterdays} />
              <Section title="Older" data={notifications.olders} />
            </>
          )}
        </View>

        <View style={{ height: hp(5) }} />
      </ImageBackground>
    </ScrollView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F3F5",
  },
  vector: {
    flex: 1,
    width: wp(100),
    minHeight: hp(100),
  },
  header: {
    width: wp(100),
    height: hp(7),
    marginTop: "10%",
    paddingHorizontal: "5%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerChild: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    marginRight: 6,
  },
  headerText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(3),
    color: "#0D0140",
  },
  clearAll: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.8),
    color: "#FF3B30",
  },
  body: {
    marginTop: hp(2),
    minHeight: hp(60),
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp(12),
  },
  loadingText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.9),
    color: "#8E8E93",
    marginTop: hp(1.5),
  },
  noNotifications: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.3),
    color: "#0D0140",
    marginTop: hp(2),
  },
  noNotificationsSub: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.8),
    color: "#8E8E93",
    marginTop: hp(0.5),
    textAlign: "center",
    paddingHorizontal: wp(10),
  },
  section: {
    marginBottom: hp(1),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: wp(5),
    marginBottom: hp(0.5),
    marginTop: hp(1),
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#130160",
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.1),
    color: "#0D0140",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    marginHorizontal: wp(5),
    marginVertical: hp(0.6),
    borderRadius: 14,
    padding: wp(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.9),
    color: "#0D0D26",
    marginBottom: 4,
  },
  notificationDescription: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.7),
    color: "#8E8E93",
    marginBottom: 6,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationTime: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.5),
    color: "#8E8E93",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.6),
    color: "#FF3B30",
  },
});