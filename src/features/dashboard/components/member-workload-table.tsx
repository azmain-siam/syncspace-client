'use client';

import * as React from 'react';
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
import type { MemberWorkloadItem } from '../types/dashboard.types';

interface MemberWorkloadTableProps {
  workload?: MemberWorkloadItem[];
  isLoading?: boolean;
}

export function MemberWorkloadTable({ workload = [], isLoading }: MemberWorkloadTableProps) {
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
              Distribution of assignments, completion velocity, and overdue pressure per collaborator
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {sortedWorkload.length === 0 ? (
          <div className="text-center py-10 rounded-xl border border-dashed border-border/80 bg-muted/10">
            <Users className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No workload data recorded yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Assign tasks to team members to track individual throughput and delivery rates.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[240px]">Collaborator</TableHead>
                <TableHead className="hidden sm:table-cell">Role</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead className="text-right hidden md:table-cell">Completed</TableHead>
                <TableHead className="text-center">Overdue</TableHead>
                <TableHead className="text-right hidden lg:table-cell">Story Points</TableHead>
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

                return (
                  <TableRow key={item.memberId} className="hover:bg-muted/30 transition-colors">
                    {/* Collaborator */}
                    <TableCell>
                      <div className="flex items-center gap-3">
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
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      >
                        {item.role}
                      </Badge>
                    </TableCell>

                    {/* Assigned */}
                    <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                      {item.assignedCount.toLocaleString()}
                    </TableCell>

                    {/* Completed */}
                    <TableCell className="text-right font-mono text-xs text-muted-foreground hidden md:table-cell">
                      <span className="font-semibold text-foreground">
                        {item.completedCount.toLocaleString()}
                      </span>
                    </TableCell>

                    {/* Overdue */}
                    <TableCell className="text-center">
                      {item.overdueCount > 0 ? (
                        <Badge
                          variant="danger"
                          className="gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        >
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {item.overdueCount}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono">0</span>
                      )}
                    </TableCell>

                    {/* Story Points */}
                    <TableCell className="text-right font-mono text-xs text-muted-foreground hidden lg:table-cell">
                      <span className="font-semibold text-foreground">
                        {item.completedStoryPoints}
                      </span>
                      <span> / {item.totalStoryPoints} SP</span>
                    </TableCell>

                    {/* Completion Rate */}
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
