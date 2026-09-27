export const projectKeys = {
  all: ['projects'] as const,
  workspaceProjects: (workspaceId: string) =>
    ['workspaces', workspaceId, 'projects'] as const,
  detail: (workspaceId: string, projectId: string) =>
    ['workspaces', workspaceId, 'projects', projectId] as const,
  statusUpdates: (workspaceId: string, projectId: string) =>
    ['workspaces', workspaceId, 'projects', projectId, 'status-updates'] as const,
  links: (workspaceId: string, projectId: string) =>
    ['workspaces', workspaceId, 'projects', projectId, 'links'] as const,
  tasks: (workspaceId: string, projectId: string, filters?: Record<string, unknown>) =>
    ['workspaces', workspaceId, 'projects', projectId, 'tasks', filters] as const,
};
