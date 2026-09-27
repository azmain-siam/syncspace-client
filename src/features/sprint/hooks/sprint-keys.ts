import type { SprintQueryParams, BacklogQueryParams } from '../types/sprint.types';

export const sprintKeys = {
  all: ['sprints'] as const,
  projectSprints: (projectId: string, params?: SprintQueryParams) =>
    ['project-sprints', projectId, params] as const,
  projectBacklog: (projectId: string, params?: BacklogQueryParams) =>
    ['project-backlog', projectId, params] as const,
  sprint: (sprintId: string) => ['sprint', sprintId] as const,
};
