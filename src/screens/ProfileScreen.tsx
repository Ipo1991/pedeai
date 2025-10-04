import React, { useEffect } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { Button, TextInput as PaperInput } from 'react-native-paper';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProfile, updateProfileThunk } from '../store/profileSlice';
import { RootState } from '../store/store';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaskedTextInput } from 'react-native-mask-text';

interface Profile {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  notifications?: boolean;
}

const schema = yup.object({
  name: yup.string().required('Obrigatório'),
  email: yup.string().email('Email inválido').required('Obrigatório'),
  phone: yup.string().required('Obrigatório'),
  birthDate: yup.string().required('Obrigatório'),
  notifications: yup.boolean().optional(),
}).required();

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state: RootState) => state.profile.data) as Profile;
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<Profile>({
    resolver: yupResolver<Profile, any, any>(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      birthDate: new Date().toISOString(),
      notifications: true,
    },
  });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    Object.keys(profile).forEach(key => setValue(key as keyof Profile, profile[key as keyof Profile]));
  }, [profile, setValue]);

  const onSubmit: SubmitHandler<Profile> = (data) => {
    const payload: Profile = {
      ...data,
      notifications: data.notifications ?? true,
    };
    dispatch(updateProfileThunk(payload));
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Editar Perfil</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <PaperInput label="Nome" value={value} onChangeText={onChange} error={!!errors.name} />
          )}
        />
        {errors.name && <Text>{errors.name.message}</Text>}
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
          name="phone"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text>Telefone</Text>
              <MaskedTextInput
                mask="(99) 99999-9999"
                value={value}
                onChangeText={onChange}
                style={{ borderWidth: 1, padding: 10 }}
              />
            </View>
          )}
        />
        {errors.phone && <Text>{errors.phone.message}</Text>}
        <Controller
          control={control}
          name="birthDate"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text>Data de Nascimento</Text>
              <DateTimePicker
                value={new Date(value || Date.now())}
                mode="date"
                onChange={(_, date) => onChange(date?.toISOString())}
              />
            </View>
          )}
        />
        {errors.birthDate && <Text>{errors.birthDate.message}</Text>}
        <Controller
          control={control}
          name="notifications"
          render={({ field: { onChange, value } }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
              <Text>Notificações</Text>
              <Switch value={value ?? true} onValueChange={onChange} />
            </View>
          )}
        />
        <Button mode="contained" onPress={handleSubmit(onSubmit)}>Salvar</Button>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;