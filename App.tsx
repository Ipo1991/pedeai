import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/store/store';
import Navigation from './src/navigation/Navigation';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
// CartContext desativado para evitar duas fontes de estado de carrinho; usamos Redux
// import { CartProvider } from './src/contexts/CartContext';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <PaperProvider>
          <Navigation />
        </PaperProvider>
      </AuthProvider>
    </ReduxProvider>
  );
}