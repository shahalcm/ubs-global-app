import api from './api'

/**
 * Client Shipment & Shiprocket API Service
 */
export const checkShippingServiceability = async (payload) => {
  const res = await api.post('/orders/check-serviceability', payload)
  return res.data
}

export const getOrderTrackingDetails = async (orderId) => {
  const res = await api.get(`/orders/${orderId}/track`)
  return res.data
}

export const downloadShippingLabel = async (orderId) => {
  const res = await api.post(`/orders/${orderId}/generate-label`)
  return res.data
}

export const downloadOrderInvoice = async (orderId) => {
  const res = await api.post(`/orders/${orderId}/generate-invoice`)
  return res.data
}

export const downloadManifest = async (orderId) => {
  const res = await api.post(`/orders/${orderId}/generate-manifest`)
  return res.data
}

export const assignAWB = async (orderId) => {
  const res = await api.post(`/orders/${orderId}/assign-awb`)
  return res.data
}

export const schedulePickup = async (orderId) => {
  const res = await api.post(`/orders/${orderId}/generate-pickup`)
  return res.data
}
