import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../api/api';

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  return await getCart();
});

export const addToCartThunk = createAsyncThunk('cart/add', async (item: any) => {
  return await addToCart(item);
});

export const updateCartItemThunk = createAsyncThunk('cart/update', async ({ id, item }: { id: number; item: any }) => {
  return await updateCartItem(id, item);
});

export const removeFromCartThunk = createAsyncThunk('cart/remove', async (id: number) => {
  return await removeFromCart(id);
});

export const clearCartThunk = createAsyncThunk('cart/clear', async () => {
  await clearCart();
  return { items: [] };
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { data: { items: [] } as any, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => { state.data = action.payload; })
      .addCase(addToCartThunk.fulfilled, (state, action) => { state.data = action.payload; })
      .addCase(updateCartItemThunk.fulfilled, (state, action) => { state.data = action.payload; })
      .addCase(removeFromCartThunk.fulfilled, (state, action) => { state.data = action.payload; })
      .addCase(clearCartThunk.fulfilled, (state, action) => { state.data = action.payload; });
  },
});

export default cartSlice.reducer;