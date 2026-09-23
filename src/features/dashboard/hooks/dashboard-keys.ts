export const dashboardKeys = {
  all: ['dashboard'] as const,
  search: (workspaceId: string, q: string, type = 'ALL', limit = 20) =>
    [...dashboardKeys.all, 'search', workspaceId, q, type, limit] as const,
  summary: (workspaceId: string) =>
    [...dashboardKeys.all, 'summary', workspaceId] as const,
  distribution: (workspaceId: string) =>
    [...dashboardKeys.all, 'distribution', workspaceId] as const,
  productivity: (workspaceId: string, days = 30) =>
    [...dashboardKeys.all, 'productivity', workspaceId, days] as const,
  workload: (workspaceId: string) =>
    [...dashboardKeys.all, 'workload', workspaceId] as const,
};
