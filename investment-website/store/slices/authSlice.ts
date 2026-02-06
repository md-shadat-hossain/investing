import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
  image?: string | null;
  walletBalance?: number;
  referralCode?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Initialize state from localStorage (only on client side)
const getUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

const getAuthStatus = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  isAuthenticated: getAuthStatus(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      // Save to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },
    updateWalletBalance: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.walletBalance = action.payload;
      }
    },
  },
});

export const { setUser, clearAuth, updateWalletBalance } = authSlice.actions;
export default authSlice.reducer;
