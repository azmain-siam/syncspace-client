export const projectKeys = {
  all: ['projects'] as const,
  workspaceProjects: (workspaceId: string) =>
    ['workspaces', workspaceId, 'projects'] as const,
  detail: (workspaceId: string, projectId: string) =>
    ['workspaces', workspaceId, 'projects', projectId] as const,
};
