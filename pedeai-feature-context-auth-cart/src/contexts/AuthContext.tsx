import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api, { setAuthToken } from '../services/ApiService';

type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
  birthDate?: string;
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

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setAuthToken(storedToken);
    }
  }, []);

  async function signIn(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user: userData } = res.data;
    setToken(accessToken);
    setUser(userData);
    setAuthToken(accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  async function signUp(data: any) {
    const res = await api.post('/auth/register', data);
    // if backend returns tokens, sign in using them
    if (res.status === 201 && res.data.accessToken) {
      const { accessToken, refreshToken, user: userData } = res.data;
      setToken(accessToken);
      setUser(userData);
      setAuthToken(accessToken);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  }

  async function signOut() {
    const refresh = localStorage.getItem('refreshToken');
    try {
      if (refresh) {
        await api.post('/auth/logout', { refreshToken: refresh });
      }
    } catch (e) {
      // ignore
    }
    setToken(null);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};