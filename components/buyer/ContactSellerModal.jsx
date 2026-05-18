import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { createContactRequest } from '../../services/contactService'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function ContactSellerModal({ visible, onClose, product, seller }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [requestType, setRequestType] = useState('product_inquiry')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [quantity, setQuantity] = useState('')
  const [budget, setBudget] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [isBulkOrder, setIsBulkOrder] = useState(false)
  const [loading, setLoading] = useState(false)

  const requestTypes = [
    { key: 'product_inquiry', label: t('Product Inquiry') },
    { key: 'bulk_order', label: t('Bulk Order') },
    { key: 'custom_order', label: t('Custom Order') },
    { key: 'price_negotiation', label: t('Price Negotiation') },
    { key: 'shipping_inquiry', label: t('Shipping Inquiry') },
    { key: 'other', label: t('Other') }
  ]

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return
    setLoading(true)
    try {
      await createContactRequest({
        sellerId: seller?._id,
        productId: product?._id,
        subject,
        message,
        requestType,
        quantity: quantity ? Number(quantity) : undefined,
        budget,
        isUrgent,
        isBulkOrder
      })
      setSubject('')
      setMessage('')
      setQuantity('')
      setBudget('')
      setIsUrgent(false)
      setIsBulkOrder(false)
      onClose(true)
    } catch (error) {
      console.log('Request error', error)
      onClose(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{t('Contact Seller')}</Text>
              <TouchableOpacity onPress={() => onClose(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1a237e" />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>{seller?.shopName || t('Seller Shop')}</Text>

            <Text style={styles.sectionLabel}>{t('Request Type')}</Text>
            <View style={styles.chipRow}>
              {requestTypes.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.chip,
                    requestType === item.key && styles.chipActive
                  ]}
                  onPress={() => setRequestType(item.key)}
                >
                  <Text style={[styles.chipText, requestType === item.key && styles.chipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('Subject')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('Enter a short subject')}
              value={subject}
              onChangeText={setSubject}
            />

            <Text style={styles.label}>{t('Message')}</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder={t('Describe your requirements...')}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
            />

            <View style={styles.inlineRow}>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t('Quantity')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('How many units?')}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t('Budget')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('Budget range')}
                  value={budget}
                  onChangeText={setBudget}
                />
              </View>
            </View>

            <View style={styles.checkboxRow}>
              <TouchableOpacity onPress={() => setIsBulkOrder(!isBulkOrder)} style={styles.checkboxWrap}>
                <View style={[styles.checkbox, isBulkOrder && styles.checkboxChecked]}>
                  {isBulkOrder && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>{t('This is a bulk order (50+ units)')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsUrgent(!isUrgent)} style={styles.checkboxWrap}>
                <View style={[styles.checkbox, isUrgent && styles.checkboxChecked]}>
                  {isUrgent && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>{t('Urgent request')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.previewCard}>
              <Text style={styles.previewHeading}>{t('Product Preview')}</Text>
              <View style={styles.productRow}>
                <View style={styles.productImagePlaceholder}>
                  {product?.images?.[0] ? (
                    <Image source={{ uri: product.images[0] }} style={styles.productImage} />
                  ) : null}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle}>{product?.title || t('Product name')}</Text>
                  <Text style={styles.productPrice}>{product?.price ? `$${product.price}` : t('Price not set')}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>{t('Send Request →')}</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.noteText}>🔒 {t('Admin will review and connect you with seller within 24 hours.')}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.36)',
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%'
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#dfe3ee',
    alignSelf: 'center',
    marginVertical: 12
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a237e'
  },
  subtitle: {
    marginTop: 4,
    color: '#5b5f74',
    fontSize: 14,
    marginBottom: 18
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3949ab',
    marginBottom: 10
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d9ff',
    backgroundColor: '#f5f7ff',
    marginRight: 10,
    marginBottom: 10
  },
  chipActive: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e'
  },
  chipText: {
    fontSize: 12,
    color: '#1a237e'
  },
  chipTextActive: {
    color: '#fff'
  },
  label: {
    color: '#20232a',
    marginBottom: 8,
    fontWeight: '700'
  },
  input: {
    backgroundColor: '#f5f6ff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    color: '#1f2040'
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  halfField: {
    flex: 1
  },
  checkboxRow: {
    marginBottom: 16
  },
  checkboxWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cfd8de',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxChecked: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e'
  },
  checkboxLabel: {
    color: '#42465a',
    flex: 1,
    fontSize: 13
  },
  previewCard: {
    backgroundColor: '#f8f9ff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18
  },
  previewHeading: {
    color: '#1a237e',
    fontWeight: '700',
    marginBottom: 12
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  productImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#dfe3ee',
    marginRight: 14,
    overflow: 'hidden'
  },
  productImage: {
    width: '100%',
    height: '100%'
  },
  productInfo: {
    flex: 1
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2040',
    marginBottom: 6
  },
  productPrice: {
    fontSize: 13,
    color: '#1a237e'
  },
  submitBtn: {
    backgroundColor: '#1a237e',
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  submitText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15
  },
  noteText: {
    color: '#6d7280',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20
  }
})
