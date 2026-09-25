import type { TaskPriority, TaskStatus } from '@/types/domain';

export interface TaskStatusTheme {
  label: string;
  badgeClass: string;
  dotClass: string;
  hex: string;
}

export interface TaskPriorityTheme {
  label: string;
  badgeClass: string;
  dotClass: string;
  hex: string;
}

/**
 * Canonical Task Status Theme Configuration
 * High-contrast, WCAG 2.1 AA compliant (4.5:1+ contrast in both light and dark themes)
 */
export const TASK_STATUS_CONFIG: Record<TaskStatus, TaskStatusTheme> = {
  TODO: {
    label: 'To Do',
    badgeClass:
      'bg-slate-500/10 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300 border-slate-500/20 dark:border-slate-500/30',
    dotClass: 'bg-slate-400 dark:bg-slate-500 text-slate-500',
    hex: '#64748b',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    badgeClass:
      'bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30',
    dotClass: 'bg-blue-500 text-blue-500',
    hex: '#3b82f6',
  },
  REVIEW: {
    label: 'In Review',
    badgeClass:
      'bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400 border-amber-500/25 dark:border-amber-500/30',
    dotClass: 'bg-amber-500 text-amber-500',
    hex: '#f59e0b',
  },
  DONE: {
    label: 'Done',
    badgeClass:
      'bg-emerald-500/10 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-500/25 dark:border-emerald-500/30',
    dotClass: 'bg-emerald-500 text-emerald-500',
    hex: '#10b981',
  },
};

/**
 * Canonical Task Priority Theme Configuration
 * High-contrast, WCAG 2.1 AA compliant (4.5:1+ contrast in both light and dark themes)
 */
export const TASK_PRIORITY_CONFIG: Record<TaskPriority, TaskPriorityTheme> = {
  LOW: {
    label: 'Low',
    badgeClass:
      'bg-slate-500/10 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300 border-slate-500/20 dark:border-slate-500/30',
    dotClass: 'bg-slate-400 dark:bg-slate-500 text-slate-500',
    hex: '#94a3b8',
  },
  MEDIUM: {
    label: 'Medium',
    badgeClass:
      'bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30',
    dotClass: 'bg-blue-500 text-blue-500',
    hex: '#3b82f6',
  },
  HIGH: {
    label: 'High',
    badgeClass:
      'bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400 border-amber-500/25 dark:border-amber-500/30',
    dotClass: 'bg-amber-500 text-amber-500',
    hex: '#f59e0b',
  },
  URGENT: {
    label: 'Urgent',
    badgeClass:
      'bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400 border-red-500/25 dark:border-red-500/30',
    dotClass: 'bg-red-500 text-red-500',
    hex: '#ef4444',
  },
};
