import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import api from '../services/ApiService';

interface Order {
  id: number;
  status: string;
  total: string;
  createdAt: string;
}

const StatisticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadMyStatistics();
  }, []);

  const loadMyStatistics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/my');
      console.log('My orders:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao carregar minhas estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusEmoji = (status: string) => {
    const emojis: { [key: string]: string } = {
      pending: '⏳',
      confirmed: '✅',
      preparing: '👨‍🍳',
      delivering: '🚚',
      delivered: '📦',
      cancelled: '❌',
    };
    return emojis[status] || '❓';
  };

  const translateStatus = (status: string) => {
    const translations: { [key: string]: string } = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      delivering: 'Entregando',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };
    return translations[status] || status;
  };

  const calculateStats = () => {
    const totalOrders = orders.length;
    const totalSpent = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + Number(order.total), 0);
    
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

    return {
      totalOrders,
      totalSpent,
      completedOrders,
      cancelledOrders,
      ordersByStatus,
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b71c1c" />
        <Text style={styles.loadingText}>Carregando suas estatísticas...</Text>
      </View>
    );
  }

  const stats = calculateStats();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Minhas Estatísticas</Text>
        <Text style={styles.subtitle}>Resumo dos seus pedidos</Text>
      </View>

      {/* Métricas Principais */}
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Text style={styles.metricIcon}>📦</Text>
            <Text style={styles.metricValue}>{stats.totalOrders}</Text>
            <Text style={styles.metricLabel}>Total de Pedidos</Text>
          </Card.Content>
        </Card>

        <Card style={styles.metricCard}>
          <Card.Content>
            <Text style={styles.metricIcon}>💰</Text>
            <Text style={styles.metricValue}>R$ {stats.totalSpent.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Total Gasto</Text>
          </Card.Content>
        </Card>

        <Card style={styles.metricCard}>
          <Card.Content>
            <Text style={styles.metricIcon}>✅</Text>
            <Text style={styles.metricValue}>{stats.completedOrders}</Text>
            <Text style={styles.metricLabel}>Pedidos Entregues</Text>
          </Card.Content>
        </Card>

        <Card style={styles.metricCard}>
          <Card.Content>
            <Text style={styles.metricIcon}>❌</Text>
            <Text style={styles.metricValue}>{stats.cancelledOrders}</Text>
            <Text style={styles.metricLabel}>Cancelados</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Status dos Pedidos */}
      {Object.keys(stats.ordersByStatus).length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="Status dos Seus Pedidos" titleStyle={styles.cardTitle} />
          <Card.Content>
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <View key={status} style={styles.statusRow}>
                <Text style={styles.statusLabel}>
                  {getStatusEmoji(status)} {translateStatus(status)}
                </Text>
                <Text style={styles.statusValue}>{String(count)}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Ticket Médio */}
      {stats.completedOrders > 0 && (
        <Card style={styles.card}>
          <Card.Title title="💳 Ticket Médio" titleStyle={styles.cardTitle} />
          <Card.Content>
            <View style={styles.ticketContainer}>
              <Text style={styles.ticketValue}>
                R$ {(stats.totalSpent / stats.completedOrders).toFixed(2)}
              </Text>
              <Text style={styles.ticketLabel}>Valor médio por pedido entregue</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {orders.length === 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.noDataText}>
              Você ainda não fez nenhum pedido.{'\n'}
              Explore nossos restaurantes e faça seu primeiro pedido!
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#b71c1c',
  },
  header: {
    backgroundColor: '#b71c1c',
    padding: 24,
    paddingTop: 48,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#ffcccc',
    textAlign: 'center',
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
  },
  metricIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#b71c1c',
    textAlign: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fff',
  },
  cardTitle: {
    color: '#b71c1c',
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 14,
    color: '#333',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b71c1c',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 16,
    lineHeight: 22,
  },
  ticketContainer: {
    alignItems: 'center',
    padding: 16,
  },
  ticketValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#b71c1c',
    marginBottom: 8,
  },
  ticketLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default StatisticsScreen;
