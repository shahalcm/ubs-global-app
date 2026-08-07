import api from './api'

// Apply to become seller
export const applyAsSeller = async (sellerData) => {
  const formData = new FormData()
  Object.keys(sellerData).forEach((key) => {
    if (sellerData[key] === null || sellerData[key] === undefined) {
      return;
    }
    if (key === 'shopLogo' || key === 'idProof') {
      if (typeof sellerData[key] === 'string' && sellerData[key].length > 0) {
        const uri = sellerData[key]
        const filename = uri.split('/').pop() || `${key}.jpg`
        const match = /\.(\w+)$/.exec(filename)
        const type = match ? `image/${match[1]}` : 'image/jpeg'
        formData.append(key, {
          uri,
          name: filename,
          type
        })
      }
    } else if (key === 'bankDetails' && typeof sellerData[key] === 'object') {
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

// Pickup Addresses
export const getPickupAddresses = async () => {
  const res = await api.get('/sellers/pickup-addresses')
  return res.data
}

export const addPickupAddress = async (data) => {
  const res = await api.post('/sellers/pickup-addresses', data)
  return res.data
}

export const setDefaultPickupAddress = async (locationId) => {
  const res = await api.patch(`/sellers/pickup-addresses/${locationId}/default`)
  return res.data
}

