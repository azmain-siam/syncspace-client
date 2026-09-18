import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse, UserProfile } from '@/types/domain';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { userApi } from '../api/user.api';

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<
    ApiResponse<UserProfile>,
    AxiosError<ApiResponse<unknown>>,
    File | Blob
  >({
    mutationFn: (file: File | Blob) => userApi.uploadAvatar(file),
    onSuccess: (response) => {
      const updatedUser = response.data;
      if (updatedUser) {
        setUser(updatedUser);
        queryClient.setQueryData(['user', 'me'], response);
      }
      toast.success(response.message || 'Avatar updated successfully!');
    },
    onError: (error) => {
      const errorMessage = formatApiErrorMessage(
        error,
        'Failed to upload avatar. Please try again.',
      );
      toast.error(errorMessage);
    },
  });
}
