import {
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import useStore from "../../store";

const NotificationScreen = () => {
  const navigation = useNavigation();
  const { notifications, fetchNotifications, deleteNotification } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        await fetchNotifications();
      } catch (e) {
        console.error("Fetch notifications error:", e.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ✅ Safe defaults — prevent crash if notifications is undefined or missing keys
  const todays     = notifications?.todays     ?? [];
  const yesturdays = notifications?.yesturdays ?? [];
  const olders     = notifications?.olders     ?? [];
  const isEmpty    = todays.length === 0 && yesturdays.length === 0 && olders.length === 0;

  const NotificationItem = ({ id, title, time, description }) => (
    <View style={styles.notificationItem}>
      <View style={styles.iconContainer}>
        <Ionicons name="document-text-outline" size={24} color="#14BA9C" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{title || "Notification"}</Text>
        {!!description && (
          <Text style={styles.notificationDescription}>{description}</Text>
        )}
        <View style={styles.notificationFooter}>
          <Text style={styles.notificationTime}>{time || ""}</Text>
          <TouchableOpacity onPress={() => deleteNotification(id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const Section = ({ title, data }) => {
    if (!data || data.length === 0) return null;
    return (
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {data.map((n) => (
          <NotificationItem
            key={n.id || n._id}
            id={n.id || n._id}
            title={n.message || n.title}
            time={n.time_ago || n.time}
            description={n.description || ""}
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
        resizeMode="stretch"
      >
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={25} />
            </Pressable>
            <Text style={styles.headerText}>Notifications</Text>
          </View>
        </View>

        <View style={styles.body}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#130160" style={styles.loader} />
          ) : isEmpty ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
              <Text style={styles.noNotifications}>No notifications yet</Text>
            </View>
          ) : (
            <>
              <Section title="Today" data={todays} />
              <Section title="Yesterday" data={yesturdays} />
              <Section title="Older" data={olders} />
            </>
          )}
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

export default NotificationScreen;

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
    gap: 6,
  },
  headerText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(3),
    color: "#0D0140",
  },
  body: {
    marginVertical: hp(2),
    paddingBottom: hp(4),
  },
  loader: {
    marginTop: hp(10),
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: hp(12),
  },
  noNotifications: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(2),
    color: "#8E8E93",
    marginTop: hp(2),
  },
  sectionTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.3),
    color: "#0D0140",
    marginLeft: wp(5),
    marginTop: hp(2),
    marginBottom: hp(0.5),
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: wp(5),
    marginVertical: hp(0.8),
    borderRadius: 10,
    padding: "4%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontFamily: "Nunito-SemiBold",
    color: "#000000",
    marginBottom: 2,
  },
  notificationDescription: {
    fontSize: 13,
    fontFamily: "Nunito-Regular",
    color: "#8E8E93",
    marginBottom: 4,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  notificationTime: {
    fontSize: 13,
    fontFamily: "Nunito-Regular",
    color: "#8E8E93",
  },
  deleteText: {
    fontSize: 13,
    fontFamily: "Nunito-SemiBold",
    color: "#FF3B30",
  },
});