import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({ baseURL: 'http://fake-api.com' });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const storageKeys = {
  profile: 'profile',
  addresses: 'addresses',
  payments: 'payments',
  orders: 'orders',
  cart: 'cart',
  users: 'users',
};

interface Profile {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
}

interface User {
  email: string;
  password: string;
  name?: string;
}

export const getProfile = async (): Promise<Profile> => {
  await delay(300);
  const data = await AsyncStorage.getItem(storageKeys.profile);
  return data
    ? JSON.parse(data)
    : { name: '', email: '', phone: '', birthDate: new Date().toISOString() };
};

// 🔹 Atualizar perfil (agora aceita campos parciais)
export const updateProfile = async (partialProfile: Partial<Profile>): Promise<Profile> => {
  await delay(300);
  const existingData = await AsyncStorage.getItem(storageKeys.profile);
  const currentProfile: Profile = existingData
    ? JSON.parse(existingData)
    : { name: '', email: '', phone: '', birthDate: new Date().toISOString() };

  const updatedProfile: Profile = { ...currentProfile, ...partialProfile };

  await AsyncStorage.setItem(storageKeys.profile, JSON.stringify(updatedProfile));
  return updatedProfile;
};

// CRUD Addresses
export const getAddresses = async () => {
  await delay(500);
  const data = await AsyncStorage.getItem(storageKeys.addresses);
  return data ? JSON.parse(data) : [];
};

export const createAddress = async (address: any) => {
  await delay(500);
  const addresses = await getAddresses();
  const newAddress = { ...address, id: Date.now() };
  const updated = [...addresses, newAddress];
  await AsyncStorage.setItem(storageKeys.addresses, JSON.stringify(updated));
  return newAddress;
};

export const updateAddress = async (id: number, address: any) => {
  await delay(500);
  const addresses = await getAddresses();
  const updated = addresses.map((a: any) => (a.id === id ? { ...a, ...address } : a));
  await AsyncStorage.setItem(storageKeys.addresses, JSON.stringify(updated));
  return address;
};

export const deleteAddress = async (id: number) => {
  await delay(500);
  const addresses = await getAddresses();
  const updated = addresses.filter((a: any) => a.id !== id);
  await AsyncStorage.setItem(storageKeys.addresses, JSON.stringify(updated));
  return updated;
};

// CRUD Payments
export const getPayments = async () => {
  await delay(500);
  const data = await AsyncStorage.getItem(storageKeys.payments);
  return data ? JSON.parse(data) : [];
};

export const createPayment = async (payment: any) => {
  await delay(500);
  const payments = await getPayments();
  const newPayment = { ...payment, id: Date.now() };
  const updated = [...payments, newPayment];
  await AsyncStorage.setItem(storageKeys.payments, JSON.stringify(updated));
  return newPayment;
};

export const updatePayment = async (id: number, payment: any) => {
  await delay(500);
  const payments = await getPayments();
  const updated = payments.map((p: any) => (p.id === id ? { ...p, ...payment } : p));
  await AsyncStorage.setItem(storageKeys.payments, JSON.stringify(updated));
  return payment;
};

export const deletePayment = async (id: number) => {
  await delay(500);
  const payments = await getPayments();
  const updated = payments.filter((p: any) => p.id !== id);
  await AsyncStorage.setItem(storageKeys.payments, JSON.stringify(updated));
  return updated;
};

// CRUD Orders
export const getOrders = async () => {
  await delay(500);
  const data = await AsyncStorage.getItem(storageKeys.orders);
  return data ? JSON.parse(data) : [];
};

export const createOrder = async (order: any) => {
  await delay(500);
  const orders = await getOrders();
  const newOrder = { ...order, id: Date.now(), date: new Date().toISOString() };
  const updated = [...orders, newOrder];
  await AsyncStorage.setItem(storageKeys.orders, JSON.stringify(updated));
  return newOrder;
};

export const updateOrder = async (id: number, order: any) => {
  await delay(500);
  const orders = await getOrders();
  const updated = orders.map((o: any) => (o.id === id ? { ...o, ...order } : o));
  await AsyncStorage.setItem(storageKeys.orders, JSON.stringify(updated));
  return order;
};

export const deleteOrder = async (id: number) => {
  await delay(500);
  const orders = await getOrders();
  const updated = orders.filter((o: any) => o.id !== id);
  await AsyncStorage.setItem(storageKeys.orders, JSON.stringify(updated));
  return updated;
};

// CRUD Cart
export const getCart = async () => {
  await delay(500);
  const data = await AsyncStorage.getItem(storageKeys.cart);
  return data ? JSON.parse(data) : { items: [] };
};

export const addToCart = async (item: any) => {
  await delay(500);
  const cart = await getCart();
  const newItem = { ...item, id: Date.now() };
  const updatedItems = [...cart.items, newItem];
  const updatedCart = { items: updatedItems };
  await AsyncStorage.setItem(storageKeys.cart, JSON.stringify(updatedCart));
  return updatedCart;
};

export const updateCartItem = async (id: number, item: any) => {
  await delay(500);
  const cart = await getCart();
  const updatedItems = cart.items.map((i: any) => (i.id === id ? { ...i, ...item } : i));
  const updatedCart = { items: updatedItems };
  await AsyncStorage.setItem(storageKeys.cart, JSON.stringify(updatedCart));
  return updatedCart;
};

export const removeFromCart = async (id: number) => {
  await delay(500);
  const cart = await getCart();
  const updatedItems = cart.items.filter((i: any) => i.id !== id);
  const updatedCart = { items: updatedItems };
  await AsyncStorage.setItem(storageKeys.cart, JSON.stringify(updatedCart));
  return updatedCart;
};

export const clearCart = async () => {
  await delay(500);
  await AsyncStorage.setItem(storageKeys.cart, JSON.stringify({ items: [] }));
};

// 🔹 Auth

export const register = async (email: string, password: string, name?: string) => {
  await delay(500);

  const data = await AsyncStorage.getItem(storageKeys.users);
  const users: User[] = data ? JSON.parse(data) : [];

  if (users.find(u => u.email === email)) {
    throw new Error('Email já cadastrado');
  }

  const newUser: User = { email, password, name };
  users.push(newUser);
  await AsyncStorage.setItem(storageKeys.users, JSON.stringify(users));

  const token = 'fake-token';
  await AsyncStorage.setItem('token', token);
  return token;
};

export const login = async (email: string, password: string) => {
  await delay(500);

  const data = await AsyncStorage.getItem(storageKeys.users);
  const users: User[] = data ? JSON.parse(data) : [];

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Email ou senha inválidos');
  }

  const token = 'fake-token';
  await AsyncStorage.setItem('token', token);
  return token;
};

export const logout = async () => {
  await delay(200);
  await AsyncStorage.removeItem('token');
};