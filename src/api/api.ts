// Usando ApiService real para conectar ao backend NestJS
import api from '../services/ApiService';
// import api from '../services/MockApiService'; // Descomente para usar mock

export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  console.log('🔑 Login response:', res.data);
  console.log('🔑 isAdmin:', res.data.isAdmin);
  return {
    token: res.data.access_token,
    isAdmin: res.data.isAdmin || false,
  };
};

export const register = async (email: string, password: string, name: string, phone?: string, birth_date?: string) => {
  // saneia telefone e birth_date antes de enviar
  const cleanPhone = phone ? phone.replace(/\D/g, '') : undefined;
  let bd = birth_date;
  if (birth_date) {
    // aceita dd/mm/aaaa e converte para ISO yyyy-mm-dd
    const m = birth_date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) bd = `${m[3]}-${m[2]}-${m[1]}`;
  }
  const res = await api.post('/auth/register', { email, password, name, phone: cleanPhone, birth_date: bd });
  return {
    token: res.data.access_token,
    isAdmin: res.data.isAdmin || false,
  };
};

export const logout = async () => {
  // Backend não tem endpoint de logout (JWT stateless)
  // Apenas remover token local
  const { setAuthToken } = await import('../services/ApiService');
  setAuthToken(null);
};

// Profiles
export const getProfile = async () => {
  const res = await api.get('/users/profile');
  return res.data;
};

export const updateProfile = async (payload: any) => {
  // Precisa do ID do usuário - pegar do profile primeiro ou passar como parâmetro
  const profile = await getProfile();
  const res = await api.patch(`/users/${profile.id}`, payload);
  return res.data;
};

export const deleteProfile = async () => {
  const profile = await getProfile();
  const res = await api.delete(`/users/${profile.id}`);
  return res.data;
};

// Addresses
export const getAddresses = async () => {
  const res = await api.get('/addresses/my');
  return res.data;
};

export const createAddress = async (address: any) => {
  // Normaliza payload para backend: isDefault -> is_default, zip somente dígitos
  const payload = {
    street: address.street,
    number: address.number,
    complement: address.complement || undefined,
    neighborhood: address.neighborhood, // Campo obrigatório no backend
    city: address.city,
    state: address.state,
    zip: String(address.zip).replace(/\D/g, ''), // remove hífen
    is_default: !!address.isDefault,
  };
  const res = await api.post('/addresses', payload);
  return res.data;
};

export const updateAddress = async (id: number, address: any) => {
  const payload = {
    street: address.street,
    number: address.number,
    complement: address.complement || undefined,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    zip: String(address.zip).replace(/\D/g, ''),
    is_default: address.isDefault !== undefined ? !!address.isDefault : undefined,
  };
  console.log('🔄 updateAddress API call:', id, payload);
  const res = await api.patch(`/addresses/${id}`, payload);
  return res.data;
};

export const deleteAddress = async (id: number) => {
  const res = await api.delete(`/addresses/${id}`);
  return res.data;
};

// Payments
export const getPayments = async () => {
  const res = await api.get('/payments/my');
  return res.data;
};

export const createPayment = async (payload: any) => {
  const res = await api.post('/payments', payload);
  return res.data;
};

export const updatePayment = async (id: number, payment: any) => {
  const res = await api.patch(`/payments/${id}`, payment);
  return res.data;
};

export const deletePayment = async (id: number) => {
  const res = await api.delete(`/payments/${id}`);
  return res.data;
};

// Cart - Backend não tem carrinho separado, gerenciar no frontend
// Usar AsyncStorage local ou manter MockApiService apenas para cart
import MockApiService from '../services/MockApiService';

export const getCart = async () => {
  const res = await MockApiService.get('/cart');
  return res.data;
};

export const addToCart = async (item: any) => {
  const res = await MockApiService.post('/cart/items', item);
  return res.data;
};

export const updateCartItem = async (id: number, item: any) => {
  const res = await MockApiService.put(`/cart/items/${id}`, item);
  return res.data;
};

export const removeFromCart = async (id: number) => {
  const res = await MockApiService.delete(`/cart/items/${id}`);
  return res.data;
};

export const clearCart = async () => {
  const res = await MockApiService.delete('/cart');
  return res.data;
};

// Orders
export const getOrders = async () => {
  const res = await api.get('/orders/my');
  return res.data;
};

export const createOrder = async (order: any) => {
  // Backend espera formato diferente, transformar
  const orderPayload = {
    user_id: order.userId, // Será sobrescrito pelo backend com JWT
    restaurant_id: order.restaurantId,
    restaurant_name: order.restaurantName,
    items: order.items.map((item: any) => ({
      product_id: item.productId || item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    total: order.total,
    address_id: order.addressId,
    address: order.address,
    payment_type: order.paymentType || 'credit_card',
  };
  
  const res = await api.post('/orders', orderPayload);
  return res.data;
};

export const updateOrder = async (id: number, order: any) => {
  console.log('🔄 Updating order:', id, 'with data:', order);
  const res = await api.patch(`/orders/${id}`, order);
  return res.data;
};

export const deleteOrder = async (id: number) => {
  const res = await api.delete(`/orders/${id}`);
  return res.data;
};

// Restaurants & products
export const fetchRestaurants = async () => {
  const res = await api.get('/restaurants');
  return res.data;
};

export const fetchRestaurantProducts = async (restaurantId: number) => {
  const res = await api.get(`/products?restaurant_id=${restaurantId}`);
  return res.data;
};