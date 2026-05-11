import api from './api';

export async function fetchProducts(params) {
  const { data } = await api.get('/products', { params });
  return data;
}

export async function fetchProductById(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}
