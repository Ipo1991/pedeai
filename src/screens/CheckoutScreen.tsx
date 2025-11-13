import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, RadioButton, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCart, clearCartThunk } from '../store/cartSlice';
import { fetchAddresses } from '../store/addressSlice';
import { fetchPayments } from '../store/paymentSlice';
import { createOrderThunk } from '../store/orderSlice';
import { RootState } from '../store/store';
import { AuthContext } from '../contexts/AuthContext';
import SnackbarNotification from '../components/SnackbarNotification';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;

interface Address {
  id: number;
  street: string;
  number: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

interface Payment {
  id: number;
  type: string;
  cardNumber?: string;
  isDefault: boolean;
}

interface CartItem {
  id: number;
  productId?: number;
  name: string;
  price: number;
  quantity: number;
  restaurantId?: number;
  restaurantName?: string;
}

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const auth = useContext(AuthContext);
  const cart = useAppSelector((state: RootState) => state.cart.data) || { items: [] };
  const addresses = useAppSelector((state: RootState) => state.addresses.data) as Address[];
  const payments = useAppSelector((state: RootState) => state.payments.data) as Payment[];

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info' });

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchAddresses());
    dispatch(fetchPayments());
  }, [dispatch]);

  useEffect(() => {
    const def = addresses.find((a) => a.isDefault);
    if (def && !selectedAddressId) setSelectedAddressId(def.id);
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    const def = payments.find((p) => p.isDefault);
    if (def && !selectedPaymentId) setSelectedPaymentId(def.id);
  }, [payments, selectedPaymentId]);

  const handleConfirmOrder = async () => {
    console.log('🛒 Confirmar pedido!');
    if (!selectedAddressId) {
      setSnackbar({ visible: true, message: 'Selecione um endereço', type: 'warning' });
      return;
    }
    if (!selectedPaymentId) {
      setSnackbar({ visible: true, message: 'Selecione uma forma de pagamento', type: 'warning' });
      return;
    }
    if (!cart.items || cart.items.length === 0) {
      setSnackbar({ visible: true, message: 'Carrinho vazio', type: 'warning' });
      return;
    }

    const addr = addresses.find((a) => a.id === selectedAddressId);
    const pay = payments.find((p) => p.id === selectedPaymentId);
    const total = cart.items.reduce((s: number, i: CartItem) => s + Number(i.price) * i.quantity, 0);

    const orderData = {
      userId: auth?.user?.id || 0,
      restaurantId: cart.items[0]?.restaurantId || 0,
      restaurantName: cart.items[0]?.restaurantName || '',
      items: cart.items.map((i: CartItem) => ({ 
        productId: i.productId || i.id,
        name: i.name, 
        price: Number(i.price), 
        quantity: i.quantity 
      })),
      total,
      addressId: selectedAddressId,
      address: `${addr?.street}, ${addr?.number} - ${addr?.city}/${addr?.state}`,
      paymentId: selectedPaymentId,
      paymentType: pay?.type || '',
      status: 'pending',
    };

    console.log('Criando pedido:', orderData);
    try {
      const result = await dispatch(createOrderThunk(orderData));
      if (createOrderThunk.fulfilled.match(result)) {
        await dispatch(clearCartThunk());
        setSnackbar({ 
          visible: true, 
          message: `✅ Pedido Confirmado! Total: R$ ${total.toFixed(2)}`, 
          type: 'success' 
        });
        console.log(`✅ Pedido Confirmado! Total: R$ ${total.toFixed(2)}`);
        // Navega após 1.5s para usuário ver o snackbar
        setTimeout(() => navigation.navigate('OrderHistory'), 1500);
      } else {
        // Extrai a mensagem de erro do backend
        // rejectWithValue retorna a mensagem diretamente como string no payload
        const errorMessage = typeof result.payload === 'string' 
          ? result.payload 
          : (result.payload as any)?.message || 'Erro ao finalizar pedido';
        setSnackbar({ visible: true, message: errorMessage, type: 'error' });
        console.error('❌ Erro ao finalizar pedido:', errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao finalizar pedido';
      setSnackbar({ visible: true, message: errorMessage, type: 'error' });
      console.error('❌ Erro ao finalizar pedido:', error);
    }
  };

  const total = cart.items.reduce((s: number, i: CartItem) => s + Number(i.price) * i.quantity, 0);
  const restaurantName = cart.items.length > 0 ? cart.items[0].restaurantName : null;

  const getPaymentLabel = (p: Payment) => {
    if (p.type === 'credit') return 'Cartão de Crédito';
    if (p.type === 'debit') return 'Cartão de Débito';
    if (p.type === 'pix') return 'PIX';
    return 'Dinheiro';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Finalizar Pedido</Text>

      {restaurantName && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Restaurante</Text>
            <Text style={styles.restaurantName}>{restaurantName}</Text>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Itens</Text>
          {cart.items.map((item: CartItem) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.quantity}x {item.name}</Text>
              <Text style={styles.itemPrice}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Endereço</Text>
          </View>
          {addresses.length === 0 ? (
            <View>
              <Text style={styles.emptyText}>Nenhum endereço cadastrado</Text>
              <Button
                mode="outlined"
                textColor="#b71c1c"
                style={{ marginTop: 8, borderColor: '#b71c1c' }}
                onPress={() => (navigation as any).navigate('Addresses')}
              >
                + Cadastrar Endereço
              </Button>
            </View>
          ) : (
            <RadioButton.Group
              onValueChange={(v) => setSelectedAddressId(Number(v))}
              value={selectedAddressId?.toString() || ''}
            >
              {addresses.map((a) => (
                <View key={a.id} style={styles.radioRow}>
                  <RadioButton value={a.id.toString()} color="#b71c1c" />
                  <View style={styles.radioContent}>
                    <Text style={styles.radioText}>{a.street}, {a.number}</Text>
                    <Text style={styles.radioSubtext}>{a.city} - {a.state}</Text>
                  </View>
                </View>
              ))}
            </RadioButton.Group>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Pagamento</Text>
          </View>
          {payments.length === 0 ? (
            <View>
              <Text style={styles.emptyText}>Nenhuma forma de pagamento</Text>
              <Button
                mode="outlined"
                textColor="#b71c1c"
                style={{ marginTop: 8, borderColor: '#b71c1c' }}
                onPress={() => (navigation as any).navigate('Payments')}
              >
                + Cadastrar Pagamento
              </Button>
            </View>
          ) : (
            <RadioButton.Group
              onValueChange={(v) => setSelectedPaymentId(Number(v))}
              value={selectedPaymentId?.toString() || ''}
            >
              {payments.map((p) => (
                <View key={p.id} style={styles.radioRow}>
                  <RadioButton value={p.id.toString()} color="#b71c1c" />
                  <Text style={styles.radioText}>{getPaymentLabel(p)}</Text>
                </View>
              ))}
            </RadioButton.Group>
          )}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        buttonColor="#b71c1c"
        style={styles.confirmButton}
        onPress={handleConfirmOrder}
        disabled={!selectedAddressId || !selectedPaymentId || cart.items.length === 0}
      >
        Confirmar - R$ {total.toFixed(2)}
      </Button>

      {/* Snackbar para feedback */}
      <SnackbarNotification
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
      />
    </ScrollView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20, textAlign: 'center', color: '#b71c1c' },
  card: { marginBottom: 16, borderRadius: 12, backgroundColor: '#fff', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#b71c1c' },
  addButton: { fontSize: 14, color: '#b71c1c', fontWeight: '600' },
  restaurantName: { fontSize: 16, color: '#333', fontWeight: '600', marginTop: 4 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemName: { fontSize: 14, color: '#333', flex: 1 },
  itemPrice: { fontSize: 14, color: '#333', fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#333' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#b71c1c' },
  emptyText: { fontSize: 14, color: '#999', fontStyle: 'italic', textAlign: 'center', marginVertical: 12 },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  radioContent: { flex: 1, marginLeft: 8 },
  radioText: { fontSize: 14, color: '#333' },
  radioSubtext: { fontSize: 12, color: '#666', marginTop: 2 },
  confirmButton: { marginTop: 20, borderRadius: 8, paddingVertical: 8 },
});
