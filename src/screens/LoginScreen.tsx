// screens/LoginScreen.tsx
import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Button, TextInput as PaperInput, Card, Modal, Portal } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Obrigatório'),
  password: yup.string().min(8, 'Mínimo 8 caracteres').required('Obrigatório'),
});

const LoginScreen: React.FC = () => {
  const auth = useContext(AuthContext)!;
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError('');
      await auth.signIn(data.email, data.password);
      // Navegação automática quando o token for definido
    } catch (err: any) {
      console.log('Login error:', err);
      
      // Verifica o status code do erro
      if (err.response?.status === 401) {
        setError('Email ou senha incorretos. Verifique seus dados e tente novamente.');
      } else if (err.response?.status === 400) {
        setError('Dados inválidos. Verifique o email e senha digitados.');
      } else if (err.response?.status >= 500) {
        setError('Erro no servidor. Tente novamente em alguns instantes.');
      } else if (err.message?.includes('Network')) {
        setError('Sem conexão com o servidor. Verifique sua internet.');
      } else {
        setError('Erro ao fazer login. Verifique seus dados e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = (text: string) => {
    setError('');
    setValue('email', text);
  };

  const handleChangePassword = (text: string) => {
    setError('');
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
      <View style={styles.header}>
        <Text style={styles.logo}>PedeAí</Text>
        <Text style={styles.subtitle}>Bem-vindo de volta! Faça login para continuar.</Text>
      </View>

      <View style={styles.formContainer}>
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
                  keyboardType="email-address"
                  autoCapitalize="none"
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

        {/* Erro de login */}
        {error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </Card.Content>
          </Card>
        )}

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

        {/* Links */}
        <View style={styles.linksContainer}>
          <Button textColor="#b71c1c" onPress={() => navigation.navigate('Register')}>
            Não tem conta? Cadastre-se
          </Button>
          <Button textColor="#b71c1c" onPress={() => setForgotVisible(true)}>
            Esqueci a senha
          </Button>
        </View>
      </View>

      {/* Modal Esqueci a Senha */}
      <Portal>
        <Modal
          visible={forgotVisible}
          onDismiss={() => setForgotVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <View style={{ padding: 20 }}>
            <Text style={styles.modalTitle}>Recuperar Senha</Text>
            {emailSent ? (
              <View style={{ paddingVertical: 20 }}>
                <Text style={styles.successText}>📧 Email de recuperação enviado com sucesso!</Text>
                <Text style={{ textAlign: 'center', color: '#666', marginTop: 8 }}>
                  Verifique sua caixa de entrada.
                </Text>
              </View>
            ) : (
              <Card style={styles.modalCard}>
                <Card.Content>
                  <PaperInput
                    label="Email"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    left={<PaperInput.Icon icon="email" color="#b71c1c" />}
                    activeUnderlineColor="#b71c1c"
                    style={styles.input}
                    textColor="#000"
                  />
                  <Button
                    mode="contained"
                    onPress={handleForgotPassword}
                    style={styles.saveButton}
                    buttonColor={forgotEmail ? '#b71c1c' : '#ccc'}
                    textColor="white"
                    disabled={!forgotEmail}
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
                </Card.Content>
              </Card>
            )}
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#b71c1c',
    padding: 30,
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 20,
  },
  logo: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#ffcdd2',
  },
  formContainer: {
    padding: 20,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  input: {
    marginVertical: 4,
    backgroundColor: '#fff',
  },
  error: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  errorCard: {
    marginTop: 4,
    marginBottom: 12,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
    elevation: 2,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 10,
    paddingVertical: 6,
    elevation: 3,
  },
  linksContainer: {
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 20,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#b71c1c',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 0,
  },
  successText: {
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'center',
    fontWeight: '500',
    paddingVertical: 12,
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 4,
  },
});
