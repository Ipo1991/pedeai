import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrders } from '../store/orderSlice';
import { RootState } from '../store/store';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  date: string;
  total: number;
  status: string;
  items: CartItem[];
  cancelled: boolean;
}

const OrderHistoryScreen = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state: RootState) => state.orders.data) as Order[];
  const [searchText, setSearchText] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const lowerSearch = searchText.toLowerCase();
      const filtered = orders.filter(order => 
        // filtrar por valor total
        order.total.toString().includes(lowerSearch) ||
        // filtrar por data
        new Date(order.date).toLocaleDateString().includes(lowerSearch) ||
        // filtrar por item comprado
        order.items.some(item => item.name.toLowerCase().includes(lowerSearch))
      );
      setFilteredOrders(filtered);
    }
  }, [searchText, orders]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#b71c1c',
          marginBottom: 10,
        }}
      >
        Histórico de Pedidos
      </Text>

      <TextInput
        placeholder="Filtrar por valor, item ou data"
        value={searchText}
        onChangeText={setSearchText}
        style={{
          borderWidth: 1,
          borderColor: '#b71c1c',
          borderRadius: 8,
          padding: 8,
          marginBottom: 15,
        }}
      />

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: '#ffeaea',
              borderRadius: 12,
              padding: 15,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#f5c2c2',
            }}
          >
            <Text style={{ fontSize: 16, color: '#000', marginBottom: 5 }}>
              Pedido #{item.id}
            </Text>
            <Text style={{ color: '#000', marginBottom: 5 }}>
              Data: {new Date(item.date).toLocaleDateString()}
            </Text>
            <Text style={{ color: '#000', marginBottom: 5 }}>
              Total: R$ {item.total.toFixed(2)}
            </Text>

            <Text
              style={{
                color: 'green',
                fontWeight: 'bold',
                marginBottom: 10,
              }}
            >
              Status: Pedido Finalizado
            </Text>

            <Text style={{ fontWeight: '600', marginBottom: 5 }}>Itens Comprados:</Text>
            {item.items.map((product) => (
              <View
                key={product.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 3,
                }}
              >
                <Text style={{ color: '#000' }}>
                  {product.name} x {product.quantity}
                </Text>
                <Text style={{ color: '#000' }}>
                  R$ {(product.price * product.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
};

export default OrderHistoryScreen;
