export function formatDelta(value: number, suffix: string): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString()} ${suffix}`;
}

export function formatRelativeUpdated(date: Date): string {
  const elapsedMs = Date.now() - date.getTime();
  if (elapsedMs < 15_000) return 'Updated just now';
  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes < 1) return 'Updated just now';
  if (minutes === 1) return 'Updated 1 minute ago';
  if (minutes < 60) return `Updated ${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return 'Updated 1 hour ago';
  return `Updated ${hours} hours ago`;
}

export function formatDueDate(dueDate: string | null): {
  label: string;
  isOverdue: boolean;
  isDueToday: boolean;
} {
  if (!dueDate) {
    return { label: 'No due date', isOverdue: false, isDueToday: false };
  }

  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);

  const isDueToday = dueDay.getTime() === today.getTime();
  const isOverdue = dueDay.getTime() < today.getTime();

  if (isOverdue) return { label: 'Overdue', isOverdue: true, isDueToday: false };
  if (isDueToday) return { label: 'Due today', isOverdue: false, isDueToday: true };

  return {
    label: `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    isOverdue: false,
    isDueToday: false,
  };
}
