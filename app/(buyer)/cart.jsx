// app/(buyer)/cart.jsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

const INITIAL_CART = [
  {
    id: 1,
    title: 'High-Efficiency Bifacial 600W Solar Module',
    variant: '600W / Silver Frame',
    supplier: 'SolarTrade Global Ltd.',
    image: 'https://images.unsplash.com/photo-1509391366360-1e97b524c08b?w=400&q=80',
    price: 185.00,
    quantity: 50,
    minOrder: 50,
    selected: true,
  },
  {
    id: 2,
    title: 'Elite Series Pro Wireless Headphones',
    variant: 'Midnight Black',
    supplier: 'Apex Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    price: 299.00,
    quantity: 1,
    minOrder: 1,
    selected: true,
  },
]

export default function CartScreen() {
  const [cartItems, setCartItems] = useState(INITIAL_CART)

  const toggleSelect = (id) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ))
  }

  const toggleSelectAll = () => {
    const allSelected = cartItems.every(item => item.selected)
    setCartItems(cartItems.map(item => ({ ...item, selected: !allSelected })))
  }

  const updateQuantity = (id, change) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + change
        return newQty >= item.minOrder ? { ...item, quantity: newQty } : item
      }
      return item
    }))
  }

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  // Calculate totals
  const selectedItems = cartItems.filter(item => item.selected)
  const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const isAllSelected = cartItems.length > 0 && cartItems.every(item => item.selected)

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart ({cartItems.length})</Text>
        <TouchableOpacity onPress={() => setCartItems([])}>
          <Text style={styles.clearBtn}>Clear</Text>
        </TouchableOpacity>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptyDesc}>Looks like you haven't added any products to your cart yet.</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(buyer)/home')}>
            <Text style={styles.browseBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Select All Row */}
            <View style={styles.selectAllRow}>
              <TouchableOpacity style={styles.checkboxRow} onPress={toggleSelectAll}>
                <View style={[styles.checkbox, isAllSelected && styles.checkboxActive]}>
                  {isAllSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.selectAllText}>Select All Items</Text>
              </TouchableOpacity>
            </View>

            {/* Cart Items */}
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartCard}>
                
                {/* Vendor Header inside Card (B2B specific) */}
                <View style={styles.vendorHeader}>
                  <Text style={styles.vendorIcon}>🏪</Text>
                  <Text style={styles.vendorName}>{item.supplier}</Text>
                </View>
                
                <View style={styles.cardBody}>
                  <TouchableOpacity style={styles.itemCheckbox} onPress={() => toggleSelect(item.id)}>
                    <View style={[styles.checkbox, item.selected && styles.checkboxActive]}>
                      {item.selected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                  
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.itemVariant}>{item.variant}</Text>
                    
                    <View style={styles.priceRow}>
                      <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                      <TouchableOpacity onPress={() => removeItem(item.id)}>
                        <Text style={styles.deleteIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.quantityRow}>
                      <Text style={styles.minOrderAlert}>Min: {item.minOrder}</Text>
                      
                      <View style={styles.qtyControl}>
                        <TouchableOpacity 
                          style={styles.qtyBtn} 
                          onPress={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= item.minOrder}
                        >
                          <Text style={styles.qtyBtnText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{item.quantity}</Text>
                        <TouchableOpacity 
                          style={styles.qtyBtn} 
                          onPress={() => updateQuantity(item.id, 1)}
                        >
                          <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
            
            {/* Trust Badges */}
            <View style={styles.trustBox}>
              <Text style={styles.trustTitle}>🛡 Safe & Secure Purchasing</Text>
              <Text style={styles.trustDesc}>Your funds are securely held in escrow and released to the supplier only upon delivery confirmation.</Text>
            </View>

          </ScrollView>

          {/* Checkout Bottom Bar */}
          <View style={styles.checkoutBar}>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total ({selectedItems.length} items)</Text>
              <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.checkoutBtn, selectedItems.length === 0 && styles.checkoutBtnDisabled]}
              onPress={() => router.push('/(buyer)/payment')}
              disabled={selectedItems.length === 0}
            >
              <Text style={styles.checkoutBtnText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 24, color: '#000040' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#000040' },
  clearBtn: { color: '#e53935', fontSize: 14, fontWeight: '600' },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Select All
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  checkboxActive: {
    backgroundColor: '#008b8b', // Teal
    borderColor: '#008b8b',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectAllText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },

  // Cart Cards
  cartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eaeaea',
    overflow: 'hidden',
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fbfbfe',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  vendorIcon: { fontSize: 14, marginRight: 8 },
  vendorName: { fontSize: 12, fontWeight: '700', color: '#1a237e' },

  cardBody: {
    flexDirection: 'row',
    padding: 16,
  },
  itemCheckbox: {
    justifyContent: 'center',
    paddingRight: 8,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: 11,
    color: '#888',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#008b8b',
  },
  deleteIcon: {
    fontSize: 16,
  },

  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  minOrderAlert: {
    fontSize: 10,
    color: '#e65100', // orange
    fontWeight: '600',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
  },
  qtyBtnText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  qtyValue: {
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: '700',
    color: '#000040',
  },

  // Trust Box
  trustBox: {
    backgroundColor: '#e0f2f1',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#004d40',
    marginBottom: 4,
  },
  trustDesc: {
    fontSize: 11,
    color: '#00695c',
    lineHeight: 16,
  },

  // Checkout Bar
  checkoutBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalBox: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000040',
  },
  checkoutBtn: {
    backgroundColor: '#000040',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  checkoutBtnDisabled: {
    backgroundColor: '#9e9e9e',
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000040',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseBtn: {
    backgroundColor: '#000040',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
})
