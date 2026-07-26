import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { ApiResponse, User } from '@/types/domain';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/use-auth-store';

export function useCurrentUser() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery<ApiResponse<User>, AxiosError<ApiResponse<unknown>>>({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const res = await authApi.getCurrentUser();
      if (res.data) {
        setUser(res.data);
      }
      return res;
    },
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
