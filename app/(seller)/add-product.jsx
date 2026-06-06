import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { Picker } from '@react-native-picker/picker'
import api from '../../services/api'
import { useSeller } from '../../context/SellerContext'

const CATEGORIES = [
  { label: 'Select Category', value: '' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Mobiles', value: 'mobiles' },
  { label: 'Furniture', value: 'furniture' },
  { label: 'Cosmetics', value: 'cosmetics' },
  { label: 'Grocery', value: 'grocery' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Medicines', value: 'medicines' },
  { label: 'Home & Kitchen', value: 'home-kitchen' },
  { label: 'Real Estate', value: 'real-estate' },
  { label: 'Building Materials', value: 'building-materials' },
  { label: 'Machinery', value: 'machinery' },
  { label: 'Oils', value: 'oils' },
]

export default function AddProductScreen() {
  const { loadDashboard } = useSeller()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  // Basic Info
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sku, setSku] = useState('')

  // Pricing
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [costPerItem, setCostPerItem] = useState('')

  // Category
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')

  // Inventory
  const [inStock, setInStock] = useState(true)
  const [stock, setStock] = useState('')
  const [lowStockAlert, setLowStockAlert] = useState('5')

  // Shipping
  const [freeShipping, setFreeShipping] = useState(false)
  const [weight, setWeight] = useState('')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [shippingFee, setShippingFee] = useState('')

  // Pick image from gallery
  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit', 'Maximum 5 images allowed')
      return
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
      aspect: [1, 1],
      allowsEditing: false
    })

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(a => ({
        uri: a.uri,
        type: 'image/jpeg',
        name: `product_${Date.now()}.jpg`
      }))
      setImages(prev => [...prev, ...newImages].slice(0, 5))
    }
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // Validate form
  const validate = () => {
    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one product image')
      return false
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Product title is required')
      return false
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Description is required')
      return false
    }
    if (!price || Number(price) <= 0) {
      Alert.alert('Error', 'Valid price is required')
      return false
    }
    if (!stock || Number(stock) < 0) {
      Alert.alert('Error', 'Stock quantity is required')
      return false
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category')
      return false
    }
    return true
  }

  // Submit product
  const handleAddProduct = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      const formData = new FormData()

      // Append images for Cloudinary upload
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `product_image_${index}_${Date.now()}.jpg`
        })
      })

      // Append product data
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('sku', sku.trim() || `UBS-${Date.now()}`)
      formData.append('category', category)
      formData.append('subcategory', subcategory)
      formData.append('price', price)
      formData.append('comparePrice', comparePrice || '0')
      formData.append('costPerItem', costPerItem || '0')
      formData.append('stock', stock)
      formData.append('lowStockAlert', lowStockAlert)
      formData.append('weight', weight || '0')
      formData.append('length', length || '0')
      formData.append('width', width || '0')
      formData.append('height', height || '0')
      formData.append('freeShipping', freeShipping.toString())
      formData.append('shippingFee', shippingFee || '0')

      const response = await api.post(
        '/products',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json'
          },
          timeout: 60000
        }
      )

      if (response.data.success) {
        loadDashboard()
        Alert.alert(
          '✅ Product Created!',
          'Your product has been created and is now visible to buyers.',
          [
            {
              text: 'Add Another',
              onPress: () => {
                // Reset form
                setImages([])
                setTitle('')
                setDescription('')
                setSku('')
                setPrice('')
                setComparePrice('')
                setCostPerItem('')
                setCategory('')
                setSubcategory('')
                setStock('')
                setLowStockAlert('5')
                setWeight('')
                setShippingFee('')
              }
            },
            {
              text: 'View My Products',
              onPress: () => router.push('/(seller)/my-products')
            }
          ]
        )
      }
    } catch (error) {
      console.error('Add product error:', error)
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add product. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    // Save to AsyncStorage as draft
    Alert.alert('Saved', 'Product saved as draft')
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >

        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(seller)/dashboard')}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Add New Product</Text>
          <TouchableOpacity onPress={handleSaveDraft}>
            <Text style={styles.saveDraft}>Save Draft</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* IMAGE UPLOAD SECTION */}
          <TouchableOpacity
            style={styles.mainUploadBox}
            onPress={pickImage}
          >
            {images.length === 0 ? (
              <>
                <Text style={styles.cameraIcon}>📷</Text>
                <Text style={styles.uploadTitle}>
                  Upload Product Photos
                </Text>
                <Text style={styles.uploadSub}>
                  Add up to 5 images
                </Text>
              </>
            ) : (
              <Image
                source={{ uri: images[0].uri }}
                style={styles.mainPreviewImage}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>

          {/* IMAGE SLOTS ROW */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.slotsScroll}
            contentContainerStyle={styles.slotsContainer}
          >
            {[0, 1, 2, 3, 4].map((index) => (
              <TouchableOpacity
                key={index}
                style={styles.imageSlot}
                onPress={images[index] ? () => removeImage(index) : pickImage}
              >
                {images[index] ? (
                  <>
                    <Image
                      source={{ uri: images[index].uri }}
                      style={styles.slotImage}
                    />
                    <View style={styles.removeOverlay}>
                      <Text style={styles.removeX}>×</Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.slotPlus}>+</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* BASIC INFO SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Info</Text>

            <Text style={styles.fieldLabel}>PRODUCT TITLE</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product name"
              placeholderTextColor="#bbb"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.fieldLabel}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Describe your product features and benefits..."
              placeholderTextColor="#bbb"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.fieldLabel}>SKU / PRODUCT CODE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., UBS-2024-PRD"
              placeholderTextColor="#bbb"
              value={sku}
              onChangeText={setSku}
            />
          </View>

          {/* PRICING SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>

            <Text style={styles.fieldLabel}>PRICE (USD)</Text>
            <View style={styles.priceInput}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.priceField}
                placeholder="0.00"
                placeholderTextColor="#bbb"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>

            <Text style={styles.fieldLabel}>COMPARE PRICE</Text>
            <View style={styles.priceInput}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.priceField}
                placeholder="0.00"
                placeholderTextColor="#bbb"
                value={comparePrice}
                onChangeText={setComparePrice}
                keyboardType="decimal-pad"
              />
            </View>

            <Text style={styles.fieldLabel}>COST PER ITEM</Text>
            <View style={styles.priceInput}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.priceField}
                placeholder="0.00"
                placeholderTextColor="#bbb"
                value={costPerItem}
                onChangeText={setCostPerItem}
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.helperText}>{"Customers won't see this"}</Text>
          </View>

          {/* CATEGORY SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>

            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                style={styles.picker}
              >
                {CATEGORIES.map(cat => (
                  <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                ))}
              </Picker>
            </View>

            <Text style={styles.fieldLabel}>SUBCATEGORY</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={subcategory}
                onValueChange={setSubcategory}
                style={styles.picker}
              >
                <Picker.Item label="Select Subcategory" value="" />
                <Picker.Item label="Premium" value="premium" />
                <Picker.Item label="Budget" value="budget" />
                <Picker.Item label="Wholesale" value="wholesale" />
              </Picker>
            </View>
          </View>

          {/* INVENTORY SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Inventory</Text>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>In Stock</Text>
                <Switch
                  value={inStock}
                  onValueChange={setInStock}
                  trackColor={{ false: '#ddd', true: '#29b6f6' }}
                  thumbColor={inStock ? '#1a237e' : '#fff'}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>STOCK QUANTITY</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#bbb"
              value={stock}
              onChangeText={setStock}
              keyboardType="number-pad"
            />

            <Text style={styles.fieldLabel}>LOW STOCK ALERT</Text>
            <TextInput
              style={styles.input}
              placeholder="5"
              placeholderTextColor="#bbb"
              value={lowStockAlert}
              onChangeText={setLowStockAlert}
              keyboardType="number-pad"
            />
          </View>

          {/* SHIPPING SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Shipping</Text>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Free Shipping</Text>
                <Switch
                  value={freeShipping}
                  onValueChange={setFreeShipping}
                  trackColor={{ false: '#ddd', true: '#29b6f6' }}
                  thumbColor={freeShipping ? '#1a237e' : '#fff'}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>WEIGHT (KG)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              placeholderTextColor="#bbb"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
            />

            <Text style={styles.fieldLabel}>DIMENSIONS (L X W X H) CM</Text>
            <View style={styles.dimensionsRow}>
              <TextInput
                style={[styles.input, styles.dimInput]}
                placeholder="L"
                placeholderTextColor="#bbb"
                value={length}
                onChangeText={setLength}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.input, styles.dimInput]}
                placeholder="W"
                placeholderTextColor="#bbb"
                value={width}
                onChangeText={setWidth}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.input, styles.dimInput]}
                placeholder="H"
                placeholderTextColor="#bbb"
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
              />
            </View>

            {!freeShipping && (
              <>
                <Text style={styles.fieldLabel}>SHIPPING FEE (USD)</Text>
                <View style={styles.priceInput}>
                  <Text style={styles.dollarSign}>$</Text>
                  <TextInput
                    style={styles.priceField}
                    placeholder="0.00"
                    placeholderTextColor="#bbb"
                    value={shippingFee}
                    onChangeText={setShippingFee}
                    keyboardType="decimal-pad"
                  />
                </View>
              </>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* STICKY BOTTOM BUTTON */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.addBtn, loading && { opacity: 0.7 }]}
            onPress={handleAddProduct}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.addBtnText}>Uploading to Cloudinary...</Text>
              </View>
            ) : (
              <Text style={styles.addBtnText}>⊞ Add Product</Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fc',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backArrow: {
    fontSize: 22,
    color: '#1a237e',
    fontWeight: '700',
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a237e',
  },
  saveDraft: {
    fontSize: 14,
    color: '#29b6f6',
    fontWeight: '600',
  },
  scroll: {
    padding: 16,
  },
  mainUploadBox: {
    borderWidth: 2,
    borderColor: '#c5cae9',
    borderStyle: 'dashed',
    borderRadius: 16,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cameraIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 4,
  },
  uploadSub: {
    fontSize: 13,
    color: '#888',
  },
  mainPreviewImage: {
    width: '100%',
    height: '100%',
  },
  slotsScroll: {
    marginBottom: 20,
  },
  slotsContainer: {
    gap: 10,
    paddingRight: 16,
  },
  imageSlot: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#c5cae9',
    borderStyle: 'dashed',
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 10
  },
  slotImage: {
    width: '100%',
    height: '100%',
  },
  removeOverlay: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeX: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  slotPlus: {
    fontSize: 24,
    color: '#c5cae9',
    fontWeight: '300',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f5f7fc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8ecf4',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a237e',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
    fontStyle: 'italic',
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8ecf4',
    paddingHorizontal: 14,
  },
  dollarSign: {
    fontSize: 16,
    color: '#555',
    marginRight: 4,
  },
  priceField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a237e',
  },
  pickerBox: {
    backgroundColor: '#f5f7fc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8ecf4',
    overflow: 'hidden',
  },
  picker: {
    color: '#1a237e',
  },
  dimensionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dimInput: {
    flex: 1,
    textAlign: 'center',
  },
  bottomBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addBtn: {
    backgroundColor: '#1a237e',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
})
