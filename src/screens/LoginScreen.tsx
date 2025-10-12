// screens/LoginScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Button, TextInput as PaperInput, Card, Modal, Portal } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginThunk, clearError } from '../store/authSlice';
import { RootState } from '../store/store';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

interface LoginFormData {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Obrigatório'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('Obrigatório'),
});

const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const loading = useAppSelector((state: RootState) => state.auth.loading);
  const error = useAppSelector((state: RootState) => state.auth.error);
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  useFocusEffect(
    useCallback(() => {
      dispatch(clearError());
    }, [dispatch])
  );

  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = (data: LoginFormData) => {
    dispatch(loginThunk(data));
  };

  const handleChangeEmail = (text: string) => {
    dispatch(clearError());
    setValue('email', text);
  };

  const handleChangePassword = (text: string) => {
    dispatch(clearError());
    setValue('password', text);
  };

  const handleForgotPassword = () => {
    if (!forgotEmail) return;
    setEmailSent(true);
    setTimeout(() => {
      setForgotVisible(false);
      setEmailSent(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>PedeAí</Text>
      <Text style={styles.subtitle}>Bem-vindo de volta! Faça login para continuar.</Text>

      {/* Email */}
      <Card style={styles.card}>
        <Card.Content>
          <Controller
            control={control}
            name="email"
            render={({ field: { value } }) => (
              <PaperInput
                label="Email"
                value={value}
                onChangeText={handleChangeEmail}
                error={!!errors.email}
                left={<PaperInput.Icon icon="email" color="#b71c1c" />}
                activeUnderlineColor="#b71c1c"
                style={styles.input}
                textColor="#000"
              />
            )}
          />
          {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
        </Card.Content>
      </Card>

      {/* Senha */}
      <Card style={styles.card}>
        <Card.Content>
          <Controller
            control={control}
            name="password"
            render={({ field: { value } }) => (
              <PaperInput
                label="Senha"
                value={value}
                onChangeText={handleChangePassword}
                secureTextEntry
                error={!!errors.password}
                left={<PaperInput.Icon icon="lock" color="#b71c1c" />}
                activeUnderlineColor="#b71c1c"
                style={styles.input}
                textColor="#000"
              />
            )}
          />
          {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
        </Card.Content>
      </Card>

      {/* Botão Entrar */}
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        style={styles.loginButton}
        buttonColor="#b71c1c"
        textColor="white"
      >
        {loading ? <ActivityIndicator color="white" /> : 'Entrar'}
      </Button>

      {/* Erro de login */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Links */}
      <View style={styles.linksContainer}>
        <Button textColor="#b71c1c" onPress={() => navigation.navigate('Register')}>
          Cadastrar
        </Button>
        <Button textColor="#b71c1c" onPress={() => setForgotVisible(true)}>
          Esqueci a senha
        </Button>
      </View>

      {/* Modal Esqueci a Senha */}
      <Portal>
        <Modal
          visible={forgotVisible}
          onDismiss={() => setForgotVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Recuperar Senha</Text>
          <Card style={styles.modalCard}>
            <Card.Content>
              {emailSent ? (
                <Text style={styles.successText}>📧 Email de recuperação enviado com sucesso!</Text>
              ) : (
                <>
                  <PaperInput
                    label="Email"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    left={<PaperInput.Icon icon="email" color="#b71c1c" />}
                    activeUnderlineColor="#b71c1c"
                    style={styles.input}
                    textColor="#000"
                  />
                  <Button
                    mode="contained"
                    onPress={handleForgotPassword}
                    style={styles.saveButton}
                    buttonColor={forgotEmail ? '#b71c1c' : '#f28b82'}
                    textColor="white"
                  >
                    Enviar Email
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => setForgotVisible(false)}
                    style={[styles.saveButton, { marginTop: 8 }]}
                    textColor="#b71c1c"
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  logo: { fontSize: 36, fontWeight: '700', textAlign: 'center', color: '#b71c1c' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#444' },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#ffe5e5',
  },
  input: {
    marginVertical: 4,
    backgroundColor: '#fff',
  },
  error: { color: 'red', marginTop: 4, textAlign: 'center' },
  loginButton: { marginTop: 20, borderRadius: 8 },
  linksContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
  },
  modalCard: {
    backgroundColor: '#ffe5e5',
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: '#b71c1c',
  },
  successText: {
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 8,
  },
});
