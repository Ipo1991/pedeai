import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  removeFromCartThunk,
  clearCartThunk,
  fetchCart,
  updateCartItemThunk,
} from '../store/cartSlice';
import { RootState } from '../store/store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  restaurantId?: number;
  restaurantName?: string;
}

const CartScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state: RootState) => state.cart.data) || { items: [] };

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const updateQuantity = (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCartThunk(item.id));
    } else {
      dispatch(updateCartItemThunk({ id: item.id, item: { ...item, quantity: newQuantity } }));
    }
  };

  const removeItem = (id: number) => {
    dispatch(removeFromCartThunk(id));
  };

  const clearCart = () => {
    dispatch(clearCartThunk());
  };

  const goToCheckout = () => {
    navigation.navigate('Checkout');
  };

  const goToRestaurants = () => {
    navigation.navigate('Restaurants');
  };

  const total = cart.items.reduce(
    (sum: number, item: CartItem) => sum + Number(item.price) * item.quantity,
    0
  );

  const restaurantName = cart.items.length > 0 ? cart.items[0].restaurantName : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meu Carrinho</Text>

      {cart.items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
          <Text style={styles.emptySubtext}>
            Adicione itens dos restaurantes para começar
          </Text>
          <Button
            mode="contained"
            buttonColor="#b71c1c"
            textColor="#fff"
            style={styles.emptyButton}
            onPress={goToRestaurants}
          >
            Ver Restaurantes
          </Button>
        </View>
      ) : (
        <>
          {restaurantName && (
            <Card style={styles.restaurantCard}>
              <Card.Content>
                <Text style={styles.restaurantLabel}>Pedido de:</Text>
                <Text style={styles.restaurantName}>{restaurantName}</Text>
              </Card.Content>
            </Card>
          )}

          {cart.items.map((item: CartItem) => (
            <Card key={item.id} style={styles.itemCard}>
              <Card.Content>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="#d32f2f"
                    onPress={() => removeItem(item.id)}
                  />
                </View>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>R$ {Number(item.price).toFixed(2)}</Text>
                  <View style={styles.quantityControl}>
                    <IconButton
                      icon="minus"
                      size={18}
                      iconColor="#b71c1c"
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item, item.quantity - 1)}
                    />
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <IconButton
                      icon="plus"
                      size={18}
                      iconColor="#b71c1c"
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item, item.quantity + 1)}
                    />
                  </View>
                  <Text style={styles.itemTotal}>
                    R$ {(Number(item.price) * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>R$ {total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxa de entrega</Text>
              <Text style={styles.summaryValue}>A calcular</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <Button
              mode="outlined"
              textColor="#b71c1c"
              style={styles.clearButton}
              onPress={clearCart}
            >
              Limpar Carrinho
            </Button>
            <Button
              mode="contained"
              buttonColor="#b71c1c"
              textColor="#fff"
              style={styles.checkoutButton}
              onPress={goToCheckout}
            >
              Finalizar Pedido
            </Button>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#b71c1c',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  restaurantCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#ffe5e5',
  },
  restaurantLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#b71c1c',
  },
  itemCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  quantityButton: {
    margin: 0,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#b71c1c',
    minWidth: 80,
    textAlign: 'right',
  },
  summaryCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#b71c1c',
  },
  actionsContainer: {
    marginTop: 20,
    gap: 12,
  },
  clearButton: {
    borderRadius: 8,
    borderColor: '#b71c1c',
  },
  checkoutButton: {
    borderRadius: 8,
  },
});
