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

  // Limpa erro ao digitar
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
                activeUnderlineColor="#ffffffff"
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
                activeUnderlineColor="#ffffffff"
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
        <Button textColor="#d32f2f" onPress={() => navigation.navigate('Register')}>
          Cadastrar
        </Button>
        <Button textColor="#d32f2f" onPress={() => setForgotVisible(true)}>
          Esqueci a senha
        </Button>
      </View>

      {/* Modal Esqueci a Senha */}
      <Portal>
        <Modal
          visible={forgotVisible}
          onDismiss={() => setForgotVisible(false)}
          contentContainerStyle={styles.modalBackdrop}
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              {emailSent ? (
                <Text style={styles.successText}>📧 Email de recuperação enviado com sucesso!</Text>
              ) : (
                <>
                  <Text style={styles.modalTitle}>Recuperar Senha</Text>
                  <PaperInput
                    label="Email"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    left={<PaperInput.Icon icon="email" color="#b71c1c" />}
                    activeUnderlineColor="#ffffffff"
                  />
                  <Button
                    mode="contained"
                    onPress={handleForgotPassword}
                    style={styles.sendButton}
                    buttonColor={forgotEmail ? "#b71c1c" : "#f28b82"}
                    textColor="white"
                  >
                    Enviar Email
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => setForgotVisible(false)}
                    style={styles.cancelButton}
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
  container: { padding: 20, paddingTop: 60 },
  logo: { fontSize: 36, fontWeight: '700', textAlign: 'center', marginBottom: 10, color: '#b71c1c' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#444' },
  card: { marginBottom: 15 },
  error: { color: 'red', marginTop: 4, textAlign: 'center' },
  loginButton: { marginTop: 20, paddingVertical: 5 },
  linksContainer: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  modalBackdrop: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 20, justifyContent: 'center', flex: 1 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 10, elevation: 6 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#b71c1c', textAlign: 'center' },
  sendButton: { marginTop: 15, borderRadius: 8, paddingVertical: 4 },
  cancelButton: { marginTop: 8, borderColor: '#b71c1c' },
  successText: { fontSize: 16, color: 'green', textAlign: 'center', fontWeight: '500' },
});
