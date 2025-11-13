// screens/PaymentScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button, TextInput as PaperInput, Card, Portal, Modal, Switch, RadioButton, Menu } from 'react-native-paper';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPayments, createPaymentThunk, updatePaymentThunk, deletePaymentThunk } from '../store/paymentSlice';
import { RootState } from '../store/store';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
import { RootStackParamList } from '../navigation/Navigation';

interface Payment {
  id: number;
  type: string; // 'credit' | 'debit' | 'cash' | 'pix'
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  name?: string;
  isDefault: boolean;
}
type PaymentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payments'>;
type PaymentForm = Omit<Payment, 'id'>;

// Schema dinâmico baseado no tipo de pagamento
const createSchema = (paymentType: string) => {
  const baseSchema: any = {
    type: yup.string().required('Tipo é obrigatório'),
    isDefault: yup.boolean().required(),
  };

  if (paymentType === 'credit' || paymentType === 'debit') {
    baseSchema.cardNumber = yup
      .string()
      .required('Número do cartão é obrigatório')
      .matches(/^\d{4} \d{4} \d{4} \d{4}$/, 'Formato: 0000 0000 0000 0000');
    baseSchema.expiry = yup
      .string()
      .required('Validade é obrigatória')
      .matches(/^\d{2}\/\d{2}$/, 'Formato: MM/AA')
      .test('valid-expiry', 'Data inválida', (value) => {
        if (!value) return false;
        const [month, year] = value.split('/').map(Number);
        if (month < 1 || month > 12) return false;
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        if (year < currentYear) return false;
        if (year === currentYear && month < currentMonth) return false;
        return true;
      });
    baseSchema.cvv = yup
      .string()
      .required('CVV é obrigatório')
      .matches(/^\d{3,4}$/, 'CVV: 3 ou 4 dígitos');
    baseSchema.name = yup
      .string()
      .required('Nome no cartão é obrigatório')
      .min(3, 'Mínimo 3 caracteres');
  }

  return yup.object(baseSchema).required();
};

const PaymentScreen = () => {
  const navigation = useNavigation<PaymentScreenNavigationProp>(); 
  const dispatch = useAppDispatch();
  const payments = useAppSelector((state: RootState) => state.payments.data) as Payment[];

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [paymentType, setPaymentType] = useState<string>('credit');

  const { control, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<PaymentForm>({
    resolver: yupResolver(createSchema(paymentType)) as any,
    defaultValues: {
      type: 'credit',
      cardNumber: '',
      expiry: '',
      cvv: '',
      name: '',
      isDefault: false,
    },
  });

  const sortedPayments = useMemo(() => {
    const arr = Array.isArray(payments) ? [...payments] : [];
    return arr.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  }, [payments]);

  // Recarrega pagamentos sempre que a tela ganhar foco
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchPayments());
      return () => {
        // Cleanup se necessário
      };
    }, [dispatch])
  );

  // Máscaras
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').substring(0, 19); // max 16 digits + 3 spaces
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  };

  const onSubmit: SubmitHandler<PaymentForm> = async (data) => {
    console.log('💳 PaymentScreen: Submitting', data);
    try {
      if (editingId) {
        await dispatch(updatePaymentThunk({ id: editingId, payment: data })).unwrap();
      } else {
        await dispatch(createPaymentThunk(data)).unwrap();
      }
      
      // Recarrega a lista
      await dispatch(fetchPayments());
      
      setModalVisible(false);
      reset();
      setPaymentType('credit');
    } catch (error) {
      console.error('💳 PaymentScreen: Error', error);
    }
  };

  const editPayment = (payment: Payment) => {
    // Passa apenas os campos do formulário, sem id e userId
    reset({
      type: payment.type,
      cardNumber: payment.cardNumber,
      expiry: payment.expiry,
      cvv: payment.cvv,
      name: payment.name,
      isDefault: payment.isDefault,
    });
    setPaymentType(payment.type);
    setEditingId(payment.id);
    setModalVisible(true);
  };

  const deletePay = (id: number) => {
    dispatch(deletePaymentThunk(id));
  };

  const getPaymentTypeLabel = (type: string) => {
    const types: any = {
      credit: '💳 Cartão de Crédito',
      debit: '💳 Cartão de Débito',
    };
    return types[type] || type;
  };

  const getPaymentIcon = (type: string) => {
    const icons: any = { credit: 'credit-card', debit: 'credit-card-outline', cash: 'cash', pix: 'qrcode' };
    return icons[type] || 'wallet';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Formas de Pagamento</Text>

      <FlatList
        data={sortedPayments}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTypeLabel}>{getPaymentTypeLabel(item.type)}</Text>
                {item.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Padrão</Text>
                  </View>
                )}
              </View>

              {(item.type === 'credit' || item.type === 'debit') && (
                <>
                  <Text style={styles.label}>Número do Cartão:</Text>
                  <Text style={styles.value}>
                    •••• •••• •••• {item.cardNumber?.slice(-4) || '****'}
                  </Text>

                  <Text style={styles.label}>Validade:</Text>
                  <Text style={styles.value}>{item.expiry}</Text>

                  <Text style={styles.label}>Nome no Cartão:</Text>
                  <Text style={styles.value}>{item.name}</Text>
                </>
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
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>Você ainda não tem formas de pagamento.</Text>
            <Text style={{ color: '#666' }}>Toque em "Adicionar Pagamento" para criar.</Text>
          </View>
        }
      />

      <Button
        mode="contained"
        buttonColor="#b71c1c"
        textColor="white"
        style={styles.addButton}
        onPress={() => {
          setEditingId(null);
          reset();
          setPaymentType('credit');
          setModalVisible(true);
        }}
      >
        Adicionar Pagamento
      </Button>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderIcon}>💳</Text>
            <Text style={styles.modalHeaderTitle}>
              {editingId ? 'Editar Pagamento' : 'Novo Pagamento'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} accessibilityLabel="Fechar">
              <Text style={styles.modalClose}>✖</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {/* Tipo de Pagamento */}
            <Text style={styles.sectionLabel}>Tipo de Pagamento</Text>
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <RadioButton.Group onValueChange={(v) => { onChange(v); setPaymentType(v); setValue('type', v); }} value={value}>
                  <View style={styles.radioRow}>
                    <RadioButton.Item label="💳 Cartão de Crédito" value="credit" color="#b71c1c" />
                  </View>
                  <View style={styles.radioRow}>
                    <RadioButton.Item label="💳 Cartão de Débito" value="debit" color="#b71c1c" />
                  </View>
                </RadioButton.Group>
              )}
            />
            {errors.type && <Text style={styles.error}>{errors.type.message}</Text>}

            {/* Campos de Cartão */}
            <Controller
              control={control}
              name="cardNumber"
                  render={({ field: { onChange, value } }) => (
                    <PaperInput
                      label="Número do Cartão *"
                      value={value}
                      onChangeText={(t) => onChange(formatCardNumber(t))}
                      error={!!errors.cardNumber}
                      style={styles.input}
                      textColor="#000"
                      left={<PaperInput.Icon icon="credit-card" color="#b71c1c" />}
                      activeUnderlineColor="#b71c1c"
                      keyboardType="number-pad"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                    />
                  )}
                />
                {errors.cardNumber && <Text style={styles.error}>{errors.cardNumber.message}</Text>}

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Controller
                      control={control}
                      name="expiry"
                      render={({ field: { onChange, value } }) => (
                        <PaperInput
                          label="Validade *"
                          value={value}
                          onChangeText={(t) => onChange(formatExpiry(t))}
                          error={!!errors.expiry}
                          style={styles.input}
                          textColor="#000"
                          left={<PaperInput.Icon icon="calendar" color="#b71c1c" />}
                          activeUnderlineColor="#b71c1c"
                          keyboardType="number-pad"
                          placeholder="MM/AA"
                          maxLength={5}
                        />
                      )}
                    />
                    {errors.expiry && <Text style={styles.error}>{errors.expiry.message}</Text>}
                  </View>
                  <View style={styles.halfInput}>
                    <Controller
                      control={control}
                      name="cvv"
                      render={({ field: { onChange, value } }) => (
                        <PaperInput
                          label="CVV *"
                          value={value}
                          onChangeText={(t) => onChange(t.replace(/\D/g, ''))}
                          error={!!errors.cvv}
                          style={styles.input}
                          textColor="#000"
                          left={<PaperInput.Icon icon="lock" color="#b71c1c" />}
                          activeUnderlineColor="#b71c1c"
                          keyboardType="number-pad"
                          maxLength={4}
                          secureTextEntry
                        />
                      )}
                    />
                    {errors.cvv && <Text style={styles.error}>{errors.cvv.message}</Text>}
                  </View>
                </View>

                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <PaperInput
                      label="Nome no Cartão *"
                      value={value}
                      onChangeText={(t) => onChange(t.toUpperCase())}
                      error={!!errors.name}
                      style={styles.input}
                      textColor="#000"
                      left={<PaperInput.Icon icon="account" color="#b71c1c" />}
                      activeUnderlineColor="#b71c1c"
                      autoCapitalize="characters"
                    />
              )}
            />
            {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

            <View style={{ height: 12 }} />

            {/* Método padrão */}
            <Controller
              control={control}
              name="isDefault"
              render={({ field: { onChange, value } }) => (
                <View style={styles.switchRow}>
                  <Text style={styles.label}>Definir como Método Padrão</Text>
                  <Switch value={value} onValueChange={onChange} color="#b71c1c" />
                </View>
              )}
            />
          </ScrollView>
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
              textColor="#b71c1c"
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              buttonColor="#b71c1c"
              textColor="white"
              style={styles.modalButton}
            >
              Salvar
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20, textAlign: 'center', color: '#b71c1c' },
  card: { marginBottom: 12, borderRadius: 12, backgroundColor: '#fff', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTypeLabel: { fontSize: 18, fontWeight: '700', color: '#b71c1c' },
  defaultBadge: { backgroundColor: '#b71c1c', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  defaultBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  label: { fontWeight: '500', color: '#666', marginTop: 6, fontSize: 13 },
  value: { fontSize: 16, color: '#333', marginBottom: 4 },
  cashNote: { fontSize: 14, color: '#666', fontStyle: 'italic', marginTop: 8 },
  cardButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  cardButton: { flex: 1, marginHorizontal: 4, borderRadius: 8 },
  addButton: { marginTop: 16, borderRadius: 8 },
  input: { marginVertical: 8, backgroundColor: '#fff' },
  error: { color: '#d32f2f', fontSize: 12, marginTop: -4, marginBottom: 8 },
  // Modal styles
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffe5e5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcdd2',
  },
  modalHeaderIcon: { fontSize: 20, color: '#b71c1c', marginRight: 8 },
  modalHeaderTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#b71c1c' },
  modalClose: { color: '#b71c1c', fontSize: 18, paddingHorizontal: 4 },
  modalBody: { padding: 16 },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  radioRow: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8 },
  halfInput: { flex: 1 },
  infoBox: { backgroundColor: '#e3f2fd', padding: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#2196f3' },
  infoText: { fontSize: 14, color: '#1976d2' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingVertical: 8 },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalButton: { flex: 1, marginHorizontal: 5, borderRadius: 8 },
  saveButton: { marginTop: 16, borderRadius: 8 },
});
