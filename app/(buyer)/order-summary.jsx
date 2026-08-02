import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  ActivityIndicator,
  Keyboard
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

// Field Order for Keyboard Navigation
const FIELD_ORDER = ['fullName', 'phone', 'email', 'street', 'landmark', 'city', 'state', 'country', 'zipCode']

const getInputIcon = (field) => {
  switch (field) {
    case 'fullName': return 'account-outline'
    case 'phone': return 'phone-outline'
    case 'email': return 'email-outline'
    case 'street': return 'map-marker-outline'
    case 'landmark': return 'compass-outline'
    case 'city': return 'city-variant-outline'
    case 'state': return 'map-outline'
    case 'country': return 'earth'
    case 'zipCode': return 'mailbox-outline'
    default: return 'pencil-outline'
  }
}

// Ultra-Stable Standalone Memoized Input Component with Fixed Android Autofill Handling
const AddressInput = React.memo(React.forwardRef(({
  field,
  label,
  value,
  onChangeText,
  onFocus,
  onBlur,
  error,
  isFocused,
  keyboardType = 'default',
  autoCapitalize = 'words',
  returnKeyType = 'next',
  onSubmitEditing,
  halfWidth = false,
  required = false
}, ref) => {
  const icon = getInputIcon(field)

  useEffect(() => {
    return () => {
      if (ref && ref.current) {
        try {
          ref.current.blur()
        } catch (e) {}
      }
    }
  }, [ref])

  const handleChangeText = useCallback((text) => {
    onChangeText(field, text)
  }, [field, onChangeText])

  const handleFocus = useCallback(() => {
    onFocus(field)
  }, [field, onFocus])

  const handleBlur = useCallback(() => {
    onBlur(field)
  }, [field, onBlur])

  const handleSubmitEditing = useCallback(() => {
    onSubmitEditing(field)
  }, [field, onSubmitEditing])

  return (
    <View style={[styles.inputWrapper, halfWidth && { flex: 1 }]}>
      <Text style={[
        styles.inputLabel,
        isFocused && { color: colors.primary },
        !!error && { color: colors.error }
      ]}>
        {label} {required && <Text style={{ color: colors.error }}>*</Text>}
      </Text>
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        !!error && styles.inputContainerError
      ]}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={error ? colors.error : isFocused ? colors.primary : '#8ea0b5'}
          style={styles.inputIcon}
        />
        <TextInput
          ref={ref}
          style={styles.textInput}
          placeholder={`Enter ${label.replace('*', '').toLowerCase()}`}
          placeholderTextColor="#b0bec5"
          value={value || ''}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete="off"
          importantForAutofill="no"
          textContentType="none"
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={handleSubmitEditing}
          blurOnSubmit={returnKeyType === 'done'}
          accessibilityLabel={label}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}))

export default function OrderSummaryScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { productId, quantity, sellerId } = useLocalSearchParams()
  
  const scrollViewRef = useRef(null)
  const isSubmittingRef = useRef(false)
  const fieldYMap = useRef({})

  // Input Field References
  const fullNameRef = useRef(null)
  const phoneRef = useRef(null)
  const emailRef = useRef(null)
  const streetRef = useRef(null)
  const landmarkRef = useRef(null)
  const cityRef = useRef(null)
  const stateRef = useRef(null)
  const countryRef = useRef(null)
  const zipCodeRef = useRef(null)

  const fieldRefsMap = useMemo(() => ({
    fullName: fullNameRef,
    phone: phoneRef,
    email: emailRef,
    street: streetRef,
    landmark: landmarkRef,
    city: cityRef,
    state: stateRef,
    country: countryRef,
    zipCode: zipCodeRef
  }), [])

  const [product, setProduct] = useState(null)
  const [addressType, setAddressType] = useState('home')
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  })
  
  const [shippingSpeed, setShippingSpeed] = useState('standard')
  const [sellerNote, setSellerNote] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [promoSuccess, setPromoSuccess] = useState('')

  const [errors, setErrors] = useState({})
  const [focusedField, setFocusedField] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pastAddress, setPastAddress] = useState(null)

  const hasSyncedUserRef = useRef(false)
  useEffect(() => {
    if (user && !hasSyncedUserRef.current) {
      hasSyncedUserRef.current = true
      setAddress(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || ''
      }))
    }
  }, [user])

  useEffect(() => {
    let isMounted = true
    const loadProduct = async () => {
      try {
        if (!productId) return
        const res = await getProduct(productId)
        if (isMounted && res?.product) {
          setProduct(res.product)
        }
      } catch (err) {
        console.log('Error loading product:', err)
        Alert.alert('Error', 'Failed to load product details.')
      }
    }

    const fetchPastAddress = async () => {
      try {
        const res = await getMyOrders()
        if (isMounted && res?.orders && res.orders.length > 0) {
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

    return () => {
      isMounted = false
    }
  }, [productId])

  const isIndia = useMemo(() => {
    const country = (address.country || '').trim().toLowerCase()
    const state = (address.state || '').trim().toLowerCase()
    const zip = (address.zipCode || '').trim()
    return (
      country.includes('india') ||
      country.includes('bharat') ||
      country === 'in' ||
      state.includes('kerala') ||
      state.includes('delhi') ||
      state.includes('mumbai') ||
      state.includes('karnataka') ||
      state.includes('tamil') ||
      /^[1-9][0-9]{5}$/.test(zip)
    )
  }, [address.country, address.state, address.zipCode])

  const currencySymbol = isIndia ? '₹' : '$'
  const currencyCode = isIndia ? 'INR' : 'USD'
  const exchangeRate = isIndia ? 83.0 : 1.0

  const subtotal = useMemo(() => {
    if (!product) return 0
    return Number(product.price || 0) * Number(quantity || 1) * exchangeRate
  }, [product, quantity, exchangeRate])

  const baseShippingFee = useMemo(() => {
    if (!product || product.freeShipping) return 0
    return Number(product.shippingFee || 0) * exchangeRate
  }, [product, exchangeRate])

  const expressShippingFee = useMemo(() => {
    return shippingSpeed === 'express' ? 9.99 * exchangeRate : 0
  }, [shippingSpeed, exchangeRate])

  const totalShipping = useMemo(() => baseShippingFee + expressShippingFee, [baseShippingFee, expressShippingFee])
  const tax = useMemo(() => subtotal * 0.05, [subtotal])
  
  const grandTotal = useMemo(() => {
    const rawTotal = subtotal + totalShipping + tax - appliedDiscount
    return Math.max(0, rawTotal)
  }, [subtotal, totalShipping, tax, appliedDiscount])

  const estimatedDeliveryText = useMemo(() => {
    const date = new Date()
    const daysToAdd = shippingSpeed === 'express' ? 2 : 5
    date.setDate(date.getDate() + daysToAdd)
    const options = { weekday: 'short', month: 'short', day: 'numeric' }
    return `${date.toLocaleDateString('en-US', options)} (${shippingSpeed === 'express' ? '1-2 Days' : '3-5 Days'})`
  }, [shippingSpeed])

  const handleInputChange = useCallback((field, text) => {
    setAddress(prev => ({ ...prev, [field]: text }))
    setErrors(prev => (prev[field] ? { ...prev, [field]: null } : prev))

    if (field === 'zipCode' && /^[1-9][0-9]{5}$/.test(text.trim())) {
      setAddress(prev => ({
        ...prev,
        zipCode: text,
        country: prev.country || 'India'
      }))
    }
  }, [])

  const handleFocusField = useCallback((field) => {
    setFocusedField(field)
  }, [])

  // Dismiss Keyboard & Active Focus on Scroll to prevents floating overlays
  const handleScrollBegin = useCallback(() => {
    if (focusedField && fieldRefsMap[focusedField]?.current) {
      try {
        fieldRefsMap[focusedField].current.blur()
      } catch (e) {}
    }
    Keyboard.dismiss()
    setFocusedField(null)
  }, [focusedField, fieldRefsMap])

  const handleBlurField = useCallback((field) => {
    setFocusedField(null)
    setAddress(prev => {
      const val = prev[field]
      if (!val) return prev
      let cleaned = val.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F800}-\u{1F8FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      cleaned = cleaned.replace(/\s{2,}/g, ' ').trim()
      return { ...prev, [field]: cleaned }
    })
  }, [])

  const handleAutofillPastAddress = useCallback(() => {
    if (pastAddress) {
      setAddress({
        fullName: pastAddress.fullName || pastAddress.name || user?.name || '',
        phone: pastAddress.phone || user?.phone || '',
        email: pastAddress.email || user?.email || '',
        street: pastAddress.street || '',
        landmark: pastAddress.landmark || pastAddress.deliveryInstructions || '',
        city: pastAddress.city || '',
        state: pastAddress.state || '',
        country: pastAddress.country || 'India',
        zipCode: pastAddress.zipCode || ''
      })
      setErrors({})
    }
  }, [pastAddress, user])

  const handleApplyPromo = useCallback(() => {
    const code = promoCode.trim().toUpperCase()
    if (!code) return

    if (code === 'UBS10' || code === 'WELCOME10' || code === 'GLOBAL10') {
      const discountVal = subtotal * 0.10
      setAppliedDiscount(discountVal)
      setPromoSuccess('🎉 10% Discount Applied!')
      Alert.alert('Promo Applied!', `You saved ${currencySymbol}${discountVal.toFixed(2)} with code ${code}`)
    } else {
      Alert.alert('Invalid Code', 'Try UBS10 or WELCOME10 for 10% off.')
    }
  }, [promoCode, subtotal, currencySymbol])

  const validateForm = useCallback(() => {
    const tempErrors = {}
    const fullNameVal = (address.fullName || '').trim()
    const phoneVal = (address.phone || '').trim()
    const streetVal = (address.street || '').trim()
    const cityVal = (address.city || '').trim()
    const stateVal = (address.state || '').trim()
    const countryVal = (address.country || '').trim()
    const zipCodeVal = (address.zipCode || '').trim()
    const emailVal = (address.email || '').trim()

    if (!fullNameVal) tempErrors.fullName = 'Full Name is required'
    if (!phoneVal) tempErrors.phone = 'Phone Number is required'
    else if (phoneVal.length < 7) tempErrors.phone = 'Please enter a valid phone number'

    if (!streetVal) tempErrors.street = 'Street Address is required'
    if (!cityVal) tempErrors.city = 'City is required'
    if (!stateVal) tempErrors.state = 'State is required'
    if (!countryVal) tempErrors.country = 'Country is required'
    if (!zipCodeVal) tempErrors.zipCode = 'ZIP Code is required'
    
    if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      tempErrors.email = 'Please enter a valid email address'
    }

    setErrors(tempErrors)
    const errorKeys = Object.keys(tempErrors)

    if (errorKeys.length > 0) {
      const firstErrorField = FIELD_ORDER.find(f => tempErrors[f])
      if (firstErrorField && fieldYMap.current[firstErrorField] !== undefined) {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, fieldYMap.current[firstErrorField] - 30),
          animated: true
        })
        fieldRefsMap[firstErrorField]?.current?.focus()
      }
      return false
    }

    return true
  }, [address, fieldRefsMap])

  const isFormValid = useMemo(() => {
    return (
      (address.fullName || '').trim().length > 0 &&
      (address.phone || '').trim().length >= 7 &&
      (address.street || '').trim().length > 0 &&
      (address.city || '').trim().length > 0 &&
      (address.state || '').trim().length > 0 &&
      (address.country || '').trim().length > 0 &&
      (address.zipCode || '').trim().length > 0 &&
      Object.keys(errors).every(k => !errors[k])
    )
  }, [address, errors])

  const handleContinueToPayment = useCallback(async () => {
    if (isSubmittingRef.current || loading) return

    if (!validateForm()) {
      Alert.alert('Missing Details', 'Please fill all required shipping fields correctly before proceeding.')
      return
    }

    isSubmittingRef.current = true
    setLoading(true)

    try {
      const res = await createRazorpayOrder({
        items: [{ productId, quantity: Number(quantity) || 1 }],
        sellerId,
        currency: currencyCode,
        shippingSpeed,
        sellerNote: (sellerNote || '').trim(),
        deliveryAddress: {
          addressType,
          fullName: (address.fullName || '').trim(),
          name: (address.fullName || '').trim(),
          phone: (address.phone || '').trim(),
          email: (address.email || '').trim(),
          street: (address.street || '').trim(),
          landmark: (address.landmark || '').trim(),
          city: (address.city || '').trim(),
          state: (address.state || '').trim(),
          country: (address.country || '').trim(),
          zipCode: (address.zipCode || '').trim(),
          deliveryInstructions: (address.landmark || '').trim()
        }
      })

      router.push({
        pathname: '/(buyer)/payment',
        params: {
          razorpayOrderId: res.razorpayOrderId,
          amount: res.amount,
          currency: currencyCode,
          orderId: res.orderId,
          orderNumber: res.orderNumber,
          grandTotal: grandTotal.toFixed(2),
          key: res.key
        }
      })
    } catch (error) {
      Alert.alert('Payment Error', error.response?.data?.message || 'Failed to initialize order payment.')
    } finally {
      setLoading(false)
      isSubmittingRef.current = false
    }
  }, [address, addressType, validateForm, loading, productId, quantity, sellerId, currencyCode, grandTotal, shippingSpeed, sellerNote])

  const focusNextField = useCallback((currentField) => {
    const index = FIELD_ORDER.indexOf(currentField)
    if (index >= 0 && index < FIELD_ORDER.length - 1) {
      const nextField = FIELD_ORDER[index + 1]
      fieldRefsMap[nextField]?.current?.focus()
    } else {
      Keyboard.dismiss()
    }
  }, [fieldRefsMap])

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
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/home')}
          accessibilityLabel="Back button"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Checkout & Review</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 130 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={handleScrollBegin}
          scrollEventThrottle={16}
        >
          {/* Progress Stepper Bar */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleDone]}>
                <MaterialCommunityIcons name="check" size={14} color="#ffffff" />
              </View>
              <Text style={styles.stepTextDone}>Cart</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={styles.stepNumActive}>2</Text>
              </View>
              <Text style={styles.stepTextActive}>Shipping</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNum}>3</Text>
              </View>
              <Text style={styles.stepText}>Payment</Text>
            </View>
          </View>

          {/* Product Info */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="shopping-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Items In Order</Text>
          </View>
          
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={{ uri: getProductImageUrl(product.images?.[0] || product.image) }} style={styles.pImg} />
              <View style={styles.pInfo}>
                <Text style={styles.pTitle} numberOfLines={2}>{product.title}</Text>
                
                <View style={styles.badgeRow}>
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyBadgeText}>Qty: {quantity}</Text>
                  </View>
                  {product.freeShipping ? (
                    <View style={styles.shippingBadge}>
                      <Text style={styles.shippingBadgeText}>Free Shipping</Text>
                    </View>
                  ) : (
                    <View style={[styles.shippingBadge, { backgroundColor: '#fff3e0' }]}>
                      <Text style={[styles.shippingBadgeText, { color: '#e65100' }]}>Standard Shipping</Text>
                    </View>
                  )}
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceEach}>{currencySymbol}{(Number(product.price || 0) * exchangeRate).toFixed(2)} each</Text>
                  <Text style={styles.priceTotal}>Subtotal: {currencySymbol}{subtotal.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.estDeliveryBox}>
              <MaterialCommunityIcons name="truck-delivery-outline" size={16} color="#1a237e" />
              <Text style={styles.estDeliveryText}>
                Estimated Delivery: <Text style={{ fontWeight: '800' }}>{estimatedDeliveryText}</Text>
              </Text>
            </View>
          </View>

          {/* Autofill past address */}
          {pastAddress && (
            <View style={styles.autofillBanner}>
              <MaterialCommunityIcons name="history" size={22} color={colors.primary} style={{ marginRight: 10 }} />
              <View style={styles.autofillTextContainer}>
                <Text style={styles.autofillTitle}>Use Last Shipping Address?</Text>
                <Text style={styles.autofillDesc} numberOfLines={1}>
                  {pastAddress.street}, {pastAddress.city}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.autofillBtn}
                onPress={handleAutofillPastAddress}
                accessibilityLabel="Autofill past address button"
                accessibilityRole="button"
              >
                <Text style={styles.autofillBtnText}>Autofill</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Section 1: Contact Details */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account-details-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Contact Details</Text>
          </View>

          <View style={styles.card}>
            <AddressInput
              ref={fullNameRef}
              field="fullName"
              label="Full Name"
              value={address.fullName}
              onChangeText={handleInputChange}
              onFocus={handleFocusField}
              onBlur={handleBlurField}
              error={errors.fullName}
              isFocused={focusedField === 'fullName'}
              required
              onSubmitEditing={focusNextField}
            />

            <AddressInput
              ref={phoneRef}
              field="phone"
              label="Phone Number"
              value={address.phone}
              onChangeText={handleInputChange}
              onFocus={handleFocusField}
              onBlur={handleBlurField}
              error={errors.phone}
              isFocused={focusedField === 'phone'}
              keyboardType="phone-pad"
              required
              onSubmitEditing={focusNextField}
            />

            <AddressInput
              ref={emailRef}
              field="email"
              label="Email Address"
              value={address.email}
              onChangeText={handleInputChange}
              onFocus={handleFocusField}
              onBlur={handleBlurField}
              error={errors.email}
              isFocused={focusedField === 'email'}
              keyboardType="email-address"
              autoCapitalize="none"
              onSubmitEditing={focusNextField}
            />
          </View>

          {/* Section 2: Shipping Location */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Shipping Location</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.inputLabel}>Address Type</Text>
            <View style={styles.addressTypeContainer}>
              <TouchableOpacity
                style={[styles.typePill, addressType === 'home' && styles.typePillActive]}
                onPress={() => setAddressType('home')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="home-outline"
                  size={16}
                  color={addressType === 'home' ? '#ffffff' : '#64748b'}
                />
                <Text style={[styles.typePillText, addressType === 'home' && styles.typePillTextActive]}>Home</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typePill, addressType === 'work' && styles.typePillActive]}
                onPress={() => setAddressType('work')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="briefcase-outline"
                  size={16}
                  color={addressType === 'work' ? '#ffffff' : '#64748b'}
                />
                <Text style={[styles.typePillText, addressType === 'work' && styles.typePillTextActive]}>Work</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typePill, addressType === 'other' && styles.typePillActive]}
                onPress={() => setAddressType('other')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={16}
                  color={addressType === 'other' ? '#ffffff' : '#64748b'}
                />
                <Text style={[styles.typePillText, addressType === 'other' && styles.typePillTextActive]}>Other</Text>
              </TouchableOpacity>
            </View>

            <AddressInput
              ref={streetRef}
              field="street"
              label="Street Address"
              value={address.street}
              onChangeText={handleInputChange}
              onFocus={handleFocusField}
              onBlur={handleBlurField}
              error={errors.street}
              isFocused={focusedField === 'street'}
              required
              onSubmitEditing={focusNextField}
            />

            <AddressInput
              ref={landmarkRef}
              field="landmark"
              label="Landmark / Gate / Building (Optional)"
              value={address.landmark}
              onChangeText={handleInputChange}
              onFocus={handleFocusField}
              onBlur={handleBlurField}
              error={errors.landmark}
              isFocused={focusedField === 'landmark'}
              onSubmitEditing={focusNextField}
            />
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <AddressInput
                ref={cityRef}
                field="city"
                label="City"
                value={address.city}
                onChangeText={handleInputChange}
                onFocus={handleFocusField}
                onBlur={handleBlurField}
                error={errors.city}
                isFocused={focusedField === 'city'}
                halfWidth
                required
                onSubmitEditing={focusNextField}
              />

              <AddressInput
                ref={stateRef}
                field="state"
                label="State"
                value={address.state}
                onChangeText={handleInputChange}
                onFocus={handleFocusField}
                onBlur={handleBlurField}
                error={errors.state}
                isFocused={focusedField === 'state'}
                halfWidth
                required
                onSubmitEditing={focusNextField}
              />
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <AddressInput
                ref={countryRef}
                field="country"
                label="Country"
                value={address.country}
                onChangeText={handleInputChange}
                onFocus={handleFocusField}
                onBlur={handleBlurField}
                error={errors.country}
                isFocused={focusedField === 'country'}
                halfWidth
                required
                onSubmitEditing={focusNextField}
              />

              <AddressInput
                ref={zipCodeRef}
                field="zipCode"
                label="ZIP Code"
                value={address.zipCode}
                onChangeText={handleInputChange}
                onFocus={handleFocusField}
                onBlur={handleBlurField}
                error={errors.zipCode}
                isFocused={focusedField === 'zipCode'}
                keyboardType="number-pad"
                autoCapitalize="characters"
                halfWidth
                required
                returnKeyType="done"
                onSubmitEditing={focusNextField}
              />
            </View>
          </View>

          {/* Delivery Speed */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="speedometer" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Delivery Speed</Text>
          </View>

          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.speedOption, shippingSpeed === 'standard' && styles.speedOptionSelected]}
              onPress={() => setShippingSpeed('standard')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={shippingSpeed === 'standard' ? "radiobox-marked" : "radiobox-blank"}
                size={20}
                color={shippingSpeed === 'standard' ? colors.primary : '#b0bec5'}
              />
              <View style={styles.speedTextWrapper}>
                <Text style={styles.speedTitle}>Standard Delivery (3-5 Days)</Text>
                <Text style={styles.speedDesc}>Reliable door-to-door delivery with tracking</Text>
              </View>
              <Text style={styles.speedPrice}>
                {baseShippingFee === 0 ? 'FREE' : `${currencySymbol}${baseShippingFee.toFixed(2)}`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.speedOption, shippingSpeed === 'express' && styles.speedOptionSelected, { marginTop: 10 }]}
              onPress={() => setShippingSpeed('express')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={shippingSpeed === 'express' ? "radiobox-marked" : "radiobox-blank"}
                size={20}
                color={shippingSpeed === 'express' ? colors.primary : '#b0bec5'}
              />
              <View style={styles.speedTextWrapper}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.speedTitle}>Express Expedited (1-2 Days)</Text>
                  <View style={styles.fastTag}>
                    <Text style={styles.fastTagText}>FASTEST</Text>
                  </View>
                </View>
                <Text style={styles.speedDesc}>Priority fulfillment & air express transport</Text>
              </View>
              <Text style={styles.speedPrice}>+{currencySymbol}{(9.99 * exchangeRate).toFixed(2)}</Text>
            </TouchableOpacity>
          </View>

          {/* Order Note */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="note-text-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Order Note For Seller</Text>
          </View>

          <View style={styles.card}>
            <TextInput
              style={styles.sellerNoteInput}
              placeholder="E.g. Gift wrap this item, call before delivery, leave with gate guard..."
              placeholderTextColor="#b0bec5"
              value={sellerNote}
              onChangeText={setSellerNote}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Promo Code */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Promo Code / Coupon</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.promoRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="Try UBS10 or WELCOME10"
                placeholderTextColor="#b0bec5"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyPromo}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
            {promoSuccess ? <Text style={styles.promoSuccessText}>{promoSuccess}</Text> : null}
          </View>

          {/* Pricing Details */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="receipt" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Price Breakdown ({currencyCode})</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Items Subtotal</Text>
              <Text style={styles.rowVal}>{currencySymbol}{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Shipping Fee ({shippingSpeed === 'express' ? 'Express' : 'Standard'})</Text>
              <Text style={[styles.rowVal, totalShipping === 0 && { color: '#2e7d32', fontWeight: '700' }]}>
                {totalShipping === 0 ? 'FREE' : `${currencySymbol}${totalShipping.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Tax (5%)</Text>
              <Text style={styles.rowVal}>{currencySymbol}{tax.toFixed(2)}</Text>
            </View>
            {appliedDiscount > 0 && (
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: '#2e7d32' }]}>Promo Discount</Text>
                <Text style={[styles.rowVal, { color: '#2e7d32', fontWeight: '700' }]}>
                  -{currencySymbol}{appliedDiscount.toFixed(2)}
                </Text>
              </View>
            )}
            
            <View style={styles.totalDivider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalVal}>{currencySymbol}{grandTotal.toFixed(2)}</Text>
            </View>
          </View>

          {/* Trust Badges */}
          <View style={styles.trustBadgesCard}>
            <View style={styles.trustBadgeItem}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color="#2e7d32" />
              <Text style={styles.trustBadgeTitle}>256-bit SSL</Text>
              <Text style={styles.trustBadgeSub}>Encrypted</Text>
            </View>
            <View style={styles.trustBadgeDivider} />
            <View style={styles.trustBadgeItem}>
              <MaterialCommunityIcons name="rotate-left" size={20} color="#0288d1" />
              <Text style={styles.trustBadgeTitle}>Easy Returns</Text>
              <Text style={styles.trustBadgeSub}>Buyer Protection</Text>
            </View>
            <View style={styles.trustBadgeDivider} />
            <View style={styles.trustBadgeItem}>
              <MaterialCommunityIcons name="check-decagram-outline" size={20} color="#651fff" />
              <Text style={styles.trustBadgeTitle}>Verified</Text>
              <Text style={styles.trustBadgeSub}>Global Seller</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Payment Action */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
          <TouchableOpacity
            style={[
              styles.payBtn,
              (!isFormValid || loading) && styles.payBtnDisabled
            ]}
            onPress={handleContinueToPayment}
            disabled={loading}
            accessibilityLabel={`Pay ${currencySymbol}${grandTotal.toFixed(2)} button`}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.payBtnText}>
                  Pay {currencySymbol}{grandTotal.toFixed(2)}
                </Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>
          <View style={styles.trustContainer}>
            <MaterialCommunityIcons name="lock-outline" size={12} color="#9e9e9e" />
            <Text style={styles.trustText}>
              Secure via {isIndia ? 'Razorpay' : 'Stripe'} • 100% Encrypted & Safe
            </Text>
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
    justify: 'space-between',
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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8eef8',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleDone: {
    backgroundColor: '#2e7d32',
  },
  stepCircleActive: {
    backgroundColor: '#1a237e',
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#757575',
  },
  stepNumActive: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  stepText: {
    fontSize: 11,
    color: '#9e9e9e',
    marginTop: 3,
    fontWeight: '600',
  },
  stepTextDone: {
    fontSize: 11,
    color: '#2e7d32',
    marginTop: 3,
    fontWeight: '700',
  },
  stepTextActive: {
    fontSize: 11,
    color: '#1a237e',
    marginTop: 3,
    fontWeight: '800',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
    marginTop: -14,
  },
  stepLineActive: {
    backgroundColor: '#2e7d32',
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 13.5,
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
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 14,
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
    marginBottom: 6,
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
  estDeliveryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  estDeliveryText: {
    fontSize: 12,
    color: '#475569',
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
  addressTypeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    marginTop: 4,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 6,
  },
  typePillActive: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  typePillTextActive: {
    color: '#ffffff',
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
  },
  speedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  speedOptionSelected: {
    borderColor: '#1a237e',
    backgroundColor: '#f0f3ff',
  },
  speedTextWrapper: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  speedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  speedDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  speedPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a237e',
  },
  fastTag: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fastTagText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  sellerNoteInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#1a1a1a',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    height: 46,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    fontSize: 13,
    color: '#1a1a1a',
  },
  applyBtn: {
    backgroundColor: '#1a237e',
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  promoSuccessText: {
    marginTop: 8,
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  rowVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a237e',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '850',
    color: '#1a237e',
  },
  trustBadgesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e8eef8',
    marginBottom: 16,
  },
  trustBadgeItem: {
    alignItems: 'center',
    flex: 1,
  },
  trustBadgeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 4,
  },
  trustBadgeSub: {
    fontSize: 10,
    color: '#64748b',
  },
  trustBadgeDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingTop: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  payBtn: {
    backgroundColor: '#1a237e',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  payBtnDisabled: {
    backgroundColor: '#9fa8da',
    shadowOpacity: 0,
    elevation: 0,
  },
  payBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  trustContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  trustText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
})