import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTranslation } from "react-i18next";

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Order Shipped",
    desc: "Your order #UBS8923 has been shipped and is on its way.",
    time: "2 hours ago",
    icon: "package",
    read: false,
  },
  {
    id: 2,
    title: "Payment Successful",
    desc: "We received your payment of $450.00 for order #UBS8923.",
    time: "1 day ago",
    icon: "credit-card",
    read: true,
  },
  {
    id: 3,
    title: "New Message",
    desc: "Seller 'Global Tech Exports' sent you a message.",
    time: "2 days ago",
    icon: "email",
    read: true,
  },
];

export default function NotificationsScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Notifications')}</Text>
        <TouchableOpacity>
          <Text style={styles.markReadText}>{t('Read All')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {NOTIFICATIONS.map((item) => (
          <View
            key={item.id}
            style={[styles.notificationCard, !item.read && styles.unreadCard]}
          >
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name={item.icon} size={24} color="#666" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{t(item.title)}</Text>
              <Text style={styles.desc}>{t(item.desc)}</Text>
              <Text style={styles.time}>{t(item.time)}</Text>
            </View>
            {!item.read && <View style={styles.dot} />}
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
  markReadText: {
    fontSize: 14,
    color: "#1565c0",
    fontWeight: "600",
  },
  content: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  unreadCard: {
    backgroundColor: "#f0f8ff",
    borderColor: "#bbdefb",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eef1f8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: "#aaa",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#c62828",
    marginTop: 6,
  },
});
