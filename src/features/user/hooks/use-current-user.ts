import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { ApiResponse, UserProfile } from '@/types/domain';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { userApi } from '../api/user.api';

export function useCurrentUser() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);

  const query = useQuery<ApiResponse<UserProfile>, AxiosError<ApiResponse<unknown>>>({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const res = await userApi.getCurrentUser();
      if (res.data) {
        setUser(res.data);
      }
      return res;
    },
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 1,
  });

  return {
    ...query,
    user: query.data?.data ?? null,
  };
}
