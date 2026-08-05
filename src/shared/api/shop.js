import { apiRequest } from './client.js';

export function getProducts(token) {
  return apiRequest('/shop/products', { token });
}

export function redeem(productId, token) {
  return apiRequest('/shop/redeem', { method: 'POST', body: { productId }, token });
}

export function getOrders(token) {
  return apiRequest('/shop/orders', { token });
}
