import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RootState } from '../store/store';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddressScreen from '../screens/AddressScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import CartScreen from '../screens/CartScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginThunk } from '../store/authSlice';
import { View, Text } from 'react-native';
import CheckoutScreen from '../screens/CheckoutScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Profile: undefined;
  Addresses: { fromCheckout?: boolean } | undefined; // Adicionado parâmetro opcional
  Payments: { fromCheckout?: boolean } | undefined;  // Adicionado parâmetro opcional
  OrderHistory: undefined;
  Cart: undefined;
  Checkout: { newAddressId?: number; newPaymentId?: number } | undefined; // Adicionado parâmetro opcional
};

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        console.log('Token lido do AsyncStorage:', storedToken);
        if (storedToken && !token) { // Só atualiza se token não está no estado
          dispatch(loginThunk.fulfilled(storedToken, 'dummy-request-id', { email: '', password: '' }));
        }
      } catch (error) {
        console.error('Erro ao verificar token no AsyncStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, [dispatch]);

  useEffect(() => {
    console.log('Token no estado Redux:', token); // Log para depurar mudanças no token
  }, [token]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={token ? 'Dashboard' : 'Login'}>
      <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>
        
        <Stack.Group>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Addresses" component={AddressScreen} />
          <Stack.Screen name="Payments" component={PaymentScreen} />
          <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} /> 
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;