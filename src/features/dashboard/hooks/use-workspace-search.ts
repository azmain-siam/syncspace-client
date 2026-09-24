'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardKeys } from './dashboard-keys';
import type { SearchResponse, SearchType } from '../types/dashboard.types';

export function useWorkspaceSearch(
  workspaceId: string,
  q: string,
  type: SearchType | 'ALL' | 'PROJECTS' | 'TASKS' | 'COMMENTS' | 'MEMBERS' = 'ALL',
  limit = 20,
) {
  const [debouncedQuery, setDebouncedQuery] = useState(q);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(q);
    }, 300);

    return () => clearTimeout(handler);
  }, [q]);

  const trimmedQuery = debouncedQuery.trim();
  const isEnabled = Boolean(workspaceId && trimmedQuery.length >= 2);

  const queryResult = useQuery<SearchResponse>({
    queryKey: dashboardKeys.search(workspaceId, trimmedQuery, type, limit),
    queryFn: async () => {
      const response = await dashboardApi.workspaceSearch(workspaceId, {
        q: trimmedQuery,
        type,
        limit,
      });
      return response.data;
    },
    enabled: isEnabled,
    staleTime: 30000,
  });

  return {
    ...queryResult,
    debouncedQuery,
    isSearching: queryResult.isLoading || (q !== debouncedQuery && q.trim().length >= 2),
  };
}
