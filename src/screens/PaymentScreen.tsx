import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Button, TextInput as PaperInput, Portal, Modal } from 'react-native-paper';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPayments, createPaymentThunk, updatePaymentThunk, deletePaymentThunk } from '../store/paymentSlice';
import { RootState } from '../store/store';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaskedTextInput } from 'react-native-mask-text';

interface Payment {
  id: number;
  type: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
  isDefault: boolean;
}

type PaymentForm = Omit<Payment, 'id'>;

const schema = yup.object({
  type: yup.string().required('Obrigatório'),
  cardNumber: yup.string().required('Obrigatório'),
  expiry: yup.string().required('Obrigatório'),
  cvv: yup.string().length(3, 'Exato 3 dígitos').required('Obrigatório'),
  name: yup.string().required('Obrigatório'),
  isDefault: yup.boolean().required('Obrigatório'),
}).required();

const PaymentScreen = () => {
  const dispatch = useAppDispatch();
  const payments = useAppSelector((state: RootState) => state.payments.data) as Payment[];
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<PaymentForm>({
    resolver: yupResolver<PaymentForm, any, any>(schema),
    defaultValues: {
      type: 'credit',
      cardNumber: '',
      expiry: new Date().toISOString(),
      cvv: '',
      name: '',
      isDefault: false,
    },
  });

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  const onSubmit: SubmitHandler<PaymentForm> = (data) => {
    if (editingId) {
      dispatch(updatePaymentThunk({ id: editingId, payment: data }));
    } else {
      dispatch(createPaymentThunk(data));
    }
    setModalVisible(false);
    reset();
  };

  const editPayment = (payment: Payment) => {
    reset({
      type: payment.type,
      cardNumber: payment.cardNumber,
      expiry: payment.expiry,
      cvv: payment.cvv,
      name: payment.name,
      isDefault: payment.isDefault,
    });
    setEditingId(payment.id);
    setModalVisible(true);
  };

  const deletePay = (id: number) => {
    dispatch(deletePaymentThunk(id));
  };

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Formas de Pagamento</Text>
      <FlatList
        data={payments}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10, padding: 10, borderWidth: 1 }}>
            <Text>{item.type} - {item.cardNumber} - {item.name}</Text>
            <TouchableOpacity onPress={() => editPayment(item)}>
              <Text style={{ color: 'blue' }}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deletePay(item.id)}>
              <Text style={{ color: 'red' }}>Deletar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button onPress={() => { setEditingId(null); reset(); setModalVisible(true); }}>
        Adicionar Pagamento
      </Button>
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', padding: 20, margin: 20 }}>
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <Picker selectedValue={value} onValueChange={onChange}>
                <Picker.Item label="Crédito" value="credit" />
                <Picker.Item label="Débito" value="debit" />
              </Picker>
            )}
          />
          {errors.type && <Text>{errors.type.message}</Text>}
          <Controller
            control={control}
            name="cardNumber"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text>Número do Cartão</Text>
                <MaskedTextInput mask="9999 9999 9999 9999" value={value} onChangeText={onChange} style={{ borderWidth: 1, padding: 10 }} />
              </View>
            )}
          />
          {errors.cardNumber && <Text>{errors.cardNumber.message}</Text>}
          <Controller
            control={control}
            name="expiry"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text>Validade</Text>
                <DateTimePicker value={new Date(value || Date.now())} mode="date" onChange={(_, date) => onChange(date?.toISOString())} />
              </View>
            )}
          />
          {errors.expiry && <Text>{errors.expiry.message}</Text>}
          <Controller
            control={control}
            name="cvv"
            render={({ field: { onChange, value } }) => (
              <PaperInput label="CVV" value={value} onChangeText={onChange} maxLength={3} error={!!errors.cvv} />
            )}
          />
          {errors.cvv && <Text>{errors.cvv.message}</Text>}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <PaperInput label="Nome no Cartão" value={value} onChangeText={onChange} error={!!errors.name} />
            )}
          />
          {errors.name && <Text>{errors.name.message}</Text>}
          <Controller
            control={control}
            name="isDefault"
            render={({ field: { onChange, value } }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>Padrão</Text>
                <Switch value={value} onValueChange={onChange} />
              </View>
            )}
          />
          <Button mode="contained" onPress={handleSubmit(onSubmit)}>Salvar</Button>
        </Modal>
      </Portal>
    </View>
  );
};

export default PaymentScreen;