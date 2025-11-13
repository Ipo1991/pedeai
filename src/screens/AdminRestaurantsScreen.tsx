import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/ApiService';
import SnackbarNotification from '../components/SnackbarNotification';

interface Restaurant {
  id: number;
  name: string;
  category: string;
  delivery_time: string;
  image: string;
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

export default function AdminRestaurantsScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [searchText, setSearchText] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info' });
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    image: 'https://via.placeholder.com/300x200',
  });

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const response = await api.get('/restaurants');
      setRestaurants(response.data);
      setFilteredRestaurants(response.data);
    } catch (error) {
      console.error('Erro ao carregar restaurantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(text.toLowerCase()) ||
          restaurant.category.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        image: formData.image,
      };

      if (editingRestaurant) {
        await api.patch(`/restaurants/${editingRestaurant.id}`, payload);
        setModalVisible(false);
        resetForm();
        loadRestaurants();
        setTimeout(() => {
          setSnackbar({ visible: true, message: 'Restaurante atualizado com sucesso!', type: 'success' });
        }, 100);
      } else {
        await api.post('/restaurants', payload);
        setModalVisible(false);
        resetForm();
        loadRestaurants();
        setTimeout(() => {
          setSnackbar({ visible: true, message: 'Restaurante criado com sucesso!', type: 'success' });
        }, 100);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao salvar restaurante';
      setSnackbar({ visible: true, message: errorMessage, type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    console.log('🗑️ handleDelete restaurante chamado com ID:', id);
    console.log('🔑 Token no axios:', api.defaults.headers.common['Authorization']);
    
    const confirmed = window.confirm('Deseja realmente excluir este restaurante?');
    
    if (!confirmed) {
      console.log('❌ Exclusão cancelada pelo usuário');
      return;
    }

    try {
      console.log('🗑️ Enviando requisição DELETE para /restaurants/' + id);
      const response = await api.delete(`/restaurants/${id}`);
      console.log('✅ Restaurante deletado com sucesso:', response.data);
      loadRestaurants();
      setSnackbar({ visible: true, message: 'Restaurante excluído com sucesso!', type: 'success' });
    } catch (error: any) {
      console.error('❌ Erro ao deletar restaurante:', error);
      console.error('Response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao excluir restaurante';
      setSnackbar({ visible: true, message: errorMessage, type: 'error' });
    }
  };

  const openModal = (restaurant?: Restaurant) => {
    if (restaurant) {
      setEditingRestaurant(restaurant);
      setFormData({
        name: restaurant.name,
        category: restaurant.category,
        image: restaurant.image || '',
      });
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingRestaurant(null);
    setFormData({
      name: '',
      category: '',
      image: 'https://via.placeholder.com/300x200',
    });
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <View style={styles.restaurantCard}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      ) : (
        <Text style={styles.restaurantEmoji}>
          {categoryEmojis[item.category] || '🍽️'}
        </Text>
      )}
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantCategory}>{item.category}</Text>
        {item.delivery_time && (
          <Text style={styles.restaurantDetails}>
            🕐 {item.delivery_time}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openModal(item)} style={styles.editButton}>
          <Ionicons name="create-outline" size={24} color="#FF6B35" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciar Restaurantes</Text>
        <TouchableOpacity onPress={() => openModal()} style={styles.addButton}>
          <Ionicons name="add-circle" size={32} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou categoria..."
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Carregando...</Text>
      ) : (
        <FlatList
          data={filteredRestaurants}
          renderItem={renderRestaurant}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum restaurante encontrado</Text>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingRestaurant ? 'Editar Restaurante' : 'Novo Restaurante'}
            </Text>

            <ScrollView style={styles.form}>
              <Text style={styles.label}>Nome *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Nome do restaurante"
              />

              <Text style={styles.label}>Categoria *</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="Ex: Italiana, Japonesa, Brasileira"
              />

              <Text style={styles.label}>URL da Imagem</Text>
              <TextInput
                style={styles.input}
                value={formData.image}
                onChangeText={(text) => setFormData({ ...formData, image: text })}
                placeholder="https://..."
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={[styles.modalButton, styles.saveButton]}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SnackbarNotification
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        duration={4000}
        onDismiss={() => setSnackbar({ visible: false, message: '', type: 'info' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 4,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
  list: {
    padding: 16,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  restaurantEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  restaurantCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  restaurantDetails: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  form: {
    maxHeight: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
