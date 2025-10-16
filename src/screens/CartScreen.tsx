// screens/RestaurantsScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addToCartThunk,
  removeFromCartThunk,
  clearCartThunk,
  fetchCart,
} from '../store/cartSlice';
import { createOrderThunk } from '../store/orderSlice';
import { RootState } from '../store/store';
import { useNavigation } from '@react-navigation/native'; //adc poke

interface MenuItem {
  id: number;
  name: string;
  price: number;
}

interface Restaurant {
  id: number;
  name: string;
  items: MenuItem[];
}

interface CartItem extends MenuItem {
  quantity: number;
}

// 🔹 Restaurantes atualizados
const restaurants: Restaurant[] = [
  {
    id: 1,
    name: 'FastBurguer',
    items: [
      { id: 1, name: 'Hambúrguer', price: 25 },
      { id: 2, name: 'Batata Frita', price: 12 },
      { id: 3, name: 'Suco', price: 8 },
    ],
  },
  {
    id: 2,
    name: 'Pizzajá',
    items: [
      { id: 4, name: 'Calabresa', price: 35 },
      { id: 5, name: 'Quatro Queijos', price: 38 },
      { id: 6, name: 'Alho e Óleo', price: 32 },
    ],
  },
  {
    id: 3,
    name: 'SushiNow',
    items: [
      { id: 7, name: 'Sushi', price: 40 },
      { id: 8, name: 'Sashimi', price: 45 },
      { id: 9, name: 'Bolinho de Peixe', price: 25 },
    ],
  },
];

const RestaurantsScreen: React.FC = () => {
  const navigation = useNavigation<any>(); // add poke
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state: RootState) => state.cart.data) || { items: [] };

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const addItemToCart = (item: MenuItem) => {
    dispatch(addToCartThunk({ ...item, quantity: 1 }));
  };

  const removeItemFromCart = (id: number) => {
    dispatch(removeFromCartThunk(id));
  };

  const finalizeOrder = () => { // add daniel

    navigation.navigate('Checkout'); //  apenas navega para a nova tela.
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Restaurantes</Text>

      {/* 🔹 Restaurantes */}
      {restaurants.map((restaurant) => (
        <Card key={restaurant.id} style={styles.card}>
          <Card.Content>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            {restaurant.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemText}>
                  {item.name} - R${item.price}
                </Text>
                <Button
                  mode="contained"
                  buttonColor="#b71c1c"
                  textColor="#fff"
                  style={styles.button}
                  onPress={() => addItemToCart(item)}
                >
                  Adicionar
                </Button>
              </View>
            ))}
          </Card.Content>
        </Card>
      ))}

      {/* 🔹 Carrinho */}
      <Text style={styles.subtitle}>Carrinho</Text>
      {cart.items.length === 0 && <Text style={styles.emptyCart}>Carrinho vazio</Text>}
      {cart.items.map((item: CartItem) => (
        <View key={item.id} style={styles.itemRow}>
          <Text style={styles.itemText}>
            {item.name} x {item.quantity} - R${item.price * item.quantity}
          </Text>
          <Button
            mode="outlined"
            textColor="#b71c1c"
            style={styles.button}
            onPress={() => removeItemFromCart(item.id)}
          >
            Remover
          </Button>
        </View>
      ))}

      {cart.items.length > 0 && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>
            Total: R$
            {cart.items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0)}
          </Text>
          <Button
            mode="contained"
            buttonColor="#b71c1c"
            textColor="white"
            style={styles.saveButton}
            onPress={finalizeOrder}
          >
            Finalizar Pedido
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

export default RestaurantsScreen;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#b71c1c',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 30,
    marginBottom: 10,
    color: '#b71c1c',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#ffe5e5',
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#b71c1c',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  itemText: {
    fontSize: 16,
    color: '#000',
  },
  button: {
    borderRadius: 8,
  },
  emptyCart: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  totalContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  saveButton: {
    borderRadius: 8,
    alignSelf: 'center',
  },
});
