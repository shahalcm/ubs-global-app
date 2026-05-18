import api from './api'

// Create contact request
export const createContactRequest = async (data) => {
  const res = await api.post('/contact-requests', data)
  return res.data
}

// Get my requests
export const getMyRequests = async () => {
  const res = await api.get('/contact-requests/my-requests')
  return res.data
}
