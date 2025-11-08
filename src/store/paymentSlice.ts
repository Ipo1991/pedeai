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
  reducers: {
    clearPayments: (state) => {
      state.data = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.fulfilled, (state, action) => { 
        state.data = action.payload || [];
        console.log('💳 Payments loaded:', state.data.length);
      })
      .addCase(createPaymentThunk.fulfilled, (state, action) => { 
        // Não atualiza diretamente; espera fetchPayments no screen
        console.log('✅ Payment created:', action.payload);
      })
      .addCase(updatePaymentThunk.fulfilled, (state, action) => {
        // Não atualiza diretamente; espera fetchPayments no screen
        console.log('✅ Payment updated:', action.payload);
      })
      .addCase(deletePaymentThunk.fulfilled, (state, action) => {
        // Remove imediatamente para UX rápido
        state.data = state.data.filter(p => p.id !== action.meta.arg);
        console.log('🗑️ Payment deleted:', action.meta.arg);
      });
  },
});

export const { clearPayments } = paymentSlice.actions;
export default paymentSlice.reducer;