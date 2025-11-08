import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import addressReducer from './addressSlice';
import paymentReducer from './paymentSlice';
import orderReducer from './orderSlice';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    addresses: addressReducer,
    payments: paymentReducer,
    orders: orderReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;