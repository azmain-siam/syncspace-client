import { useQuery } from '@tanstack/react-query';
import { sprintApi } from '../api/sprint.api';
import { sprintKeys } from './sprint-keys';
import type { Sprint } from '../types/sprint.types';
import type { ApiResponse } from '@/types/domain';

export function useSprintDetails(sprintId?: string | null) {
  return useQuery<ApiResponse<Sprint>>({
    queryKey: sprintKeys.sprint(sprintId || ''),
    queryFn: () => sprintApi.getSprint(sprintId!),
    enabled: Boolean(sprintId),
    staleTime: 1000 * 30,
  });
}
