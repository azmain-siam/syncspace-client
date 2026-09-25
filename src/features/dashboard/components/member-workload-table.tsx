'use client';

import { AlertTriangle, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MemberCapacityStatus, MemberWorkloadItem } from '../types/dashboard.types';
import { DashboardQueryEmpty, DashboardQueryError } from './dashboard-query-state';

interface MemberWorkloadTableProps {
  workload?: MemberWorkloadItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onSelectMember?: (userId: string, name: string) => void;
  onSelectMemberOverdue?: (userId: string, name: string, count: number) => void;
}

const CAPACITY_STYLES: Record<MemberCapacityStatus, string> = {
  OPTIMAL: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  OVERLOADED: 'bg-destructive/10 text-destructive border-destructive/20',
  UNDERLOADED: 'bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/20',
};

export function MemberWorkloadTable({
  workload = [],
  isLoading,
  isError,
  onRetry,
  onSelectMember,
  onSelectMemberOverdue,
}: MemberWorkloadTableProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl border-border bg-card">
        <CardHeader className="pb-3">
          <div className="h-5 w-48 rounded bg-muted/70 mb-1" />
          <div className="h-3.5 w-64 rounded bg-muted/50" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-full rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return <DashboardQueryError title="team workload" onRetry={onRetry} />;
  }

  const sortedWorkload = [...workload].sort((a, b) => b.assignedCount - a.assignedCount);

  return (
    <Card className="rounded-2xl border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold tracking-tight">
                Team Member Workload
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-mono gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                {workload.length} Collaborators
              </Badge>
            </div>
            <CardDescription className="text-xs">
              WIP, overdue pressure, and capacity. Click a name or overdue count to open their tasks.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {sortedWorkload.length === 0 ? (
          <DashboardQueryEmpty
            title="No workload data yet"
            description="Assign tasks to team members to track WIP and delivery rates."
            icon={<Users className="h-5 w-5" />}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[240px]">Collaborator</TableHead>
                <TableHead className="hidden sm:table-cell">Role</TableHead>
                <TableHead className="text-right hidden md:table-cell">WIP</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead className="text-center">Overdue</TableHead>
                <TableHead className="hidden lg:table-cell">Capacity</TableHead>
                <TableHead className="w-[180px] text-right">Completion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedWorkload.map((item) => {
                const initials = item.user.name
                  ? item.user.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'U';
                const safeRate = Math.min(100, Math.max(0, item.completionRate));
                const wip = item.inProgressCount ?? 0;

                return (
                  <TableRow key={item.memberId} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => onSelectMember?.(item.user.id, item.user.name)}
                        disabled={!onSelectMember}
                        className="flex items-center gap-3 text-left disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                        aria-label={`View tasks assigned to ${item.user.name}`}
                      >
                        <Avatar className="h-8 w-8 rounded-lg border border-border shrink-0">
                          {item.user.avatar && (
                            <AvatarImage src={item.user.avatar} alt={item.user.name} />
                          )}
                          <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate max-w-[150px]">
                            {item.user.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                            {item.user.email}
                          </p>
                        </div>
                      </button>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {item.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-foreground hidden md:table-cell">
                      {wip.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                      {item.assignedCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.overdueCount > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            onSelectMemberOverdue?.(item.user.id, item.user.name, item.overdueCount)
                          }
                          disabled={!onSelectMemberOverdue}
                          aria-label={`View ${item.overdueCount} overdue tasks for ${item.user.name}`}
                          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Badge
                            variant="danger"
                            className="gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          >
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {item.overdueCount}
                          </Badge>
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono">0</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {item.capacityStatus ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                            CAPACITY_STYLES[item.capacityStatus],
                          )}
                        >
                          {item.capacityStatus}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <div className="w-20 sm:w-24">
                          <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                safeRate >= 75
                                  ? 'bg-emerald-500'
                                  : safeRate >= 40
                                    ? 'bg-primary'
                                    : 'bg-amber-500',
                              )}
                              style={{ width: `${safeRate}%` }}
                            />
                          </div>
                        </div>
                        <span className="font-mono text-xs font-semibold text-foreground w-9 text-right">
                          {safeRate}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
