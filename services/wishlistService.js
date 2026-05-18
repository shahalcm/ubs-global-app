import api from './api'

export const getWishlist = async () => {
  const res = await api.get('/wishlist')
  return res.data
}

export const toggleWishlist = async (productId) => {
  const res = await api.post(`/wishlist/toggle/${productId}`)
  return res.data
}
