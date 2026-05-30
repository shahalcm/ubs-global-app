import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const BASE_URL = 'http://10.213.25.184:5000/api'

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
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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

    console.error('[API Error Response]', error.response?.status, error.message);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token')
      await AsyncStorage.removeItem('user')
      // redirect to login
    }
    return Promise.reject(error)
  }
)

export default api
