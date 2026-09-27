import { useQuery } from '@tanstack/react-query';
import { sprintApi } from '../api/sprint.api';
import { sprintKeys } from './sprint-keys';
import type { SprintQueryParams, PaginatedSprintsResponse } from '../types/sprint.types';
import type { ApiResponse } from '@/types/domain';

export function useProjectSprints(projectId: string, params?: SprintQueryParams) {
  return useQuery<ApiResponse<PaginatedSprintsResponse>>({
    queryKey: sprintKeys.projectSprints(projectId, params),
    queryFn: () => sprintApi.getProjectSprints(projectId, params),
    enabled: Boolean(projectId),
    staleTime: 1000 * 30,
  });
}
