import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse, UserProfile, UpdateUserRequest } from '@/types/domain';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { userApi } from '../api/user.api';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<
    ApiResponse<UserProfile>,
    AxiosError<ApiResponse<unknown>>,
    UpdateUserRequest
  >({
    mutationFn: (data: UpdateUserRequest) => userApi.updateProfile(data),
    onSuccess: (response) => {
      const updatedUser = response.data;
      if (updatedUser) {
        setUser(updatedUser);
        queryClient.setQueryData(['user', 'me'], response);
      }
      toast.success(response.message || 'Profile updated successfully!');
    },
    onError: (error) => {
      const errorMessage = formatApiErrorMessage(
        error,
        'Failed to update profile. Please try again.',
      );
      toast.error(errorMessage);
    },
  });
}
