import axiosInstance from "./axios-utils";
import type { AccountType, AuthUser, SignupData } from "../../redux-toolkit/authSlice";

interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    token?: string;
    user?: T;
}

export const sendOtpRequest = (email: string) =>
    axiosInstance.post<ApiResponse>("/api/auth/sendotp", { email });

export const signupRequest = (signupData: SignupData, otp: string) =>
    axiosInstance.post<ApiResponse<AuthUser>>("/api/auth/signup", {
        ...signupData,
        otp,
    });

export const loginRequest = (email: string, password: string) =>
    axiosInstance.post<ApiResponse<AuthUser>>("/api/auth/login", {
        email,
        password,
    });

export const getMeRequest = () =>
    axiosInstance.get<ApiResponse<AuthUser>>("/api/auth/me");

export const roleOptions: AccountType[] = ["Operator", "Manager", "Admin"];
