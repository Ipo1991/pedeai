import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Button, TextInput as PaperInput, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AuthContext } from '../contexts/AuthContext';
import SnackbarNotification from '../components/SnackbarNotification';

const schema = yup.object({
  name: yup.string().required('Nome é obrigatório').min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  phone: yup.string()
    .required('Telefone é obrigatório')
    .test('phone-format', 'Formato: (99) 99999-9999', (value) => {
      return /^\(\d{2}\) \d{5}-\d{4}$/.test(value || '');
    }),
  birthDate: yup.string()
    .required('Data de nascimento é obrigatória')
    .test('date-format', 'Formato: DD/MM/AAAA', (value) => {
      return /^\d{2}\/\d{2}\/\d{4}$/.test(value || '');
    })
    .test('valid-date', 'Data inválida', (value) => {
      if (!value) return false;
      const [day, month, year] = value.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    })
    .test('age', 'Você deve ter no mínimo 18 anos', (value) => {
      if (!value) return false;
      const [day, month, year] = value.split('/').map(Number);
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    }),
  password: yup.string()
    .required('Senha é obrigatória')
    .min(8, 'Mínimo 8 caracteres')
    .matches(/[A-Z]/, 'Deve conter ao menos uma letra maiúscula')
    .matches(/[a-z]/, 'Deve conter ao menos uma letra minúscula')
    .matches(/[0-9]/, 'Deve conter ao menos um número')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Deve conter ao menos um caractere especial'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'As senhas não coincidem')
    .required('Confirme sua senha'),
});

type RegisterFormData = yup.InferType<typeof schema>;

const RegisterScreen = () => {
  const auth = useContext(AuthContext)!;
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [showPasswordHints, setShowPasswordHints] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info' });
  
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Validações individuais da senha
  const passwordValidations = {
    minLength: passwordValue.length >= 8,
    hasUpperCase: /[A-Z]/.test(passwordValue),
    hasLowerCase: /[a-z]/.test(passwordValue),
    hasNumber: /[0-9]/.test(passwordValue),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
  };

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      await auth.signUp({ 
        name: data.name, 
        email: data.email, 
        password: data.password, 
        phone: data.phone, 
        birth_date: data.birthDate
      });
      // Navegação automática quando o token for definido
    } catch (err: any) {
      setSnackbar({ visible: true, message: err.message || 'Erro ao criar conta', type: 'error' });
      console.error('❌ Erro ao criar conta:', err.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>PedeAí</Text>
        <Text style={styles.subtitle}>Crie sua conta e comece a pedir!</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Nome */}
        <Card style={styles.card}>
          <Card.Content>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="Nome completo *"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.name}
                  left={<PaperInput.Icon icon="account" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  style={styles.input}
                  textColor="#000"
                  autoCapitalize="words"
                />
              )}
            />
            {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
          </Card.Content>
        </Card>

        {/* Email */}
        <Card style={styles.card}>
          <Card.Content>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="E-mail *"
                  value={value}
                  onChangeText={onChange}
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

        {/* Telefone */}
        <Card style={styles.card}>
          <Card.Content>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="Telefone *"
                  value={value}
                  onChangeText={(text) => onChange(formatPhone(text))}
                  error={!!errors.phone}
                  keyboardType="phone-pad"
                  left={<PaperInput.Icon icon="phone" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  style={styles.input}
                  textColor="#000"
                  placeholder="(99) 99999-9999"
                  maxLength={15}
                />
              )}
            />
            {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}
          </Card.Content>
        </Card>

        {/* Data de Nascimento */}
        <Card style={styles.card}>
          <Card.Content>
            <Controller
              control={control}
              name="birthDate"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="Data de Nascimento *"
                  value={value}
                  onChangeText={(text) => onChange(formatDate(text))}
                  error={!!errors.birthDate}
                  keyboardType="number-pad"
                  left={<PaperInput.Icon icon="calendar" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  style={styles.input}
                  textColor="#000"
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                />
              )}
            />
            {errors.birthDate && <Text style={styles.error}>{errors.birthDate.message}</Text>}
          </Card.Content>
        </Card>

        {/* Senha */}
        <Card style={styles.card}>
          <Card.Content>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="Senha *"
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    setPasswordValue(text);
                  }}
                  onFocus={() => setShowPasswordHints(true)}
                  onBlur={() => setShowPasswordHints(false)}
                  error={!!errors.password}
                  secureTextEntry
                  left={<PaperInput.Icon icon="lock" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  style={styles.input}
                  textColor="#000"
                />
              )}
            />
            {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
            
            {/* Dicas de senha */}
            {showPasswordHints && (
              <View style={styles.passwordHints}>
                <Text style={styles.passwordHintsTitle}>A senha deve conter:</Text>
                <View style={styles.hintRow}>
                  <Text style={passwordValidations.minLength ? styles.hintValid : styles.hintInvalid}>
                    {passwordValidations.minLength ? '✓' : '○'} Mínimo 8 caracteres
                  </Text>
                </View>
                <View style={styles.hintRow}>
                  <Text style={passwordValidations.hasUpperCase ? styles.hintValid : styles.hintInvalid}>
                    {passwordValidations.hasUpperCase ? '✓' : '○'} Uma letra maiúscula
                  </Text>
                </View>
                <View style={styles.hintRow}>
                  <Text style={passwordValidations.hasLowerCase ? styles.hintValid : styles.hintInvalid}>
                    {passwordValidations.hasLowerCase ? '✓' : '○'} Uma letra minúscula
                  </Text>
                </View>
                <View style={styles.hintRow}>
                  <Text style={passwordValidations.hasNumber ? styles.hintValid : styles.hintInvalid}>
                    {passwordValidations.hasNumber ? '✓' : '○'} Um número
                  </Text>
                </View>
                <View style={styles.hintRow}>
                  <Text style={passwordValidations.hasSpecial ? styles.hintValid : styles.hintInvalid}>
                    {passwordValidations.hasSpecial ? '✓' : '○'} Um caractere especial (!@#$%^&*)
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Confirmar Senha */}
        <Card style={styles.card}>
          <Card.Content>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <PaperInput
                  label="Confirmar Senha *"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.confirmPassword}
                  secureTextEntry
                  left={<PaperInput.Icon icon="lock-check" color="#b71c1c" />}
                  activeUnderlineColor="#b71c1c"
                  style={styles.input}
                  textColor="#000"
                />
              )}
            />
            {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}
          </Card.Content>
        </Card>

        {/* Botão Cadastrar */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          style={styles.registerButton}
          buttonColor="#b71c1c"
          textColor="white"
        >
          {loading ? <ActivityIndicator color="white" /> : 'Cadastrar'}
        </Button>

        {/* Link para Login */}
        <View style={styles.linksContainer}>
          <Button textColor="#b71c1c" onPress={() => navigation.navigate('Login')}>
            Já tem uma conta? Fazer login
          </Button>
        </View>
      </View>

      {/* Snackbar para feedback */}
      <SnackbarNotification
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
      />
    </ScrollView>
  );
};

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
  registerButton: {
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
  passwordHints: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3',
  },
  passwordHintsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  hintRow: {
    marginVertical: 3,
  },
  hintValid: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
  },
  hintInvalid: {
    fontSize: 12,
    color: '#757575',
  },
});

export default RegisterScreen;