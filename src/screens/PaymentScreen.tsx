// screens/PaymentScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput as PaperInput, Card, Portal, Modal, Switch } from 'react-native-paper';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPayments, createPaymentThunk, updatePaymentThunk, deletePaymentThunk } from '../store/paymentSlice';
import { RootState } from '../store/store';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
import { RootStackParamList } from '../navigation/Navigation';

interface Payment {
  id: number;
  type: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
  isDefault: boolean;
}
type PaymentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payments'>;
type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payments'>;
type PaymentForm = Omit<Payment, 'id'>;

const schema = yup.object({
  type: yup.string().required('Obrigatório'),
  cardNumber: yup.string().required('Obrigatório'),
  expiry: yup.string().required('Obrigatório'),
  cvv: yup.string().length(3, 'Exato 3 dígitos').required('Obrigatório'),
  name: yup.string().required('Obrigatório'),
  isDefault: yup.boolean().required(),
}).required();

const PaymentScreen = () => {
  const navigation = useNavigation<PaymentScreenNavigationProp>(); 
  const route = useRoute<PaymentScreenRouteProp>(); 
  const fromCheckout = route.params?.fromCheckout;
  const dispatch = useAppDispatch();
  const payments = useAppSelector((state: RootState) => state.payments.data) as Payment[];

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<PaymentForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      type: 'credit',
      cardNumber: '',
      expiry: '',
      cvv: '',
      name: '',
      isDefault: false,
    },
  });

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  const onSubmit: SubmitHandler<PaymentForm> = async (data) => {
    if (editingId) {
      await dispatch(updatePaymentThunk({ id: editingId, payment: data }));
    } else {
      const resultAction = await dispatch(createPaymentThunk(data));
      // Verifica se a ação foi bem-sucedida e se veio do checkout
      if (createPaymentThunk.fulfilled.match(resultAction) && fromCheckout) {
        const newPayment = resultAction.payload;
        navigation.navigate('Checkout', { newPaymentId: newPayment.id });
        setModalVisible(false);
        reset();
        return; // Para a execução
      }
    }
    // Comportamento padrão
    setModalVisible(false);
    reset();
  };

  const editPayment = (payment: Payment) => {
    reset(payment);
    setEditingId(payment.id);
    setModalVisible(true);
  };

  const deletePay = (id: number) => {
    dispatch(deletePaymentThunk(id));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Formas de Pagamento</Text>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.label}>Tipo:</Text>
              <Text style={styles.value}>{item.type === 'credit' ? 'Crédito' : 'Débito'}</Text>

              <Text style={styles.label}>Número do Cartão:</Text>
              <Text style={styles.value}>{item.cardNumber}</Text>

              <Text style={styles.label}>Validade:</Text>
              <Text style={styles.value}>{item.expiry}</Text>

              <Text style={styles.label}>Nome no Cartão:</Text>
              <Text style={styles.value}>{item.name}</Text>

              {item.isDefault && (
                <Text style={[styles.value, { color: '#b71c1c', fontWeight: '600' }]}>
                  Método Padrão
                </Text>
              )}

              <View style={styles.cardButtons}>
                <Button
                  mode="outlined"
                  textColor="#b71c1c"
                  style={styles.cardButton}
                  onPress={() => editPayment(item)}
                >
                  Editar
                </Button>
                <Button
                  mode="contained"
                  buttonColor="#b71c1c"
                  textColor="white"
                  style={styles.cardButton}
                  onPress={() => deletePay(item.id)}
                >
                  Excluir
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      />

      <Button
        mode="contained"
        buttonColor="#b71c1c"
        textColor="white"
        style={styles.addButton}
        onPress={() => {
          setEditingId(null);
          reset();
          setModalVisible(true);
        }}
      >
        Adicionar Pagamento
      </Button>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>
            {editingId ? 'Editar Pagamento' : 'Novo Pagamento'}
          </Text>
          <ScrollView>
            {/* Tipo */}
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="Tipo (Crédito/Débito)"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.type}
                  style={styles.input}
                  textColor="#000"
                  left={<PaperInput.Icon icon="credit-card" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                />
              )}
            />
            {errors.type && <Text style={styles.error}>{errors.type.message}</Text>}

            {/* Número do Cartão */}
            <Controller
              control={control}
              name="cardNumber"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="Número do Cartão"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.cardNumber}
                  style={styles.input}
                  textColor="#000"
                  left={<PaperInput.Icon icon="credit-card" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                />
              )}
            />
            {errors.cardNumber && <Text style={styles.error}>{errors.cardNumber.message}</Text>}

            {/* Validade */}
            <Controller
              control={control}
              name="expiry"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="Validade (MM/AA)"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.expiry}
                  style={styles.input}
                  textColor="#000"
                  left={<PaperInput.Icon icon="calendar" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                />
              )}
            />
            {errors.expiry && <Text style={styles.error}>{errors.expiry.message}</Text>}

            {/* CVV */}
            <Controller
              control={control}
              name="cvv"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="CVV"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.cvv}
                  style={styles.input}
                  textColor="#000"
                  left={<PaperInput.Icon icon="lock" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  maxLength={3}
                />
              )}
            />
            {errors.cvv && <Text style={styles.error}>{errors.cvv.message}</Text>}

            {/* Nome no Cartão */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="Nome no Cartão"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.name}
                  style={styles.input}
                  textColor="#000"
                  left={<PaperInput.Icon icon="account" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                />
              )}
            />
            {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

            {/* Método padrão */}
            <Controller
              control={control}
              name="isDefault"
              render={({ field: { onChange, value } }) => (
                <View style={styles.switchRow}>
                  <Text style={styles.label}>Método Padrão</Text>
                  <Switch value={value} onValueChange={onChange} color="#b71c1c" />
                </View>
              )}
            />

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              buttonColor="#b71c1c"
              textColor="white"
              style={styles.saveButton}
            >
              Salvar
            </Button>

            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={[styles.saveButton, { marginTop: 8 }]}
              textColor="#b71c1c"
            >
              Cancelar
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20, textAlign: 'center', color: '#b71c1c' },
  card: { marginBottom: 12, borderRadius: 12, backgroundColor: '#ffe5e5' },
  label: { fontWeight: '500', color: '#333', marginTop: 6 },
  value: { fontSize: 16, color: '#333', marginBottom: 4 },
  cardButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cardButton: { flex: 1, marginHorizontal: 4, borderRadius: 8 },
  addButton: { marginTop: 16, borderRadius: 8 },
  input: { marginVertical: 8, backgroundColor: '#fff' },
  error: { color: 'red', marginBottom: 4 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, margin: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16, textAlign: 'center', color: '#b71c1c' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  saveButton: { marginTop: 16, borderRadius: 8 },
});
