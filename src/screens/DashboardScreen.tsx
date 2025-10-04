import React, { useEffect } from 'react';
import { View, Text, Dimensions, ScrollView, Animated } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrders } from '../store/orderSlice';
import { logoutThunk } from '../store/authSlice';
import { RootState } from '../store/store';
import { LineChart } from 'react-native-chart-kit';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const orders = useAppSelector((state: RootState) => state.orders.data);
  const token = useAppSelector((state: RootState) => state.auth.token); // Adicionado para depuração
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    console.log('Token no Dashboard:', token); // Log para verificar o token
    dispatch(fetchOrders());
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, [dispatch, fadeAnim]);

  const handleLogout = () => {
    console.log('Logout disparado'); // Log para confirmar clique no botão Sair
    dispatch(logoutThunk());
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Dashboard</Text>
        <LineChart
          data={{
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{ data: [20, 45, 28, 80, 99, 43] }],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          bezier
        />
        <Text style={{ marginTop: 10 }}>Total de Pedidos: {orders.length}</Text>
        <View style={{ marginTop: 20 }}>
          <Button icon={() => <Icon name="person" size={20} />} onPress={() => navigation.navigate('Profile')}>
            Perfil
          </Button>
          <Button icon={() => <Icon name="location-on" size={20} />} onPress={() => navigation.navigate('Addresses')}>
            Endereços
          </Button>
          <Button icon={() => <Icon name="payment" size={20} />} onPress={() => navigation.navigate('Payments')}>
            Pagamentos
          </Button>
          <Button icon={() => <Icon name="history" size={20} />} onPress={() => navigation.navigate('OrderHistory')}>
            Histórico de Pedidos
          </Button>
          <Button icon={() => <Icon name="shopping-cart" size={20} />} onPress={() => navigation.navigate('Cart')}>
            Carrinho
          </Button>
          <Button icon={() => <Icon name="logout" size={20} />} onPress={handleLogout}>
            Sair
          </Button>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default DashboardScreen;