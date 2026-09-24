import type { TaskStatus } from '../types/task.types';

/**
 * Maps a Kanban column title to a canonical TaskStatus.
 * Aligns with backend column-to-status inference rules:
 * - "Done", "Completed", "Closed" -> DONE
 * - "In Progress", "Doing", "In Dev", "WIP" -> IN_PROGRESS
 * - "Review", "QA", "Testing", "Audit" -> REVIEW
 * - Default / "To Do", "Backlog" -> TODO
 */
export function mapColumnTitleToTaskStatus(title?: string | null): TaskStatus {
  if (!title) return 'TODO';
  const lower = title.trim().toLowerCase();

  if (
    lower.includes('done') ||
    lower.includes('complete') ||
    lower.includes('finish') ||
    lower.includes('closed')
  ) {
    return 'DONE';
  }

  if (
    lower.includes('progress') ||
    lower.includes('doing') ||
    lower.includes('dev') ||
    lower.includes('wip') ||
    lower.includes('working')
  ) {
    return 'IN_PROGRESS';
  }

  if (
    lower.includes('review') ||
    lower.includes('qa') ||
    lower.includes('test') ||
    lower.includes('audit') ||
    lower.includes('verify')
  ) {
    return 'REVIEW';
  }

  return 'TODO';
}
