import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    _id?: string;
    email: string;
    firstname?: string;
    lastname?: string;
    username?: string;
}

interface UserState {
    user: User | null;
    isLoggedIn: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    isLoggedIn: false,
    loading: false,
    error: null,
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isLoggedIn = !!action.payload;
        },
        setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
            state.isLoggedIn = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isLoggedIn = false;
            state.error = null;
        },
    },
})

export const {
    setUser,
    setIsLoggedIn,
    setLoading,
    setError,
    logout,
} = userSlice.actions;
    
export default userSlice.reducer;

