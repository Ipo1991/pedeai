import React, { useEffect, useState, useContext } from 'react';
import { View, Text } from 'react-native';
import { format, parseISO } from 'date-fns';
import { AuthContext } from '../contexts/AuthContext';
import { getProfile } from '../api/api';

export default function ProfileScreen() {
  const auth = useContext(AuthContext)!;
  const [profile, setProfile] = useState<any>(null);
  const [birthDateStr, setBirthDateStr] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfile();
        setProfile(data);
        if (data.birthDate) {
          try { setBirthDateStr(format(parseISO(data.birthDate), 'dd/MM/yyyy')); } catch { setBirthDateStr(data.birthDate); }
        }
      } catch (e) {}
    }
    load();
  }, []);

  return (
    <View>
      <Text>{profile?.name}</Text>
      <Text>{birthDateStr}</Text>
    </View>
  );
}