import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

const tabs = [
  { name: 'dashboard', label: 'Dashboard', icon: 'home' },
  { name: 'my-products', label: 'Products', icon: 'cube-outline' },
  { name: 'seller-orders', label: 'Orders', icon: 'clipboard-list' },
  { name: 'seller-messages', label: 'Messages', icon: 'message-text-outline' },
  { name: 'seller-profile', label: 'Profile', icon: 'account-circle-outline' },
];

export default function SellerBottomNav() {
  const router = useRouter();
  const segments = useSegments();
  const activeSegment = segments[segments.length - 1] || 'dashboard';

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = activeSegment === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(`/${tab.name}`)}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={22}
              color={active ? colors.primary : '#8a8a8a'}
            />
            <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 74,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ececec',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 6,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
  },
  label: {
    fontSize: 11,
    color: '#8a8a8a',
    marginTop: 2,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
});
