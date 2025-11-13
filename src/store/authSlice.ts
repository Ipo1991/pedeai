import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, register, logout } from '../api/api';
import { setAuthToken } from '../services/ApiService';

interface AuthState {
  token: string | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  isAdmin: false,
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('=== LOGIN THUNK ===');
      console.log('Email:', email);
      const result = await login(email, password);
      console.log('Login result:', result);
      setAuthToken(result.token); // Salvar token no ApiService
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao logar';
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (
    { email, password, name, phone, birth_date }: { email: string; password: string; name: string; phone?: string; birth_date?: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await register(email, password, name, phone, birth_date);
      setAuthToken(result.token); // Salvar token no ApiService
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao registrar';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await logout();
  setAuthToken(null); // Remover token do ApiService
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => { 
        state.loading = false; 
        state.token = action.payload.token; 
        state.isAdmin = action.payload.isAdmin;
        state.error = null; 
      })
      .addCase(loginThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(registerThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerThunk.fulfilled, (state, action) => { 
        state.loading = false; 
        state.token = action.payload.token; 
        state.isAdmin = action.payload.isAdmin;
        state.error = null; 
      })
      .addCase(registerThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(logoutThunk.fulfilled, (state) => { 
        state.token = null; 
        state.isAdmin = false;
        state.error = null; 
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;