import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Mock API functions since the main API is deprecated
const authAPI = {
  login: async (email: string, password: string): Promise<{ data: AuthResponse }> => {
    // Mock successful login for demo purposes
    const mockUser: User = {
      id: '1',
      email: email,
      name: 'Demo User',
      avatar: null,
    };
    
    const mockTokens = {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
    };

    return {
      data: {
        user: mockUser,
        ...mockTokens,
      },
    };
  },

  register: async (userData) => {
    // Mock successful registration for demo purposes
    const mockUser = {
      id: '1',
      email: userData.email,
      name: userData.name,
      avatar: null,
    };
    const mockTokens = {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
    };

    return {
      data: {
        user: mockUser,
        ...mockTokens,
      },
    };
  },

  logout: async () => {
    // Mock logout
    return { data: { success: true } };
  },
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(email, password);
      const { user, accessToken, refreshToken } = response.data;

      // Store tokens
      await AsyncStorage.setItem('userToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      return { user, accessToken, refreshToken };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      const { user, accessToken, refreshToken } = response.data;

      // Store tokens
      await AsyncStorage.setItem('userToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      return { user, accessToken, refreshToken };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authAPI.logout();
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('refreshToken');
    return true;
  } catch (error) {
    return rejectWithValue('Logout failed');
  }
});

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Mock user data for demo
        return {
          user: {
            id: '1',
            email: 'demo@combo.com',
            name: 'Demo User',
            avatar: null,
          },
          accessToken: token,
          isAuthenticated: true,
        };
      }
      return { isAuthenticated: false };
    } catch (error) {
      return rejectWithValue('Failed to initialize auth');
    }
  },
);

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Initialize
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        if (action.payload.isAuthenticated) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
