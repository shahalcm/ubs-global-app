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
