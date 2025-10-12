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

const schema = yup.object({
  name: yup.string().required('Obrigatório'),
  phone: yup.string().required('Obrigatório'),
  birthDate: yup
    .string()
    .matches(/^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/, 'Data inválida. Use DD/MM/AAAA')
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
      await dispatch(registerThunk(data)).unwrap();
    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : err?.message || 'Erro ao registrar';
      if (errorMessage.toLowerCase().includes('email')) {
        setError('email', { type: 'manual', message: errorMessage });
      } else {
        console.log(errorMessage);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      {/** Campos de entrada dentro de cards */}
      {[
        { name: 'name', label: 'Nome', icon: 'account', keyboard: 'default' },
        { name: 'phone', label: 'Telefone', icon: 'phone', keyboard: 'phone-pad' },
        { name: 'birthDate', label: 'Data de Nascimento (DD/MM/AAAA)', icon: 'calendar', keyboard: 'default' },
        { name: 'email', label: 'Email', icon: 'email', keyboard: 'email-address' },
        { name: 'password', label: 'Senha', icon: 'lock', keyboard: 'default', secure: true },
        { name: 'confirmPassword', label: 'Repita a senha', icon: 'lock', keyboard: 'default', secure: true },
      ].map((field) => (
        <Card key={field.name} style={styles.card}>
          <Card.Content>
            <Controller
              control={control}
              name={field.name as keyof RegisterFormData}
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label={field.label}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors[field.name as keyof RegisterFormData]}
                  keyboardType={field.keyboard as any}
                  secureTextEntry={field.secure}
                  left={<PaperInput.Icon icon={field.icon} color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  style={styles.input}
                  textColor="#000"
                />
              )}
            />
            {errors[field.name as keyof RegisterFormData] && (
              <Text style={styles.error}>
                {errors[field.name as keyof RegisterFormData]?.message}
              </Text>
            )}
          </Card.Content>
        </Card>
      ))}

      {/** Botão de cadastro */}
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        style={styles.saveButton}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#b71c1c',
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#ffe5e5',
  },
  input: {
    marginVertical: 4,
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    marginTop: 4,
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 8,
  },
});
