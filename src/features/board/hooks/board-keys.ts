export const boardKeys = {
  all: ['boards'] as const,
  projectBoards: (workspaceId: string, projectId: string) =>
    ['workspaces', workspaceId, 'projects', projectId, 'boards'] as const,
  detail: (workspaceId: string, projectId: string, boardId: string) =>
    ['workspaces', workspaceId, 'projects', projectId, 'boards', boardId] as const,
  columns: (workspaceId: string, projectId: string, boardId: string) =>
    ['workspaces', workspaceId, 'projects', projectId, 'boards', boardId, 'columns'] as const,
};
