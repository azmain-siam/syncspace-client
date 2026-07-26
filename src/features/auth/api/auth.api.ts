import { apiClient } from '@/lib/api/api-client';
import type { ApiResponse, User } from '@/types/domain';
import type { ForgotPasswordInput } from '../schemas/forgot-password.schema';
import type { LoginInput } from '../schemas/login.schema';
import type { RegisterInput } from '../schemas/register.schema';
import type { ResetPasswordInput } from '../schemas/reset-password.schema';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseData {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResponseData {
  message: string;
  user: User;
}

export const authApi = {
  login: async (data: LoginInput): Promise<ApiResponse<LoginResponseData>> => {
    const res = await apiClient.post<ApiResponse<LoginResponseData>>(
      '/auth/login',
      data,
    );
    return res.data;
  },

  register: async (
    data: RegisterInput,
  ): Promise<ApiResponse<RegisterResponseData>> => {
    // Strip confirmPassword before sending to backend RegisterDto
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...dto } = data;
    const res = await apiClient.post<ApiResponse<RegisterResponseData>>(
      '/auth/register',
      dto,
    );
    return res.data;
  },

  verifyEmail: async (token: string): Promise<ApiResponse<{ user?: User }>> => {
    const res = await apiClient.get<ApiResponse<{ user?: User }>>(
      `/auth/verify-email?token=${encodeURIComponent(token)}`,
    );
    return res.data;
  },

  forgotPassword: async (
    data: ForgotPasswordInput,
  ): Promise<ApiResponse<{ message: string }>> => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/forgot-password',
      data,
    );
    return res.data;
  },

  resetPassword: async (
    data: ResetPasswordInput,
  ): Promise<ApiResponse<{ message: string }>> => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/reset-password',
      data,
    );
    return res.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/logout');
    return res.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const res = await apiClient.get<ApiResponse<User>>('/user/me');
    return res.data;
  },
};
