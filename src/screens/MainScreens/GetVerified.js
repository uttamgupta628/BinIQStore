import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Pressable,
  Alert, ActivityIndicator,
} from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useStripe } from "@stripe/stripe-react-native";
import useStore from "../../store";

const BACKEND_URL = "https://biniq.onrender.com/api";

const GetVerified = () => {
  const navigation = useNavigation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { accessToken, user } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    "✅ Verified Badge on your store profile",
    "✅ Priority placement in search results",
    "✅ Access to Reseller's Community",
    "✅ Advanced analytics & insights",
    "✅ Dedicated support team",
    "✅ Unlimited product listings",
    "✅ Promotional campaign tools",
    "✅ Monthly performance reports",
    "✅ Early access to new features",
    "✅ Boost visibility & sales",
  ];

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // Step 1: Create PaymentIntent
      const response = await fetch(`${BACKEND_URL}/payments/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amount: 199700,
          currency: "usd",
          email: user?.email,
          name: user?.full_name,
        }),
      });

      const data = await response.json();
      console.log("PaymentIntent response:", data);

      // ✅ Already verified — don't charge again
      if (data.already_verified) {
        Alert.alert(
          "Already Verified ✅",
          "Your store is already verified!",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        setIsLoading(false);
        return;
      }

      if (!response.ok || !data.clientSecret) {
        Alert.alert("Error", data.message || "Failed to initialize payment.");
        setIsLoading(false);
        return;
      }

      // Step 2: Initialize Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "BinIQ",
        paymentIntentClientSecret: data.clientSecret,
        defaultBillingDetails: {
          email: user?.email || "",
          name: user?.full_name || "",
        },
        appearance: {
          colors: {
            primary: "#130160",
            background: "#ffffff",
            componentBackground: "#f5f5f5",
            componentBorder: "#e0e0e0",
            componentDivider: "#e0e0e0",
            primaryText: "#130160",
            secondaryText: "#524B6B",
            componentText: "#000000",
            placeholderText: "#999999",
            icon: "#130160",
            error: "#FF0000",
          },
          shapes: {
            borderRadius: 12,
            borderWidth: 0.5,
          },
        },
        allowsDelayedPaymentMethods: false,
      });

      if (initError) {
        Alert.alert("Setup Error", initError.message);
        setIsLoading(false);
        return;
      }

      // Step 3: Present Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== "Canceled") {
          Alert.alert("Payment Failed", paymentError.message);
        }
        setIsLoading(false);
        return;
      }

      // Step 4: Payment succeeded — confirm verification on backend
      console.log("Payment succeeded, confirming with:", data.paymentIntentId);

      const verifyResponse = await fetch(`${BACKEND_URL}/payments/confirm-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ payment_intent_id: data.paymentIntentId }),
      });

      const verifyData = await verifyResponse.json();
      console.log("Verify response:", verifyData);

      if (verifyResponse.ok) {
        Alert.alert(
          "🎉 Congratulations!",
          "Your store is now verified! Your verified badge is now active.",
          [{ text: "Awesome!", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          "Warning",
          verifyData.message || "Payment received but verification failed. Please contact support."
        );
      }

    } catch (error) {
      console.error("Payment error:", error.message);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" color="#fff" size={25} />
        </Pressable>
        <Text style={styles.headerText}>Get Verified</Text>
        <View style={{ width: 25 }} />
      </View>

      {/* Hero */}
      <View style={styles.heroSection}>
        <Text style={styles.heroEmoji}>🏆</Text>
        <Text style={styles.heroTitle}>Become a Verified Store</Text>
        <Text style={styles.heroSubtitle}>
          Join thousands of trusted sellers and unlock the full power of BinIQ
        </Text>
      </View>

      {/* Price Card */}
      <View style={styles.priceCard}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ANNUAL PLAN</Text>
          </View>
        </View>

        <Text style={styles.priceLabel}>1 Year Verification</Text>
        <View style={styles.priceRow}>
          <Text style={styles.currency}>$</Text>
          <Text style={styles.price}>1,997</Text>
        </View>
        <Text style={styles.priceNote}>Billed annually. Renews every year.</Text>

        <View style={styles.divider} />

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <Text key={index} style={styles.featureText}>{feature}</Text>
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.ctaButton, isLoading && styles.ctaButtonDisabled]}
          activeOpacity={0.8}
          onPress={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={[styles.ctaText, { marginLeft: 8 }]}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.ctaText}>Get Verified Now →</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.secureText}>🔒 Secure payment · 30-day money back guarantee</Text>
      </View>

      <View style={{ height: hp(4) }} />
    </ScrollView>
  );
};

export default GetVerified;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#130160" },
  content: { paddingBottom: hp(4) },

  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "5%", paddingTop: "12%", paddingBottom: "4%",
  },
  headerText: { fontFamily: "Nunito-Bold", fontSize: hp(2.6), color: "#fff" },

  heroSection: { alignItems: "center", paddingHorizontal: "8%", paddingBottom: hp(3) },
  heroEmoji: { fontSize: hp(7), marginBottom: hp(1) },
  heroTitle: {
    fontFamily: "Nunito-Bold", fontSize: hp(3.2),
    color: "#fff", textAlign: "center", marginBottom: hp(1),
  },
  heroSubtitle: {
    fontFamily: "Nunito-Regular", fontSize: hp(1.9),
    color: "#C4C4C4", textAlign: "center", lineHeight: hp(2.8),
  },

  priceCard: {
    backgroundColor: "#fff", marginHorizontal: "5%",
    borderRadius: 20, padding: "6%",
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 10,
  },

  badgeRow: { alignItems: "center", marginBottom: hp(1.5) },
  badge: {
    backgroundColor: "#14BA9C", paddingHorizontal: wp(4),
    paddingVertical: hp(0.5), borderRadius: 20,
  },
  badgeText: { fontFamily: "Nunito-Bold", fontSize: hp(1.4), color: "#fff" },

  priceLabel: {
    fontFamily: "Nunito-SemiBold", fontSize: hp(2),
    color: "#524B6B", textAlign: "center", marginBottom: hp(0.5),
  },
  priceRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "center" },
  currency: {
    fontFamily: "Nunito-Bold", fontSize: hp(3),
    color: "#130160", marginTop: hp(1),
  },
  price: { fontFamily: "Nunito-Bold", fontSize: hp(7), color: "#130160" },
  priceNote: {
    fontFamily: "Nunito-Regular", fontSize: hp(1.7),
    color: "#999", textAlign: "center", marginBottom: hp(2),
  },

  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: hp(2) },

  featuresContainer: { marginBottom: hp(2.5) },
  featureText: {
    fontFamily: "Nunito-SemiBold", fontSize: hp(1.8),
    color: "#333", paddingVertical: hp(0.6),
  },

  ctaButton: {
    backgroundColor: "#130160", borderRadius: 12,
    paddingVertical: hp(2), alignItems: "center",
    marginBottom: hp(1.5),
  },
  ctaButtonDisabled: { opacity: 0.6 },
  ctaText: { fontFamily: "Nunito-Bold", fontSize: hp(2.2), color: "#fff" },
  loadingRow: { flexDirection: "row", alignItems: "center" },

  secureText: {
    fontFamily: "Nunito-Regular", fontSize: hp(1.5),
    color: "#999", textAlign: "center",
  },
});