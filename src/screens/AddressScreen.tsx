import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Button, TextInput as PaperInput, Portal, Modal } from 'react-native-paper';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAddresses, createAddressThunk, updateAddressThunk, deleteAddressThunk } from '../store/addressSlice';
import { RootState } from '../store/store';
import { Picker } from '@react-native-picker/picker';

interface Address {
  id: number;
  street: string;
  number: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

type AddressForm = Omit<Address, 'id'>;

const schema = yup.object({
  street: yup.string().required('Obrigatório'),
  number: yup.string().required('Obrigatório'),
  city: yup.string().required('Obrigatório'),
  state: yup.string().required('Obrigatório'),
  zip: yup.string().required('Obrigatório'),
  isDefault: yup.boolean().required('Obrigatório'), // Adicionado .required() para alinhar com o tipo boolean (não undefined)
}).required();

const AddressScreen = () => {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector((state: RootState) => state.addresses.data) as Address[];
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<AddressForm>({
    resolver: yupResolver<AddressForm, any, any>(schema),
    defaultValues: {
      street: '',
      number: '',
      city: '',
      state: '',
      zip: '',
      isDefault: false,
    },
  });

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const onSubmit: SubmitHandler<AddressForm> = (data) => {
    if (editingId) {
      dispatch(updateAddressThunk({ id: editingId, address: data }));
    } else {
      dispatch(createAddressThunk(data));
    }
    setModalVisible(false);
    reset();
  };

  const editAddress = (address: Address) => {
    reset({
      street: address.street,
      number: address.number,
      city: address.city,
      state: address.state,
      zip: address.zip,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setModalVisible(true);
  };

  const deleteAddr = (id: number) => {
    dispatch(deleteAddressThunk(id));
  };

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Endereços</Text>
      <FlatList
        data={addresses}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10, padding: 10, borderWidth: 1 }}>
            <Text>{item.street}, {item.number} - {item.city}/{item.state} {item.zip}</Text>
            <Text>{item.isDefault ? 'Padrão' : ''}</Text>
            <TouchableOpacity onPress={() => editAddress(item)}>
              <Text style={{ color: 'blue' }}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteAddr(item.id)}>
              <Text style={{ color: 'red' }}>Deletar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button onPress={() => { setEditingId(null); reset(); setModalVisible(true); }}>
        Adicionar Endereço
      </Button>
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', padding: 20, margin: 20 }}>
          <Controller
            control={control}
            name="street"
            render={({ field: { onChange, value } }) => (
              <PaperInput label="Rua" value={value} onChangeText={onChange} error={!!errors.street} />
            )}
          />
          {errors.street && <Text>{errors.street.message}</Text>}
          <Controller
            control={control}
            name="number"
            render={({ field: { onChange, value } }) => (
              <PaperInput label="Número" value={value} onChangeText={onChange} error={!!errors.number} />
            )}
          />
          {errors.number && <Text>{errors.number.message}</Text>}
          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, value } }) => (
              <PaperInput label="Cidade" value={value} onChangeText={onChange} error={!!errors.city} />
            )}
          />
          {errors.city && <Text>{errors.city.message}</Text>}
          <Controller
            control={control}
            name="state"
            render={({ field: { onChange, value } }) => (
              <Picker selectedValue={value} onValueChange={onChange}>
                <Picker.Item label="SP" value="SP" />
                <Picker.Item label="RJ" value="RJ" />
                <Picker.Item label="MG" value="MG" />
              </Picker>
            )}
          />
          {errors.state && <Text>{errors.state.message}</Text>}
          <Controller
            control={control}
            name="zip"
            render={({ field: { onChange, value } }) => (
              <PaperInput label="CEP" value={value} onChangeText={onChange} error={!!errors.zip} />
            )}
          />
          {errors.zip && <Text>{errors.zip.message}</Text>}
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

export default AddressScreen;