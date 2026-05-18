import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import SellerHeader from '../../components/seller/SellerHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useSeller } from '../../context/SellerContext';

const timelineSteps = ['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

export default function OrderDetails() {
  const { orders, updateOrderStatus } = useSeller();
  const order = orders?.[0] || { id: '#UBS-00123', date: 'May 10, 2026', product: 'Imported Coffee Beans', quantity: 2, price: 52, customer: 'Ayesha Khan', phone: '+91 98765 43210', email: 'ayesha@example.com', address: '12 Market Lane, Mumbai', status: 'Confirmed', method: 'Credit Card', subtotal: 104, shipping: 10, tax: 8, total: 122 };
  const [courier, setCourier] = useState('');
  const [tracking, setTracking] = useState('');
  const [eta, setEta] = useState('May 20, 2026');
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, { courier, tracking, eta });
      alert('Order status updated.');
    } catch (err) {
      alert(err.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={styles.screen}>
      <SellerHeader title={`Order ${order.id}`} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.timelineCard}>
          <Text style={styles.cardTitle}>Order Status</Text>
          {timelineSteps.map((step, index) => {
            const completed = index <= timelineSteps.indexOf(order.status === 'Confirmed' ? 'Confirmed' : order.status);
            return (
              <View key={step} style={styles.timelineRow}>
                <View style={[styles.timelineDot, completed ? styles.timelineActive : styles.timelineInactive]}>
                  {completed && <MaterialCommunityIcons name="check" size={12} color="#fff" />}
                </View>
                <Text style={[styles.timelineLabel, completed && styles.timelineLabelActive]}>{step}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Product Details</Text>
          <View style={styles.itemRow}><Text style={styles.itemLabel}>Name</Text><Text style={styles.itemValue}>{order.product}</Text></View>
          <View style={styles.itemRow}><Text style={styles.itemLabel}>Quantity</Text><Text style={styles.itemValue}>{order.quantity}</Text></View>
          <View style={styles.itemRow}><Text style={styles.itemLabel}>Subtotal</Text><Text style={styles.itemValue}>${order.subtotal}</Text></View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Customer Info</Text>
          <View style={styles.customerRow}><View style={styles.avatar}><Text style={styles.avatarText}>{order.customer.charAt(0)}</Text></View><View><Text style={styles.customerName}>{order.customer}</Text><Text style={styles.customerMeta}>{order.phone}</Text></View></View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Delivery Address</Text>
          <View style={styles.addressRow}><MaterialCommunityIcons name="map-marker-radius" size={18} color={colors.primary} /><Text style={styles.addressText}>{order.address}</Text></View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Payment Info</Text>
          <View style={styles.itemRow}><Text style={styles.itemLabel}>Method</Text><Text style={styles.itemValue}>{order.method}</Text></View>
          <View style={styles.itemRow}><Text style={styles.itemLabel}>Shipping</Text><Text style={styles.itemValue}>${order.shipping}</Text></View>
          <View style={styles.itemRow}><Text style={styles.itemLabel}>Tax</Text><Text style={styles.itemValue}>${order.tax}</Text></View>
          <View style={[styles.itemRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>${order.total}</Text></View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Update Shipping Details</Text>
          <TextInput style={styles.input} placeholder="Courier name" value={courier} onChangeText={setCourier} />
          <TextInput style={styles.input} placeholder="Tracking number" value={tracking} onChangeText={setTracking} />
          <TextInput style={styles.input} placeholder="Estimated delivery date" value={eta} onChangeText={setEta} />
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} disabled={updating}> {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.updateText}>Update Order Status</Text>} </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 20 },
  timelineCard: { backgroundColor: '#fff', borderRadius: 22, padding: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 14, elevation: 4 },
  detailCard: { backgroundColor: '#fff', borderRadius: 22, padding: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 14, elevation: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  timelineDot: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  timelineActive: { backgroundColor: colors.primary },
  timelineInactive: { backgroundColor: '#eaeaea' },
  timelineLabel: { color: '#7a7a7a', fontSize: 14 },
  timelineLabelActive: { color: colors.text, fontWeight: '700' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  itemLabel: { color: '#7a7a7a', fontSize: 13 },
  itemValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  customerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  customerName: { fontSize: 15, fontWeight: '700', color: colors.text },
  customerMeta: { fontSize: 13, color: '#7a7a7a', marginTop: 4 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  addressText: { marginLeft: 10, color: '#666', fontSize: 13, lineHeight: 20, flex: 1 },
  input: { borderWidth: 1, borderColor: '#eef0ff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 12, backgroundColor: '#fafaff' },
  updateButton: { marginTop: 10, backgroundColor: colors.primary, borderRadius: 18, paddingVertical: 16, alignItems: 'center' },
  updateText: { color: '#fff', fontWeight: '700' },
});
