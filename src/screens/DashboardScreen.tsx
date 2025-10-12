import React, { useEffect, useRef, useMemo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ScrollView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrders } from '../store/orderSlice';
import { logoutThunk } from '../store/authSlice';
import { RootState } from '../store/store';
import { BarChart } from 'react-native-chart-kit';
import { Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const orders = useAppSelector((state: RootState) => state.orders.data ?? []);
  const token = useAppSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (token) dispatch(fetchOrders());

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [dispatch, token]);

  const handleLogout = () => dispatch(logoutThunk());

  // Dados do gráfico: últimos 5 meses
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 5 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
      return d.toLocaleString('default', { month: 'short' }).toUpperCase();
    });

    const counts = months.map((_, index) => {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - (4 - index));
      return orders.filter((order: any) => {
        const date = new Date(order.date);
        return (
          date.getMonth() === targetMonth.getMonth() &&
          date.getFullYear() === targetMonth.getFullYear()
        );
      }).length;
    });

    return { months, counts };
  }, [orders]);

  const barData = {
    labels: monthlyData.months,
    datasets: [{ data: monthlyData.counts }],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Text style={styles.title}>📦 Dashboard de Pedidos</Text>
          <Text style={styles.subtitle}>Resumo dos últimos 5 meses</Text>

          <Card style={styles.chartCard}>
            <Card.Content>
              <View style={{ alignItems: 'center' }}>
                <BarChart
                  data={barData}
                  width={Math.min(Math.max(320, width - 40), 900)}
                  height={260}
                  fromZero
                  showValuesOnTopOfBars
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundGradientFrom: '#ffcccc',
                    backgroundGradientTo: '#ffe5e5',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255, 50, 50, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(80, 0, 0, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForBackgroundLines: {
                      stroke: '#ff9999',
                    },
                  }}
                  style={{ borderRadius: 12 }}
                />
              </View>
            </Card.Content>
          </Card>


          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.totalTitle}>Total de Pedidos</Text>
              <Text style={styles.totalCount}>{orders.length}</Text>
            </Card.Content>
          </Card>

          <View style={styles.buttons}>
             <Button
              mode="contained"
              icon="account"
              onPress={() => navigation.navigate('Profile')}
              style={styles.button}
              buttonColor="#b71c1c"
              textColor="white"
            >
              Perfil
            </Button>

            <Button
              mode="contained"
              icon="map-marker"
              onPress={() => navigation.navigate('Addresses')}
              style={styles.button}
              buttonColor="#b71c1c"
              textColor="white"
            >
              Endereços
            </Button>

            <Button
              mode="contained"
              icon="credit-card"
              onPress={() => navigation.navigate('Payments')}
              style={styles.button}
              buttonColor="#b71c1c"
              textColor="white"
            >
              Pagamentos
            </Button>

            <Button
              mode="contained"
              icon="history"
              onPress={() => navigation.navigate('OrderHistory')}
              style={styles.button}
              buttonColor="#b71c1c"
              textColor="white"
            >
              Histórico
            </Button>

            <Button
              mode="contained"
              icon="cart"
              onPress={() => navigation.navigate('Cart')}
              style={styles.button}
              buttonColor="#b71c1c"
              textColor="white"
            >
              Restaurantes
            </Button>

            <Button
              mode="contained"
              icon="logout"
              onPress={handleLogout}
              style={[styles.button, styles.logoutButton]}
              textColor="white"
            >
              Sair
            </Button>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20, alignItems: 'center' },
  content: { width: '100%', maxWidth: 900 },
  title: { fontSize: 26, marginBottom: 4, textAlign: 'center', fontWeight: '700', color: '#b71c1c' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#555' },
  chartCard: { borderRadius: 12, marginBottom: 16, elevation: 3 },
  summaryCard: { backgroundColor: '#b71c1c', borderRadius: 12, paddingVertical: 16, marginBottom: 20 },
  totalTitle: { fontSize: 18, color: 'white', textAlign: 'center', fontWeight: '500' },
  totalCount: { fontSize: 40, color: 'white', textAlign: 'center', fontWeight: 'bold' },
  buttons: { marginTop: 10, width: '100%' },
  button: { marginBottom: 12, borderRadius: 8 },
  logoutButton: { backgroundColor: '#d32f2f' },
});
