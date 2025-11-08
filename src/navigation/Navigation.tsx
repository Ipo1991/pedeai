import React, { useEffect, useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddressScreen from '../screens/AddressScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import RestaurantsScreen from '../screens/RestaurantsScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import { AuthContext } from '../contexts/AuthContext';
import { View, Text, ActivityIndicator } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Profile: undefined;
  Addresses: undefined;
  Payments: undefined;
  OrderHistory: undefined;
  Cart: undefined;
  Checkout: undefined;
  Restaurants: undefined;
  RestaurantDetail: { id: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  const auth = useContext(AuthContext);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // small delay to let AuthProvider restore token from storage
    const t = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const signedIn = !!auth?.token;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={signedIn ? 'Dashboard' : 'Login'}>
        {!signedIn ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Restaurants" component={RestaurantsScreen} options={{ title: 'Restaurantes' }} />
            <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{ title: 'Cardápio' }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Carrinho' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Finalizar Pedido' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
            <Stack.Screen name="Addresses" component={AddressScreen} options={{ title: 'Endereços' }} />
            <Stack.Screen name="Payments" component={PaymentScreen} options={{ title: 'Pagamentos' }} />
            <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'Histórico' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;