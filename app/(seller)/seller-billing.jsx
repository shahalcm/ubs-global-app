import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { getSellerEarnings, requestWithdrawal } from '../../services/paymentService'

export default function SellerBillingScreen() {
  const [data, setData] = useState({
    earnings: { totalEarnings: 0, pendingWithdrawal: 0, withdrawnAmount: 0, totalCommissionPaid: 0 },
    transactions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await getSellerEarnings()
      if (res.success) setData(res)
    } catch(err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawal = async () => {
    if (data.earnings.pendingWithdrawal <= 0) {
      Alert.alert('Notice', 'No pending balance to withdraw.')
      return
    }

    Alert.prompt(
      'Request Withdrawal',
      `Enter amount to withdraw (Max: $${data.earnings.pendingWithdrawal})`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit', 
          onPress: async (val) => {
            const amount = Number(val)
            if (isNaN(amount) || amount <= 0 || amount > data.earnings.pendingWithdrawal) {
              Alert.alert('Error', 'Invalid amount')
              return
            }
            try {
              const res = await requestWithdrawal({ amount })
              Alert.alert('Success', res.message)
              loadData()
            } catch(err) {
              Alert.alert('Error', err.response?.data?.message || 'Withdrawal failed')
            }
          }
        }
      ],
      'plain-text',
      data.earnings.pendingWithdrawal.toString()
    )
  }

  if (loading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator style={{marginTop:50}} size="large" /></SafeAreaView>
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialCommunityIcons name="arrow-left" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Billing & Earnings</Text>
        <View style={{width:24}}/>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Available to Withdraw</Text>
            <Text style={[styles.statValue, {color:'#008b8b'}]}>${data.earnings.pendingWithdrawal}</Text>
            <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdrawal}>
              <Text style={styles.withdrawBtnText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Withdrawn</Text>
            <Text style={[styles.statValue, {color:'#666'}]}>${data.earnings.withdrawnAmount}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, {flex:1, marginRight:10}]}>
            <Text style={styles.statLabel}>Total Earnings</Text>
            <Text style={styles.statValue}>${data.earnings.totalEarnings}</Text>
          </View>
          <View style={[styles.statCard, {flex:1}]}>
            <Text style={styles.statLabel}>Platform Fees (3%)</Text>
            <Text style={[styles.statValue, {color:'#e53935'}]}>${data.earnings.totalCommissionPaid}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {data.transactions.map((tx) => (
          <View key={tx._id} style={styles.txCard}>
            <View style={styles.txHeader}>
              <Text style={styles.txOrder}>Order #{tx.orderNumber}</Text>
              <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.txBody}>
              <Text style={styles.txBuyer}>Buyer: {tx.buyerId?.name}</Text>
              <View style={styles.txAmounts}>
                <Text style={styles.txGross}>Gross: ${tx.grossAmount}</Text>
                <Text style={styles.txFee}>Fee: -${tx.commissionAmount}</Text>
                <Text style={styles.txNet}>Net: ${tx.sellerEarnings}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eaeaea' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#000040' },
  scrollContent: { padding: 16 },
  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eaeaea' },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#000040' },
  withdrawBtn: { backgroundColor: '#1a237e', padding: 8, borderRadius: 6, marginTop: 12, alignItems: 'center' },
  withdrawBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  statsRow: { flexDirection: 'row', marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 12 },
  txCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eaeaea' },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  txOrder: { fontWeight: '700', color: '#1a237e' },
  txDate: { fontSize: 12, color: '#888' },
  txBody: { flexDirection: 'row', justifyContent: 'space-between' },
  txBuyer: { fontSize: 13, color: '#555' },
  txAmounts: { alignItems: 'flex-end' },
  txGross: { fontSize: 12, color: '#666' },
  txFee: { fontSize: 12, color: '#e53935' },
  txNet: { fontSize: 14, fontWeight: '800', color: '#008b8b', marginTop: 4 }
})
