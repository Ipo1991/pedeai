import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button, TextInput as PaperInput, Card, Portal, Modal, Switch } from 'react-native-paper';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAddresses, createAddressThunk, updateAddressThunk, deleteAddressThunk } from '../store/addressSlice';
import { RootState } from '../store/store';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
import { RootStackParamList } from '../navigation/Navigation'; 


// Interface única extendida
interface Address {
  id: number;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string; // armazenado com máscara no form, normalizado na API
  isDefault: boolean;
}
type AddressScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Addresses'>;
// Form type: manter "complement" presente (pode ser undefined) para alinhar com inferência do yupResolver
type AddressForm = {
  street: string;
  number: string;
  complement?: string; // opcional
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
};

const schema = yup.object({
  street: yup.string().required('Rua é obrigatória').min(3, 'Muito curto'),
  number: yup
    .string()
    .required('Número é obrigatório')
    .test('number-or-sn', 'Informe um número ou "S/N"', (val) => {
      if (!val) return false;
      const v = String(val).trim().toUpperCase();
      return v === 'S/N' || /^\d+$/.test(v);
    }),
  complement: yup.string().optional(),
  neighborhood: yup.string().required('Bairro é obrigatório').min(2, 'Muito curto'),
  city: yup.string().required('Cidade é obrigatória').min(2, 'Muito curto'),
  state: yup
    .string()
    .required('UF é obrigatória')
    .transform((v) => (v ? v.toUpperCase() : v))
    .matches(/^[A-Z]{2}$/i, 'UF deve ter 2 letras'),
  zip: yup
    .string()
    .required('CEP é obrigatório')
    .matches(/^\d{5}-\d{3}$/, 'Formato: 00000-000'),
  isDefault: yup.boolean().required(),
}).required();

const AddressScreen = () => {
  const navigation = useNavigation<AddressScreenNavigationProp>(); 
  const dispatch = useAppDispatch();
  const addresses = useAppSelector((state: RootState) => state.addresses.data) as Address[];
  const sortedAddresses = useMemo(() => {
    const arr = Array.isArray(addresses) ? [...addresses] : [];
    return arr.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  }, [addresses]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noNumber, setNoNumber] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const { control, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<AddressForm>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip: '',
      isDefault: false,
    },
  });

  const formZip = watch('zip');
  const formStateUF = watch('state');

  // Recarrega endereços sempre que a tela ganhar foco
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchAddresses());
      return () => {
        // Cleanup se necessário
      };
    }, [dispatch])
  );

  // Máscaras
  const formatCEP = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  };

  const formatUF = (text: string) => {
    return text.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
  };

  // Auto-preenche cidade/UF via ViaCEP (opcional)
  useEffect(() => {
    const fetchViaCep = async () => {
      const cleaned = (formZip || '').replace(/\D/g, '');
      if (cleaned.length !== 8) return;
      try {
        setLoadingCep(true);
        const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        const data = await res.json();
        if (!data.erro) {
          if (data.logradouro) setValue('street', data.logradouro);
          if (data.localidade) setValue('city', data.localidade);
          if (data.uf) setValue('state', data.uf);
        }
      } catch (e) {
        // Silencia erros de rede
      } finally {
        setLoadingCep(false);
      }
    };

    fetchViaCep();
  }, [formZip, setValue]);

  const onSubmit: SubmitHandler<AddressForm> = async (data) => {
    console.log('🏠 AddressScreen: Submitting form', data);
    try {
      if (editingId) {
        console.log('🏠 AddressScreen: Updating address', editingId);
        const result = await dispatch(updateAddressThunk({ id: editingId, address: data }));
        // Garante unicidade do endereço padrão
        if ((data as any).isDefault) {
          const newId = editingId;
          const toUpdate = (addresses || []).filter(a => a.id !== newId && a.isDefault);
          for (const addr of toUpdate) {
            await dispatch(updateAddressThunk({ id: addr.id, address: { ...addr, isDefault: false } }));
          }
        }
        // Refresca lista para garantir sincronismo com storage
        console.log('🏠 AddressScreen: Fetching addresses after update');
        await dispatch(fetchAddresses());
      } else {
        console.log('🏠 AddressScreen: Creating new address');
        const resultAction = await dispatch(createAddressThunk(data));
        console.log('🏠 AddressScreen: Create result', resultAction);
        // Verifica se a ação foi bem-sucedida e se veio do checkout
        if (createAddressThunk.fulfilled.match(resultAction)) {
          const newAddress = resultAction.payload as Address;
          console.log('🏠 AddressScreen: Address created successfully', newAddress);
          // Garante unicidade do endereço padrão
          if ((data as any).isDefault) {
            const toUpdate = (addresses || []).filter(a => a.id !== newAddress.id && a.isDefault);
            for (const addr of toUpdate) {
              await dispatch(updateAddressThunk({ id: addr.id, address: { ...addr, isDefault: false } }));
            }
          }
          // Refresca lista após criação
          console.log('🏠 AddressScreen: Fetching addresses after create');
          await dispatch(fetchAddresses());
        } else {
          console.error('🏠 AddressScreen: Create failed', resultAction);
        }
      }
      // Comportamento padrão
      setModalVisible(false);
      reset();
      setNoNumber(false);
    } catch (error) {
      console.error('🏠 AddressScreen: Error submitting form', error);
    }
  };

  const editAddress = (address: Address) => {
    reset(address);
    setNoNumber(String(address.number).toUpperCase() === 'S/N');
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
        data={sortedAddresses}
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
                <Text style={[styles.value, { color: '#b71c1c', fontWeight: '600' }]}>Endereço Padrão</Text>
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
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>Você ainda não tem endereços.</Text>
            <Text style={{ color: '#666' }}>Toque em "Adicionar Endereço" para criar.</Text>
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
          setNoNumber(false);
          setModalVisible(true);
        }}
      >
        Adicionar Endereço
      </Button>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderIcon}>🏠</Text>
            <Text style={styles.modalHeaderTitle}>{editingId ? 'Editar Endereço' : 'Novo Endereço'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} accessibilityLabel="Fechar">
              <Text style={styles.modalClose}>✖</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
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
                  onChangeText={(t) => onChange(noNumber ? 'S/N' : t.replace(/[^\d]/g, ''))}
                  error={!!errors.number}
                  style={[styles.input, styles.textInput]}
                  left={<PaperInput.Icon icon="numeric" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  textColor="#000"
                  keyboardType="number-pad"
                  disabled={noNumber}
                />
              )}
            />
            {errors.number && <Text style={styles.error}>{errors.number.message}</Text>}

            {/* Sem número */}
            <View style={styles.switchRow}>
              <Text style={styles.label}>Sem número</Text>
              <Switch
                value={noNumber}
                onValueChange={(v) => {
                  setNoNumber(v);
                  if (v) setValue('number', 'S/N');
                  else setValue('number', '');
                }}
                color="#b71c1c"
              />
            </View>

            {/* Cidade */}
            {/* Complemento */}
            <Controller
              control={control}
              name="complement"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="Complemento (opcional)"
                  value={value}
                  onChangeText={onChange}
                  style={[styles.input, styles.textInput]}
                  left={<PaperInput.Icon icon="plus" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  textColor="#000"
                />
              )}
            />

            {/* Bairro */}
            <Controller
              control={control}
              name="neighborhood"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="Bairro"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.neighborhood}
                  style={[styles.input, styles.textInput]}
                  left={<PaperInput.Icon icon="map" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  textColor="#000"
                />
              )}
            />
            {errors.neighborhood && <Text style={styles.error}>{errors.neighborhood.message}</Text>}

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

            {/* UF */}
            <Controller
              control={control}
              name="state"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="UF"
                  value={value}
                  onChangeText={(t) => onChange(formatUF(t))}
                  error={!!errors.state}
                  style={[styles.input, styles.textInput]}
                  left={<PaperInput.Icon icon="map" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  textColor="#000"
                  maxLength={2}
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
                  onChangeText={(t) => onChange(formatCEP(t))}
                  error={!!errors.zip}
                  style={[styles.input, styles.textInput]}
                  left={<PaperInput.Icon icon="map-marker" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  textColor="#000"
                  keyboardType="number-pad"
                  maxLength={9}
                  placeholder="00000-000"
                />
              )}
            />
            {errors.zip && <Text style={styles.error}>{errors.zip.message}</Text>}
            {loadingCep && <Text style={styles.helper}>Buscando endereço pelo CEP...</Text>}

            <View style={{ height: 8 }} />

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
          </ScrollView>
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={[styles.modalButton]}
              textColor="#b71c1c"
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit as any)}
              buttonColor="#b71c1c"
              textColor="white"
              style={[styles.modalButton]}
            >
              Salvar
            </Button>
          </View>
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
  // New modal styles (consistent with ProfileScreen)
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
  helper: { fontSize: 12, color: '#666' },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalButton: { flex: 1, marginHorizontal: 5, borderRadius: 8 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  saveButton: { marginTop: 16, borderRadius: 8 },
});
