import { useInfiniteQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@/types/domain';
import { commentApi } from '../api/comment.api';
import type { PaginatedCommentsResponse, Comment } from '../types/comment.types';

export function useTaskComments(taskId: string, limit = 20) {
  return useInfiniteQuery<ApiResponse<PaginatedCommentsResponse>>({
    queryKey: ['task-comments', taskId],
    queryFn: ({ pageParam }) =>
      commentApi.getTaskComments(taskId, {
        limit,
        cursor: pageParam ? (pageParam as string) : undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data?.meta;
      return meta?.hasNextPage && meta.nextCursor ? meta.nextCursor : undefined;
    },
    enabled: Boolean(taskId),
    staleTime: 1000 * 30,
  });
}

/**
 * Utility to flatten and deduplicate comments across all loaded pages.
 */
export function extractDeduplicatedComments(
  pages?: Array<ApiResponse<PaginatedCommentsResponse>>,
): Comment[] {
  if (!pages || pages.length === 0) return [];

  const map = new Map<string, Comment>();

  pages.forEach((page) => {
    const list = page.data?.comments || [];
    list.forEach((c) => {
      if (c && c.id && !map.has(c.id) && !c.deletedAt) {
        map.set(c.id, c);
      }
    });
  });

  return Array.from(map.values());
}
