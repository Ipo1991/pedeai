import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/store/store';
import Navigation from './src/navigation/Navigation';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <CartProvider>
          <PaperProvider>
            <Navigation />
          </PaperProvider>
        </CartProvider>
      </AuthProvider>
    </ReduxProvider>
  );
}