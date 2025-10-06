import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal } from 'react-native';
import { Button, TextInput as PaperInput, Card, Portal } from 'react-native-paper';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProfile, updateProfileThunk } from '../store/profileSlice';
import { RootState } from '../store/store';

interface Profile {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
}

const schema = yup.object({
  name: yup.string().required('Obrigatório'),
  email: yup.string().email('Email inválido').required('Obrigatório'),
  phone: yup.string().required('Obrigatório'),
  birthDate: yup
    .string()
    .matches(/^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/, 'Data inválida. Use DD/MM/AAAA')
    .required('Obrigatório'),
}).required();

// Função para converter ISO -> DD/MM/YYYY
const isoToDDMMYYYY = (iso: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state: RootState) => state.profile.data) as Profile;

  const [modalVisible, setModalVisible] = useState(false);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<Profile>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      birthDate: '',
    },
  });

  // Busca perfil ao abrir
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Preenche formulário quando profile é carregado
  useEffect(() => {
    if (profile) {
      Object.keys(profile).forEach(key => {
        if (key === 'birthDate' && profile.birthDate) {
          setValue('birthDate', isoToDDMMYYYY(profile.birthDate));
        } else {
          setValue(key as keyof Profile, profile[key as keyof Profile] ?? '');
        }
      });
    }
  }, [profile, setValue]);

  const onSubmit: SubmitHandler<Profile> = (data) => {
    // Converte DD/MM/YYYY -> ISO antes de enviar
    const [day, month, year] = data.birthDate.split('/');
    const isoDate = new Date(+year, +month - 1, +day).toISOString();

    dispatch(updateProfileThunk({
      ...data,
      birthDate: isoDate,
    }));
    setModalVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Meu Perfil</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Nome:</Text>
          <Text style={styles.value}>{profile?.name || '-'}</Text>

          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{profile?.email || '-'}</Text>

          <Text style={styles.label}>Telefone:</Text>
          <Text style={styles.value}>{profile?.phone || '-'}</Text>

          <Text style={styles.label}>Data de Nascimento:</Text>
          <Text style={styles.value}>
            {profile?.birthDate ? isoToDDMMYYYY(profile.birthDate) : '-'}
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => setModalVisible(true)}
        buttonColor="#b71c1c"
        textColor="white"
        style={styles.button}
      >
        Editar Perfil
      </Button>

      {/* Modal de edição */}
      <Portal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>

              <ScrollView>
                {/* Nome */}
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { value, onChange } }) => (
                    <PaperInput
                      label="Nome"
                      value={value}
                      onChangeText={onChange}
                      error={!!errors.name}
                      style={styles.input}
                      left={<PaperInput.Icon icon="account" color="#b71c1c" />}
                      activeUnderlineColor="#b71c1c"
                    />
                  )}
                />
                {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

                {/* Email */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { value, onChange } }) => (
                    <PaperInput
                      label="Email"
                      value={value}
                      onChangeText={onChange}
                      error={!!errors.email}
                      style={styles.input}
                      left={<PaperInput.Icon icon="email" color="#b71c1c" />}
                      activeUnderlineColor="#b71c1c"
                    />
                  )}
                />
                {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

                {/* Telefone */}
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { value, onChange } }) => (
                    <PaperInput
                      label="Telefone"
                      value={value}
                      onChangeText={onChange}
                      error={!!errors.phone}
                      style={styles.input}
                      left={<PaperInput.Icon icon="phone" color="#b71c1c" />}
                      keyboardType="phone-pad"
                      activeUnderlineColor="#b71c1c"
                    />
                  )}
                />
                {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

                {/* Data de Nascimento */}
                <Controller
                  control={control}
                  name="birthDate"
                  render={({ field: { value, onChange } }) => (
                    <PaperInput
                      label="Data de Nascimento (DD/MM/AAAA)"
                      value={value}
                      onChangeText={onChange}
                      error={!!errors.birthDate}
                      style={styles.input}
                      left={<PaperInput.Icon icon="calendar" color="#b71c1c" />}
                      placeholder="DD/MM/AAAA"
                      activeUnderlineColor="#b71c1c"
                    />
                  )}
                />
                {errors.birthDate && <Text style={styles.error}>{errors.birthDate.message}</Text>}

                <Button
                  mode="contained"
                  onPress={handleSubmit(onSubmit)}
                  buttonColor="#b71c1c"
                  textColor="white"
                  style={styles.button}
                >
                  Salvar
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={[styles.button, { marginTop: 8 }]}
                  textColor="#b71c1c"
                >
                  Cancelar
                </Button>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20, textAlign: 'center', color: '#b71c1c' },
  card: { marginBottom: 12, borderRadius: 12, backgroundColor: '#ffe5e5', padding: 10 },
  label: { fontWeight: '500', marginTop: 8, color: '#333' },
  value: { fontSize: 16, marginBottom: 4, color: '#333' },
  input: { marginVertical: 8, backgroundColor: '#fff' },
  error: { color: 'red', marginTop: 4 },
  button: { marginTop: 16, borderRadius: 8 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16, textAlign: 'center', color: '#b71c1c' },
});
