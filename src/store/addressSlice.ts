import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../api/api';

export const fetchAddresses = createAsyncThunk('addresses/fetch', async () => {
  return await getAddresses();
});

export const createAddressThunk = createAsyncThunk('addresses/create', async (address: any, { rejectWithValue }) => {
  try {
    const result = await createAddress(address);
    console.log('✅ createAddressThunk: Success', result);
    return result;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Unknown error';
    console.error('❌ createAddressThunk: Error', message, error?.response?.data || '');
    return rejectWithValue(message);
  }
});

export const updateAddressThunk = createAsyncThunk('addresses/update', async ({ id, address }: { id: number; address: any }, { rejectWithValue }) => {
  try {
    const result = await updateAddress(id, address);
    console.log('✅ updateAddressThunk: Success', result);
    return result;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Unknown error';
    console.error('❌ updateAddressThunk: Error', message, error?.response?.data || '');
    return rejectWithValue(message);
  }
});

export const deleteAddressThunk = createAsyncThunk('addresses/delete', async (id: number, { rejectWithValue }) => {
  try {
    const result = await deleteAddress(id);
    console.log('✅ deleteAddressThunk: Success', result);
    return result;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Unknown error';
    console.error('❌ deleteAddressThunk: Error', message, error?.response?.data || '');
    return rejectWithValue(message);
  }
});

const addressSlice = createSlice({
  name: 'addresses',
  initialState: { data: [] as any[], loading: false },
  reducers: {
    clearAddresses: (state) => {
      state.data = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => { state.loading = true; })
      .addCase(fetchAddresses.fulfilled, (state, action) => { 
        state.loading = false;
        state.data = action.payload || [];
        console.log('📍 Addresses loaded:', state.data.length);
      })
      .addCase(fetchAddresses.rejected, (state) => { state.loading = false; })
      .addCase(createAddressThunk.fulfilled, (state, action) => { 
        // Não adiciona diretamente; espera fetchAddresses no screen
        console.log('✅ Address created:', action.payload);
      })
      .addCase(updateAddressThunk.fulfilled, (state, action) => {
        // Não atualiza diretamente; espera fetchAddresses no screen
        console.log('✅ Address updated:', action.payload);
      })
      .addCase(deleteAddressThunk.fulfilled, (state, action) => {
        // Remove imediatamente para UX rápido
        state.data = state.data.filter(a => a.id !== action.meta.arg);
        console.log('🗑️ Address deleted:', action.meta.arg);
      });
  },
});

export const { clearAddresses } = addressSlice.actions;
export default addressSlice.reducer;