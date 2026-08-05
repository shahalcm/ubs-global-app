import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const RECENTLY_VIEWED_KEY = 'ubs_recently_viewed_products';

export async function getRecentlyViewed() {
  try {
    const json = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    let localItems = json ? JSON.parse(json) : [];

    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const res = await api.get('/users/recently-viewed');
        if (res.data?.success && Array.isArray(res.data.products) && res.data.products.length > 0) {
          const backendItems = res.data.products;
          const map = new Map();
          [...backendItems, ...localItems].forEach((item) => {
            if (item && (item._id || item.id)) {
              const key = (item._id || item.id).toString();
              if (!map.has(key)) map.set(key, item);
            }
          });
          localItems = Array.from(map.values()).slice(0, 20);
          await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(localItems));
        }
      } catch (backendErr) {
        console.log('Backend getRecentlyViewed fallback to local storage:', backendErr?.message);
      }
    }
    return localItems;
  } catch (err) {
    console.error('Error in getRecentlyViewed:', err);
    return [];
  }
}

export async function addRecentlyViewed(product) {
  if (!product || (!product._id && !product.id)) return;
  const productId = (product._id || product.id).toString();

  try {
    const json = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    let currentItems = json ? JSON.parse(json) : [];

    currentItems = currentItems.filter((item) => item && (item._id || item.id).toString() !== productId);
    currentItems.unshift(product);

    if (currentItems.length > 20) {
      currentItems = currentItems.slice(0, 20);
    }

    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(currentItems));

    const token = await AsyncStorage.getItem('token');
    if (token) {
      api.post('/users/recently-viewed', { productId }).catch((e) => {
        console.log('Backend sync addRecentlyViewed failed:', e?.message);
      });
    }
  } catch (err) {
    console.error('Error in addRecentlyViewed:', err);
  }
}

export async function removeRecentlyViewed(productId) {
  if (!productId) return;
  try {
    const json = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    let currentItems = json ? JSON.parse(json) : [];
    currentItems = currentItems.filter((item) => item && (item._id || item.id).toString() !== productId.toString());
    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(currentItems));
  } catch (err) {
    console.error('Error in removeRecentlyViewed:', err);
  }
}

export async function clearRecentlyViewed() {
  try {
    await AsyncStorage.removeItem(RECENTLY_VIEWED_KEY);
    const token = await AsyncStorage.getItem('token');
    if (token) {
      api.delete('/users/recently-viewed').catch((e) => {
        console.log('Backend clearRecentlyViewed failed:', e?.message);
      });
    }
  } catch (err) {
    console.error('Error in clearRecentlyViewed:', err);
  }
}
