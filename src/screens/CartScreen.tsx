// screens/CartScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addToCartThunk,
  removeFromCartThunk,
  clearCartThunk,
  fetchCart,
} from '../store/cartSlice';
import { createOrderThunk } from '../store/orderSlice';
import { RootState } from '../store/store';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  vegetarian: boolean;
}

interface Restaurant {
  id: number;
  name: string;
  items: MenuItem[];
}

interface CartItem extends MenuItem {
  quantity: number;
}

// 🔹 Restaurantes fictícios
const restaurants: Restaurant[] = [
  {
    id: 1,
    name: 'Restaurante A',
    items: [
      { id: 1, name: 'Hambúrguer', price: 25, vegetarian: false },
      { id: 2, name: 'Salada', price: 18, vegetarian: true },
      { id: 3, name: 'Suco', price: 8, vegetarian: true },
    ],
  },
  {
    id: 2,
    name: 'Restaurante B',
    items: [
      { id: 4, name: 'Pizza', price: 30, vegetarian: false },
      { id: 5, name: 'Pão de Alho', price: 10, vegetarian: true },
      { id: 6, name: 'Refrigerante', price: 6, vegetarian: true },
    ],
  },
  {
    id: 3,
    name: 'Restaurante C',
    items: [
      { id: 7, name: 'Sushi', price: 40, vegetarian: false },
      { id: 8, name: 'Guioza', price: 20, vegetarian: false },
      { id: 9, name: 'Chá Gelado', price: 7, vegetarian: true },
    ],
  },
];

const CartScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state: RootState) => state.cart.data) || { items: [] };

  // Buscar carrinho ao montar
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const addItemToCart = (item: MenuItem) => {
    dispatch(addToCartThunk({ ...item, quantity: 1 }));
  };

  const removeItemFromCart = (id: number) => {
    dispatch(removeFromCartThunk(id));
  };

  const finalizeOrder = () => {
    const total: number = cart.items.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    );

    dispatch(
      createOrderThunk({
        items: cart.items,
        total,
        status: 'pending',
        date: new Date().toISOString(),
        cancelled: false,
      })
    );
    dispatch(clearCartThunk());
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Restaurantes</Text>

      {/* 🔹 Menu dos restaurantes */}
      {restaurants.map((restaurant) => (
        <View key={restaurant.id} style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 10 }}>{restaurant.name}</Text>
          {restaurant.items.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
                padding: 8,
                borderWidth: 1,
                borderRadius: 6,
              }}
            >
              <Text>
                {item.name} - R${item.price} {item.vegetarian ? '(Vegetariano)' : ''}
              </Text>
              <Button mode="contained" onPress={() => addItemToCart(item)}>
                Adicionar
              </Button>
            </View>
          ))}
        </View>
      ))}

      {/* 🔹 Carrinho */}
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Carrinho</Text>
      {cart.items.length === 0 && <Text>Carrinho vazio</Text>}
      {cart.items.map((item: CartItem) => (
        <View
          key={item.id}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
            padding: 8,
            borderWidth: 1,
            borderRadius: 6,
          }}
        >
          <Text>
            {item.name} x {item.quantity} - R${item.price * item.quantity}
          </Text>
          <Button mode="contained" onPress={() => removeItemFromCart(item.id)}>
            Remover
          </Button>
        </View>
      ))}

      {cart.items.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            Total: R$
            {cart.items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0)}
          </Text>
          <Button mode="contained" onPress={finalizeOrder}>
            Finalizar Pedido
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

export default CartScreen;
