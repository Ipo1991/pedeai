import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Button, Portal, Modal, TextInput as PaperInput } from 'react-native-paper';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrders, updateOrderThunk, cancelOrderThunk } from '../store/orderSlice';
import { RootState } from '../store/store';
import { Picker } from '@react-native-picker/picker';

interface Order {
  id: number;
  date: string;
  total: number;
  status: string;
  items: any[];
  cancelled: boolean;
}

type OrderForm = Omit<Order, 'id' | 'date' | 'items'>;

const schema = yup.object({
  status: yup.string().required('Obrigatório'),
  total: yup.number().required('Obrigatório'),
  cancelled: yup.boolean().required('Obrigatório'), // Adicionado .required() para alinhar com o tipo boolean (não undefined)
}).required();

const OrderHistoryScreen = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state: RootState) => state.orders.data) as Order[];
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<OrderForm>({
    resolver: yupResolver<OrderForm, any, any>(schema),
    defaultValues: {
      status: 'pending',
      total: 0,
      cancelled: false,
    },
  });

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const onSubmit: SubmitHandler<OrderForm> = (data) => {
    dispatch(updateOrderThunk({ id: editingId!, order: data }));
    setModalVisible(false);
    reset();
  };

  const editOrder = (order: Order) => {
    reset({
      status: order.status,
      total: order.total,
      cancelled: order.cancelled,
    });
    setEditingId(order.id);
    setModalVisible(true);
  };

  const cancelOrd = (id: number) => {
    dispatch(cancelOrderThunk(id));
  };

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Histórico de Pedidos</Text>
      <FlatList
        data={orders}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10, padding: 10, borderWidth: 1 }}>
            <Text>Pedido {item.id} - {new Date(item.date).toLocaleDateString()} - Total: R${item.total} - Status: {item.status}</Text>
            <TouchableOpacity onPress={() => editOrder(item)}>
              <Text style={{ color: 'blue' }}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => cancelOrd(item.id)}>
              <Text style={{ color: 'red' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', padding: 20, margin: 20 }}>
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <Picker selectedValue={value} onValueChange={onChange}>
                <Picker.Item label="Pendente" value="pending" />
                <Picker.Item label="Entregue" value="delivered" />
                <Picker.Item label="Cancelado" value="cancelled" />
              </Picker>
            )}
          />
          {errors.status && <Text>{errors.status.message}</Text>}
          <Controller
            control={control}
            name="total"
            render={({ field: { onChange, value } }) => (
              <PaperInput label="Total" value={value?.toString()} onChangeText={onChange} keyboardType="numeric" error={!!errors.total} />
            )}
          />
          {errors.total && <Text>{errors.total.message}</Text>}
          <Controller
            control={control}
            name="cancelled"
            render={({ field: { onChange, value } }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>Cancelado</Text>
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

export default OrderHistoryScreen;