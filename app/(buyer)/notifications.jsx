import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTranslation } from "react-i18next";
import { getNotifications, markAllRead, markAsRead } from "../../services/notificationService";

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const data = await getNotifications();
      // Ensure mapped format is set
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Error loading notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.log("Error marking all as read:", err);
    }
  };

  const handleNotificationPress = async (item) => {
    // Mark as read on the backend first if it is unread
    if (!item.read) {
      try {
        await markAsRead(item._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.log("Error marking notification read:", err);
      }
    }

    // Redirect user to the corresponding flow based on type
    if (item.type === "order" && item.data?.orderId) {
      router.push({
        pathname: "/(buyer)/order-tracking",
        params: { orderId: item.data.orderId },
      });
    } else if (item.type === "message") {
      router.push("/(buyer)/messages");
    }
  };

  const getIconName = (type) => {
    switch (type) {
      case "order":
        return "package-variant-closed";
      case "payment":
        return "credit-card-outline";
      case "message":
        return "message-text-outline";
      case "system":
        return "cog-outline";
      case "promotion":
        return "tag-outline";
      case "contact_request":
        return "account-box-outline";
      default:
        return "bell-outline";
    }
  };

  const formatTimeElapsed = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t("Just now");
    if (diffMins < 60) return `${diffMins}${t("m ago")}`;
    if (diffHours < 24) return `${diffHours}${t("h ago")}`;
    if (diffDays === 1) return t("Yesterday");
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/home')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Notifications')}</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markReadText}>{t('Read All')}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000033" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#000033"]} />
          }
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="bell-off-outline" size={48} color="#ccc" />
              <Text style={styles.emptyTitle}>{t('No Notifications')}</Text>
              <Text style={styles.emptyDesc}>{t("We'll let you know when we have updates for you.")}</Text>
            </View>
          ) : (
            notifications.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={[styles.notificationCard, !item.read && styles.unreadCard]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name={getIconName(item.type)} size={24} color="#666" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{t(item.title)}</Text>
                  <Text style={styles.desc}>{item.message}</Text>
                  <Text style={styles.time}>{formatTimeElapsed(item.createdAt)}</Text>
                </View>
                {!item.read && <View style={styles.dot} />}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
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
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000033",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
