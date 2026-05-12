// app/(buyer)/drawer.jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const MENU_ITEMS = [
  { id: "home", label: "Home", icon: "⌂", route: "/(buyer)/home" },
  {
    id: "categories",
    label: "Categories",
    icon: "△",
    route: "/(buyer)/categories",
  },
  { id: "products", label: "Products", icon: "▦", route: "/(buyer)/products" },
  { id: "orders", label: "Orders", icon: "🧾", route: "/(buyer)/orders" },
  {
    id: "tracking",
    label: "Order Tracking",
    icon: "🚚",
    route: "/(buyer)/order-tracking",
  },
  { id: "wishlist", label: "Wishlist", icon: "♡", route: "/(buyer)/wishlist" },
  { type: "divider" },
  {
    id: "messages",
    label: "Messages",
    icon: "✉",
    route: "/(buyer)/messages",
    badge: 3,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "🔔",
    route: "/(buyer)/notifications",
  },
  { type: "divider" },
  { id: "settings", label: "Settings", icon: "⚙", route: "/(buyer)/settings" },
  { id: "help", label: "Help Center", icon: "🎧", route: "/(buyer)/help" },
];

export default function DrawerMenuScreen() {
  const activeRoute = "home";

  const handleNavigate = (route) => {
    if (route) {
      router.push(route);
    }
  };

  return (
    <View style={styles.container}>
      {/* Dark Overlay (Click to close) */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => router.back()}
      />

      {/* Drawer Content */}
      <View style={styles.drawer}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            {/* Close Button */}
            <View style={styles.closeHeader}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => router.back()}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80",
                  }}
                  style={styles.avatar}
                />
              </View>
              <Text style={styles.userName}>UBS Global User</Text>
              <Text style={styles.userEmail}>user.global@ubsexports.com</Text>
              <Text style={styles.userBadge}>
                Premium Member • Importer/Exporter
              </Text>

              <TouchableOpacity 
                style={styles.editBtn}
                onPress={() => handleNavigate("/(buyer)/edit-profile")}
              >
                <Text style={styles.editIcon}>✎</Text>
                <Text style={styles.editText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mainDivider} />

            {/* Menu Items */}
            <View style={styles.menuList}>
              {MENU_ITEMS.map((item, index) => {
                if (item.type === "divider") {
                  return (
                    <View key={`div-${index}`} style={styles.itemDivider} />
                  );
                }

                const isActive = activeRoute === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.menuItem, isActive && styles.menuItemActive]}
                    onPress={() => handleNavigate(item.route)}
                  >
                    <Text
                      style={[
                        styles.menuIcon,
                        isActive && styles.menuIconActive,
                      ]}
                    >
                      {item.icon}
                    </Text>
                    <Text
                      style={[
                        styles.menuLabel,
                        isActive && styles.menuLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Bottom Logout */}
          <View style={styles.logoutSection}>
            <View style={styles.mainDivider} />
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text style={styles.logoutIcon}>⎋</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.4)", // Dim background
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    width: width * 0.82,
    maxWidth: 340,
    backgroundColor: "#fff",
    height: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 20,
  },

  // Close Header
  closeHeader: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  closeBtn: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 20,
    color: "#666",
    fontWeight: "500",
  },

  // Profile
  profileSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: "#4dd0e1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000033", // Deep navy
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  userBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#007b8a", // Teal
    marginBottom: 20,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d0d5e8",
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  editIcon: {
    fontSize: 14,
    color: "#000033",
  },
  editText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000033",
  },

  // Dividers
  mainDivider: {
    height: 1,
    backgroundColor: "#eee",
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#f5f5f5",
    marginVertical: 4,
    marginHorizontal: 20,
  },

  // Menu List
  menuList: {
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: "#dbeafe", // Light blue
  },
  menuIcon: {
    fontSize: 20,
    color: "#555",
    width: 32,
    textAlign: "center",
    marginRight: 12,
  },
  menuIconActive: {
    color: "#1565c0", // Blue
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  menuLabelActive: {
    color: "#1565c0",
  },
  badge: {
    backgroundColor: "#c62828",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  // Logout
  logoutSection: {
    backgroundColor: "#fff",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 28,
    gap: 12,
  },
  logoutIcon: {
    fontSize: 20,
    color: "#c62828",
    transform: [{ scaleX: -1 }], // Flip to mimic logout door
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#c62828",
  },
});
