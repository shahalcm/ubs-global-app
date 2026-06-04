import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import { getEnv } from '../utils/env'

let BASE_URL = getEnv('EXPO_PUBLIC_API_URL', 'https://api.ubsglobalapp.com/api')

// Ensure BASE_URL ends with '/api' to resolve endpoints correctly and prevent 404s
if (BASE_URL) {
  // Strip trailing slashes first
  BASE_URL = BASE_URL.replace(/\/+$/, '')
  // If it doesn't end with '/api', append it
  if (!BASE_URL.endsWith('/api')) {
    BASE_URL += '/api'
  }
} else {
  BASE_URL = 'https://api.ubsglobalapp.com/api'
}

console.log('🔌 [API Config] Active API Base URL:', BASE_URL)

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true'
  }
})

// Configure progressive retry parameters
const MAX_RETRIES = 3
const RETRY_DELAY_BASE = 1000 // 1 second base delay

// Auto attach token to every request
api.interceptors.request.use(
  async (config) => {
    // Ensure no duplicate /api segments are created in the final URL path
    if (config.url && (config.url.startsWith('/api/') || config.url === '/api')) {
      config.url = config.url.replace(/^\/api/, '')
    }

    console.log('API Request:', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''));
    
    const token = await AsyncStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
)

// Handle responses globally and implement retry logic
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    const { config, message } = error;
    
    // Check if configuration exists and retries can be processed
    if (!config) {
      return Promise.reject(error);
    }

    // Initialize retry counter
    config.__retryCount = config.__retryCount || 0;

    // Retry only on network drops/errors or server-side 5xx errors (not client 4xx like 401/403)
    const isNetworkError = !error.response || (error.response.status >= 500 && error.response.status <= 599);
    
    if (isNetworkError && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;
      const delay = RETRY_DELAY_BASE * Math.pow(2, config.__retryCount); // Exponential backoff: 2s, 4s, 8s
      
      console.warn(`⚠️ [API Retry] ${config.method?.toUpperCase()} ${config.url} failed (${message}). Retrying in ${delay}ms... (Attempt ${config.__retryCount}/${MAX_RETRIES})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(config);
    }

    console.log('API ERROR URL:', error?.config?.url);
    console.log('API ERROR STATUS:', error?.response?.status);
    console.log('API ERROR DATA:', error?.response?.data);

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token')
      await AsyncStorage.removeItem('user')
      // redirect to login
    }
    return Promise.reject(error)
  }
)

export default api
