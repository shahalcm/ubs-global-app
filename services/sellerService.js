import api from './api'

// Apply to become seller
export const applyAsSeller = async (sellerData) => {
  const formData = new FormData()
  Object.keys(sellerData).forEach((key) => {
    if (key === 'shopLogo' || key === 'idProof') {
      if (sellerData[key]) {
        formData.append(key, {
          uri: sellerData[key],
          type: 'image/jpeg',
          name: `${key}.jpg`
        })
      }
    } else if (key === 'bankDetails' && typeof sellerData[key] === 'object' && sellerData[key] !== null) {
      formData.append(key, JSON.stringify(sellerData[key]))
    } else {
      formData.append(key, sellerData[key])
    }
  })
  const res = await api.post('/sellers/apply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

// Get seller profile
export const getSellerProfile = async () => {
  const res = await api.get('/sellers/profile')
  return res.data
}

// Update seller profile
export const updateSellerProfile = async (data) => {
  const res = await api.put('/sellers/profile', data)
  return res.data
}

// Get dashboard stats
export const getDashboardStats = async (period = 'month') => {
  const res = await api.get('/sellers/dashboard-stats', {
    params: { period }
  })
  return res.data
}

// Get earnings
export const getEarnings = async (period = 'month') => {
  const res = await api.get('/sellers/earnings', {
    params: { period }
  })
  return res.data
}

// Get recent orders
export const getRecentOrders = async (period = 'month') => {
  const res = await api.get('/sellers/recent-orders', {
    params: { period }
  })
  return res.data
}
