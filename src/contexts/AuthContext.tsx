import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '../store/hooks';
import { loginThunk, registerThunk, logoutThunk } from '../store/authSlice';
// Usando ApiService real para conectar ao backend NestJS
import api, { setAuthToken } from '../services/ApiService';
// import api, { setAuthToken } from '../services/MockApiService'; // Descomente para usar mock

type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
  birth_date?: string;
};

type AuthContextData = {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (data: any) => Promise<void>;
};

export const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@pedeai:token');
        const storedUser = await AsyncStorage.getItem('@pedeai:user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setAuthToken(storedToken);
        }
      } catch (e) {
        console.error('Error loading auth state:', e);
      }
    })();
  }, []);

  async function signIn(email: string, password: string) {
    const result = await dispatch(loginThunk({ email, password })).unwrap();
    const { token: access_token, isAdmin, ...userData } = result as any;
    setToken(access_token);
    setUser({ id: userData.id || 0, name: userData.name || '', email: userData.email || email });
    await AsyncStorage.setItem('@pedeai:token', access_token);
    await AsyncStorage.setItem('@pedeai:user', JSON.stringify({ id: userData.id, name: userData.name, email: userData.email }));
  }

  async function signUp(data: any) {
    const result = await dispatch(registerThunk(data)).unwrap();
    const { token: access_token, isAdmin, ...userData } = result as any;
    setToken(access_token);
    setUser({ id: userData.id || 0, name: userData.name || '', email: userData.email || data.email });
    await AsyncStorage.setItem('@pedeai:token', access_token);
    await AsyncStorage.setItem('@pedeai:user', JSON.stringify({ id: userData.id, name: userData.name, email: userData.email }));
  }

  async function signOut() {
    await dispatch(logoutThunk());
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('@pedeai:token');
    await AsyncStorage.removeItem('@pedeai:user');
  }

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};