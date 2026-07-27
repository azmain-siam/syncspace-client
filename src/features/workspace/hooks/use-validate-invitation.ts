import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { ApiResponse } from '@/types/domain';
import { workspaceApi, type ValidateInvitationResponse } from '../api/workspace.api';

export function useValidateInvitation(token: string) {
  return useQuery<
    ApiResponse<ValidateInvitationResponse>,
    AxiosError<ApiResponse<unknown>>
  >({
    queryKey: ['invitation', 'validate', token],
    queryFn: () => workspaceApi.validateInvitation(token),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });
}
