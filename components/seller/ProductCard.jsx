import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { colors } from '../../constants/colors';
import { useTranslation } from 'react-i18next';
import { getProductImageUrl } from '../../utils/image';
import { useSeller } from '../../context/SellerContext';

export default function ProductCard({ product, onEdit, onDelete }) {
  const { t } = useTranslation();
  const { updateProduct } = useSeller();
  const [updatingStock, setUpdatingStock] = useState(false);

  const isCurrentlyInStock = Number(product.stock ?? 0) > 0;

  const handleToggleStock = async () => {
    setUpdatingStock(true);
    try {
      const nextStock = isCurrentlyInStock ? 0 : 10;
      await updateProduct(product._id || product.id, {
        stock: nextStock,
        inStock: !isCurrentlyInStock
      });
    } catch (err) {
      console.error('Failed to toggle stock status:', err);
    } finally {
      setUpdatingStock(false);
    }
  };

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

  const imageUrl = (product.images && product.images.length > 0)
    ? product.images[0]
    : (product.image || 'https://via.placeholder.com/150');
  const displayTitle = product.title || product.name || '';
  const displayCategory = product.category?.name || product.category || t('Uncategorized');

  return (
    <Swipeable renderRightActions={rightActions}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: getProductImageUrl(imageUrl) }} style={styles.image} />
          {!isCurrentlyInStock && (
            <View style={styles.outOfStockBadgeOverlay}>
              <Text style={styles.outOfStockBadgeOverlayText}>Out of Stock</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{displayTitle}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{displayCategory}</Text>
          </View>
          {!(
            (product.category?.name || product.category || '').toLowerCase().trim() === 'job portal' ||
            (product.category?.name || product.category || '').toLowerCase().trim() === 'service portal' ||
            (product.category?.name || product.category || '').toLowerCase().trim() === 'job-portal' ||
            (product.category?.name || product.category || '').toLowerCase().trim() === 'service-portal'
          ) && <Text style={styles.price}>${product.price}{product.priceUnit ? ` ${product.priceUnit}` : ''}</Text>}

          <View style={styles.stockRow}>
            <Text style={[styles.stock, isCurrentlyInStock ? styles.inStock : styles.outStock]}>
              {isCurrentlyInStock ? `${t('In Stock')} (${product.stock} ${product.stockUnit || 'pcs'})` : t('Out of Stock')}
            </Text>
          </View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[
                styles.stockToggleBtn,
                isCurrentlyInStock ? styles.stockBtnOut : styles.stockBtnIn,
                updatingStock && { opacity: 0.6 }
              ]}
              onPress={handleToggleStock}
              disabled={updatingStock}
            >
              {updatingStock ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name={isCurrentlyInStock ? "package-variant-closed-remove" : "package-variant-closed-check"}
                    size={14}
                    color="#fff"
                  />
                  <Text style={styles.stockToggleText}>
                    {isCurrentlyInStock ? t('Set Out of Stock') : t('Set In Stock')}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineButton} onPress={onEdit}>
              <MaterialCommunityIcons name="pencil" size={14} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.outlineButton, styles.deleteOutline]} onPress={onDelete}>
              <MaterialCommunityIcons name="trash-can-outline" size={14} color={colors.error} />
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
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  outOfStockBadgeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(211, 47, 47, 0.88)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingVertical: 2,
    alignItems: 'center',
  },
  outOfStockBadgeOverlayText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
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
  price: { marginTop: 6, fontSize: 15, fontWeight: '700', color: colors.primary },
  stockRow: { marginTop: 4 },
  stock: { fontSize: 13, fontWeight: '600' },
  inStock: { color: colors.success },
  outStock: { color: colors.error },
  buttonsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
  stockToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  stockBtnOut: {
    backgroundColor: '#e65100',
  },
  stockBtnIn: {
    backgroundColor: '#2e7d32',
  },
  stockToggleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  outlineButton: {
    padding: 7,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteOutline: { borderColor: colors.error },
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
