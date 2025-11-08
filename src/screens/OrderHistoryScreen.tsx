import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrders, clearOrders, updateOrderThunk, cancelOrderThunk } from '../store/orderSlice';
import { RootState } from '../store/store';
import { useFocusEffect } from '@react-navigation/native';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  createdAt: string;
  date?: string;
  total: number;
  status: string;
  items: CartItem[];
  cancelled?: boolean;
  restaurantId?: number;
  restaurantName?: string;
  address?: string;
  paymentType?: string;
}

const OrderHistoryScreen = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state: RootState) => state.orders.data) as Order[];
  const [searchText, setSearchText] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  // Helpers para normalização e rótulos
  const normalize = (s: string) =>
    (s || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const paymentLabel = (type?: string) => {
    switch (type) {
      case 'credit':
        return 'cartao de credito credito';
      case 'debit':
        return 'cartao de debito debito';
      case 'pix':
        return 'pix';
      case 'cash':
      default:
        return 'dinheiro cash';
    }
  };

  const statusLabel = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'pendente em preparo aguardando';
      case 'delivered':
      case 'completed':
      case 'finalized':
        return 'finalizado entregue concluido';
      case 'cancelled':
      case 'canceled':
        return 'cancelado cancelada';
      default:
        return status || '';
    }
  };

  // Recarrega pedidos sempre que a tela ganhar foco
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchOrders());
      return () => {
        // Cleanup se necessário
      };
    }, [dispatch])
  );

  useEffect(() => {
    const text = searchText.trim();
    if (text === '') {
      setFilteredOrders(orders);
      return;
    }

    const terms = text.split(/\s+/).map(normalize).filter(Boolean);

    const filtered = orders.filter((order) => {
      const orderDateRaw = order.createdAt || order.date || '';
      const d = orderDateRaw ? new Date(orderDateRaw) : new Date();
      const datePt = d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const idStr = `#${order.id} ${order.id}`;
      const totalDot = Number(order.total).toFixed(2); // 25.00
      const totalComma = totalDot.replace('.', ','); // 25,00
      const totalStr = `r$ ${totalComma} ${totalComma} ${totalDot} ${order.total}`;
      const rest = order.restaurantName || '';
      const addr = order.address || '';
      const pay = paymentLabel(order.paymentType);
      const stat = statusLabel(order.status);
      const items = (order.items || []).map((i) => i.name).join(' ');

      const haystack = normalize(
        [idStr, datePt, orderDateRaw, totalStr, rest, addr, pay, stat, items].join(' ')
      );

      // Todos os termos devem estar presentes em algum dos campos
      return terms.every((t) => haystack.includes(t));
    });

    setFilteredOrders(filtered);
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
        placeholder="Buscar pedidos..."
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
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => {
          const orderDate = item.createdAt || item.date || new Date().toISOString();
          return (
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
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#b71c1c', marginBottom: 8 }}>
                Pedido #{item.id}
              </Text>
              
              {item.restaurantName && (
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>
                  🍽️ Restaurante: {item.restaurantName}
                </Text>
              )}
              
              <Text style={{ color: '#666', marginBottom: 5 }}>
                📅 Data: {new Date(orderDate).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
              
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 5 }}>
                💰 Total: R$ {Number(item.total || 0).toFixed(2)}
              </Text>

              {item.address && (
                <Text style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>
                  📍 Endereço: {item.address}
                </Text>
              )}

              {item.paymentType && (
                <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                  💳 Pagamento: {
                    item.paymentType === 'credit' ? 'Cartão de Crédito' :
                    item.paymentType === 'debit' ? 'Cartão de Débito' :
                    item.paymentType === 'pix' ? 'PIX' : 'Dinheiro'
                  }
                </Text>
              )}

              <Text
                style={{
                  color: 
                    item.status === 'pending' ? '#ff9800' :
                    item.status === 'confirmed' ? '#2196f3' :
                    item.status === 'preparing' ? '#9c27b0' :
                    item.status === 'delivering' ? '#00bcd4' :
                    item.status === 'delivered' ? '#4caf50' :
                    item.status === 'cancelled' ? '#f44336' : '#666',
                  fontWeight: 'bold',
                  marginBottom: 10,
                }}
              >
                Status: {
                  item.status === 'pending' ? '⏳ Pendente' :
                  item.status === 'confirmed' ? '✅ Confirmado' :
                  item.status === 'preparing' ? '👨‍🍳 Preparando' :
                  item.status === 'delivering' ? '🚚 Em entrega' :
                  item.status === 'delivered' ? '✅ Entregue' :
                  item.status === 'cancelled' ? '❌ Cancelado' : item.status
                }
              </Text>

              <Text style={{ fontWeight: '600', marginBottom: 5 }}>Itens:</Text>
              {item.items && item.items.map((product: any, idx: number) => (
                <View
                  key={`${product.product_id || product.id}-${idx}`}
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
                    R$ {(Number(product.price) * product.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}

              {/* Ações do pedido */}
              {item.status !== 'cancelled' && item.status !== 'delivered' && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <Text
                    onPress={() => {
                      // Avança para o próximo status válido
                      const nextStatus = 
                        item.status === 'pending' ? 'confirmed' :
                        item.status === 'confirmed' ? 'preparing' :
                        item.status === 'preparing' ? 'delivering' :
                        item.status === 'delivering' ? 'delivered' : null;
                      
                      if (nextStatus) {
                        dispatch(updateOrderThunk({ id: item.id, order: { status: nextStatus } }));
                      }
                    }}
                    style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#2e7d32', color: '#fff', borderRadius: 8 }}
                  >
                    Avançar
                  </Text>
                  <Text
                    onPress={() => dispatch(updateOrderThunk({ id: item.id, order: { status: 'cancelled' } }))}
                    style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#d32f2f', color: '#fff', borderRadius: 8 }}
                  >
                    Cancelar
                  </Text>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

export default OrderHistoryScreen;
