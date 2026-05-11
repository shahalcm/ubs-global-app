import api from './api';

export async function login(payload) {
  const { data } = await api.post('/auth/login', payload);
  return data;
}

export async function signup(payload) {
  const { data } = await api.post('/auth/signup', payload);
  return data;
}

export async function verifyOtp(payload) {
  const { data } = await api.post('/auth/verify-otp', payload);
  return data;
}
