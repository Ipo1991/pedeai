import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearOrders } from '../store/orderSlice';
import { clearAddresses } from '../store/addressSlice';
import { clearPayments } from '../store/paymentSlice';

const DashboardScreen = () => {
  const auth = useContext(AuthContext)!;
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector((state) => state.auth.isAdmin);

  console.log('👤 DashboardScreen - isAdmin:', isAdmin);
  console.log('👤 DashboardScreen - auth state:', useAppSelector((state) => state.auth));

  const handleLogout = () => {
    dispatch(clearOrders());
    dispatch(clearAddresses());
    dispatch(clearPayments());
    auth.signOut();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🍔 PedeAí</Text>
        <Text style={styles.welcome}>Olá, {auth.user?.name || 'Usuário'}!</Text>
        <Text style={styles.subtitle}>O que você deseja fazer hoje?</Text>
      </View>

      <View style={styles.menuGrid}>
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('Restaurants')}
        >
          <Text style={styles.menuIcon}>🍽️</Text>
          <Text style={styles.menuText}>Restaurantes</Text>
          <Text style={styles.menuDescription}>Explore opções</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Text style={styles.menuIcon}>📦</Text>
          <Text style={styles.menuText}>Meus Pedidos</Text>
          <Text style={styles.menuDescription}>Histórico</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.menuIcon}>👤</Text>
          <Text style={styles.menuText}>Perfil</Text>
          <Text style={styles.menuDescription}>Meus dados</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('Addresses')}
        >
          <Text style={styles.menuIcon}>📍</Text>
          <Text style={styles.menuText}>Endereços</Text>
          <Text style={styles.menuDescription}>Gerenciar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('Payments')}
        >
          <Text style={styles.menuIcon}>💳</Text>
          <Text style={styles.menuText}>Pagamento</Text>
          <Text style={styles.menuDescription}>Formas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('Statistics')}
        >
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuText}>Estatísticas</Text>
          <Text style={styles.menuDescription}>Dados</Text>
        </TouchableOpacity>

        {isAdmin && (
          <>
            <TouchableOpacity
              style={[styles.menuCard, styles.adminCard]}
              onPress={() => navigation.navigate('AdminRestaurants')}
            >
              <Text style={styles.menuIcon}>🏪</Text>
              <Text style={[styles.menuText, styles.adminText]}>Admin - Restaurantes</Text>
              <Text style={styles.menuDescription}>Gerenciar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuCard, styles.adminCard]}
              onPress={() => navigation.navigate('AdminProducts')}
            >
              <Text style={styles.menuIcon}>🍕</Text>
              <Text style={[styles.menuText, styles.adminText]}>Admin - Produtos</Text>
              <Text style={styles.menuDescription}>Gerenciar</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.menuCard} onPress={handleLogout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={styles.menuText}>Sair</Text>
          <Text style={styles.menuDescription}>Logout</Text>
        </TouchableOpacity>
      </View>
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
    padding: 24,
    paddingTop: 48,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#ffcccc',
    textAlign: 'center',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  menuCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b71c1c',
    textAlign: 'center',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  adminCard: {
    borderWidth: 2,
    borderColor: '#ff9800',
    backgroundColor: '#fff8e1',
  },
  adminText: {
    color: '#ff6f00',
  },
});

export default DashboardScreen;
