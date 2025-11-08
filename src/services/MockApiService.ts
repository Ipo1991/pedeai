// Mock API Service para desenvolvimento sem backend
// Para usar, importe este arquivo ao invés do ApiService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_TOKEN = 'mock-jwt-token-12345';
const MOCK_DELAY = 500; // Simula delay de rede

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simula armazenamento persistente usando AsyncStorage
const STORAGE_KEYS = {
  USERS: '@mock:users',
  ADDRESSES: '@mock:addresses',
  PAYMENTS: '@mock:payments',
  CART: '@mock:cart',
  ORDERS: '@mock:orders',
};

const getStorageItem = async (key: string, defaultValue: any) => {
  try {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to AsyncStorage:', e);
  }
};

// Cache em memória para melhor performance
let mockUsers: any[] = [];
let mockAddresses: any[] = [];
let mockPayments: any[] = [];
let mockCart: any = { items: [] };
let mockOrders: any[] = [];
let currentUserId: number | null = null;
// Fila simples para serializar mutações do carrinho e evitar condições de corrida
let cartQueue: Promise<any> = Promise.resolve();

// Inicializa os dados do AsyncStorage
let initialized = false;
const initializeStorage = async () => {
  if (initialized) return;
  // Cria cópias mutáveis para evitar "object is not extensible"
  mockUsers = [...(await getStorageItem(STORAGE_KEYS.USERS, []))];
  mockAddresses = [...(await getStorageItem(STORAGE_KEYS.ADDRESSES, []))];
  mockPayments = [...(await getStorageItem(STORAGE_KEYS.PAYMENTS, []))];
  mockCart = { items: [...((await getStorageItem(STORAGE_KEYS.CART, { items: [] })).items || [])] };
  mockOrders = [...(await getStorageItem(STORAGE_KEYS.ORDERS, []))];
  
  // Tenta restaurar o usuário atual do localStorage
  try {
    const storedUser = await AsyncStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      currentUserId = user.id;
      console.log('🔄 Restored currentUserId:', currentUserId);
    }
  } catch (e) {
    console.log('No stored user found');
  }
  
  initialized = true;
  console.log('🔄 MockAPI: Storage initialized', { 
    users: mockUsers.length, 
    addresses: mockAddresses.length, 
    payments: mockPayments.length, 
    orders: mockOrders.length 
  });
};

const mockApi = {
  post: async (url: string, data: any) => {
    console.log('🔵 MockAPI POST:', url, data);
    await initializeStorage();
    await delay(MOCK_DELAY);
    
    if (url === '/auth/login') {
      const user = mockUsers.find(u => u.email === data.email);
      if (user && user.password === data.password) {
        currentUserId = user.id; // Armazena o usuário atual
        return { data: { accessToken: MOCK_TOKEN, user } };
      }
      throw new Error('Credenciais inválidas');
    }
    
    if (url === '/auth/register') {
      const { password, ...userDataWithoutPassword } = data;
      const newUser = {
        id: mockUsers.length + 1,
        ...userDataWithoutPassword,
        createdAt: new Date().toISOString()
      };
      mockUsers.push({ ...newUser, password }); // Store with password for login
      await setStorageItem(STORAGE_KEYS.USERS, mockUsers);
      currentUserId = newUser.id; // Armazena o usuário atual
      return { data: { accessToken: MOCK_TOKEN, refreshToken: 'mock-refresh-token', user: newUser } };
    }
    
    if (url === '/auth/logout') {
      currentUserId = null; // Limpa o usuário atual
      return { data: { message: 'Logout successful' } };
    }
    
    if (url === '/users/me/addresses') {
      console.log('📍 MockAPI: Creating address, current array:', mockAddresses);
      try {
        // Recarrega do storage para garantir array mutável
        const storedAddresses = await getStorageItem(STORAGE_KEYS.ADDRESSES, []);
        mockAddresses = Array.isArray(storedAddresses) ? [...storedAddresses] : [];
        console.log('📍 MockAPI: Reloaded from storage:', mockAddresses.length);
        
        const maxId = mockAddresses.length > 0 ? Math.max(...mockAddresses.map(a => a.id || 0)) : 0;
        const newAddress = { id: maxId + 1, userId: currentUserId, ...data };
        console.log('📍 MockAPI: New address prepared:', newAddress);
        
        // Cria novo array com o novo item
        mockAddresses = [...mockAddresses, newAddress];
        console.log('📍 MockAPI: New array created, length:', mockAddresses.length);
        
        await setStorageItem(STORAGE_KEYS.ADDRESSES, mockAddresses);
        console.log('📍 MockAPI: Saved to storage');
        return { data: newAddress };
      } catch (error) {
        console.error('❌ MockAPI: Error creating address:', error);
        throw error;
      }
    }
    
    if (url === '/users/me/payments') {
      console.log('💳 MockAPI: Creating payment, current array:', mockPayments);
      try {
        // Recarrega do storage para garantir array mutável
        const storedPayments = await getStorageItem(STORAGE_KEYS.PAYMENTS, []);
        mockPayments = Array.isArray(storedPayments) ? [...storedPayments] : [];
        console.log('💳 MockAPI: Reloaded from storage:', mockPayments.length);
        
        const maxId = mockPayments.length > 0 ? Math.max(...mockPayments.map(p => p.id || 0)) : 0;
        const newPayment = { id: maxId + 1, userId: currentUserId, ...data };
        console.log('💳 MockAPI: New payment prepared:', newPayment);
        
        // Cria novo array com o novo item
        mockPayments = [...mockPayments, newPayment];
        console.log('💳 MockAPI: New array created, length:', mockPayments.length);
        
        await setStorageItem(STORAGE_KEYS.PAYMENTS, mockPayments);
        console.log('💳 MockAPI: Saved to storage');
        return { data: newPayment };
      } catch (error) {
        console.error('❌ MockAPI: Error creating payment:', error);
        throw error;
      }
    }
    
// Aceita /cart/items e variações com possíveis sufixos
if (url.startsWith('/cart/items')) {
  const result = await (cartQueue = cartQueue.then(async () => {
    try {
      console.log('🛒 [QUEUE] Processing add for product:', data.id, data.name);
      
      // Recarrega storage para obter estado mais recente
      const storedCart = await getStorageItem(STORAGE_KEYS.CART, { items: [] });
      const rawItems = Array.isArray(storedCart.items) ? storedCart.items : [];
      console.log('🛒 [QUEUE] Current cart has', rawItems.length, 'items');
      
      // NORMALIZA itens existentes antes de adicionar novo
      // CRIA NOVO OBJETO ao invés de modificar mockCart diretamente (pode ser read-only)
      const normalizedItems = rawItems.map((item: any) => ({
        id: item.id,
        name: item.name || '',
        price: item.price || 0,
        description: item.description || '',
        image: item.image || '',
        quantity: item.quantity || item.qty || 1,
        restaurantId: item.restaurantId || item.restId || item.r,
        restaurantName: item.restaurantName || ''
      }));
      console.log('🛒 [QUEUE] Items normalized');

      // Sanitiza e NORMALIZA payload do novo item
      const incomingQuantity = typeof data.quantity === 'number' && data.quantity > 0 ? data.quantity : 1;
      const incomingRestaurantId = data.restaurantId ?? data.restId ?? data.restaurantID ?? data.r;
      const normalizedData = {
        id: data.id,
        name: data.name || '',
        price: data.price || 0,
        description: data.description || '',
        image: data.image || '',
        quantity: incomingQuantity,
        restaurantId: incomingRestaurantId,
        restaurantName: data.restaurantName || '',
      };
      console.log('🛒 [QUEUE] New item normalized');

      // Localiza item existente (mesmo produto e mesmo restaurante)
      const existingIndex = normalizedItems.findIndex((item: any) => item.id === normalizedData.id && item.restaurantId === normalizedData.restaurantId);

      let updatedItems;
      if (existingIndex !== -1) {
        console.log('🛒 Incrementing quantity for existing product');
        updatedItems = [...normalizedItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + normalizedData.quantity
        };
      } else {
        console.log('🛒 Adding new product to cart');
        updatedItems = [...normalizedItems, normalizedData];
      }
      console.log('🛒 [QUEUE] Cart updated in memory');

      const newCart = { items: updatedItems };
      mockCart = newCart;
      console.log('🛒 [QUEUE] About to save to storage...');
      await setStorageItem(STORAGE_KEYS.CART, newCart);
      console.log('🛒 [QUEUE] Cart saved. Total items:', newCart.items.length);

      return { data: newCart };
    } catch (error) {
      console.error('❌ [QUEUE] Error processing cart add:', error);
      throw error;
    }
  }));
  return result;
} else if (url.includes('/cart/items')) {
  console.log('🛒 ⚠️ POST caiu em /cart/items mas condição exata falhou para url:', url);
}
    
    if (url === '/orders') {
      const newOrder = { 
        id: mockOrders.length + 1, 
        ...data, 
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      mockOrders.push(newOrder);
      await setStorageItem(STORAGE_KEYS.ORDERS, mockOrders);
      return { data: newOrder };
    }
    
    return { data: { message: 'Success' } };
  },
  
  get: async (url: string) => {
    await initializeStorage();
    await delay(MOCK_DELAY);
    
    if (url === '/users/me') {
      return { data: mockUsers[0] || { id: 1, name: 'Usuário Teste', email: 'teste@example.com' } };
    }
    
    if (url === '/users/me/addresses') {
      // Retorna apenas endereços do usuário logado
      const userAddresses = currentUserId 
        ? mockAddresses.filter(address => address.userId === currentUserId)
        : [];
      console.log('📍 MockAPI: Fetching addresses for user', currentUserId, 'count:', userAddresses.length);
      return { data: userAddresses };
    }
    
    if (url === '/users/me/payments') {
      // Retorna apenas pagamentos do usuário logado
      const userPayments = currentUserId 
        ? mockPayments.filter(payment => payment.userId === currentUserId)
        : [];
      console.log('💳 MockAPI: Fetching payments for user', currentUserId, 'count:', userPayments.length);
      return { data: userPayments };
    }
    
    if (url === '/cart') {
      // AGUARDA a fila terminar antes de ler, mas NÃO entra na fila
      await cartQueue;
      
      // Recarrega do storage para obter estado mais recente
      const storedCart = await getStorageItem(STORAGE_KEYS.CART, { items: [] });
      const rawItems = Array.isArray(storedCart.items) ? storedCart.items : [];
      
      // NORMALIZA itens corrompidos - garante que campos estejam corretos
      const safeItems = rawItems.map((item: any) => ({
        id: item.id,
        name: item.name || '',
        price: item.price || 0,
        description: item.description || '',
        image: item.image || '',
        quantity: item.quantity || item.qty || 1, // Aceita qty mas converte para quantity
        restaurantId: item.restaurantId || item.restId || item.r, // Aceita variações
        restaurantName: item.restaurantName || ''
      }));
      
      mockCart = { items: safeItems };
      
      // Salva a versão normalizada de volta no storage
      if (safeItems.length > 0) {
        await setStorageItem(STORAGE_KEYS.CART, { items: safeItems });
      }
      
      console.log('🛒 GET /cart returned', safeItems.length, 'items');
      return { data: { items: safeItems.map((i: any) => ({ ...i })) } };
    }
    
    if (url === '/orders') {
      // Retorna apenas pedidos do usuário logado
      const userOrders = currentUserId 
        ? mockOrders.filter(order => order.userId === currentUserId)
        : [];
      console.log('📦 MockAPI: Fetching orders for user', currentUserId, 'count:', userOrders.length);
      return { data: userOrders };
    }
    
    if (url === '/restaurants') {
      return { 
        data: [
          { id: 1, name: 'Restaurante 1', category: 'Italiana', rating: 4.5 },
          { id: 2, name: 'Restaurante 2', category: 'Japonesa', rating: 4.8 },
        ]
      };
    }
    
    if (url.startsWith('/restaurants/') && url.endsWith('/products')) {
      return {
        data: [
          { id: 1, name: 'Produto 1', price: 25.90, description: 'Descrição do produto 1' },
          { id: 2, name: 'Produto 2', price: 35.90, description: 'Descrição do produto 2' },
        ]
      };
    }
    
    return { data: {} };
  },
  
  put: async (url: string, data: any) => {
    await initializeStorage();
    await delay(MOCK_DELAY);
    
    if (url === '/users/me') {
      if (mockUsers[0]) {
        mockUsers[0] = { ...mockUsers[0], ...data };
        await setStorageItem(STORAGE_KEYS.USERS, mockUsers);
        return { data: mockUsers[0] };
      }
    }
    
    if (url.includes('/addresses/')) {
      const id = parseInt(url.split('/').pop() || '0');
      const index = mockAddresses.findIndex(a => a.id === id);
      if (index !== -1) {
        mockAddresses[index] = { ...mockAddresses[index], ...data };
        await setStorageItem(STORAGE_KEYS.ADDRESSES, mockAddresses);
        console.log('📍 MockAPI: Updated address', mockAddresses[index]);
        return { data: mockAddresses[index] };
      }
      console.warn('⚠️ MockAPI: Address not found for update, id:', id);
    }
    
    if (url.includes('/payments/')) {
      const id = parseInt(url.split('/').pop() || '0');
      const index = mockPayments.findIndex(p => p.id === id);
      if (index !== -1) {
        mockPayments[index] = { ...mockPayments[index], ...data };
        await setStorageItem(STORAGE_KEYS.PAYMENTS, mockPayments);
        return { data: mockPayments[index] };
      }
    }
    
    if (url.includes('/cart/items/')) {
      const id = parseInt(url.split('/').pop() || '0');
      const result = await (cartQueue = cartQueue.then(async () => {
        const storedCart = await getStorageItem(STORAGE_KEYS.CART, { items: [] });
        const rawItems = Array.isArray(storedCart.items) ? storedCart.items : [];
        
        // NORMALIZA itens existentes
        mockCart.items = rawItems.map((item: any) => ({
          id: item.id,
          name: item.name || '',
          price: item.price || 0,
          description: item.description || '',
          image: item.image || '',
          quantity: item.quantity || item.qty || 1,
          restaurantId: item.restaurantId || item.restId || item.r,
          restaurantName: item.restaurantName || ''
        }));
        
        const index = mockCart.items.findIndex((item: any) => item.id === id);
        if (index !== -1) {
          // NORMALIZA dados recebidos antes de fazer merge
          const normalizedUpdate = {
            quantity: data.quantity || data.qty || mockCart.items[index].quantity,
            restaurantId: data.restaurantId || data.restId || data.r || mockCart.items[index].restaurantId,
            // Preserva outros campos importantes
            name: data.name || mockCart.items[index].name,
            price: data.price !== undefined ? data.price : mockCart.items[index].price,
            description: data.description || mockCart.items[index].description,
            image: data.image || mockCart.items[index].image,
            restaurantName: data.restaurantName || mockCart.items[index].restaurantName,
          };
          
          const updatedItem = { ...mockCart.items[index], ...normalizedUpdate };
          const newItems = [
            ...mockCart.items.slice(0, index),
            updatedItem,
            ...mockCart.items.slice(index + 1)
          ];
          mockCart = { items: newItems };
          await setStorageItem(STORAGE_KEYS.CART, mockCart);
          return { data: { items: newItems.map((i: any) => ({ ...i })) } };
        }
        return { data: { items: mockCart.items.map((i: any) => ({ ...i })) } };
      }));
      return result;
    }
    
    if (url.includes('/orders/')) {
      const id = parseInt(url.split('/').pop() || '0');
      const index = mockOrders.findIndex(o => o.id === id);
      if (index !== -1) {
        mockOrders[index] = { ...mockOrders[index], ...data };
        await setStorageItem(STORAGE_KEYS.ORDERS, mockOrders);
        return { data: mockOrders[index] };
      }
    }
    
    return { data };
  },
  
  delete: async (url: string) => {
    await initializeStorage();
    await delay(MOCK_DELAY);
    
    if (url === '/users/me') {
      // Exclui conta do usuário atual e dados relacionados
      if (currentUserId != null) {
        mockUsers = mockUsers.filter(u => u.id !== currentUserId);
        mockAddresses = mockAddresses.filter(a => a.userId !== currentUserId);
        mockPayments = mockPayments.filter(p => p.userId !== currentUserId);
        mockOrders = mockOrders.filter(o => o.userId !== currentUserId);
        await setStorageItem(STORAGE_KEYS.USERS, mockUsers);
        await setStorageItem(STORAGE_KEYS.ADDRESSES, mockAddresses);
        await setStorageItem(STORAGE_KEYS.PAYMENTS, mockPayments);
        await setStorageItem(STORAGE_KEYS.ORDERS, mockOrders);
        currentUserId = null;
      }
      return { data: { message: 'User deleted' } };
    }

    if (url.includes('/addresses/')) {
      const id = parseInt(url.split('/').pop() || '0');
      mockAddresses = mockAddresses.filter(a => a.id !== id);
      await setStorageItem(STORAGE_KEYS.ADDRESSES, mockAddresses);
      return { data: { message: 'Deleted' } };
    }
    
    if (url.includes('/payments/')) {
      const id = parseInt(url.split('/').pop() || '0');
      mockPayments = mockPayments.filter(p => p.id !== id);
      await setStorageItem(STORAGE_KEYS.PAYMENTS, mockPayments);
      return { data: { message: 'Deleted' } };
    }
    
    if (url.includes('/cart/items/')) {
      const id = parseInt(url.split('/').pop() || '0');
      const result = await (cartQueue = cartQueue.then(async () => {
        const storedCart = await getStorageItem(STORAGE_KEYS.CART, { items: [] });
        mockCart.items = Array.isArray(storedCart.items) ? [...storedCart.items] : [];
        const newItems = mockCart.items.filter((item: any) => item.id !== id);
        mockCart = { items: newItems };
        await setStorageItem(STORAGE_KEYS.CART, mockCart);
        return { data: { items: newItems.map((i: any) => ({ ...i })) } };
      }));
      return result;
    }
    
    if (url === '/cart') {
      const result = await (cartQueue = cartQueue.then(async () => {
        mockCart = { items: [] };
        await setStorageItem(STORAGE_KEYS.CART, mockCart);
        return { data: { items: [] } };
      }));
      return result;
    }
    
    if (url.includes('/orders/')) {
      const id = parseInt(url.split('/').pop() || '0');
      mockOrders = mockOrders.filter(o => o.id !== id);
      await setStorageItem(STORAGE_KEYS.ORDERS, mockOrders);
      return { data: { message: 'Deleted' } };
    }
    
    return { data: { message: 'Deleted' } };
  },
  
  defaults: {
    headers: {
      common: {} as any
    }
  },
  
  interceptors: {
    response: {
      use: (onSuccess: any, onError: any) => {}
    }
  }
};

export function setAuthToken(token: string | null) {
  if (token) {
    mockApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete mockApi.defaults.headers.common['Authorization'];
  }
}

export default mockApi;
