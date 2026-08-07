import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useCurrency } from '../../../context/CurrencyContext'

const COUNTRIES = [
  { code: 'IN', name: 'India', currency: 'INR', symbol: '₹', timezone: 'Asia/Kolkata' },
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$', timezone: 'America/New_York' },
  { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€', timezone: 'Europe/Berlin' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£', timezone: 'Europe/London' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', symbol: 'AED', timezone: 'Asia/Dubai' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'CA$', timezone: 'America/Toronto' },
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$', timezone: 'Australia/Sydney' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: 'S$', timezone: 'Asia/Singapore' },
  { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥', timezone: 'Asia/Tokyo' },
  { code: 'MY', name: 'Malaysia', currency: 'MYR', symbol: 'RM', timezone: 'Asia/Kuala_Lumpur' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', symbol: 'SAR', timezone: 'Asia/Riyadh' },
  { code: 'QA', name: 'Qatar', currency: 'QAR', symbol: 'QAR', timezone: 'Asia/Qatar' }
]

export default function LanguageRegionScreen() {
  const { currency, countryCode, countryName, setCountry } = useCurrency()

  const handleSelectCountry = (item) => {
    setCountry(item.code)
    Alert.alert('Region Updated', `Country changed to ${item.name} (${item.currency}). Prices will now be displayed in ${item.currency}.`)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/home')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language & Region</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.activeCard}>
          <MaterialCommunityIcons name="earth" size={28} color="#1a237e" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.activeLabel}>CURRENT REGION</Text>
            <Text style={styles.activeValue}>{countryName} ({countryCode})</Text>
            <Text style={styles.activeSub}>Active Currency: {currency}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select Country & Currency</Text>
        <View style={styles.listCard}>
          {COUNTRIES.map((item) => {
            const isSelected = item.code === countryCode
            return (
              <TouchableOpacity
                key={item.code}
                style={[styles.rowItem, isSelected && styles.rowSelected]}
                onPress={() => handleSelectCountry(item)}
              >
                <View>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.currencyMeta}>{item.currency} — {item.symbol} ({item.timezone})</Text>
                </View>
                {isSelected ? (
                  <MaterialCommunityIcons name="check-circle" size={22} color="#1a237e" />
                ) : (
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  content: { padding: 16 },
  activeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e7ff', padding: 16, borderRadius: 16, marginBottom: 20 },
  activeLabel: { fontSize: 11, fontWeight: '800', color: '#3730a3', letterSpacing: 0.5 },
  activeValue: { fontSize: 18, fontWeight: '800', color: '#1e1b4b', marginTop: 2 },
  activeSub: { fontSize: 13, color: '#4338ca', marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#334155', marginBottom: 10, textTransform: 'uppercase' },
  listCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowSelected: { backgroundColor: '#f0f3ff' },
  countryName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  currencyMeta: { fontSize: 12, color: '#64748b', marginTop: 2 }
})
