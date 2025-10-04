import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Button, TextInput as PaperInput, Portal, Modal } from 'react-native-paper';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCart, addToCartThunk, updateCartItemThunk, removeFromCartThunk, clearCartThunk } from '../store/cartSlice';
import { createOrderThunk } from '../store/orderSlice';
import { RootState } from '../store/store';
import { Picker } from '@react-native-picker/picker';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string; // Alterado para opcional (?): permite undefined, alinhando com o schema
  vegetarian: boolean;
}

type CartItemForm = Omit<CartItem, 'id'>;

const schema = yup.object({
  name: yup.string().required('Obrigatório'),
  price: yup.number().required('Obrigatório'),
  quantity: yup.number().min(1).required('Obrigatório'),
  notes: yup.string(), // Permite undefined, agora compatível com notes?: string
  vegetarian: yup.boolean().required('Obrigatório'),
}).required();

const CartScreen = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state: RootState) => state.cart.data) as { items: CartItem[] };
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CartItemForm>({
    resolver: yupResolver<CartItemForm, any, any>(schema),
    defaultValues: {
      name: '',
      price: 0,
      quantity: 1,
      notes: '',
      vegetarian: false,
    },
  });

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const onSubmit: SubmitHandler<CartItemForm> = (data) => {
    if (editingId) {
      dispatch(updateCartItemThunk({ id: editingId, item: data }));
    } else {
      dispatch(addToCartThunk(data));
    }
    setModalVisible(false);
    reset();
  };

  const editItem = (item: CartItem) => {
    reset({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes,
      vegetarian: item.vegetarian,
    });
    setEditingId(item.id);
    setModalVisible(true);
  };

  const removeItem = (id: number) => {
    dispatch(removeFromCartThunk(id));
  };

  const finalizeOrder = () => {
    const total = cart.items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
    dispatch(createOrderThunk({ items: cart.items, total, status: 'pending', date: new Date().toISOString(), cancelled: false }));
    dispatch(clearCartThunk());
  };

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Carrinho</Text>
      <FlatList
        data={cart.items}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10, padding: 10, borderWidth: 1 }}>
            <Text>{item.name} - R${item.price} x {item.quantity} - {item.notes || ''}</Text>
            <Text>{item.vegetarian ? 'Vegetariano' : ''}</Text>
            <TouchableOpacity onPress={() => editItem(item)}>
              <Text style={{ color: 'blue' }}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeItem(item.id)}>
              <Text style={{ color: 'red' }}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button onPress={() => { setEditingId(null); reset(); setModalVisible(true); }}>
        Adicionar Item
      </Button>
      <Button onPress={finalizeOrder} disabled={!cart.items.length}>
        Finalizar Pedido
      </Button>
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', padding: 20, margin: 20 }}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <PaperInput label="Nome do Item" value={value} onChangeText={onChange} error={!!errors.name} />
            )}
          />
          {errors.name && <Text>{errors.name.message}</Text>}
          <Controller
            control={control}
            name="price"
            render={({ field: { onChange, value } }) => (
              <PaperInput label="Preço" value={value?.toString()} onChangeText={onChange} keyboardType="numeric" error={!!errors.price} />
            )}
          />
          {errors.price && <Text>{errors.price.message}</Text>}
          <Controller
            control={control}
            name="quantity"
            render={({ field: { onChange, value } }) => (
              <Picker selectedValue={value} onValueChange={onChange}>
                <Picker.Item label="1" value={1} />
                <Picker.Item label="2" value={2} />
                <Picker.Item label="3" value={3} />
                <Picker.Item label="4" value={4} />
                <Picker.Item label="5" value={5} />
              </Picker>
            )}
          />
          {errors.quantity && <Text>{errors.quantity.message}</Text>}
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <PaperInput label="Notas" value={value} onChangeText={onChange} error={!!errors.notes} />
            )}
          />
          <Controller
            control={control}
            name="vegetarian"
            render={({ field: { onChange, value } }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>Vegetariano</Text>
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

export default CartScreen;