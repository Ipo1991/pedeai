import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Button, Card, IconButton } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCartThunk, clearCartThunk } from '../store/cartSlice';
import { RootState } from '../store/store';
import SnackbarNotification from '../components/SnackbarNotification';
import { fetchRestaurants, fetchRestaurantProducts } from '../api/api';

type RestaurantDetailRouteProp = RouteProp<RootStackParamList, 'RestaurantDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RestaurantDetail'>;

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  isAvailable: boolean;
}

interface Restaurant {
  id: number;
  name: string;
  category: string;
  delivery_time: string;
  image?: string;
  is_active: boolean;
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

const productEmojiMap: Record<string, string> = {
  'burger': '🍔',
  'pizza': '🍕',
  'sushi': '🍣',
  'taco': '🌮',
  'pasta': '🍝',
  'drink': '🥤',
  'dessert': '�',
  'default': '🍽️',
};

const RestaurantDetailScreen: React.FC = () => {
  const route = useRoute<RestaurantDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state: RootState) => state.cart.data) || { items: [] };
  
  const { id } = route.params;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [isNavigatingToCart, setIsNavigatingToCart] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info' });

  const getProductEmoji = (productName: string): string => {
    const name = productName.toLowerCase();
    if (name.includes('pizza')) return '🍕';
    if (name.includes('burger') || name.includes('hambúrguer')) return '🍔';
    if (name.includes('sushi') || name.includes('temaki') || name.includes('sashimi') || name.includes('roll')) return '🍣';
    if (name.includes('taco') || name.includes('burrito') || name.includes('nachos')) return '🌮';
    if (name.includes('feijoada') || name.includes('marmita')) return '🍲';
    if (name.includes('parmegiana') || name.includes('bife')) return '🥩';
    if (name.includes('bebida') || name.includes('suco') || name.includes('refrigerante')) return '🥤';
    if (name.includes('sobremesa') || name.includes('doce')) return '🍰';
    return '🍽️';
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [restaurantsData, productsData] = await Promise.all([
          fetchRestaurants(),
          fetchRestaurantProducts(id)
        ]);
        
        const foundRestaurant = restaurantsData.find((r: Restaurant) => r.id === id);
        if (!foundRestaurant) {
          setError('Restaurante não encontrado');
          return;
        }
        
        setRestaurant(foundRestaurant);
        setProducts(productsData.filter((p: Product) => p.isAvailable));
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar informações do restaurante');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#b71c1c" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error || 'Restaurante não encontrado'}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} buttonColor="#b71c1c">
          Voltar
        </Button>
      </View>
    );
  }

  const getQuantity = (productId: number) => quantities[productId] || 0;

  const incrementQuantity = (productId: number) => {
    setQuantities(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const decrementQuantity = (productId: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      if (current <= 0) return prev;
      return { ...prev, [productId]: current - 1 };
    });
  };

  const addToCart = (product: Product) => {
    const quantity = getQuantity(product.id);
    if (quantity === 0) {
      setSnackbar({ visible: true, message: 'Selecione a quantidade do produto', type: 'warning' });
      return;
    }

    // Impede misturar restaurantes no carrinho
    const hasDifferentRestaurant = (cart.items || []).length > 0 &&
      (cart.items as any[]).some((i: any) => i.restaurantId !== restaurant.id);

    const proceedAdd = () => {
      // Reseta quantidade ANTES do dispatch para evitar state inconsistente
      const qtyToAdd = quantity;
      setQuantities(prev => ({ ...prev, [product.id]: 0 }));
      
      dispatch(addToCartThunk({
        ...product,
        productId: product.id,
        quantity: qtyToAdd,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
      }));
      
      // Feedback visual não-bloqueante
      setSnackbar({ 
        visible: true, 
        message: `✅ ${qtyToAdd}x ${product.name} adicionado`, 
        type: 'success' 
      });
      console.log(`✅ ${qtyToAdd}x ${product.name} adicionado ao carrinho`);
    };

    if (hasDifferentRestaurant) {
      // Web não suporta Alert multi-botão; usar confirm simples
      const userConfirmed = window.confirm(
        'Seu carrinho possui itens de outro restaurante. Deseja limpar o carrinho para adicionar deste restaurante?'
      );
      if (userConfirmed) {
        (dispatch as any)(clearCartThunk()).then(() => {
          proceedAdd();
        }).catch(() => {
          proceedAdd();
        });
      }
      return;
    }

    proceedAdd();
  };

  const goToCart = () => {
    setIsNavigatingToCart(true);
    navigation.navigate('Cart');
  };

  const cartItemCount = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header do Restaurante */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <Text style={styles.restaurantImage}>
                {categoryEmojis[restaurant.category] || '🍽️'}
              </Text>
              <View style={styles.headerInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.category}>{restaurant.category}</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detail}>🕐 {restaurant.delivery_time}</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Cardápio</Text>

        {products.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum produto disponível no momento</Text>
        ) : (
          products.map((product) => (
            <Card key={product.id} style={styles.productCard}>
              <Card.Content>
                <View style={styles.productHeader}>
                  {product.image ? (
                    <Image source={{ uri: product.image }} style={styles.productImagePhoto} />
                  ) : (
                    <Text style={styles.productImageEmoji}>
                      {getProductEmoji(product.name)}
                    </Text>
                  )}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productDescription}>{product.description}</Text>
                    <Text style={styles.productPrice}>R$ {Number(product.price).toFixed(2)}</Text>
                  </View>
                </View>
                
                <View style={styles.productActions}>
                  <View style={styles.quantityControl}>
                    <IconButton
                      icon="minus"
                      size={20}
                      iconColor="#b71c1c"
                      style={styles.quantityButton}
                      onPress={() => decrementQuantity(product.id)}
                    />
                    <Text style={styles.quantityText}>{getQuantity(product.id)}</Text>
                    <IconButton
                      icon="plus"
                      size={20}
                      iconColor="#b71c1c"
                      style={styles.quantityButton}
                      onPress={() => incrementQuantity(product.id)}
                    />
                  </View>
                  <Button
                  mode="contained"
                  buttonColor="#b71c1c"
                  textColor="#fff"
                  style={styles.addButton}
                  onPress={() => addToCart(product)}
                >
                  Adicionar
                </Button>
              </View>
            </Card.Content>
          </Card>
          ))
        )}
      </ScrollView>

      {/* Botão flutuante do carrinho */}
      {cartItemCount > 0 && (
        <Button
          mode="contained"
          buttonColor="#b71c1c"
          textColor="#fff"
          style={styles.floatingButton}
          onPress={goToCart}
          icon="cart"
        >
          Ver Carrinho ({cartItemCount})
        </Button>
      )}

      {/* Snackbar para feedback */}
      <SnackbarNotification
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
      />
    </View>
  );
};

export default RestaurantDetailScreen;

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 100 },
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
  errorText: { fontSize: 18, color: '#b71c1c', textAlign: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
  headerCard: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#ffe5e5',
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantImage: {
    fontSize: 56,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 24,
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#b71c1c',
  },
  productCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImagePhoto: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  productImageEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    color: '#333',
  },
  productDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#b71c1c',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  quantityButton: {
    margin: 0,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
  },
  addButton: {
    borderRadius: 8,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 12,
    elevation: 4,
  },
});