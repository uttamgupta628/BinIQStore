import {
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import useStore from '../../store/index';

const BASE_URL = 'https://biniq.onrender.com/api';

const CATEGORIES = [
  { label: 'General', value: 'general' },
  { label: 'Bug Report', value: 'bug' },
  { label: 'Feature Request', value: 'feature' },
  { label: 'Billing', value: 'billing' },
  { label: 'Other', value: 'other' },
];

const Feedback = () => {
  const navigation = useNavigation();
  const { accessToken } = useStore();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Missing Rating', 'Please select a rating before submitting.');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Missing Subject', 'Please enter a subject for your feedback.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Missing Message', 'Please write your feedback message.');
      return;
    }

    try {
      setSubmitting(true);

      await axios.post(
        `${BASE_URL}/users/feedback`,
        {
          rating: rating,
          suggestion: `[${selectedCategory}] ${subject.trim()} — ${message.trim()}`,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      Alert.alert(
        'Feedback Sent!',
        'Thank you for your feedback. We will get back to you soon.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      console.error('Feedback submit error:', error.message);
      console.error('Response data:', error?.response?.data);

      const errMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to submit feedback. Please try again.';

      Alert.alert('Submission Failed', errMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <StatusBar translucent={true} backgroundColor={'transparent'} />
        <ImageBackground
          source={require('../../../assets/vector_1.png')}
          style={styles.vector}
          resizeMode="stretch">

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerChild}>
              <Pressable onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back-ios" color={'#0D0D26'} size={25} />
              </Pressable>
              <Text style={styles.headerText}>Feedback</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>

            {/* Category */}
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.value && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.value)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat.value && styles.categoryChipTextActive,
                    ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating */}
            <Text style={styles.label}>Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color={star <= rating ? '#F5A623' : '#ccc'}
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Subject */}
            <Text style={styles.label}>Subject</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="create-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter subject"
                placeholderTextColor="#aaa"
                value={subject}
                onChangeText={setSubject}
                maxLength={100}
              />
            </View>

            {/* Message */}
            <Text style={styles.label}>Message</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <TextInput
                style={styles.textArea}
                placeholder="Write your feedback here..."
                placeholderTextColor="#aaa"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={1000}
              />
            </View>
            <Text style={styles.charCount}>{message.length}/1000</Text>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}>
              <Ionicons name="send-outline" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>
                {submitting ? 'Sending...' : 'Submit Feedback'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: hp(5) }} />
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Feedback;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3F5',
  },
  vector: {
    flex: 1,
    width: wp(100),
    minHeight: hp(100),
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
    justifyContent: 'space-between',
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3),
    textAlign: 'left',
    color: '#0D0140',
  },
  formContainer: {
    marginHorizontal: wp(5),
    marginTop: hp(3),
  },
  label: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2),
    color: '#0D0D26',
    marginBottom: hp(1),
    marginTop: hp(1.5),
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: hp(0.5),
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 6,
  },
  categoryChipActive: {
    backgroundColor: '#130160',
    borderColor: '#130160',
  },
  categoryChipText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.7),
    color: '#555',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.9),
    color: '#0D0D26',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    flex: 1,
    width: '100%',
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.9),
    color: '#0D0D26',
    minHeight: hp(15),
  },
  charCount: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.5),
    color: '#aaa',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: hp(2),
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#130160',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
    marginTop: hp(1),
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.1),
    color: '#fff',
  },
});