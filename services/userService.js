import api from './api'

// Get profile
export const getProfile = async () => {
  const res = await api.get('/users/profile')
  return res.data
}

// Update profile
export const updateProfile = async (data) => {
  const res = await api.patch('/users/profile', data)
  return res.data
}

// Update avatar
export const updateAvatar = async (imageUri) => {
  const formData = new FormData()
  formData.append('avatar', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'avatar.jpg'
  })
  const res = await api.patch('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

// Delete Account (soft delete)
export const deleteAccount = async () => {
  const res = await api.delete('/users/delete-account')
  return res.data
}

// Export My Data (GDPR export)
export const exportData = async () => {
  const res = await api.get('/users/export-data')
  return res.data
}

// Delete My Data (request GDPR purge)
export const deleteDataRequest = async () => {
  const res = await api.delete('/users/delete-data')
  return res.data
}

// Update Privacy Consent Settings
export const updatePrivacySettings = async (settings) => {
  const res = await api.patch('/users/privacy-settings', settings)
  return res.data
}

// Get Legal Policy Document (public)
export const getLegalDoc = async (key) => {
  const res = await api.get(`/users/legal-docs/${key}`)
  return res.data
}
