import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useAppDispatch } from '../store/hooks';
import { fetchRestaurants } from '../api/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Restaurants'>;

interface Restaurant {
  id: number;
  name: string;
  category: string;
  deliveryTime: string;
  image?: string;
  isActive: boolean;
}

const categoryEmojis: Record<string, string> = {
  'Italiana': '🍝',
  'Pizzaria': '🍕',
  'Japonesa': '🍣',
  'Hamburguer': '🍔',
  'Hamburgueria': '🍔',
  'Mexicana': '🌮',
  'Brasileira': '🍴',
  'Churrascaria': '🥩',
};

const RestaurantsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
  const data = await fetchRestaurants();
  setRestaurants(data.filter((r: Restaurant) => r.isActive));
    } catch (err) {
      console.error('Erro ao carregar restaurantes:', err);
      setError('Erro ao carregar restaurantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadRestaurants();
    }, [])
  );

  const handleRestaurantPress = (restaurantId: number) => {
    navigation.navigate('RestaurantDetail', { id: restaurantId });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#b71c1c" />
        <Text style={styles.loadingText}>Carregando restaurantes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadRestaurants} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Restaurantes</Text>
      <Text style={styles.subtitle}>Escolha seu favorito</Text>

      {restaurants.map((restaurant) => (
        <TouchableOpacity
          key={restaurant.id}
          onPress={() => handleRestaurantPress(restaurant.id)}
          activeOpacity={0.7}
        >
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                {restaurant.image ? (
                  <Image source={{ uri: restaurant.image }} style={styles.restaurantImagePhoto} />
                ) : (
                  <Text style={styles.restaurantImageEmoji}>
                    {categoryEmojis[restaurant.category] || '🍽️'}
                  </Text>
                )}
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.category}>{restaurant.category}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default RestaurantsScreen;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#b71c1c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#b71c1c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#b71c1c',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantImagePhoto: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
  },
  restaurantImageEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    color: '#b71c1c',
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detail: {
    fontSize: 12,
    color: '#333',
  },
});