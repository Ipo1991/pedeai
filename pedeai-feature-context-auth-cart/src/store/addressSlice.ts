import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../api/api';

export const fetchAddresses = createAsyncThunk('addresses/fetch', async () => {
  return await getAddresses();
});

export const createAddressThunk = createAsyncThunk('addresses/create', async (address: any) => {
  return await createAddress(address);
});

export const updateAddressThunk = createAsyncThunk('addresses/update', async ({ id, address }: { id: number; address: any }) => {
  return await updateAddress(id, address);
});

export const deleteAddressThunk = createAsyncThunk('addresses/delete', async (id: number) => {
  return await deleteAddress(id);
});

const addressSlice = createSlice({
  name: 'addresses',
  initialState: { data: [] as any[], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.fulfilled, (state, action) => { state.data = action.payload; })
      .addCase(createAddressThunk.fulfilled, (state, action) => { state.data.push(action.payload); })
      .addCase(updateAddressThunk.fulfilled, (state, action) => {
        const index = state.data.findIndex(a => a.id === action.meta.arg.id);
        if (index !== -1) state.data[index] = { ...state.data[index], ...action.payload };
      })
      .addCase(deleteAddressThunk.fulfilled, (state, action) => {
        state.data = state.data.filter(a => a.id !== action.meta.arg);
      });
  },
});

export default addressSlice.reducer;