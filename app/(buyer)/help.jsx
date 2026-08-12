import React, { useState, useEffect } from "react";
import api from "../../services/api";
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
  {
    q: "How do customs and import duties work?",
    a: "Import duties, customs fees, and taxes are the buyer's responsibility. They are calculated based on the shipping destination and cargo type upon arrivals.",
  },
  {
    q: "What is the delivery time for international orders?",
    a: "Standard shipping takes 7-14 business days, while express logistics shipping takes 3-7 business days depending on customs clearance procedures.",
  },
  {
    q: "How do I contact the seller directly?",
    a: "You can initiate a direct connection request from any product details page. Once approved by the admin, you can chat with the seller in real-time.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes, all transactions are secured and processed through Stripe or PayPal gateways. Large B2B orders can also be handled through safe escrow options.",
  },
];

export default function HelpCenterScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [supportEmail, setSupportEmail] = useState("ubsimportingexporting@gmail.com");
  const [supportPhone, setSupportPhone] = useState("9544755008");

  useEffect(() => {
    const fetchSupport = async () => {
      try {
        const res = await api.get('/public-settings');
        if (res.data?.success && res.data.settings) {
          if (res.data.settings.supportEmail) setSupportEmail(res.data.settings.supportEmail);
          if (res.data.settings.contactPhone) setSupportPhone(res.data.settings.contactPhone);
        }
      } catch (err) {
        console.log("Failed to load public support settings:", err);
      }
    };
    fetchSupport();
  }, []);

  const handleStartSupportCall = () => {
    router.push('/(buyer)/support-call')
  }

  const handleContactSupport = () => {
    Alert.alert(
      "Connect Support",
      "We offer 24/7 global trade assistance. How would you like to connect?",
      [
        {
          text: "📞 Voice Call Support",
          onPress: handleStartSupportCall
        },
        {
          text: "Email Support",
          onPress: () => Linking.openURL(`mailto:${supportEmail}?subject=UBS Global Support Request`)
        },
        {
          text: "Call Hotline",
          onPress: () => Linking.openURL(`tel:${supportPhone}`)
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    )
  }

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/home')}>
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
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Contact Support */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need live support?</Text>
          <Text style={styles.contactDesc}>
            Speak directly with an active UBS Global Customer Care Agent.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <TouchableOpacity
              style={[styles.contactBtn, { backgroundColor: '#0284c7', flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
              onPress={handleStartSupportCall}
            >
              <MaterialCommunityIcons name="phone" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.contactBtnText}>Call Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactBtn, { backgroundColor: '#0f172a', flex: 1 }]}
              onPress={handleContactSupport}
            >
              <Text style={styles.contactBtnText}>Options</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {filteredFaqs.map((faq, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <View key={index} style={styles.faqCard}>
              <TouchableOpacity onPress={() => toggleExpand(index)} style={styles.faqHeader}>
                <Text style={styles.faqQ}>{faq.q}</Text>
                <MaterialCommunityIcons 
                  name={isExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#555" 
                />
              </TouchableOpacity>
              {isExpanded && (
                <Text style={styles.faqA}>{faq.a}</Text>
              )}
            </View>
          );
        })}

        {filteredFaqs.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="help-circle-outline" size={48} color="#888" />
            <Text style={styles.emptyText}>No matching questions found</Text>
          </View>
        )}
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
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQ: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    paddingRight: 8,
  },
  faqA: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    marginTop: 12,
    fontWeight: "500",
  },
});
