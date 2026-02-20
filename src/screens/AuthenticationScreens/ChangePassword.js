import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import useStore from '../../store';

const ChangePassword = () => {
  const navigation = useNavigation();
  const { accessToken } = useStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        'https://api.biniq.net/api/users/change-password',
        {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Change password response:', response.data);
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Change password error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      const message =
        error.response?.data?.message ||
        Object.values(error.response?.data || {})?.[0]?.[0] ||
        error.message ||
        'Failed to change password';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
      >
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name='arrow-back-ios' color={'#0D0D26'} size={25} />
            </Pressable>
            <Text style={styles.headerText}>Change Password</Text>
          </View>
        </View>

        <View style={{ padding: '5%' }}>
          {/* Current Password */}
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder='Enter current password'
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={styles.input}
              placeholderTextColor={'gray'}
              secureTextEntry={!showCurrent}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowCurrent(!showCurrent)}
            >
              <MaterialIcons
                name={showCurrent ? 'visibility' : 'visibility-off'}
                size={20}
                color='#524B6B'
              />
            </TouchableOpacity>
          </View>

          {/* New Password */}
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder='Enter new password'
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
              placeholderTextColor={'gray'}
              secureTextEntry={!showNew}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNew(!showNew)}
            >
              <MaterialIcons
                name={showNew ? 'visibility' : 'visibility-off'}
                size={20}
                color='#524B6B'
              />
            </TouchableOpacity>
          </View>

          {/* Confirm New Password */}
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder='Confirm new password'
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              placeholderTextColor={'gray'}
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirm(!showConfirm)}
            >
              <MaterialIcons
                name={showConfirm ? 'visibility' : 'visibility-off'}
                size={20}
                color='#524B6B'
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.gettingStarted, isLoading && styles.disabledButton]}
          onPress={handleChangePassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#fff', fontSize: hp(2.5) }}>
              Change Password
            </Text>
          )}
        </TouchableOpacity>
      </ImageBackground>
    </ScrollView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    width: wp(100),
    height: hp(7),
    marginTop: '10%',
    paddingHorizontal: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerChild: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp(61),
    justifyContent: 'space-between',
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3),
    textAlign: 'left',
    color: '#0D0140',
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: hp(100),
  },
  label: {
    color: 'black',
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(2.2),
    marginTop: '3%',
  },
  inputContainer: {
    backgroundColor: '#fff',
    width: '100%',
    height: hp(7.5),
    alignSelf: 'center',
    borderRadius: 8,
    marginVertical: '2%',
    paddingHorizontal: '5%',
    justifyContent: 'center',
    borderWidth: 0.4,
    borderColor: '#524B6B',
  },
  input: {
    fontFamily: 'Nunito-Regular',
    color: '#000',
    fontSize: hp(2.2),
  },
  eyeIcon: {
    position: 'absolute',
    right: '5%',
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  gettingStarted: {
    backgroundColor: '#130160',
    width: '90%',
    height: hp(7),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#C0C0C0',
  },
  text: {
    marginHorizontal: 10,
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#A9A9A9',
  },
});