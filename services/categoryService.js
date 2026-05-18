import api from './api'

// Get all categories
export const getCategories = async () => {
  const res = await api.get('/categories')
  return res.data
}

// Get single category
export const getCategory = async (id) => {
  const res = await api.get(`/categories/${id}`)
  return res.data
}
