// src/screens/SettingsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  StatusBar,
  Dimensions,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import useStore from '../../store';

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://biniq.onrender.com/api';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { accessToken, logout } = useStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeletingAccount(true);
            try {
              await axios.delete(`${BASE_URL}/users/delete-account`, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              });
              logout();
              navigation.replace('Login');
            } catch (error) {
              const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to delete account. Please try again.';
              Alert.alert('Error', message);
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const SettingRow = ({ icon, label, onPress, right, danger = false }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !right}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconBox, danger && styles.iconBoxDanger]}>
          <Ionicons
            name={icon}
            size={hp(2.5)}
            color={danger ? '#e74c3c' : '#130160'}
          />
        </View>
        <Text style={[styles.settingText, danger && styles.settingTextDanger]}>
          {label}
        </Text>
      </View>
      {right || (
        onPress ? (
          <Ionicons name="chevron-forward" size={hp(2.5)} color="#ccc" />
        ) : null
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" color="#0D0D26" size={26} />
            </Pressable>
            <Text style={styles.headerText}>Settings</Text>
          </View>
        </View>

        <View style={styles.content}>

          {/* ── Account section ── */}
          <Text style={styles.sectionLabel}>Account</Text>

          <SettingRow
            icon="person-outline"
            label="My Profile"
            onPress={() => navigation.navigate('EditProfileScreen')}
          />
          <SettingRow
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
          />

          {/* ── Preferences section ── */}
          <Text style={styles.sectionLabel}>Preferences</Text>

          <SettingRow
            icon="notifications-outline"
            label="Notifications"
            right={
              <Switch
                trackColor={{ false: '#ddd', true: '#14BA9C' }}
                thumbColor="#fff"
                ios_backgroundColor="#ddd"
                onValueChange={setNotificationsEnabled}
                value={notificationsEnabled}
              />
            }
          />

          {/* ── Danger zone ── */}
          <Text style={styles.sectionLabel}>Danger Zone</Text>

          {isDeletingAccount ? (
            <View style={[styles.settingItem, { justifyContent: 'center' }]}>
              <ActivityIndicator color="#e74c3c" />
              <Text style={[styles.settingText, { color: '#e74c3c', marginLeft: 12 }]}>
                Deleting account...
              </Text>
            </View>
          ) : (
            <SettingRow
              icon="trash-outline"
              label="Delete Account"
              onPress={handleDeleteAccount}
              danger
            />
          )}

          <View style={{ height: hp(8) }} />
        </View>
      </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  vector: { flex: 1, width: wp(100), minHeight: hp(100) },
  header: {
    width: wp(100),
    height: hp(7),
    marginTop: '10%',
    paddingHorizontal: '5%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerChild: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3.2),
    color: '#0D0140',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionLabel: {
    fontFamily: 'Nunito-SemiBold',
    color: '#95969D',
    fontSize: wp(4.2),
    marginTop: hp(2),
    marginBottom: hp(0.5),
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.8),
    backgroundColor: '#fff',
    marginVertical: '1%',
    borderRadius: 12,
    paddingHorizontal: '4%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconBoxDanger: {
    backgroundColor: '#FFEBEE',
  },
  settingText: {
    fontSize: hp(2),
    color: '#150B3D',
    fontFamily: 'Nunito-SemiBold',
  },
  settingTextDanger: {
    color: '#e74c3c',
  },
});