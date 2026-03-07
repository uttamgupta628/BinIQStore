import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useStripe } from "@stripe/stripe-react-native";
import useStore from "../../store";

const BASE_URL = "https://biniq.onrender.com/api";

const PLANS = [
  {
    id: "tier1",
    label: "Starter",
    promotions: 20,
    price: "$9.99",
    amount: 999,
    duration: "30 days",
    color: "#14BA9C",
  },
  {
    id: "tier2",
    label: "Growth",
    promotions: 50,
    price: "$19.99",
    amount: 1999,
    duration: "60 days",
    color: "#130160",
    popular: true,
  },
  {
    id: "tier3",
    label: "Pro",
    promotions: 100,
    price: "$39.99",
    amount: 3999,
    duration: "90 days",
    color: "#524B6B",
  },
];

const SubscriptionScreen = () => {
  const navigation = useNavigation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { accessToken, user } = useStore();

  const [selectedPlan, setSelectedPlan] = useState("tier1");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const plan = PLANS.find((p) => p.id === selectedPlan);

      // ── Step 1: Create PaymentIntent on backend ───────────────────────
      const response = await fetch(
        `${BASE_URL}/payments/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            amount: plan.amount,
            currency: "usd",
            email: user?.email || "",
            name: user?.full_name || "",
            plan: plan.id,
          }),
        }
      );

      const data = await response.json();
      console.log("PaymentIntent response:", data);

      if (!response.ok || !data.clientSecret) {
        Alert.alert("Error", data.message || "Failed to initialize payment.");
        return;
      }

      // ── Step 2: Initialize Stripe Payment Sheet ───────────────────────
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
        return;
      }

      // ── Step 3: Present Stripe Payment Sheet ──────────────────────────
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== "Canceled") {
          Alert.alert("Payment Failed", paymentError.message);
        }
        return;
      }

      // ── Step 4: Confirm on backend + activate subscription ────────────
      console.log("Payment succeeded, confirming with:", data.paymentIntentId);

      const confirmResponse = await fetch(
        `${BASE_URL}/payments/confirm-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            payment_intent_id: data.paymentIntentId,
            plan: plan.id,
          }),
        }
      );

      const confirmData = await confirmResponse.json();
      console.log("Confirm response:", confirmData);

      if (confirmResponse.ok && confirmData.success) {
        Alert.alert(
          "Subscribed! 🎉",
          `You are now on the ${plan.label} plan.\nYou can create up to ${plan.promotions} promotions.`,
          [{ text: "Let's Go!", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          "Warning",
          confirmData.message ||
            "Payment received but subscription activation failed. Please contact support."
        );
      }
    } catch (error) {
      console.error("Subscribe error:", error.message);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require("../../../assets/vector_1.png")}
        style={styles.vector}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={25} />
            </Pressable>
            <Text style={styles.headerText}>Subscribe</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        {/* Title */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <Text style={styles.sectionSubtitle}>
            Subscribe to start creating promotions for your store
          </Text>
        </View>

        <View style={styles.spacer} />

        {/* Plan Cards */}
        <View style={styles.sectionContainer}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
                selectedPlan === plan.id && { borderColor: plan.color },
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}
              <View style={styles.planCardRow}>
                <View>
                  <Text style={styles.planLabel}>{plan.label}</Text>
                  <Text style={styles.planMeta}>
                    {plan.promotions} promotions · {plan.duration}
                  </Text>
                </View>
                <View style={styles.planPriceRow}>
                  <Text style={[styles.planPrice, { color: plan.color }]}>
                    {plan.price}
                  </Text>
                  {selectedPlan === plan.id && (
                    <MaterialIcons
                      name="check-circle"
                      size={22}
                      color={plan.color}
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.spacer} />

        {/* Info box */}
        <View style={styles.sectionContainer}>
          <View style={styles.infoBox}>
            <MaterialIcons name="lock" size={18} color="#14BA9C" />
            <Text style={styles.infoText}>
              Secure payment powered by Stripe. Your card details are never stored on our servers.
            </Text>
          </View>
          <Text style={styles.testHint}>
            🧪 Test: 4242 4242 4242 4242 · Any future date · Any CVC
          </Text>
        </View>

        <View style={styles.spacer} />

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeButton, isLoading && styles.disabledButton]}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={[styles.subscribeButtonText, { marginLeft: 8 }]}>
                Processing...
              </Text>
            </View>
          ) : (
            <Text style={styles.subscribeButtonText}>
              Pay {PLANS.find((p) => p.id === selectedPlan)?.price} · Subscribe
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ImageBackground>
    </ScrollView>
  );
};

export default SubscriptionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1 },
  vector: { width: wp(100), minHeight: hp(100) },
  header: {
    width: wp(100),
    height: hp(7),
    marginTop: "10%",
    paddingHorizontal: "5%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerChild: { flexDirection: "row", alignItems: "center" },
  headerText: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(3),
    color: "#0D0140",
    marginLeft: hp(1),
  },
  spacer: { height: hp(2) },
  sectionContainer: { paddingHorizontal: "5%" },
  sectionTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.8),
    color: "#14BA9C",
  },
  sectionSubtitle: {
    color: "#524B6B",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.7),
    marginTop: "2%",
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    padding: "4%",
    marginBottom: hp(1.5),
  },
  planCardSelected: { borderWidth: 2, backgroundColor: "#f9fffe" },
  planCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planLabel: {
    fontFamily: "Nunito-Bold",
    fontSize: hp(2.2),
    color: "#0D0140",
  },
  planMeta: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.6),
    color: "#524B6B",
    marginTop: 2,
  },
  planPriceRow: { flexDirection: "row", alignItems: "center" },
  planPrice: { fontFamily: "Nunito-Bold", fontSize: hp(2.5) },
  popularBadge: {
    backgroundColor: "#130160",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  popularBadgeText: {
    color: "#fff",
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.4),
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf9",
    borderRadius: 8,
    padding: "4%",
    gap: 8,
    marginBottom: hp(1),
  },
  infoText: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.6),
    color: "#524B6B",
    flex: 1,
  },
  testHint: {
    fontFamily: "Nunito-Regular",
    fontSize: hp(1.5),
    color: "#14BA9C",
    textAlign: "center",
    marginTop: hp(0.5),
  },
  subscribeButton: {
    backgroundColor: "#130160",
    width: "90%",
    height: hp(7),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: hp(2),
  },
  disabledButton: { opacity: 0.6 },
  loadingRow: { flexDirection: "row", alignItems: "center" },
  subscribeButtonText: {
    fontFamily: "Nunito-SemiBold",
    color: "#fff",
    fontSize: hp(2.5),
  },
  bottomSpacer: { height: hp(5) },
});