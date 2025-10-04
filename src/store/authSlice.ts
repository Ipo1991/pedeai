import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, register, logout } from '../api/api';

export const loginThunk = createAsyncThunk('auth/login', async ({ email, password }: { email: string; password: string }) => {
  return await login(email, password);
});

export const registerThunk = createAsyncThunk('auth/register', async ({ email, password }: { email: string; password: string }) => {
  return await register(email, password);
});

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: null as string | null, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => { state.loading = true; })
      .addCase(loginThunk.fulfilled, (state, action) => { state.loading = false; state.token = action.payload; })
      .addCase(registerThunk.fulfilled, (state, action) => { state.loading = false; state.token = action.payload; })
      .addCase(logoutThunk.fulfilled, (state) => { state.token = null; });
  },
});

export default authSlice.reducer;