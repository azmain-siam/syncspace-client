export const workspaceKeys = {
  all: ['workspaces'] as const,
  detail: (workspaceId: string) =>
    ['workspaces', workspaceId] as const,
  slug: (slug: string) =>
    ['workspaces', 'slug', slug] as const,
  members: (workspaceId: string) =>
    ['workspaces', workspaceId, 'members'] as const,
  invitations: (workspaceId: string) =>
    ['workspaces', workspaceId, 'invitations'] as const,
  userWorkspaces: () =>
    ['workspaces', 'me'] as const,
};
