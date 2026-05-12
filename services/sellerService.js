import { api } from './api';

export const sellerService = {
  applySeller: (payload) => api.post('/sellers/apply', payload),
  getProfile: () => api.get('/sellers/profile'),
  updateProfile: (payload) => api.put('/sellers/profile', payload),
  getDashboardStats: () => api.get('/sellers/dashboard-stats'),
  getEarnings: () => api.get('/sellers/earnings'),
  getSellerOrders: () => api.get('/orders/seller-orders'),
  updateOrderStatus: (id, payload) => api.patch(`/orders/${id}/status`, payload),
  getMessages: () => api.get('/messages'),
  getNotifications: () => api.get('/notifications'),
};
