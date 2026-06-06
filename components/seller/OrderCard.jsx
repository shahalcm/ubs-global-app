import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { useTranslation } from 'react-i18next';

const statusStyles = {
  Pending: { backgroundColor: '#fff4e5', color: '#b26f00' },
  Confirmed: { backgroundColor: '#e8f1ff', color: '#1a237e' },
  Shipped: { backgroundColor: '#f0f4ff', color: '#3f51b5' },
  Delivered: { backgroundColor: '#e7f5ec', color: colors.success },
  Cancelled: { backgroundColor: '#fdecea', color: colors.error },
};

export default function OrderCard({ order, onPressAction }) {
  const { t } = useTranslation();
  const statusStyle = statusStyles[order.status] || statusStyles.Pending;

  return (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <Text style={styles.orderId}>{order.id}</Text>
        <Text style={styles.date}>{order.date}</Text>
      </View>
      <View style={styles.productRow}>
        <Image source={{ uri: order.image }} style={styles.thumb} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{order.product}</Text>
          <Text style={styles.quantity}>{t('Qty')} {order.quantity} • ${order.price}</Text>
        </View>
      </View>
      <View style={styles.customerRow}>
        <View style={styles.avatar}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{order.customer?.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.customerName}>{order.customer}</Text>
          <Text style={styles.customerPhone}>{order.phone}</Text>
        </View>
      </View>
      <View style={styles.bottomRow}>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}> 
          <Text style={[styles.statusText, { color: statusStyle.color }]}>{t(order.status)}</Text>
        </View>
        <View style={styles.actions}> 
          {order.status === 'Pending' ? (
            <>
              <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={() => onPressAction('accept')}>
                <Text style={styles.buttonLabel}>{t('Accept')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={() => onPressAction('reject')}>
                <Text style={[styles.buttonLabel, { color: colors.error }]}>{t('Reject')}</Text>
              </TouchableOpacity>
            </>
          ) : order.status === 'Confirmed' ? (
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => onPressAction('ship')}>
              <Text style={[styles.buttonLabel, { color: '#fff' }]}>{t('Mark Shipped')}</Text>
            </TouchableOpacity>
          ) : order.status === 'Shipped' ? (
            <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={() => onPressAction('track')}>
              <Text style={styles.buttonLabel}>{t('Track')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  orderId: { fontSize: 14, fontWeight: '700', color: colors.text },
  date: { fontSize: 12, color: '#909090' },
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  thumb: { width: 50, height: 50, borderRadius: 14, marginRight: 16 },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '700', color: colors.text },
  quantity: { fontSize: 12, color: '#7a7a7a', marginTop: 4 },
  customerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  customerName: { fontSize: 13, fontWeight: '700', color: colors.text },
  customerPhone: { fontSize: 12, color: '#7a7a7a', marginTop: 2 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8 },
  button: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  acceptButton: {
    borderWidth: 1,
    borderColor: colors.success,
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#c4c4c4',
  },
  buttonLabel: { fontSize: 12, fontWeight: '700', color: colors.primary },
});
