import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:5000/api';

export const api = axios.create({
  baseURL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
