import api from './api'

// Fetch reviews for a specific product
export const getProductReviews = async (productId) => {
  const res = await api.get(`/reviews/product/${productId}`)
  return res.data
}

// Submit or update a review
export const submitReview = async (reviewData) => {
  const res = await api.post('/reviews', reviewData)
  return res.data
}
