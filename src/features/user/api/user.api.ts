import { apiClient } from '@/lib/api/api-client';
import type {
  ApiResponse,
  UserProfile,
  UpdateUserRequest,
  ChangePasswordRequest,
} from '@/types/domain';

export const userApi = {
  getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
    const res = await apiClient.get<ApiResponse<UserProfile>>('/user/me');
    return res.data;
  },

  updateProfile: async (
    data: UpdateUserRequest,
  ): Promise<ApiResponse<UserProfile>> => {
    const res = await apiClient.patch<ApiResponse<UserProfile>>('/user/me', data);
    return res.data;
  },

  uploadAvatar: async (
    file: File | Blob,
  ): Promise<ApiResponse<UserProfile>> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await apiClient.post<ApiResponse<UserProfile>>(
      '/user/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return res.data;
  },

  changePassword: async (
    data: ChangePasswordRequest,
  ): Promise<ApiResponse<{ message: string }>> => {
    const res = await apiClient.patch<ApiResponse<{ message: string }>>(
      '/user/change-password',
      data,
    );
    return res.data;
  },
};
