import api from './api'

// Get all products with filters
export const getProducts = async (filters = {}) => {
  const res = await api.get('/products', { params: filters })
  return res.data
}

// Get single product
export const getProduct = async (id) => {
  const res = await api.get(`/products/${id}`)
  return res.data
}

// Get products by category
export const getProductsByCategory = async (
  categoryId,
  filters = {}
) => {
  const res = await api.get(
    `/products/category/${categoryId}`,
    { params: filters }
  )
  return res.data
}

// Search products
export const searchProducts = async (query) => {
  const res = await api.get('/products', {
    params: { search: query }
  })
  return res.data
}

// Add to wishlist
export const toggleWishlist = async (productId) => {
  const res = await api.post(`/users/wishlist/${productId}`)
  return res.data
}

// Get wishlist
export const getWishlist = async () => {
  const res = await api.get('/users/wishlist')
  return res.data
}

// Seller: Add product
export const addProduct = async (productData) => {
  const formData = new FormData()
  Object.keys(productData).forEach((key) => {
    if (key === 'images') {
      productData.images.forEach((img, i) => {
        formData.append('images', {
          uri: img.uri,
          type: 'image/jpeg',
          name: `product_${i}.jpg`
        })
      })
    } else {
      formData.append(key, productData[key])
    }
  })
  const res = await api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

// Seller: Update product
export const updateProduct = async (id, data) => {
  const res = await api.put(`/products/${id}`, data)
  return res.data
}

// Seller: Delete product
export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`)
  return res.data
}

// Seller: Get my products
export const getMyProducts = async (filters = {}) => {
  const res = await api.get(
    '/products/my-products',
    { params: filters }
  )
  return res.data
}
