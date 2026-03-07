import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import AppNavigator from './src/screens/Navigator/AppNavigator'
import './global.css'
import { StripeProvider } from "@stripe/stripe-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {

  useEffect(() => {
    // ✅ ONE-TIME FIX: clears stale Zustand persisted cache so new
    //    subscription/user fields load correctly.
    //    REMOVE THIS useEffect after confirming cards display correctly.
    const clearCache = async () => {
      try {
        await AsyncStorage.removeItem('app-storage');
        console.log('✅ Zustand cache cleared — please log in again');
      } catch (e) {
        console.warn('Cache clear failed:', e.message);
      }
    };
    clearCache();
  }, []);

  return (
    <StripeProvider publishableKey="pk_test_51SaGUy38jla8PJ9QpsvULyDCxRRuSkIbalrFm3WkcAgwxWUcfAaFz1pVZszxvIY51FDYhqBY1ipQHExEs947J3I100qQLaneAM">
      <AppNavigator />
    </StripeProvider>
  )
}

export default App

const styles = StyleSheet.create({})