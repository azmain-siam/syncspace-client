import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useWorkspaceStore } from '@/features/workspace/stores/use-workspace-store';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/use-auth-store';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutStore = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logoutStore();
      useWorkspaceStore.getState().clearWorkspace();
      queryClient.clear();
      toast.success('Signed out successfully.');
      router.push('/login');
    },
  });
}
