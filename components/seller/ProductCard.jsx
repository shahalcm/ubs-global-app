import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { colors } from '../../constants/colors';
import { useTranslation } from 'react-i18next';

export default function ProductCard({ product, onEdit, onDelete }) {
  const { t } = useTranslation();
  const rightActions = () => (
    <View style={styles.actionRow}>
      <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={onEdit}>
        <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable renderRightActions={rightActions}>
      <View style={styles.card}>
        <Image source={{ uri: product.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.title}>{product.name}</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{product.category}</Text></View>
          <Text style={styles.price}>${product.price}</Text>
          <Text style={[styles.stock, product.stock > 0 ? styles.inStock : styles.outStock]}>{product.stock > 0 ? t('In Stock') : t('Out of Stock')}</Text>
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.outlineButton} onPress={onEdit}>
              <MaterialCommunityIcons name="pencil" size={16} color={colors.primary} />
              <Text style={styles.outlineLabel}>{t('Edit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.outlineButton, styles.deleteOutline]} onPress={onDelete}>
              <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.error} />
              <Text style={[styles.outlineLabel, styles.deleteLabel]}>{t('Delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 12,
  },
  info: { flex: 1, justifyContent: 'space-between' },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  badge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.accent + '22',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  badgeText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  price: { marginTop: 8, fontSize: 15, fontWeight: '700', color: colors.primary },
  stock: { marginTop: 4, fontSize: 13, fontWeight: '600' },
  inStock: { color: colors.success },
  outStock: { color: colors.error },
  buttonsRow: { flexDirection: 'row', marginTop: 10 },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  outlineLabel: { marginLeft: 6, color: colors.primary, fontSize: 12, fontWeight: '700' },
  deleteOutline: { borderColor: colors.error },
  deleteLabel: { color: colors.error },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: {
    width: 56,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: { backgroundColor: '#eef4ff', borderRadius: 18, marginRight: 8 },
  deleteBtn: { backgroundColor: colors.error, borderRadius: 18 },
});
