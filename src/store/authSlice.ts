import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, register, logout } from '../api/api';

interface AuthState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const token = await login(email, password);
      return token;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Erro ao logar');
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const token = await register(email, password);
      return token;
    } catch (err: any) {
      // Se o backend retornar algo como { message: 'Email já cadastrado' }
      // você captura essa mensagem
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao registrar';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await logout();
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
      .addCase(loginThunk.fulfilled, (state, action) => { state.loading = false; state.token = action.payload; state.error = null; })
      .addCase(loginThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(registerThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerThunk.fulfilled, (state, action) => { state.loading = false; state.token = action.payload; state.error = null; })
      .addCase(registerThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(logoutThunk.fulfilled, (state) => { state.token = null; state.error = null; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
