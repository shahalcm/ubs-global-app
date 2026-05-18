import api from './api'

// Buyer: Place order
export const placeOrder = async (orderData) => {
  const res = await api.post('/orders', orderData)
  return res.data
}

// Buyer: Get my orders
export const getMyOrders = async () => {
  const res = await api.get('/orders/my-orders')
  return res.data
}

// Buyer: Track order
export const trackOrder = async (orderId) => {
  const res = await api.get(`/orders/${orderId}/track`)
  return res.data
}

// Buyer: Cancel order
export const cancelOrder = async (orderId, reason) => {
  const res = await api.post(`/orders/${orderId}/cancel`, {
    reason
  })
  return res.data
}

// Seller: Get seller orders
export const getSellerOrders = async (filters = {}) => {
  const res = await api.get(
    '/orders/seller-orders',
    { params: filters }
  )
  return res.data
}

// Seller: Update order status
export const updateOrderStatus = async (orderId, status, data) => {
  const res = await api.patch(
    `/orders/${orderId}/status`,
    { status, ...data }
  )
  return res.data
}
