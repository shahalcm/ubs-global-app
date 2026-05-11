// app/(buyer)/payment.jsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

export default function PaymentScreen() {
  const [saveCard, setSaveCard] = useState(false)

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>UBS Global</Text>
        <View style={styles.secureBadge}>
          <Text style={styles.secureIcon}>🔒</Text>
          <Text style={styles.secureText}>Secure Transaction</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Secure Checkout</Text>

        {/* Express Checkout */}
        <TouchableOpacity style={styles.applePayBtn} activeOpacity={0.8}>
          <Text style={styles.applePayText}>Pay with Pay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.googlePayBtn} activeOpacity={0.8}>
          <Text style={styles.googlePayText}>Pay with GPay</Text>
        </TouchableOpacity>

        {/* Payment Method Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Payment Method</Text>
            <View style={styles.cardIconsRow}>
              <View style={[styles.cardIconBox, { backgroundColor: '#1a1f71' }]}><Text style={styles.cardIconText}>V</Text></View>
              <View style={[styles.cardIconBox, { backgroundColor: '#ff5f00' }]}><Text style={styles.cardIconText}>M</Text></View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput style={styles.input} placeholder="Full Name as on card" placeholderTextColor="#aaa" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <View style={styles.inputWithIcon}>
              <Text style={styles.inputIcon}>💳</Text>
              <TextInput style={styles.inputField} placeholder="0000 0000 0000 0000" keyboardType="number-pad" placeholderTextColor="#aaa" />
            </View>
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput style={styles.input} placeholder="MM / YY" placeholderTextColor="#aaa" />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <View style={styles.inputWithIcon}>
                <TextInput style={styles.inputField} placeholder="•••" secureTextEntry placeholderTextColor="#aaa" />
                <Text style={styles.cvvHelp}>?</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setSaveCard(!saveCard)} activeOpacity={0.8}>
            <View style={[styles.checkbox, saveCard && styles.checkboxActive]}>
              {saveCard && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Save card details for future global shipments</Text>
          </TouchableOpacity>
        </View>

        {/* PayPal Card */}
        <TouchableOpacity style={styles.paypalCard} activeOpacity={0.8}>
          <View style={styles.paypalLeft}>
            <View style={styles.paypalIconWrapper}><Text style={styles.paypalIcon}>P</Text></View>
            <Text style={styles.paypalText}>Pay with PayPal</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
          </View>
          <View style={styles.summaryBody}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryItem}>Bulk Industrial Lathes (3 units)</Text>
              <Text style={styles.summaryPrice}>$12,450.00</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryItem}>Ocean Freight (Shanghai to NYC)</Text>
              <Text style={styles.summaryPrice}>$1,200.00</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryItem}>Customs Insurance</Text>
              <Text style={styles.summaryPrice}>$245.00</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>$13,895.00</Text>
            </View>

            {/* Escrow Badge */}
            <View style={styles.escrowBox}>
              <Text style={styles.escrowIcon}>🛡</Text>
              <View style={styles.escrowTextCol}>
                <Text style={styles.escrowTitle}>Global Secure Shield</Text>
                <Text style={styles.escrowDesc}>Your funds are held in escrow until shipping confirmation is validated by UBS Global.</Text>
              </View>
            </View>

            {/* Pay Button */}
            <TouchableOpacity 
              style={styles.payBtn} 
              activeOpacity={0.9}
              onPress={() => router.push('/(buyer)/home')}
            >
              <Text style={styles.payBtnIcon}>🔒</Text>
              <Text style={styles.payBtnText}>Pay $13,895.00 Now</Text>
            </TouchableOpacity>

            <View style={styles.secureFooter}>
              <Text style={styles.secureFooterText}>🛡 SSL ENCRYPTED SECURE PAYMENT</Text>
              <Text style={styles.poweredText}>Powered by Stripe</Text>
            </View>
          </View>
        </View>

        {/* Delivery Estimate */}
        <View style={styles.deliveryCard}>
          <Text style={styles.routeTag}>PRE-VALIDATED ROUTE</Text>
          <Text style={styles.deliveryDate}>Delivery Estimated: Oct 24 - Oct 28</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLogos}>
            <View style={styles.footerLogoMock} />
            <View style={styles.footerLogoMock} />
            <View style={styles.footerLogoMock} />
          </View>
          <Text style={styles.footerText}>
            © 2024 UBS Global Logistics. Licensed International Trade Facilitator.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fbfbfe', // Match light bg
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  headerLogo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000040', // Deep Navy
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secureIcon: { fontSize: 12, color: '#888' },
  secureText: { fontSize: 13, color: '#666', fontWeight: '600' },
  
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 20,
  },

  // Express
  applePayBtn: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  applePayText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  googlePayBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  googlePayText: { color: '#333', fontSize: 16, fontWeight: '700' },

  // Cards Base
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000040',
  },
  cardIconsRow: { flexDirection: 'row', gap: 6 },
  cardIconBox: {
    width: 26,
    height: 16,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },

  // Inputs
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 11,
    color: '#555',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 14,
    color: '#333',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: { fontSize: 16, marginRight: 8, color: '#666' },
  inputField: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: '#333',
  },
  rowInputs: { flexDirection: 'row' },
  cvvHelp: { fontSize: 16, color: '#888', fontWeight: 'bold' },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: { backgroundColor: '#000040', borderColor: '#000040' },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  checkboxLabel: { flex: 1, fontSize: 12, color: '#555', lineHeight: 18 },

  // PayPal
  paypalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  paypalLeft: { flexDirection: 'row', alignItems: 'center' },
  paypalIconWrapper: {
    width: 24,
    height: 24,
    backgroundColor: '#003087',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paypalIcon: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontStyle: 'italic' },
  paypalText: { fontSize: 14, fontWeight: '700', color: '#333' },
  arrowIcon: { fontSize: 18, color: '#aaa', fontWeight: '600' },

  // Summary
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eaeaea',
    overflow: 'hidden',
  },
  summaryHeader: {
    backgroundColor: '#fbfbfe', // pale
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: '#000040' },
  summaryBody: { padding: 20 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: { fontSize: 13, color: '#666', flex: 1, paddingRight: 10 },
  summaryPrice: { fontSize: 13, color: '#555', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: { fontSize: 14, fontWeight: '800', color: '#333' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#000040' },

  escrowBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  escrowIcon: { fontSize: 16, color: '#0288d1', marginRight: 10, marginTop: 2 },
  escrowTextCol: { flex: 1 },
  escrowTitle: { fontSize: 11, fontWeight: '800', color: '#004d40', marginBottom: 2 },
  escrowDesc: { fontSize: 10, color: '#00695c', lineHeight: 15 },

  payBtn: {
    backgroundColor: '#000040',
    borderRadius: 10,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  payBtnIcon: { color: '#fff', fontSize: 14, marginRight: 8 },
  payBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  
  secureFooter: { alignItems: 'center' },
  secureFooterText: { fontSize: 10, fontWeight: '800', color: '#2e7d32', marginBottom: 4 },
  poweredText: { fontSize: 10, color: '#aaa' },

  // Delivery
  deliveryCard: {
    backgroundColor: '#f4f5fa',
    borderRadius: 12,
    padding: 24,
    marginBottom: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  routeTag: { fontSize: 10, fontWeight: '800', color: '#008b8b', letterSpacing: 0.5, marginBottom: 6 },
  deliveryDate: { fontSize: 15, fontWeight: '800', color: '#000040' },

  // Footer
  footer: { alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingTop: 24 },
  footerLogos: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  footerLogoMock: { width: 36, height: 24, backgroundColor: '#c5c5c5', borderRadius: 4 },
  footerText: { fontSize: 11, color: '#888', textAlign: 'center', paddingHorizontal: 30, lineHeight: 18 },
})
