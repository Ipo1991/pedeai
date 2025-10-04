import React from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { Button, TextInput as PaperInput } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerThunk } from '../store/authSlice';
import { RootState } from '../store/store';

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Obrigatório'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('Obrigatório'),
});

const RegisterScreen = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state: RootState) => state.auth.loading);
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    dispatch(registerThunk(data));
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Cadastro</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <PaperInput label="Email" value={value} onChangeText={onChange} error={!!errors.email} />
          )}
        />
        {errors.email && <Text>{errors.email.message}</Text>}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <PaperInput label="Senha" value={value} onChangeText={onChange} secureTextEntry error={!!errors.password} />
          )}
        />
        {errors.password && <Text>{errors.password.message}</Text>}
        <Button mode="contained" onPress={handleSubmit(onSubmit)} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : 'Cadastrar'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;