import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Linking
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons'

const FAQS = [
  {
    q: "How do I track my order?",
    a: "You can track your order by navigating to the 'Order Tracking' section from the main menu and entering your tracking ID.",
  },
  {
    q: "What payment methods are supported?",
    a: "We accept Visa, MasterCard, PayPal, and international wire transfers for large scale exports.",
  },
  {
    q: "How do I request a refund?",
    a: "Refunds can be requested within 14 days of delivery. Go to your Orders, select the item, and click 'Request Refund'.",
  },
];

export default function HelpCenterScreen() {
  const handleContactSupport = () => {
    Alert.alert(
      "Connect Support",
      "We offer 24/7 global trade assistance. How would you like to connect?",
      [
        {
          text: "Email Support",
          onPress: () => Linking.openURL('mailto:support@ubsglobalapp.com?subject=UBS Global Support Request')
        },
        {
          text: "Call Hotline",
          onPress: () => Linking.openURL('tel:+18005550199')
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor="#888"
          />
        </View>

        {/* Contact Support */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need more help?</Text>
          <Text style={styles.contactDesc}>
            Our support team is available 24/7 to assist you.
          </Text>
          <TouchableOpacity style={styles.contactBtn} onPress={handleContactSupport}>
            <Text style={styles.contactBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQS.map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <Text style={styles.faqQ}>{faq.q}</Text>
            <Text style={styles.faqA}>{faq.a}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef1f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000033",
  },
  content: {
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#dde3f0",
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#333",
  },
  contactCard: {
    backgroundColor: "#1565c0",
    padding: 20,
    borderRadius: 16,
    marginBottom: 28,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  contactDesc: {
    fontSize: 14,
    color: "#e0f7fe",
    marginBottom: 16,
  },
  contactBtn: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  contactBtnText: {
    color: "#1565c0",
    fontSize: 14,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  faqQ: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  faqA: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
