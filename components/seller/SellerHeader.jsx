import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSellerDrawer } from '../../context/SellerLayoutContext';
import { useSeller } from '../../context/SellerContext';
import { colors } from '../../constants/colors';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

export default function SellerHeader({ title, showShadow = true }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { toggleDrawer } = useSellerDrawer();
  const { unreadNotifications, seller } = useSeller();

  return (
    <View style={[styles.header, showShadow && styles.shadow]}>
      <TouchableOpacity onPress={toggleDrawer} style={styles.iconButton}>
        <MaterialCommunityIcons name="menu" size={24} color={colors.primary} />
      </TouchableOpacity>
      <View style={styles.titleWrap}>
        {title ? <Text style={styles.title}>{t(title)}</Text> : <Text style={styles.brand}>UBS Global</Text>}
      </View>
      <View style={styles.rightGroup}>
        <TouchableOpacity 
          style={styles.buyerModeBtn}
          onPress={() => router.replace('/(buyer)/home')}
        >
          <MaterialCommunityIcons name="shopping-outline" size={16} color="#0575E6" />
          <Text style={styles.buyerModeText}>{t('Buyer Mode')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bellButton}
          onPress={() => router.push('/(seller)/seller-notifications')}
        >
          <MaterialCommunityIcons name="bell-outline" size={22} color={colors.primary} />
          {unreadNotifications > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadNotifications}</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{seller?.shopName?.charAt(0) ?? 'U'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: { flex: 1, alignItems: 'center' },
  brand: { fontSize: 16, fontWeight: '700', color: colors.primary },
  title: { fontSize: 18, fontWeight: '700', color: colors.primary },
  iconButton: { padding: 10 },
  rightGroup: { flexDirection: 'row', alignItems: 'center' },
  buyerModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 10,
    gap: 4,
  },
  buyerModeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0575E6',
  },
  bellButton: { marginRight: 10 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
