import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import { sprintApi } from '../api/sprint.api';
import type {
  CreateSprintRequest,
  UpdateSprintRequest,
  CompleteSprintRequest,
  AssignTaskToSprintRequest,
} from '../types/sprint.types';

/**
 * Hook to create a new sprint in planning state
 */
export function useCreateSprint(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSprintRequest) => sprintApi.createSprint(projectId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['project-sprints', projectId] });
      toast.success(res.message || 'Sprint created successfully');
    },
    onError: (error) => {
      toast.error(formatApiErrorMessage(error, 'Failed to create sprint'));
    },
  });
}

/**
 * Hook to update sprint details (name, goal, dates, status)
 */
export function useUpdateSprint(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sprintId,
      data,
    }: {
      sprintId: string;
      data: UpdateSprintRequest;
    }) => sprintApi.updateSprint(sprintId, data),
    onSuccess: (res, { sprintId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['sprint', sprintId] });
      toast.success(res.message || 'Sprint updated successfully');
    },
    onError: (error) => {
      toast.error(formatApiErrorMessage(error, 'Failed to update sprint'));
    },
  });
}

/**
 * Hook to start sprint (enforces single active sprint per project)
 */
export function useStartSprint(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintId: string) => sprintApi.startSprint(sprintId),
    onSuccess: (res, sprintId) => {
      queryClient.invalidateQueries({ queryKey: ['project-sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-backlog', projectId] });
      queryClient.invalidateQueries({ queryKey: ['sprint', sprintId] });
      toast.success(res.message || 'Sprint started successfully');
    },
    onError: (error) => {
      toast.error(formatApiErrorMessage(error, 'Failed to start sprint'));
    },
  });
}

/**
 * Hook to complete sprint and roll unfinished tasks to next sprint or backlog
 */
export function useCompleteSprint(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sprintId,
      data,
    }: {
      sprintId: string;
      data?: CompleteSprintRequest;
    }) => sprintApi.completeSprint(sprintId, data),
    onSuccess: (res, { sprintId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-backlog', projectId] });
      queryClient.invalidateQueries({ queryKey: ['sprint', sprintId] });
      toast.success(res.message || 'Sprint completed successfully');
    },
    onError: (error) => {
      toast.error(formatApiErrorMessage(error, 'Failed to complete sprint'));
    },
  });
}

/**
 * Hook to soft-delete a sprint and move assigned tasks back to backlog
 */
export function useDeleteSprint(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintId: string) => sprintApi.deleteSprint(sprintId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['project-sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-backlog', projectId] });
      toast.success(res.message || 'Sprint deleted successfully');
    },
    onError: (error) => {
      toast.error(formatApiErrorMessage(error, 'Failed to delete sprint'));
    },
  });
}

/**
 * Hook to assign or move a task between sprints or to/from backlog
 */
export function useAssignTaskToSprint(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: AssignTaskToSprintRequest;
    }) => sprintApi.assignTaskToSprint(taskId, data),
    onSuccess: (res, { taskId, data }) => {
      queryClient.invalidateQueries({ queryKey: ['project-sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-backlog', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      if (data.sprintId) {
        queryClient.invalidateQueries({ queryKey: ['sprint', data.sprintId] });
      }
      toast.success(
        res.message ||
          (data.isBacklog ? 'Task moved to backlog' : 'Task assigned to sprint'),
      );
    },
    onError: (error) => {
      toast.error(formatApiErrorMessage(error, 'Failed to update task sprint'));
    },
  });
}
