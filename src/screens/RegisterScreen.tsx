// screens/RegisterScreen.tsx
import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Button, TextInput as PaperInput, Card } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerThunk } from '../store/authSlice';
import { RootState } from '../store/store';

interface RegisterFormData {
  name: string;
  phone: string;
  birthDate: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 🔹 Validação
const schema = yup.object({
  name: yup.string().required('Obrigatório'),
  phone: yup.string().required('Obrigatório'),
  birthDate: yup
    .string()
    .matches(
      /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/,
      'Data inválida. Use DD/MM/AAAA'
    )
    .required('Obrigatório'),
  email: yup.string().email('Email inválido').required('Obrigatório'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('Obrigatório'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'As senhas não coincidem')
    .required('Obrigatório'),
});

const RegisterScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state: RootState) => state.auth.loading);
  const { control, handleSubmit, setError, formState: { errors } } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      birthDate: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await dispatch(registerThunk(data)).unwrap(); // unwrap lança erro se rejeitado
    } catch (err: any) {
      // err já vem do rejectWithValue, deve ser string
      const errorMessage = typeof err === 'string' ? err : err?.message || 'Erro ao registrar';

      if (errorMessage.toLowerCase().includes('email')) {
        setError('email', { type: 'manual', message: errorMessage });
      } else {
        // outros erros podem ser tratados aqui
        console.log(errorMessage);
      }
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      {/** Nome */}
      <Card style={styles.card}>
        <Card.Content>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <PaperInput
                label="Nome"
                value={value}
                onChangeText={onChange}
                error={!!errors.name}
                left={<PaperInput.Icon icon="account" color="#b71c1c" />}
                activeUnderlineColor="#ffffffff"
              />
            )}
          />
          {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
        </Card.Content>
      </Card>

      {/** Telefone */}
      <Card style={styles.card}>
        <Card.Content>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <PaperInput
                label="Telefone"
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
                error={!!errors.phone}
                left={<PaperInput.Icon icon="phone" color="#b71c1c" />}
                activeUnderlineColor="#ffffffff"
              />
            )}
          />
          {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}
        </Card.Content>
      </Card>

      {/** Data de nascimento */}
      <Card style={styles.card}>
        <Card.Content>
          <Controller
            control={control}
            name="birthDate"
            render={({ field: { onChange, value } }) => (
              <PaperInput
                label="Data de Nascimento (DD/MM/AAAA)"
                value={value}
                onChangeText={onChange}
                placeholder="DD/MM/AAAA"
                error={!!errors.birthDate}
                left={<PaperInput.Icon icon="calendar" color="#b71c1c" />}
                activeUnderlineColor="#ffffffff"
              />
            )}
          />
          {errors.birthDate && <Text style={styles.error}>{errors.birthDate.message}</Text>}
        </Card.Content>
      </Card>

      {/** Email */}
      <Card style={styles.card}>
        <Card.Content>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <PaperInput
                label="Email"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                error={!!errors.email}
                left={<PaperInput.Icon icon="email" color="#b71c1c" />}
                activeUnderlineColor="#ffffffff"
              />
            )}
          />
          {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
        </Card.Content>
      </Card>

      {/** Senha */}
      <Card style={styles.card}>
        <Card.Content>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <PaperInput
                label="Senha"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={!!errors.password}
                left={<PaperInput.Icon icon="lock" color="#b71c1c" />}
                activeUnderlineColor="#ffffffff"
              />
            )}
          />
          {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
        </Card.Content>
      </Card>

      {/** Repita a senha */}
      <Card style={styles.card}>
        <Card.Content>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <PaperInput
                label="Repita a senha"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={!!errors.confirmPassword}
                left={<PaperInput.Icon icon="lock" color="#b71c1c" />}
                activeUnderlineColor="#ffffffff"
              />
            )}
          />
          {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}
        </Card.Content>
      </Card>

      {/** Botão de cadastro */}
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        style={styles.button}
        buttonColor="#b71c1c"
        textColor="white"
      >
        {loading ? <ActivityIndicator color="white" /> : 'Cadastrar'}
      </Button>
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20, textAlign: 'center', color: '#b71c1c' },
  card: { marginBottom: 12 },
  error: { color: 'red', marginTop: 4 },
  button: { marginTop: 20 },
});
