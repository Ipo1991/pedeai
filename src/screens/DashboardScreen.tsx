import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { Button, Card } from 'react-native-paper';
import { useAppDispatch } from '../store/hooks';
import { clearOrders } from '../store/orderSlice';
import { clearAddresses } from '../store/addressSlice';
import { clearPayments } from '../store/paymentSlice';

const DashboardScreen = () => {
  const auth = useContext(AuthContext)!;
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(clearOrders()); // Limpa pedidos do Redux
    dispatch(clearAddresses()); // Limpa endereços do Redux
    dispatch(clearPayments()); // Limpa pagamentos do Redux
    auth.signOut();
  };

  const menuItems = [
    { title: 'Restaurantes', icon: '🍽️', screen: 'Restaurants', description: 'Explore restaurantes' },
    { title: 'Pedidos', icon: '📦', screen: 'OrderHistory', description: 'Histórico de pedidos' },
    { title: 'Perfil', icon: '👤', screen: 'Profile', description: 'Meus dados' },
    { title: 'Endereços', icon: '📍', screen: 'Addresses', description: 'Gerenciar endereços' },
    { title: 'Pagamentos', icon: '💳', screen: 'Payments', description: 'Formas de pagamento' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>PedeAí</Text>
        <Text style={styles.welcome}>Olá, {auth.user?.name || 'Usuário'}!</Text>
        <Text style={styles.subtitle}>O que você deseja hoje?</Text>
      </View>

      {/* Menu Cards */}
      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <Card key={index} style={styles.card} onPress={() => navigation.navigate(item.screen)}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutContent}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </View>
          <Text style={styles.logoutArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#b71c1c',
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcome: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffcdd2',
    textAlign: 'center',
  },
  menuGrid: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  cardContent: {
    alignItems: 'center',
    padding: 15,
  },
  icon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  logoutSection: {
    padding: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#b71c1c',
    fontWeight: '600',
  },
  logoutArrow: {
    fontSize: 24,
    color: '#b71c1c',
    fontWeight: 'bold',
  },
  spacer: {
    height: 20,
  },
});

export default DashboardScreen;