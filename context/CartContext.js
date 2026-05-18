import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    const cart = await AsyncStorage.getItem('cart')
    if (cart) setItems(JSON.parse(cart))
  }

  const saveCart = async (cartItems) => {
    await AsyncStorage.setItem(
      'cart',
      JSON.stringify(cartItems)
    )
  }

  const addToCart = async (product, quantity = 1) => {
    const existing = items.find(
      (i) => i.productId === product._id
    )
    let newItems
    if (existing) {
      newItems = items.map((i) =>
        i.productId === product._id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      )
    } else {
      newItems = [...items, {
        productId: product._id,
        name: product.title,
        image: product.images[0],
        price: product.price,
        sellerId: product.sellerId,
        quantity
      }]
    }
    setItems(newItems)
    await saveCart(newItems)
  }

  const removeFromCart = async (productId) => {
    const newItems = items.filter(
      (i) => i.productId !== productId
    )
    setItems(newItems)
    await saveCart(newItems)
  }

  const updateQuantity = async (productId, quantity) => {
    const newItems = items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    )
    setItems(newItems)
    await saveCart(newItems)
  }

  const clearCart = async () => {
    setItems([])
    await AsyncStorage.removeItem('cart')
  }

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  )

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity, 0
  )

  return (
    <CartContext.Provider value={{
      items,
      total,
      itemCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
