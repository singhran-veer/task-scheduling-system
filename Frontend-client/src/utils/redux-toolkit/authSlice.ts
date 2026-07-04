import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AccountType = "Admin" | "Manager" | "Operator";

export interface AuthUser {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
    accountType: AccountType;
    image?: string;
    isEmailVerified: boolean;
}

export interface SignupData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    accountType: AccountType;
    roleSignupSecret?: string;
}

interface AuthState {
    signupData: SignupData | null;
    token: string | null;
    user: AuthUser | null;
    loading: boolean;
}

const readStoredValue = <T,>(key: string): T | null => {
    try {
        const value = localStorage.getItem(key);
        return value ? (JSON.parse(value) as T) : null;
    } catch {
        localStorage.removeItem(key);
        return null;
    }
};

const initialState: AuthState = {
    signupData: null,
    token: readStoredValue<string>("token"),
    user: readStoredValue<AuthUser>("user"),
    loading: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setSignupData: (state, action: PayloadAction<SignupData | null>) => {
            state.signupData = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setCredentials: (
            state,
            action: PayloadAction<{ token: string; user: AuthUser }>
        ) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
        },
        logout: (state) => {
            state.signupData = null;
            state.token = null;
            state.user = null;
            state.loading = false;
        },
    },
});

export const { setSignupData, setLoading, setCredentials, logout } =
    authSlice.actions;

export default authSlice.reducer;
