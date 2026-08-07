import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, SafeAreaView } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useCurrency } from '../../context/CurrencyContext'

const COUNTRIES = [
  { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' },
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
  { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', symbol: 'AED' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'CA$' },
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: 'S$' },
  { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥' },
  { code: 'MY', name: 'Malaysia', currency: 'MYR', symbol: 'RM' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', symbol: 'SAR' },
  { code: 'QA', name: 'Qatar', currency: 'QAR', symbol: 'QAR' },
  { code: 'CN', name: 'China', currency: 'CNY', symbol: 'CN¥' }
]

export default function CurrencySelector() {
  const [modalVisible, setModalVisible] = useState(false)
  const { currency, symbol, countryCode, countryName, setCountry } = useCurrency()

  const handleSelect = (item) => {
    setCountry(item.code)
    setModalVisible(false)
  }

  return (
    <View>
      <TouchableOpacity
        style={styles.selectorBtn}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="earth" size={18} color="#1a237e" />
        <Text style={styles.selectorText}>{countryCode} ({symbol})</Text>
        <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Country & Currency</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={COUNTRIES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => {
              const isSelected = item.code === countryCode
              return (
                <TouchableOpacity
                  style={[styles.countryItem, isSelected && styles.selectedItem]}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.countryInfo}>
                    <Text style={styles.countryName}>{item.name}</Text>
                    <Text style={styles.currencyMeta}>{item.currency} — {item.symbol}</Text>
                  </View>
                  {isSelected && <MaterialCommunityIcons name="check-circle" size={22} color="#1a237e" />}
                </TouchableOpacity>
              )
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f3ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a237e'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a237e'
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  selectedItem: {
    backgroundColor: '#f0f3ff'
  },
  countryInfo: {
    gap: 2
  },
  countryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333'
  },
  currencyMeta: {
    fontSize: 13,
    color: '#666'
  }
})
