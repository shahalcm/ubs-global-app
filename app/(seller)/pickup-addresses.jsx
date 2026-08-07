import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native'
import { router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getPickupAddresses, addPickupAddress, setDefaultPickupAddress } from '../../services/sellerService'

export default function PickupAddressesScreen() {
  const insets = useSafeAreaInsets()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  const [form, setForm] = useState({
    pickup_location: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pin_code: ''
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const res = await getPickupAddresses()
      if (res?.success) {
        setAddresses(res.addresses || [])
      }
    } catch (err) {
      console.log('Error fetching pickup addresses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubmit = async () => {
    if (!form.pickup_location || !form.name || !form.phone || !form.address || !form.city || !form.state || !form.pin_code) {
      Alert.alert('Missing Fields', 'Please fill all required fields.')
      return
    }

    try {
      setSubmitting(true)
      const res = await addPickupAddress(form)
      if (res?.success) {
        Alert.alert('Success', 'Pickup address registered with Shiprocket successfully!')
        setModalVisible(false)
        setForm({
          pickup_location: '',
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          country: 'India',
          pin_code: ''
        })
        fetchAddresses()
      } else {
        Alert.alert('Error', res?.message || 'Failed to add pickup address.')
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save pickup location.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSetDefault = async (locationId) => {
    try {
      const res = await setDefaultPickupAddress(locationId)
      if (res?.success) {
        Alert.alert('Updated', 'Default pickup location updated!')
        fetchAddresses()
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to set default location.')
    }
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(seller)/dashboard')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shiprocket Pickup Hub</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons name="plus-circle-outline" size={26} color="#1a237e" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={{ marginTop: 10, color: '#64748b' }}>Loading pickup locations...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.infoBanner}>
            <MaterialCommunityIcons name="truck-fast" size={24} color="#1a237e" />
            <Text style={styles.infoText}>
              Registered pickup locations sync automatically with Shiprocket for seller package pickups & courier AWB assignments.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Registered Pickup Hubs ({addresses.length})</Text>

          {addresses.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="map-marker-off-outline" size={42} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No Pickup Locations Registered</Text>
              <Text style={styles.emptySub}>Add your store warehouse or pickup address to enable automated courier dispatches.</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                <Text style={styles.addBtnText}>+ Add Pickup Location</Text>
              </TouchableOpacity>
            </View>
          ) : (
            addresses.map((item, idx) => (
              <View key={item._id || idx} style={[styles.card, item.isDefault && styles.cardDefault]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.locationTag}>{item.pickup_location || 'Primary Hub'}</Text>
                    <Text style={styles.contactName}>{item.name} • {item.phone}</Text>
                  </View>
                  {item.isDefault ? (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.setDefaultBtn} onPress={() => handleSetDefault(item._id)}>
                      <Text style={styles.setDefaultText}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.addressBox}>
                  <MaterialCommunityIcons name="map-marker-outline" size={16} color="#64748b" />
                  <Text style={styles.addressText}>
                    {item.address}, {item.city}, {item.state} - {item.pin_code} ({item.country || 'India'})
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Pickup Location Hub</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text style={styles.inputLabel}>Location Tag / Code (e.g. warehouse_1)</Text>
              <TextInput style={styles.input} placeholder="warehouse_main" value={form.pickup_location} onChangeText={t => setForm({ ...form, pickup_location: t })} />

              <Text style={styles.inputLabel}>Contact Person Name</Text>
              <TextInput style={styles.input} placeholder="John Doe" value={form.name} onChangeText={t => setForm({ ...form, name: t })} />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput style={styles.input} placeholder="9876543210" keyboardType="phone-pad" value={form.phone} onChangeText={t => setForm({ ...form, phone: t })} />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput style={styles.input} placeholder="warehouse@store.com" keyboardType="email-address" value={form.email} onChangeText={t => setForm({ ...form, email: t })} />

              <Text style={styles.inputLabel}>Street Address</Text>
              <TextInput style={styles.input} placeholder="123 Industrial Area, Phase 2" value={form.address} onChangeText={t => setForm({ ...form, address: t })} />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput style={styles.input} placeholder="Mumbai" value={form.city} onChangeText={t => setForm({ ...form, city: t })} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>State</Text>
                  <TextInput style={styles.input} placeholder="Maharashtra" value={form.state} onChangeText={t => setForm({ ...form, state: t })} />
                </View>
              </View>

              <Text style={styles.inputLabel}>PIN Code</Text>
              <TextInput style={styles.input} placeholder="400001" keyboardType="number-pad" value={form.pin_code} onChangeText={t => setForm({ ...form, pin_code: t })} />

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Register Pickup Hub</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e7ff', padding: 14, borderRadius: 14, marginBottom: 16, gap: 10 },
  infoText: { flex: 1, fontSize: 12, color: '#3730a3', fontWeight: '600', lineHeight: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#334155', marginBottom: 12, textTransform: 'uppercase' },
  emptyCard: { alignItems: 'center', padding: 32, backgroundColor: '#ffffff', borderRadius: 16, borderBorderWidth: 1, borderColor: '#e2e8f0' },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginTop: 12 },
  emptySub: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  addBtn: { backgroundColor: '#1a237e', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  addBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 13 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardDefault: { borderColor: '#1a237e', borderWidth: 1.5, backgroundColor: '#f8fafc' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  locationTag: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  contactName: { fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: '600' },
  defaultBadge: { backgroundColor: '#1a237e', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  defaultBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
  setDefaultBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  setDefaultText: { color: '#475569', fontSize: 11, fontWeight: '700' },
  addressBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', padding: 10, borderRadius: 10 },
  addressText: { flex: 1, fontSize: 12, color: '#334155', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' },
  submitBtn: { backgroundColor: '#1a237e', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  submitBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 15 }
})
