import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { getSocket } from '../services/socketService';

const SellerContext = createContext(null);

const initialState = {
  seller: null,
  stats: null,
  products: [],
  orders: [],
  messages: [],
  notifications: [],
  unreadMessages: 0,
  unreadNotifications: 0,
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SELLER':
      return { ...state, seller: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'SET_UNREADS':
      return { ...state, unreadMessages: action.payload.unreadMessages, unreadNotifications: action.payload.unreadNotifications };
    case 'ADD_PRODUCT':
      return { ...state, products: [action.payload, ...state.products] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((item) => ((item._id || item.id) === (action.payload._id || action.payload.id) ? action.payload : item)),
      };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter((item) => (item._id || item.id) !== action.payload) };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map((order) => (order.id === action.payload.id ? action.payload : order)),
      };
    default:
      return state;
  }
}

export function SellerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadProfile = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const cached = await AsyncStorage.getItem('sellerProfile');
      if (cached) {
        dispatch({ type: 'SET_SELLER', payload: JSON.parse(cached) });
      }
      const response = await api.get('/sellers/profile');
      if (response.data.success) {
        dispatch({ type: 'SET_SELLER', payload: response.data.seller });
        await AsyncStorage.setItem('sellerProfile', JSON.stringify(response.data.seller));
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [statsRes, productsRes, ordersRes, messagesRes, notificationsRes] = await Promise.all([
        api.get('/sellers/dashboard-stats'),
        api.get('/products/seller/my-products'),
        api.get('/orders/seller-orders'),
        api.get('/messages'),
        api.get('/notifications'),
      ]);
      dispatch({ type: 'SET_STATS', payload: statsRes.data });
      dispatch({ type: 'SET_PRODUCTS', payload: productsRes.data.products || [] });
      dispatch({ type: 'SET_ORDERS', payload: ordersRes.data });
      dispatch({ type: 'SET_MESSAGES', payload: messagesRes.data || [] });
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notificationsRes.data || [] });
      dispatch({ type: 'SET_UNREADS', payload: {
        unreadMessages: (messagesRes.data || []).filter((item) => !item.read).length,
        unreadNotifications: (notificationsRes.data || []).filter((item) => !item.read).length,
      } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addProduct = useCallback(async (product) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.post('/products', product);
      dispatch({ type: 'ADD_PRODUCT', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateProduct = useCallback(async (id, updates) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.put(`/products/${id}`, updates);
      const updatedItem = response.data.product || response.data;
      dispatch({ type: 'UPDATE_PRODUCT', payload: updatedItem });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.delete(`/products/${id}`);
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateOrderStatus = useCallback(async (id, payload) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.patch(`/orders/${id}/status`, payload);
      dispatch({ type: 'UPDATE_ORDER', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadDashboard();
  }, [loadDashboard, loadProfile]);

  useEffect(() => {
    const activeSocket = getSocket();
    if (activeSocket) {
      activeSocket.on('newOrder', loadDashboard);
      activeSocket.on('receiveMessage', loadDashboard);
      activeSocket.on('orderStatusChanged', loadDashboard);

      if (state.seller?._id) {
        activeSocket.emit('joinRoom', state.seller._id.toString());
        console.log('Joined seller socket room:', state.seller._id);
      }
    }
    return () => {
      const activeSocket = getSocket();
      if (activeSocket) {
        activeSocket.off('newOrder', loadDashboard);
        activeSocket.off('receiveMessage', loadDashboard);
        activeSocket.off('orderStatusChanged', loadDashboard);
      }
    };
  }, [state.seller?._id, loadDashboard]);

  const value = useMemo(
    () => ({
      ...state,
      loadDashboard,
      loadProfile,
      addProduct,
      updateProduct,
      deleteProduct,
      updateOrderStatus,
    }),
    [state, loadDashboard, loadProfile, addProduct, updateProduct, deleteProduct, updateOrderStatus],
  );

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
}

export function useSeller() {
  const ctx = useContext(SellerContext);
  if (!ctx) {
    throw new Error('useSeller must be used within SellerProvider');
  }
  return ctx;
}
