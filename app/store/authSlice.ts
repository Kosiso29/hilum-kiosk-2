import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Session {
    token: string;
    user?: {
        id: string;
        username: string;
        [key: string]: unknown;
    };
    expiresAt?: string;
    [key: string]: unknown;
}

interface AuthState {
    isAuthenticated: boolean;
    session: Session | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    session: null,
    loading: false,
    error: null,
};

// Async thunk for login
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/auth/login', credentials);
            return response.data.session;
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { error?: string } } };
                if (axiosError.response?.data?.error) {
                    return rejectWithValue(axiosError.response.data.error);
                }
            }
            return rejectWithValue('Network error occurred');
        }
    }
);



const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setSession: (state, action: PayloadAction<Session>) => {
            state.session = action.payload;
            state.isAuthenticated = true;
        },
        clearSession: (state) => {
            state.session = null;
            state.isAuthenticated = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.session = action.payload;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.session = null;
                state.error = action.payload as string;
            })
    },
});

export const { clearError, setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;