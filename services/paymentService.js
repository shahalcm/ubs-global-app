import api from './api'

export const createRazorpayOrder = async (orderData) => {
  const res = await api.post(
    '/payments/create-order',
    orderData
  )
  return res.data
}

export const verifyPayment = async (paymentData) => {
  const res = await api.post(
    '/payments/verify',
    paymentData
  )
  return res.data
}

export const getSellerEarnings = async () => {
  const res = await api.get('/payments/seller/earnings')
  return res.data
}

export const requestWithdrawal = async (data) => {
  const res = await api.post(
    '/payments/seller/withdraw',
    data
  )
  return res.data
}
