import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const api = axios.create({
  baseURL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
