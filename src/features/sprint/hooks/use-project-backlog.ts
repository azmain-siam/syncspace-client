import { useQuery } from '@tanstack/react-query';
import { sprintApi } from '../api/sprint.api';
import { sprintKeys } from './sprint-keys';
import type { BacklogQueryParams, BacklogResponse } from '../types/sprint.types';
import type { ApiResponse } from '@/types/domain';

export function useProjectBacklog(projectId: string, params?: BacklogQueryParams) {
  return useQuery<ApiResponse<BacklogResponse>>({
    queryKey: sprintKeys.projectBacklog(projectId, params),
    queryFn: () => sprintApi.getProjectBacklog(projectId, params),
    enabled: Boolean(projectId),
    staleTime: 1000 * 30,
  });
}
