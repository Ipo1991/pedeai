import api from '../services/ApiService';

export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data.accessToken;
};

export const register = async (email: string, password: string, name: string, phone?: string, birthDate?: string) => {
  const res = await api.post('/auth/register', { email, password, name, phone, birthDate });
  return res.data.accessToken;
};

export const logout = async () => {
  const refresh = localStorage.getItem('refreshToken');
  if (refresh) {
    await api.post('/auth/logout', { refreshToken: refresh });
  }
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

// Profiles
export const getProfile = async () => {
  const res = await api.get('/users/me');
  return res.data;
};

export const updateProfile = async (payload: any) => {
  const res = await api.put('/users/me', payload);
  return res.data;
};

// Addresses
export const getAddresses = async () => {
  const res = await api.get('/users/me/addresses');
  return res.data;
};

export const createAddress = async (address: any) => {
  const res = await api.post('/users/me/addresses', address);
  return res.data;
};

// Payments
export const getPayments = async () => {
  const res = await api.get('/users/me/payments');
  return res.data;
};

export const createPayment = async (payload: any) => {
  const res = await api.post('/users/me/payments', payload);
  return res.data;
};

// Restaurants & products
export const fetchRestaurants = async () => {
  const res = await api.get('/restaurants');
  return res.data;
};

export const fetchRestaurantProducts = async (restaurantId: number) => {
  const res = await api.get(`/restaurants/${restaurantId}/products`);
  return res.data;
};