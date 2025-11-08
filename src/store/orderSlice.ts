import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrders, createOrder, updateOrder, deleteOrder } from '../api/api';

export const fetchOrders = createAsyncThunk('orders/fetch', async () => {
  return await getOrders();
});

export const createOrderThunk = createAsyncThunk('orders/create', async (order: any) => {
  return await createOrder(order);
});

export const updateOrderThunk = createAsyncThunk('orders/update', async ({ id, order }: { id: number; order: any }) => {
  return await updateOrder(id, order);
});

export const cancelOrderThunk = createAsyncThunk('orders/cancel', async (id: number) => {
  return await deleteOrder(id);
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { data: [] as any[], loading: false },
  reducers: {
    clearOrders: (state) => {
      state.data = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.fulfilled, (state, action) => { state.data = action.payload; })
      .addCase(createOrderThunk.fulfilled, (state, action) => { state.data.push(action.payload); })
      .addCase(updateOrderThunk.fulfilled, (state, action) => {
        const index = state.data.findIndex(o => o.id === action.meta.arg.id);
        if (index !== -1) state.data[index] = { ...state.data[index], ...action.payload };
      })
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        state.data = state.data.filter(o => o.id !== action.meta.arg);
      });
  },
});

export const { clearOrders } = orderSlice.actions;
export default orderSlice.reducer;