import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPayments, createPayment, updatePayment, deletePayment } from '../api/api';

export const fetchPayments = createAsyncThunk('payments/fetch', async () => {
  return await getPayments();
});

export const createPaymentThunk = createAsyncThunk('payments/create', async (payment: any) => {
  return await createPayment(payment);
});

export const updatePaymentThunk = createAsyncThunk('payments/update', async ({ id, payment }: { id: number; payment: any }) => {
  return await updatePayment(id, payment);
});

export const deletePaymentThunk = createAsyncThunk('payments/delete', async (id: number) => {
  return await deletePayment(id);
});

const paymentSlice = createSlice({
  name: 'payments',
  initialState: { data: [] as any[], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.fulfilled, (state, action) => { state.data = action.payload; })
      .addCase(createPaymentThunk.fulfilled, (state, action) => { state.data.push(action.payload); })
      .addCase(updatePaymentThunk.fulfilled, (state, action) => {
        const index = state.data.findIndex(p => p.id === action.meta.arg.id);
        if (index !== -1) state.data[index] = { ...state.data[index], ...action.payload };
      })
      .addCase(deletePaymentThunk.fulfilled, (state, action) => {
        state.data = state.data.filter(p => p.id !== action.meta.arg);
      });
  },
});

export default paymentSlice.reducer;