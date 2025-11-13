import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Profile: undefined;
  Address: undefined;
  Payment: undefined;
  OrderHistory: undefined;
  Cart: undefined;
  Restaurants: undefined;
  RestaurantDetail: { id: number };
  Checkout: undefined;
  AdminRestaurants: undefined;
  AdminProducts: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;