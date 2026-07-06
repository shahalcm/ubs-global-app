import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSellerDrawer } from '../../context/SellerLayoutContext';
import { colors } from '../../constants/colors';
import { useTranslation } from 'react-i18next';
import { useSeller } from '../../context/SellerContext';

export default function SellerBottomNav() {
  const { t } = useTranslation();
  const router = useRouter();
  const { closeDrawer } = useSellerDrawer();
  const { seller } = useSeller();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const activeSegment = segments[segments.length - 1] || 'dashboard';

  const hiddenScreens = ['become-seller', 'add-product', 'edit-product', 'order-details'];
  if (hiddenScreens.includes(activeSegment)) return null;

  return (
    <View style={[styles.container, { 
      height: 70 + (insets.bottom > 0 ? insets.bottom - 8 : 0),
      paddingBottom: Math.max(insets.bottom, 8) 
    }]}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => { closeDrawer(); router.push('/(seller)/dashboard'); }}
      >
        <Text style={[styles.icon, activeSegment === 'dashboard' && styles.activeIcon]}>⌂</Text>
        <Text style={[styles.label, activeSegment === 'dashboard' && styles.activeLabel]}>{t('Dashboard')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => { closeDrawer(); router.push('/(seller)/my-products'); }}
      >
        <Text style={[styles.icon, activeSegment === 'my-products' && styles.activeIcon]}>▦</Text>
        <Text style={[styles.label, activeSegment === 'my-products' && styles.activeLabel]}>{t('Products')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.centerBtn}
        onPress={() => {
          closeDrawer();
          if (seller?.status === 'pending') {
            Alert.alert(
              t('Pending Approval'),
              t('You are on the pending list. After admin approval only, you can sell products.')
            );
          } else if (seller?.status !== 'approved') {
            Alert.alert(
              t('Access Denied'),
              t('Only approved sellers can add products.')
            );
          } else {
            router.push('/(seller)/add-product');
          }
        }}
      >
        <Text style={styles.centerIcon}>+</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => { closeDrawer(); router.push('/(seller)/seller-messages'); }}
      >
        <Text style={[styles.icon, activeSegment === 'seller-messages' && styles.activeIcon]}>✉</Text>
        <Text style={[styles.label, activeSegment === 'seller-messages' && styles.activeLabel]}>{t('Messages')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => { closeDrawer(); router.push('/(seller)/seller-profile'); }}
      >
        <Text style={[styles.icon, activeSegment === 'seller-profile' && styles.activeIcon]}>👤</Text>
        <Text style={[styles.label, activeSegment === 'seller-profile' && styles.activeLabel]}>{t('Profile')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  icon: {
    fontSize: 22,
    color: '#999',
  },
  activeIcon: {
    color: '#1a237e',
  },
  label: {
    fontSize: 10,
    color: '#999',
  },
  activeLabel: {
    color: '#1a237e',
    fontWeight: '600',
  },
  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  centerIcon: {
    fontSize: 30,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
});
