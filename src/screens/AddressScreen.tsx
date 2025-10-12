import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput as PaperInput, Card, Portal, Modal, Switch } from 'react-native-paper';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAddresses, createAddressThunk, updateAddressThunk, deleteAddressThunk } from '../store/addressSlice';
import { RootState } from '../store/store';

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
  isDefault: yup.boolean().required(),
}).required();

const AddressScreen = () => {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector((state: RootState) => state.addresses.data) as Address[];

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<AddressForm>({
    resolver: yupResolver(schema),
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
    reset(address);
    setEditingId(address.id);
    setModalVisible(true);
  };

  const deleteAddr = (id: number) => {
    dispatch(deleteAddressThunk(id));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meus Endereços</Text>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.label}>Rua:</Text>
              <Text style={styles.value}>{item.street}, {item.number}</Text>

              <Text style={styles.label}>Cidade:</Text>
              <Text style={styles.value}>{item.city} / {item.state}</Text>

              <Text style={styles.label}>CEP:</Text>
              <Text style={styles.value}>{item.zip}</Text>

              {item.isDefault && (
                <Text style={[styles.value, { color: '#b71c1c', fontWeight: '600' }]}>
                  Endereço Padrão
                </Text>
              )}

              <View style={styles.cardButtons}>
                <Button
                  mode="outlined"
                  textColor="#b71c1c"
                  style={styles.cardButton}
                  onPress={() => editAddress(item)}
                >
                  Editar
                </Button>
                <Button
                  mode="contained"
                  buttonColor="#b71c1c"
                  textColor="white"
                  style={styles.cardButton}
                  onPress={() => deleteAddr(item.id)}
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
        Adicionar Endereço
      </Button>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>{editingId ? 'Editar Endereço' : 'Novo Endereço'}</Text>
          <ScrollView>
            {/* Rua */}
            <Controller
              control={control}
              name="street"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="Rua"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.street}
                  style={[styles.input, styles.textInput]}
                  left={<PaperInput.Icon icon="home" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  textColor="#000"
                />
              )}
            />
            {errors.street && <Text style={styles.error}>{errors.street.message}</Text>}

            {/* Número */}
            <Controller
              control={control}
              name="number"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="Número"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.number}
                  style={[styles.input, styles.textInput]}
                  left={<PaperInput.Icon icon="numeric" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  textColor="#000"
                />
              )}
            />
            {errors.number && <Text style={styles.error}>{errors.number.message}</Text>}

            {/* Cidade */}
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="Cidade"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.city}
                  style={[styles.input, styles.textInput]}
                  left={<PaperInput.Icon icon="city" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  textColor="#000"
                />
              )}
            />
            {errors.city && <Text style={styles.error}>{errors.city.message}</Text>}

            {/* Estado (agora digitável) */}
            <Controller
              control={control}
              name="state"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="Estado"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.state}
                  style={[styles.input, styles.textInput]}
                  left={<PaperInput.Icon icon="map" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  textColor="#000"
                />
              )}
            />
            {errors.state && <Text style={styles.error}>{errors.state.message}</Text>}

            {/* CEP */}
            <Controller
              control={control}
              name="zip"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="CEP"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.zip}
                  style={[styles.input, styles.textInput]}
                  left={<PaperInput.Icon icon="map-marker" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  textColor="#000"
                />
              )}
            />
            {errors.zip && <Text style={styles.error}>{errors.zip.message}</Text>}

            {/* Endereço Padrão */}
            <Controller
              control={control}
              name="isDefault"
              render={({ field: { onChange, value } }) => (
                <View style={styles.switchRow}>
                  <Text style={styles.label}>Endereço Padrão</Text>
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

export default AddressScreen;

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
  textInput: { color: '#000' },
  error: { color: 'red', marginBottom: 4 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, margin: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16, textAlign: 'center', color: '#b71c1c' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  saveButton: { marginTop: 16, borderRadius: 8 },
});
