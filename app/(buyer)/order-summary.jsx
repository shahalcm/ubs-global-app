import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { getProduct } from '../../services/productService'
import { createRazorpayOrder } from '../../services/paymentService'
import { getMyOrders } from '../../services/orderService'
import { useAuth } from '../../context/AuthContext'
import { colors } from '../../constants/colors'
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { getProductImageUrl } from '../../utils/image'

export default function OrderSummaryScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { productId, quantity, sellerId } = useLocalSearchParams()
  
  const [product, setProduct] = useState(null)
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  })
  
  const [errors, setErrors] = useState({})
  const [focusedField, setFocusedField] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pastAddress, setPastAddress] = useState(null)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await getProduct(productId)
        setProduct(res.product)
      } catch (err) {
        console.log('Error loading product:', err)
        Alert.alert('Error', 'Failed to load product details.')
      }
    }

    const fetchPastAddress = async () => {
      try {
        const res = await getMyOrders()
        if (res?.orders && res.orders.length > 0) {
          // Find the most recent order containing delivery address information
          const orderWithAddress = res.orders.find(o => o.deliveryAddress && o.deliveryAddress.street)
          if (orderWithAddress?.deliveryAddress) {
            setPastAddress(orderWithAddress.deliveryAddress)
          }
        }
      } catch (err) {
        console.log('Error fetching past orders:', err)
      }
    }

    loadProduct()
    fetchPastAddress()
  }, [productId])

  const handleAutofillPastAddress = () => {
    if (pastAddress) {
      setAddress({
        fullName: pastAddress.fullName || user?.name || '',
        phone: pastAddress.phone || user?.phone || '',
        email: pastAddress.email || user?.email || '',
        street: pastAddress.street || '',
        city: pastAddress.city || '',
        state: pastAddress.state || '',
        country: pastAddress.country || '',
        zipCode: pastAddress.zipCode || ''
      })
      setErrors({})
    }
  }

  const validateForm = () => {
    const tempErrors = {}
    if (!address.fullName.trim()) tempErrors.fullName = 'Full Name is required'
    if (!address.phone.trim()) tempErrors.phone = 'Phone Number is required'
    if (!address.street.trim()) tempErrors.street = 'Street Address is required'
    if (!address.city.trim()) tempErrors.city = 'City is required'
    if (!address.country.trim()) tempErrors.country = 'Country is required'
    
    if (address.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) {
      tempErrors.email = 'Please enter a valid email address'
    }

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const subtotal = product ? Number(product.price || 0) * Number(quantity) : 0
  const shipping = product?.freeShipping ? 0 : Number(product?.shippingFee || 0)
  const tax = subtotal * 0.05
  const grandTotal = subtotal + shipping + tax

  const handleContinueToPayment = async () => {
    if (!validateForm()) {
      Alert.alert('Missing Details', 'Please fill all required shipping information before proceeding.')
      return
    }

    setLoading(true)
    try {
      const res = await createRazorpayOrder({
        items: [{ productId, quantity: Number(quantity) }],
        sellerId,
        deliveryAddress: address
      })

      router.push({
        pathname: '/(buyer)/payment',
        params: {
          razorpayOrderId: res.razorpayOrderId,
          amount: res.amount,
          orderId: res.orderId,
          orderNumber: res.orderNumber,
          grandTotal: grandTotal.toFixed(2),
          key: res.key
        }
      })
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to initialize payment order.')
    } finally {
      setLoading(false)
    }
  }

  const renderInput = (field, placeholder, keyboardType = 'default', halfWidth = false, required = false) => {
    const isFocused = focusedField === field
    const hasError = !!errors[field]

    return (
      <View style={[styles.inputWrapper, halfWidth && { flex: 1 }]}>
        <Text style={[
          styles.inputLabel,
          isFocused && { color: colors.primary },
          hasError && { color: colors.error }
        ]}>
          {placeholder} {required && <Text style={{ color: colors.error }}>*</Text>}
        </Text>
        <View style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError
        ]}>
          <MaterialCommunityIcons
            name={getInputIcon(field)}
            size={18}
            color={hasError ? colors.error : isFocused ? colors.primary : colors.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder={`Enter ${placeholder.toLowerCase()}`}
            placeholderTextColor="#b0bec5"
            value={address[field]}
            onChangeText={t => {
              setAddress({ ...address, [field]: t })
              if (errors[field]) {
                setErrors({ ...errors, [field]: null })
              }
            }}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            keyboardType={keyboardType}
            autoCapitalize={field === 'email' ? 'none' : 'words'}
            autoCorrect={false}
          />
        </View>
        {hasError && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    )
  }

  const getInputIcon = (field) => {
    switch (field) {
      case 'fullName': return 'account-outline'
      case 'phone': return 'phone-outline'
      case 'email': return 'email-outline'
      case 'street': return 'map-marker-outline'
      case 'city': return 'city-variant-outline'
      case 'state': return 'map-outline'
      case 'country': return 'earth'
      case 'zipCode': return 'mailbox-outline'
      default: return 'pencil-outline'
    }
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/home')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Order Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Section: Product Information */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="shopping" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Items In Order</Text>
          </View>
          
          <View style={[styles.card, { flexDirection: 'row', alignItems: 'center' }]}>
            <Image source={{ uri: getProductImageUrl(product.images?.[0] || product.image) }} style={styles.pImg} />
            <View style={styles.pInfo}>
              <Text style={styles.pTitle} numberOfLines={2}>{product.title}</Text>
              
              <View style={styles.badgeRow}>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyBadgeText}>Qty: {quantity}</Text>
                </View>
                {product.freeShipping && (
                  <View style={styles.shippingBadge}>
                    <Text style={styles.shippingBadgeText}>Free Shipping</Text>
                  </View>
                )}
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceEach}>${Number(product.price || 0).toFixed(2)} each</Text>
                <Text style={styles.priceTotal}>Subtotal: ${subtotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Section: Delivery Details */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="truck-delivery" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>

          {/* Autofill from past order banner */}
          {pastAddress && (
            <View style={styles.autofillBanner}>
              <MaterialCommunityIcons name="history" size={22} color={colors.primary} style={{ marginRight: 10 }} />
              <View style={styles.autofillTextContainer}>
                <Text style={styles.autofillTitle}>Use Last Shipping Address?</Text>
                <Text style={styles.autofillDesc} numberOfLines={1}>
                  {pastAddress.street}, {pastAddress.city}
                </Text>
              </View>
              <TouchableOpacity style={styles.autofillBtn} onPress={handleAutofillPastAddress}>
                <Text style={styles.autofillBtnText}>Autofill</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.card}>
            {renderInput('fullName', 'Full Name', 'default', false, true)}
            {renderInput('phone', 'Phone Number', 'phone-pad', false, true)}
            {renderInput('email', 'Email Address', 'email-address', false, false)}
            {renderInput('street', 'Street Address', 'default', false, true)}
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {renderInput('city', 'City', 'default', true, true)}
              {renderInput('state', 'State', 'default', true, false)}
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {renderInput('country', 'Country', 'default', true, true)}
              {renderInput('zipCode', 'ZIP Code', 'default', true, false)}
            </View>
          </View>

          {/* Section: Pricing Details */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="receipt" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Price Details</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Items Subtotal</Text>
              <Text style={styles.rowVal}>${Number(subtotal).toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Shipping Fee</Text>
              <Text style={[styles.rowVal, shipping === 0 && { color: '#2e7d32', fontWeight: '700' }]}>
                {shipping === 0 ? 'FREE' : `$${Number(shipping).toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Tax (5%)</Text>
              <Text style={styles.rowVal}>${Number(tax).toFixed(2)}</Text>
            </View>
            
            <View style={styles.totalDivider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalVal}>${Number(grandTotal).toFixed(2)}</Text>
            </View>
          </View>

          {/* Secure details */}
          <View style={styles.noteBox}>
            <MaterialCommunityIcons name="shield-check" size={18} color="#2e7d32" />
            <Text style={styles.noteText}>Secure payments via Razorpay • 256-bit SSL</Text>
          </View>
        </ScrollView>

        {/* Footer Payment Action */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
          <TouchableOpacity
            style={[styles.payBtn, loading && styles.payBtnDisabled]}
            onPress={handleContinueToPayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.payBtnText}>Pay ${Number(grandTotal).toFixed(2)}</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>
          <View style={styles.trustContainer}>
            <MaterialCommunityIcons name="lock-outline" size={12} color="#9e9e9e" />
            <Text style={styles.trustText}>Your transaction is 100% encrypted & secure</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a237e',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a237e',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8eef8',
    elevation: 3,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  pImg: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#f5f5f5',
  },
  pInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  pTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 20,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  qtyBadge: {
    backgroundColor: '#e8eaf6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qtyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1a237e',
  },
  shippingBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shippingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2e7d32',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceEach: {
    fontSize: 12,
    color: '#757575',
  },
  priceTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a237e',
  },
  autofillBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8eaf6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c5cae9',
  },
  autofillTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  autofillTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 2,
  },
  autofillDesc: {
    fontSize: 11,
    color: '#5c6bc0',
  },
  autofillBtn: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  autofillBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  inputWrapper: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f5b66',
    marginBottom: 6,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    height: 48,
  },
  inputContainerFocused: {
    borderColor: '#1a237e',
    backgroundColor: '#ffffff',
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  inputContainerError: {
    borderColor: '#f44336',
    backgroundColor: '#fffdfd',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    height: '100%',
  },
  errorText: {
    fontSize: 11,
    color: '#f44336',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rowLabel: {
    fontSize: 13.5,
    color: '#616161',
    fontWeight: '500',
  },
  rowVal: {
    fontSize: 13.5,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  totalVal: {
    fontSize: 19,
    fontWeight: '900',
    color: '#1a237e',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    marginTop: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomBar: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  payBtn: {
    backgroundColor: '#1a237e',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  payBtnDisabled: {
    backgroundColor: '#9fa8da',
  },
  payBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
    marginRight: 6,
  },
  trustContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  trustText: {
    fontSize: 11,
    color: '#9e9e9e',
    fontWeight: '500',
  },
})
