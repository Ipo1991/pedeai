// only showing updated onSubmit part to auto-login
import React from 'react';
import { useAppDispatch } from '../store/hooks';
import { registerThunk } from '../store/authSlice';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const RegisterScreen = () => {
  const auth = useContext(AuthContext)!;
  const navigation = useNavigation<any>();

  const onSubmit = async (data: any) => {
    try {
      await auth.signUp({ name: data.name, email: data.email, password: data.password, phone: data.phone, birthDate: data.birthDate });
      // after sign up, user is logged in via AuthContext; navigate to Dashboard
      navigation.replace('Dashboard');
    } catch (err: any) {
      // show error
    }
  };

  return null;
};

export default RegisterScreen;