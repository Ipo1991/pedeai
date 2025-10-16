// add poke CheckoutScreen

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RootState } from '../store/store';
import { Button, Card, RadioButton, Divider } from 'react-native-paper';
import { createOrderThunk } from '../store/orderSlice';
import { clearCartThunk } from '../store/cartSlice';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type CheckoutScreenRouteProp = RouteProp<RootStackParamList, 'Checkout'>;

const CheckoutScreen = () => {
  const route = useRoute<CheckoutScreenRouteProp>();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 1. Obter os dados necessários do Redux
  const cartItems = useAppSelector((state: RootState) => state.cart.data.items);
  const addresses = useAppSelector((state: RootState) => state.addresses.data);
  const payments = useAppSelector((state: RootState) => state.payments.data);

  // 2. Criar estados para guardar a seleção do usuário
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

  // 3. Calcular o total do pedido
  const total = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    useEffect(() => {
    // Verifica se recebemos um ID de novo endereço
    if (route.params?.newAddressId) {
      setSelectedAddressId(route.params.newAddressId);
      // Limpa o parâmetro para não selecionar novamente se o usuário voltar
      navigation.setParams({ newAddressId: undefined });
    }
    // Verifica se recebemos um ID de novo pagamento
    if (route.params?.newPaymentId) {
      setSelectedPaymentId(route.params.newPaymentId);
      // Limpa o parâmetro
      navigation.setParams({ newPaymentId: undefined });
    }
  }, [route.params, navigation]);    

  // 4. Função para finalizar o pedido DE VERDADE
  const handleFinalizeOrder = () => {
    if (!selectedAddressId || !selectedPaymentId) {
      alert('Por favor, selecione um endereço e uma forma de pagamento.');
      return;
    }

    dispatch(
      createOrderThunk({
        items: cartItems,
        total,
        status: 'pending',
        addressId: selectedAddressId,
        paymentId: selectedPaymentId,
      })
    );
    dispatch(clearCartThunk());

    // Navega para o Dashboard (ou uma tela de "Pedido Confirmado")
    navigation.navigate('Dashboard'); 
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Finalizar Pedido</Text>

      {/* Seção de Endereços */}
      <Card style={styles.card}>
        <Card.Title title="Selecione o Endereço de Entrega" titleStyle={{ color: '#b71c1c' }} />
        <Card.Content>
          <RadioButton.Group onValueChange={value => setSelectedAddressId(Number(value))} value={String(selectedAddressId)}>
            {addresses.map((address: any) => (
              <View key={address.id} style={styles.optionItem}>
                <RadioButton value={String(address.id)} color="#b71c1c" />
                <Text style={styles.optionText}>{`${address.street}, ${address.number} - ${address.city}`}</Text>
              </View>
            ))}
                  <Button
                    mode="text"
                    icon="plus-circle-outline"
                    onPress={() => navigation.navigate('Addresses', { fromCheckout: true })}
                    textColor="#b71c1c"
                    style={{ marginTop: 10 }}
                  >
                    Cadastrar Novo Endereço
                  </Button>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Seção de Pagamentos */}
      <Card style={styles.card}>
        <Card.Title title="Selecione a Forma de Pagamento" titleStyle={{ color:"#b71c1c"  }}/> 
        <Card.Content>
           <RadioButton.Group onValueChange={value => setSelectedPaymentId(Number(value))} value={String(selectedPaymentId)}>
            {payments.map((payment: any) => (
              <View key={payment.id} style={styles.optionItem}>
                <RadioButton value={String(payment.id)} color="#b71c1c" />
                <Text style={styles.optionText}>{`Cartão final ${payment.cardNumber.slice(-4)}`}</Text>
              </View>
            ))}
               <Button
                mode="text"
                icon="plus-circle-outline"
                onPress={() => navigation.navigate('Payments', { fromCheckout: true })}
                textColor="#b71c1c"
                style={{ marginTop: 10 }}
              >
                Cadastrar Nova Forma de Pagamento
              </Button>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Resumo do Pedido */}
      <Card style={styles.card}>
        <Card.Title title="Resumo dos Produtos" titleStyle={{ color: "#b71c1c" }} />
        <Card.Content>
          {cartItems.map((item: any) => (
            <View key={item.id} style={styles.summaryItem}>
              <Text>{item.name} x {item.quantity}</Text>
              <Text>R${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <Divider style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalText}>R${total.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>
      
      {/* Botão Final */}
      <Button
        mode="contained"
        onPress={handleFinalizeOrder}
        style={styles.finalButton}
        buttonColor="#b71c1c"
        textColor="white"
      >
        Confirmar e Finalizar Pedido
      </Button>
    </ScrollView>
  );
};

// Adicione estilos básicos

const styles = StyleSheet.create({
  // Fundo branco para a tela inteira
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  // Título principal em vermelho
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#b71c1c',
  },
  // Fundo dos cards em rosa claro
  card: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#ffe5e5',
    elevation: 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionText: {
    flex: 1,
    color: '#333',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  // Estilos do botão para consistência
  finalButton: {
    marginTop: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
});

// const styles = StyleSheet.create({
//   container: { padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
//   card: { marginBottom: 20 },
//   optionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
//   optionText: { flex: 1 },
//   summaryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
//   divider: { marginVertical: 8 },
//   totalText: { fontWeight: 'bold', fontSize: 16 },
//   finalButton: { marginTop: 20, paddingVertical: 8 },
// });

export default CheckoutScreen;