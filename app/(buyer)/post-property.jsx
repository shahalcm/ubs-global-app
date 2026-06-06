import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView,
  Image, Alert, Switch, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { Picker } from '@react-native-picker/picker'
import RazorpayCheckout from 'react-native-razorpay'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Ionicons } from '@expo/vector-icons'

const PLATFORM_FEE = 0.52

export default function PostPropertyScreen() {
  const { user } = useAuth()
  const params = useLocalSearchParams()
  const isEditMode = !!params.id

  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  // Property details
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [propertyType, setPropertyType] = useState('apartment')
  const [listingType, setListingType] = useState('sale')
  const [price, setPrice] = useState('')
  const [isNegotiable, setIsNegotiable] = useState(false)

  // Specs
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [area, setArea] = useState('')
  const [areaUnit, setAreaUnit] = useState('sqft')
  const [furnishing, setFurnishing] = useState('unfurnished')
  const [parking, setParking] = useState(false)
  const [floor, setFloor] = useState('')
  const [yearBuilt, setYearBuilt] = useState('')

  // Location
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [landmark, setLandmark] = useState('')

  // Amenities
  const [selectedAmenities, setSelectedAmenities] = useState([])

  const AMENITIES = [
    { key: 'swimming_pool', label: '🏊 Pool' },
    { key: 'gym', label: '💪 Gym' },
    { key: 'security', label: '🔒 Security' },
    { key: 'elevator', label: '🛗 Elevator' },
    { key: 'generator', label: '⚡ Generator' },
    { key: 'water_supply', label: '💧 Water supply' },
    { key: 'gas', label: '🔥 Gas supply' },
    { key: 'internet', label: '📶 Internet' },
    { key: 'air_conditioning', label: '❄️ AC' },
    { key: 'garden', label: '🌿 Garden' },
    { key: 'balcony', label: '🏠 Balcony' },
    { key: 'terrace', label: '🌇 Terrace' }
  ]

  const toggleAmenity = (key) => {
    setSelectedAmenities(prev =>
      prev.includes(key)
        ? prev.filter(a => a !== key)
        : [...prev, key]
    )
  }

  useEffect(() => {
    if (isEditMode) {
      fetchPropertyDetails()
    }
  }, [params.id])

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/properties/${params.id}`)
      if (res.data.success && res.data.property) {
        const prop = res.data.property
        setTitle(prop.title || '')
        setDescription(prop.description || '')
        setPropertyType(prop.propertyType || 'apartment')
        setListingType(prop.listingType || 'sale')
        setPrice(prop.price ? prop.price.toString() : '')
        setIsNegotiable(prop.isNegotiable || false)
        setBedrooms(prop.bedrooms ? prop.bedrooms.toString() : '')
        setBathrooms(prop.bathrooms ? prop.bathrooms.toString() : '')
        setArea(prop.area ? prop.area.toString() : '')
        setAreaUnit(prop.areaUnit || 'sqft')
        setFurnishing(prop.furnishing || 'unfurnished')
        setParking(prop.parking || false)
        setFloor(prop.floor ? prop.floor.toString() : '')
        setYearBuilt(prop.yearBuilt ? prop.yearBuilt.toString() : '')
        
        if (prop.address) {
          setStreet(prop.address.street || '')
          setCity(prop.address.city || '')
          setState(prop.address.state || '')
          setCountry(prop.address.country || '')
          setZipCode(prop.address.zipCode || '')
          setLandmark(prop.address.landmark || '')
        }
        
        setSelectedAmenities(prop.amenities || [])
        
        if (prop.images && prop.images.length > 0) {
          setImages(prop.images.map(imgUrl => ({
            uri: imgUrl,
            isRemote: true
          })))
        }
      }
    } catch (err) {
      console.log(err)
      Alert.alert('Error', 'Failed to fetch property details')
    } finally {
      setLoading(false)
    }
  }

  const pickImages = async () => {
    if (images.length >= 10) {
      Alert.alert('Limit', 'Max 10 images allowed')
      return
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access gallery is required')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10 - images.length,
      quality: 0.8
    })

    if (!result.canceled) {
      const newImages = result.assets.map(a => ({
        uri: a.uri,
        type: 'image/jpeg',
        name: `property_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.jpg`
      }))
      setImages(prev => [...prev, ...newImages].slice(0, 10))
    }
  }

  const validate = () => {
    if (images.length === 0) {
      Alert.alert('Error', 'Add at least one photo')
      return false
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required')
      return false
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Description is required')
      return false
    }
    if (!price || Number(price) <= 0) {
      Alert.alert('Error', 'Valid price required')
      return false
    }
    if (!city.trim()) {
      Alert.alert('Error', 'City is required')
      return false
    }
    if (!state.trim()) {
      Alert.alert('Error', 'State/Province is required')
      return false
    }
    if (!country.trim()) {
      Alert.alert('Error', 'Country is required')
      return false
    }
    return true
  }

  const handleSellProperty = async () => {
    if (!validate()) return

    // Show fee info modal
    Alert.alert(
      '💰 Platform Listing Fee',
      `To list your property in our premium marketplace, a small platform fee of $${PLATFORM_FEE} is required.\n\nAfter payment, your property will go active immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: `Pay $${PLATFORM_FEE}`, onPress: handlePayAndPost }
      ]
    )
  }

  const handlePayAndPost = async () => {
    setLoading(true)
    setPaymentLoading(true)
    try {
      // Step 1: Upload images
      const formData = new FormData()
      images.forEach((img, i) => {
        formData.append('images', {
          uri: img.uri,
          type: 'image/jpeg',
          name: img.name
        })
      })

      const uploadRes = await api.post(
        '/properties/upload-images',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (!uploadRes.data.success) {
        throw new Error('Image upload failed')
      }

      const uploadedImages = uploadRes.data.images

      // Step 2: Create Razorpay order
      const orderRes = await api.post('/properties/create-fee-order')

      if (!orderRes.data.success) {
        throw new Error('Failed to create payment order')
      }

      // Step 3: Open Razorpay checkout
      let paymentData = {
        razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substring(7),
        razorpay_signature: 'sig_mock_' + Math.random().toString(36).substring(7)
      }

      if (orderRes.data.key && orderRes.data.key !== 'rzp_test_your_key_id' && orderRes.data.razorpayOrderId && !orderRes.data.razorpayOrderId.startsWith('order_mock_')) {
        const options = {
          description: 'UBS Global Property Listing Fee',
          image: 'https://cdn-icons-png.flaticon.com/512/3143/3143212.png',
          currency: 'USD',
          key: orderRes.data.key,
          amount: orderRes.data.amount,
          name: 'UBS Global Real Estate',
          order_id: orderRes.data.razorpayOrderId,
          prefill: {
            email: user?.email || '',
            contact: user?.phone || '',
            name: user?.name || ''
          },
          theme: { color: '#1a237e' }
        }

        try {
          paymentData = await RazorpayCheckout.open(options)
        } catch (payErr) {
          // Razorpay cancel code is typically 2
          console.log('Razorpay failure', payErr)
          Alert.alert('Payment Cancelled', 'Platform fee payment must be completed to post.')
          setLoading(false)
          setPaymentLoading(false)
          return
        }
      }

      // Step 4: Verify payment and post property details
      const propertyData = {
        title: title.trim(),
        description: description.trim(),
        propertyType,
        listingType,
        price: Number(price),
        isNegotiable,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        area: area ? Number(area) : undefined,
        areaUnit,
        furnishing,
        parking,
        floor: floor ? Number(floor) : undefined,
        yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
        address: {
          street,
          city,
          state,
          country,
          zipCode,
          landmark,
          fullAddress: `${street ? street + ', ' : ''}${city}, ${state}, ${country}`
        },
        amenities: selectedAmenities
      }

      const verifyRes = await api.post(
        '/properties/verify-fee',
        {
          razorpayOrderId: orderRes.data.razorpayOrderId,
          razorpayPaymentId: paymentData.razorpay_payment_id,
          razorpaySignature: paymentData.razorpay_signature,
          propertyData,
          images: uploadedImages
        }
      )

      if (verifyRes.data.success) {
        Alert.alert(
          '🎉 Property Listed!',
          'Your property has been successfully listed in our marketplace.',
          [
            {
              text: 'View Property',
              onPress: () => router.push({
                pathname: '/(buyer)/property-detail',
                params: { id: verifyRes.data.property._id }
              })
            },
            {
              text: 'Marketplace',
              onPress: () => router.replace('/(buyer)/real-estate')
            }
          ]
        )
      } else {
        throw new Error(verifyRes.data.message || 'Payment verification failed')
      }

    } catch (err) {
      console.log(err)
      Alert.alert('Error', err.response?.data?.message || err.message || 'Something went wrong')
    } finally {
      setLoading(false)
      setPaymentLoading(false)
    }
  }

  const handleUpdateProperty = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const remoteImages = images.filter(img => img.isRemote).map(img => img.uri)
      const localImages = images.filter(img => !img.isRemote)
      
      let uploadedImages = []
      if (localImages.length > 0) {
        const formData = new FormData()
        localImages.forEach((img) => {
          formData.append('images', {
            uri: img.uri,
            type: 'image/jpeg',
            name: img.name || `image_${Date.now()}.jpg`
          })
        })
        
        const uploadRes = await api.post(
          '/properties/upload-images',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )
        if (uploadRes.data.success) {
          uploadedImages = uploadRes.data.images
        } else {
          throw new Error('Image upload failed')
        }
      }
      
      const allImages = [...remoteImages, ...uploadedImages]
      
      const propertyData = {
        title: title.trim(),
        description: description.trim(),
        propertyType,
        listingType,
        price: Number(price),
        isNegotiable,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        area: area ? Number(area) : undefined,
        areaUnit,
        furnishing,
        parking,
        floor: floor ? Number(floor) : undefined,
        yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
        address: {
          street,
          city,
          state,
          country,
          zipCode,
          landmark,
          fullAddress: `${street ? street + ', ' : ''}${city}, ${state}, ${country}`
        },
        amenities: selectedAmenities,
        images: allImages
      }
      
      const res = await api.put(`/properties/${params.id}`, propertyData)
      if (res.data.success) {
        Alert.alert(
          '🎉 Property Updated!',
          'Your property has been successfully updated.',
          [
            {
              text: 'OK',
              onPress: () => router.canGoBack() ? router.back() : router.replace('/(buyer)/real-estate')
            }
          ]
        )
      } else {
        throw new Error(res.data.message || 'Update failed')
      }
    } catch (err) {
      console.log(err)
      Alert.alert('Error', err.response?.data?.message || err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/real-estate')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a237e" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{isEditMode ? 'Edit Property' : 'Post Property'}</Text>
          {!isEditMode ? (
            <View style={styles.feeTag}>
              <Text style={styles.feeText}>Fee: $0.52</Text>
            </View>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1a237e" />
            <Text style={styles.loadingText}>
              {isEditMode 
                ? 'Saving property changes...' 
                : (paymentLoading ? 'Processing secure transaction...' : 'Uploading property images...')}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* PHOTO SECTION */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📸 Property Photos</Text>
              <Text style={styles.sectionSub}>Add up to 10 photos (first will be main thumb)</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoScroll}
              >
                <TouchableOpacity
                  style={styles.addPhotoBtn}
                  onPress={pickImages}
                >
                  <Ionicons name="camera" size={28} color="#1a237e" />
                  <Text style={styles.addPhotoText}>Add Photos</Text>
                </TouchableOpacity>

                {images.map((img, index) => (
                  <View key={index} style={styles.photoSlot}>
                    <Image source={{ uri: img.uri }} style={styles.photoThumb} />
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => setImages(prev => prev.filter((_, i) => i !== index))}
                    >
                      <Text style={styles.removeX}>✕</Text>
                    </TouchableOpacity>
                    {index === 0 && (
                      <View style={styles.mainPhotoTag}>
                        <Text style={styles.mainPhotoText}>Cover</Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* BASIC INFO */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Basic Info</Text>

              <Text style={styles.label}>TITLE *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 3BHK Premium Villa with Pool"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>DESCRIPTION *</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Describe your property amenities, history, surroundings..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.label}>PROPERTY TYPE</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={propertyType}
                  onValueChange={setPropertyType}
                  style={styles.picker}
                >
                  <Picker.Item label="Apartment" value="apartment" />
                  <Picker.Item label="House" value="house" />
                  <Picker.Item label="Villa" value="villa" />
                  <Picker.Item label="Plot / Land" value="plot" />
                  <Picker.Item label="Commercial" value="commercial" />
                  <Picker.Item label="Office Space" value="office" />
                  <Picker.Item label="Shop" value="shop" />
                  <Picker.Item label="Warehouse" value="warehouse" />
                  <Picker.Item label="Farm House" value="farm" />
                </Picker>
              </View>

              <Text style={styles.label}>LISTING TYPE</Text>
              <View style={styles.listingTypeRow}>
                {['sale', 'rent', 'lease'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.listingChip,
                      listingType === type && styles.listingChipActive
                    ]}
                    onPress={() => setListingType(type)}
                  >
                    <Text style={[
                      styles.listingChipText,
                      listingType === type && styles.listingChipTextActive
                    ]}>
                      For {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* PRICING */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 Price</Text>

              <Text style={styles.label}>PRICE (USD) *</Text>
              <View style={styles.priceRow}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0.00"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Price is Negotiable</Text>
                <Switch
                  value={isNegotiable}
                  onValueChange={setIsNegotiable}
                  trackColor={{ false: '#ddd', true: '#81b0ff' }}
                  thumbColor={isNegotiable ? '#1a237e' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* DETAILS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏠 Specs & Features</Text>

              <View style={styles.twoColRow}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>BEDROOMS</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={bedrooms}
                    onChangeText={setBedrooms}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>BATHROOMS</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={bathrooms}
                    onChangeText={setBathrooms}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Text style={styles.label}>AREA SIZE</Text>
              <View style={styles.areaRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Area"
                  value={area}
                  onChangeText={setArea}
                  keyboardType="decimal-pad"
                />
                <View style={[styles.pickerBox, { width: 110, marginLeft: 8 }]}>
                  <Picker
                    selectedValue={areaUnit}
                    onValueChange={setAreaUnit}
                    style={styles.picker}
                  >
                    <Picker.Item label="Sq.Ft" value="sqft" />
                    <Picker.Item label="Sq.M" value="sqm" />
                    <Picker.Item label="Marla" value="marla" />
                    <Picker.Item label="Kanal" value="kanal" />
                    <Picker.Item label="Acre" value="acre" />
                  </Picker>
                </View>
              </View>

              <View style={styles.twoColRow}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>FLOOR NO.</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 3"
                    value={floor}
                    onChangeText={setFloor}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>YEAR BUILT</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2020"
                    value={yearBuilt}
                    onChangeText={setYearBuilt}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Text style={styles.label}>FURNISHING STATUS</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={furnishing}
                  onValueChange={setFurnishing}
                  style={styles.picker}
                >
                  <Picker.Item label="Unfurnished" value="unfurnished" />
                  <Picker.Item label="Semi-Furnished" value="semi-furnished" />
                  <Picker.Item label="Fully Furnished" value="furnished" />
                </Picker>
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Dedicated Parking Available</Text>
                <Switch
                  value={parking}
                  onValueChange={setParking}
                  trackColor={{ false: '#ddd', true: '#81b0ff' }}
                  thumbColor={parking ? '#1a237e' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* LOCATION */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Location</Text>

              <Text style={styles.label}>STREET ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 404 Beach Road"
                value={street}
                onChangeText={setStreet}
              />

              <View style={styles.twoColRow}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>CITY *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Dubai"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>STATE/PROVINCE *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Dubai"
                    value={state}
                    onChangeText={setState}
                  />
                </View>
              </View>

              <View style={styles.twoColRow}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>COUNTRY *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. UAE"
                    value={country}
                    onChangeText={setCountry}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>ZIP CODE</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="00000"
                    value={zipCode}
                    onChangeText={setZipCode}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.label}>LANDMARK</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Near Marina mall"
                value={landmark}
                onChangeText={setLandmark}
              />
            </View>

            {/* AMENITIES */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Amenities</Text>
              <Text style={styles.sectionSub}>Select all utility and convenience features available</Text>
              <View style={styles.amenitiesGrid}>
                {AMENITIES.map(amenity => {
                  const active = selectedAmenities.includes(amenity.key)
                  return (
                    <TouchableOpacity
                      key={amenity.key}
                      style={[styles.amenityBox, active && styles.amenityBoxActive]}
                      onPress={() => toggleAmenity(amenity.key)}
                    >
                      <Text style={[styles.amenityText, active && styles.amenityTextActive]}>
                        {amenity.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={isEditMode ? handleUpdateProperty : handleSellProperty}
            >
              <Text style={styles.submitBtnText}>
                {isEditMode ? 'Update Property Details' : 'Pay $0.52 & Post Property'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fc'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backButton: {
    padding: 4
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e'
  },
  feeTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  feeText: {
    fontSize: 12,
    color: '#1565c0',
    fontWeight: '700'
  },
  scroll: {
    paddingBottom: 40
  },

  // Sections
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eef1f6'
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 4
  },
  sectionSub: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12
  },

  // Photos
  photoScroll: {
    flexDirection: 'row',
    paddingVertical: 4
  },
  addPhotoBtn: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1a237e',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#f8fafc'
  },
  addPhotoText: {
    fontSize: 11,
    color: '#1a237e',
    fontWeight: '600',
    marginTop: 4
  },
  photoSlot: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 10
  },
  photoThumb: {
    width: '100%',
    height: '100%'
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeX: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  mainPhotoTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a237e',
    paddingVertical: 2,
    alignItems: 'center'
  },
  mainPhotoText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700'
  },

  // Form Fields
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    marginTop: 14,
    marginBottom: 6,
    letterSpacing: 0.5
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333'
  },
  textarea: {
    height: 80,
    textAlignVertical: 'top'
  },
  pickerBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden'
  },
  picker: {
    height: Platform.OS === 'ios' ? 120 : 50,
    color: '#333'
  },

  // Listing chips
  listingTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  listingChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center'
  },
  listingChipActive: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e'
  },
  listingChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600'
  },
  listingChipTextActive: {
    color: '#fff',
    fontWeight: '700'
  },

  // Price
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12
  },
  dollarSign: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a237e',
    marginRight: 6
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingVertical: 10
  },

  // Toggles
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14
  },
  toggleLabel: {
    fontSize: 13,
    color: '#444'
  },

  // Two columns
  twoColRow: {
    flexDirection: 'row',
    gap: 12
  },
  halfInput: {
    flex: 1
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  // Amenities
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6
  },
  amenityBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc'
  },
  amenityBoxActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#29b6f6'
  },
  amenityText: {
    fontSize: 12,
    color: '#555'
  },
  amenityTextActive: {
    color: '#1a237e',
    fontWeight: '600'
  },

  // Submit
  submitBtn: {
    backgroundColor: '#1a237e',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700'
  }
})
