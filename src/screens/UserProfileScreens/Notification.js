import {
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
} from "react-native";
import React, { useEffect } from "react";
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

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const NotificationItem = ({ id, title, time, description }) => (
    <View style={styles.notificationItem}>
      <View style={styles.iconContainer}>
        <Ionicons name="document-text-outline" size={24} color="#14BA9C" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{title || "Notification"}</Text>
        <Text style={styles.notificationDescription}>
          {description || "No description available"}
        </Text>
        <View style={styles.deleteButton}>
          <Text style={styles.notificationTime}>{time || "Unknown time"}</Text>
          <TouchableOpacity onPress={() => deleteNotification(id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent={true} backgroundColor={"transparent"} />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
        resizeMode="stretch"
      >
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons
                name="arrow-back-ios"
                color={"#0D0D26"}
                size={25}
              />
            </Pressable>
            <Text style={styles.headerText}>Notification</Text>
          </View>
        </View>
        <View style={{ marginVertical: "2%" }}>
          {notifications.todays.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Today's Notifications</Text>
              {notifications.todays.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  id={notification.id}
                  title={notification.message}
                  time={notification.time_ago}
                  description=""
                />
              ))}
            </View>
          )}
          {notifications.yesturdays.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Yesterday's Notifications</Text>
              {notifications.yesturdays.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  id={notification.id}
                  title={notification.message}
                  time={notification.time_ago}
                  description=""
                />
              ))}
            </View>
          )}
          {notifications.olders.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Older Notifications</Text>
              {notifications.olders.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  id={notification.id}
                  title={notification.message}
                  time={notification.time_ago}
                  description=""
                />
              ))}
            </View>
          )}
          {notifications.todays.length === 0 &&
            notifications.yesturdays.length === 0 &&
            notifications.olders.length === 0 && (
              <Text style={styles.noNotifications}>
                No notifications available
              </Text>
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
    justifyContent: "space-between",
  },
  headerText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(3),
    textAlign: "left",
    color: "#0D0140",
  },
  sectionTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.3),
    color: "#0D0140",
    marginLeft: wp(5),
    marginVertical: hp(1),
  },
  noNotifications: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(2),
    color: "#8E8E93",
    textAlign: "center",
    marginVertical: hp(2),
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: wp(5),
    marginVertical: hp(1),
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
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 14,
    color: "#8E8E93",
  },
  notificationDescription: {
    fontSize: 14,
    color: "#8E8E93",
  },
  deleteButton: {
    paddingHorizontal: wp(1),
    paddingVertical: hp(1),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteText: {
    fontSize: 14,
    color: "#FF3B30",
  },
});
// import { ImageBackground, Pressable, StatusBar, StyleSheet, Text, View, Image, ScrollView } from 'react-native'
// import React from 'react'
// import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
// import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { TouchableOpacity } from 'react-native-gesture-handler';
// import { useNavigation } from '@react-navigation/native';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// const Notification = () => {
//     const navigation = useNavigation();
//     const notifications = [
//         { id: 1, title: 'Notification 1', description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry', time: '20 minutes ago' },
//     ];
//     const NotificationItem = ({ title, time, description }) => (
//         <View style={styles.notificationItem}>
//             <View style={styles.iconContainer}>
//                 <Ionicons name="document-text-outline" size={24} color="#14BA9C" />
//             </View>
//             <View style={styles.notificationContent}>
//                 <Text style={styles.notificationTitle}>{title}</Text>
//                 <Text style={styles.notificationDescription}>{description}</Text>
//                 <View style={styles.deleteButton}>
//             <Text style={styles.notificationTime}>{time}</Text>
//                 <Text style={styles.deleteText}>Delete</Text>
//             </View>
//             </View>
//         </View>
//     );
//     return (
//         <ScrollView style={styles.container}>
//             <StatusBar translucent={true} backgroundColor={'transparent'} />
//             <ImageBackground
//                 source={require('../../../assets/vector_1.png')}
//                 style={styles.vector}
//                 resizeMode="stretch"
//             >
//                 <View style={styles.header}>
//                     <View style={styles.headerChild}>
//                         <Pressable onPress={() => navigation.goBack()}>
//                             <MaterialIcons name='arrow-back-ios' color={'#0D0D26'} size={25} />
//                         </Pressable>
//                         <Text style={styles.headerText}>Notification</Text>
//                     </View>
//                 </View>
//                 <View style={{marginVertical: '2%'}}>
//                 {notifications.map((notification) => (
//                     <NotificationItem key={notification.id} title={notification.title} time={notification.time} description={notification.description} />
//                 ))}
//                 </View>
//             </ImageBackground>
//         </ScrollView>
//     )
// }

// export default Notification

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#E6F3F5',
//     },
//     header: {
//         width: wp(100),
//         height: hp(7),
//         marginTop: '10%',
//         paddingHorizontal: '5%',
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//     },
//     headerChild: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between'
//     },
//     headerText: {
//         fontFamily: 'Nunito-Bold',
//         fontSize: hp(3),
//         textAlign: 'left',
//         color: '#0D0140'
//     },
//     searchParent: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginHorizontal: '3%',
//         marginVertical: '3%',
//     },
//     searchContainer: {
//         flex: 1,
//         flexDirection: 'row',
//         alignItems: 'center',
//         // backgroundColor: 'trasparent',
//         borderWidth: 1,
//         borderRadius: 12,
//         marginRight: 10,
//         borderColor: '#99ABC678',
//         height: hp(6),
//     },
//     cameraButton: {
//         padding: 10,
//     },
//     input: {
//         flex: 1,
//         fontSize: hp(2.2),
//         fontFamily: 'Nunito-Regular',
//         paddingVertical: 8,
//         color: '#999'
//     },
//     searchButton: {
//         padding: 10,
//     },
//     menuButton: {
//         backgroundColor: '#130160',
//         padding: 10,
//         borderRadius: 12,
//         height: hp(6),
//         width: wp(14),
//         justifyContent: 'center',
//         alignItems: 'center'
//     },
//     notificationList: {
//         flex: 1,
//     },
//     notificationItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#FFFFFF',
//         marginHorizontal: wp(5),
//         marginVertical: hp(1),
//         borderRadius: 10,
//         padding: '4%',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 2,
//         elevation: 2,
//     },
//     iconContainer: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: '#E5E5EA',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 12,
//     },
//     notificationContent: {
//         flex: 1,
//     },
//     notificationTitle: {
//         fontSize: 16,
//         fontWeight: '500',
//         color: '#000000',
//         marginBottom: 4,
//     },
//     notificationTime: {
//         fontSize: 14,
//         color: '#8E8E93',
//     },
//     notificationDescription: {
//         fontSize: 14,
//         color: '#8E8E93',
//     },
//     deleteButton: {
//         paddingHorizontal: wp(1),
//         paddingVertical: hp(1),
//         flexDirection: 'row',
//         justifyContent: 'space-between'
//     },
//     deleteText: {
//         fontSize: 14,
//         color: '#FF3B30',
//     },
// })
