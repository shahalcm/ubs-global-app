import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

const menuItems = [
  { icon: 'home-outline', label: 'Dashboard', route: 'dashboard' },
  { icon: 'cube-outline', label: 'My Products', route: 'my-products' },
  { icon: 'clipboard-list-outline', label: 'Orders', route: 'seller-orders' },
  { icon: 'cash-multiple', label: 'Earnings', route: 'seller-earnings' },
  { icon: 'message-text-outline', label: 'Messages', route: 'seller-messages' },
  { icon: 'bell-outline', label: 'Notifications', route: 'seller-notifications' },
  { icon: 'cog-outline', label: 'Settings', route: 'seller-settings' },
];

export default function SellerDrawer({ open, onClose }) {
  const router = useRouter();
  const width = Dimensions.get('window').width * 0.78;
  const translateX = React.useRef(new Animated.Value(open ? 0 : -width)).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: open ? 0 : -width,
      useNativeDriver: true,
      duration: 220,
    }).start();
  }, [open, translateX, width]);

  return (
    <>
      {open && <TouchableWithoutFeedback onPress={onClose}><View style={styles.overlay} /></TouchableWithoutFeedback>}
      <Animated.View style={[styles.drawer, { width, transform: [{ translateX }] }]}>
        <View style={styles.header}>
          <View style={styles.logoCircle}><Text style={styles.logoLabel}>U</Text></View>
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
              onPress={() => {
                onClose();
                router.push(`/${item.route}`);
              }}
            >
              <MaterialCommunityIcons name={item.icon} size={20} color={colors.primary} />
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/seller-settings')}>
            <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingTop: 44,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 30,
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
    marginBottom: 24,
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
