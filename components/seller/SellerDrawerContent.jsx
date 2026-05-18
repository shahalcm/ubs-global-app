import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { registerDrawerNavigation } from '../../context/SellerLayoutContext';

const menuItems = [
  { icon: 'home-outline', label: 'Dashboard', route: '/(seller)/dashboard' },
  { icon: 'cube-outline', label: 'My Products', route: '/(seller)/my-products' },
  { icon: 'clipboard-list-outline', label: 'Orders', route: '/(seller)/seller-orders' },
  { icon: 'cash-multiple', label: 'Earnings', route: '/(seller)/seller-earnings' },
  { icon: 'message-text-outline', label: 'Messages', route: '/(seller)/seller-messages' },
  { icon: 'bell-outline', label: 'Notifications', route: '/(seller)/seller-notifications' },
  { icon: 'cog-outline', label: 'Settings', route: '/(seller)/seller-settings' },
];

export default function SellerDrawerContent(props) {
  const router = useRouter();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { navigation } = props;

  useEffect(() => {
    registerDrawerNavigation(navigation);
  }, [navigation]);

  const navigate = (route) => {
    navigation.closeDrawer();
    router.push(route);
  };

  const handleLogout = async () => {
    navigation.closeDrawer();
    await logout();
    router.replace('/login');
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 12 }]}
      style={styles.drawerScroll}
    >
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLabel}>U</Text>
        </View>
        <View>
          <Text style={styles.brand}>UBS Global</Text>
          <Text style={styles.subTitle}>Verified Seller</Text>
        </View>
      </View>

      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.menuItem}
            onPress={() => navigate(item.route)}
          >
            <MaterialCommunityIcons name={item.icon} size={20} color={colors.primary} />
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.version}>Version 1.0.0</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerScroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  logoLabel: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  brand: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  subTitle: {
    marginTop: 4,
    color: '#6f6f6f',
    fontSize: 13,
  },
  menuList: {
    marginTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuText: {
    marginLeft: 14,
    fontSize: 15,
    color: '#1f1f1f',
  },
  footer: {
    marginTop: 'auto',
  },
  version: {
    color: '#939393',
    fontSize: 12,
    marginBottom: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 8,
    color: colors.error,
    fontWeight: '700',
    fontSize: 15,
  },
});
