import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure a URL da sua API aqui
// Para web: localhost funciona
// Para device/emulador: use o IP da sua máquina (ex: http://192.168.1.10:3000)
const API_BASE_URL = 'http://localhost:3000';

const TOKEN_KEY = '@pedeai:token';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Carregar token do AsyncStorage no boot
AsyncStorage.getItem(TOKEN_KEY).then((token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    AsyncStorage.setItem(TOKEN_KEY, token).catch(console.error);
  } else {
    delete api.defaults.headers.common['Authorization'];
    AsyncStorage.removeItem(TOKEN_KEY).catch(console.error);
  }
}

// Interceptor to catch 401 and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      setAuthToken(null);
      // Para React Native, não usar window.location
      console.warn('Unauthorized - user needs to login again');
    }
    return Promise.reject(error);
  }
);

export default api;
