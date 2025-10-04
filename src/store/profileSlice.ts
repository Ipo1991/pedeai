import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProfile, updateProfile } from '../api/api';

interface Profile {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  notifications?: boolean;
}

export const fetchProfile = createAsyncThunk('profile/fetch', async () => {
  return await getProfile();
});

export const updateProfileThunk = createAsyncThunk('profile/update', async (profile: Profile) => {
  return await updateProfile(profile);
});

const profileSlice = createSlice({
  name: 'profile',
  initialState: { data: {} as Profile, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => { state.data = action.payload; })
      .addCase(updateProfileThunk.fulfilled, (state, action) => { state.data = action.payload; });
  },
});

export default profileSlice.reducer;