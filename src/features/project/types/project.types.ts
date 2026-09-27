import type { UserMinimal } from '@/features/dashboard/types/dashboard.types';

export type ProjectVisibility = 'PUBLIC' | 'PRIVATE';
export const ProjectVisibility = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
} as const;

export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export const ProjectPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type ProjectHealth = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK';
export const ProjectHealth = {
  ON_TRACK: 'ON_TRACK',
  AT_RISK: 'AT_RISK',
  OFF_TRACK: 'OFF_TRACK',
} as const;

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
export const ProjectStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  COMPLETED: 'COMPLETED',
} as const;

export type ProjectMemberRole = 'MANAGER' | 'LEAD' | 'MEMBER' | 'VIEWER';
export const ProjectMemberRole = {
  MANAGER: 'MANAGER',
  LEAD: 'LEAD',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;

export interface ProjectLink {
  id: string;
  projectId: string;
  title: string;
  url: string;
  type?: string | null;
  createdById: string;
  createdBy: UserMinimal;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStatusUpdate {
  id: string;
  projectId: string;
  authorId: string;
  author: UserMinimal;
  health: ProjectHealth;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCountMeta {
  projectMembers: number;
  boards: number;
  sprints: number;
  links: number;
}

export interface ProjectSummary {
  id: string;
  workspaceId: string;
  slug: string;
  key: string;
  title: string;
  description: string | null;
  brief: string | null;
  icon: string | null;
  color: string;
  visibility: ProjectVisibility;
  priority: ProjectPriority;
  health: ProjectHealth;
  status: ProjectStatus;
  leadId: string | null;
  lead: UserMinimal | null;
  createdById: string;
  createdBy: UserMinimal;
  startDate: string | null;
  dueDate: string | null;
  repoUrl: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  _count: ProjectCountMeta;
}

export interface ProjectMemberItem {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  user: UserMinimal;
}

export interface ProjectBoardSummary {
  id: string;
  title: string;
  _count: { columns: number };
}

export interface ProjectSprintSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface ProjectDetail extends ProjectSummary {
  projectMembers: ProjectMemberItem[];
  links: ProjectLink[];
  statusUpdates: ProjectStatusUpdate[];
  boards: ProjectBoardSummary[];
  sprints: ProjectSprintSummary[];
}
