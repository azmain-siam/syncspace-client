'use client';

import * as React from 'react';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Globe,
  KeyRound,
  RotateCcw,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { AuditAction, AuditLog } from '../types/safety.types';

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading?: boolean;
}

function getAuditActionMeta(action: AuditAction) {
  switch (action) {
    case AuditAction.USER_LOGIN:
    case AuditAction.GOOGLE_LOGIN:
    case AuditAction.USER_REGISTERED:
    case AuditAction.EMAIL_VERIFIED:
      return {
        icon: UserCheck,
        badgeClass: 'text-success-foreground bg-success border-success/30',
        label: 'AUTH SUCCESS',
      };
    case AuditAction.FAILED_LOGIN:
    case AuditAction.PASSWORD_RESET_REQUESTED:
      return {
        icon: ShieldAlert,
        badgeClass: 'text-danger-foreground bg-danger border-danger/30',
        label: 'SECURITY ALERT',
      };
    case AuditAction.PASSWORD_CHANGED:
    case AuditAction.PASSWORD_RESET_COMPLETED:
      return {
        icon: KeyRound,
        badgeClass: 'text-primary bg-primary/10 border-primary/25',
        label: 'CREDENTIALS',
      };
    case AuditAction.WORKSPACE_INVITATION_CREATED:
    case AuditAction.WORKSPACE_INVITATION_ACCEPTED:
      return {
        icon: UserPlus,
        badgeClass: 'text-primary bg-primary/10 border-primary/25',
        label: 'INVITATION',
      };
    case AuditAction.WORKSPACE_INVITATION_DECLINED:
    case AuditAction.WORKSPACE_INVITATION_CANCELLED:
    case AuditAction.WORKSPACE_LEFT:
      return {
        icon: UserX,
        badgeClass: 'text-warning-foreground bg-warning border-warning/30',
        label: 'MEMBERSHIP',
      };
    case AuditAction.TRASH_EMPTIED:
    case AuditAction.WORKSPACE_DELETED:
      return {
        icon: Trash2,
        badgeClass: 'text-danger-foreground bg-danger border-danger/30',
        label: 'DATA PURGE',
      };
    case AuditAction.TRASH_ITEM_RESTORED:
      return {
        icon: RotateCcw,
        badgeClass: 'text-primary bg-primary/10 border-primary/25',
        label: 'RECOVERY',
      };
    default:
      return {
        icon: Shield,
        badgeClass: 'text-muted-foreground bg-muted border-border',
        label: 'AUDIT',
      };
  }
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Unknown Client';
  if (ua.includes('Firefox/')) return 'Mozilla Firefox';
  if (ua.includes('Edg/')) return 'Microsoft Edge';
  if (ua.includes('Chrome/')) return 'Google Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Apple Safari';
  if (ua.includes('Postman')) return 'Postman Client';
  if (ua.includes('curl/')) return 'cURL CLI';
  return 'Web Browser';
}

export function AuditLogTable({ logs, isLoading }: AuditLogTableProps) {
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
        <div className="h-12 border-b border-border/80 bg-muted/30 px-6 flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-muted/80" />
          <div className="h-4 w-32 rounded bg-muted/60" />
          <div className="h-4 w-28 rounded bg-muted/70" />
        </div>
        <div className="divide-y divide-border/40 p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="h-4 w-40 rounded bg-muted/80" />
              <div className="h-4 w-28 rounded bg-muted/60" />
              <div className="h-4 w-32 rounded bg-muted/70" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-card/50 space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-muted/60 border border-border/80 text-muted-foreground flex items-center justify-center mx-auto">
          <Shield className="h-6 w-6" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="font-bold text-foreground text-base">No Audit Events Recorded</h3>
          <p className="text-xs text-muted-foreground">
            Security and compliance events like logins, credential updates, permission shifts, and trash actions will be tracked here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-3 sm:px-4">Timestamp</TableHead>
          <TableHead className="px-3 sm:px-4">Actor</TableHead>
          <TableHead className="px-3 sm:px-4">Event Action</TableHead>
          <TableHead className="hidden md:table-cell px-4">Client Info</TableHead>
          <TableHead className="text-right px-3 sm:px-4">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => {
          const { icon: ActionIcon, badgeClass, label } = getAuditActionMeta(log.action);
          const isExpanded = !!expandedRows[log.id];
          const clientSummary = parseUserAgent(log.userAgent);
          const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

          const actorInitials = log.actor?.name
            ? log.actor.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()
            : 'SYS';

          return (
            <React.Fragment key={log.id}>
              <TableRow>
                {/* Timestamp */}
                <TableCell className="px-3 sm:px-4 whitespace-nowrap text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Clock className="h-3 w-3 text-muted-foreground/70" />
                    <span>
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </TableCell>

                {/* Actor */}
                <TableCell className="px-3 sm:px-4 min-w-[160px]">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-border">
                      {log.actor?.avatar && (
                        <AvatarImage src={log.actor.avatar} alt={log.actor.name} />
                      )}
                      <AvatarFallback className="text-[10px] font-bold bg-muted">
                        {actorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate max-w-[130px] leading-tight text-xs">
                        {log.actor?.name || 'System / Anonymous'}
                      </p>
                      {log.actor?.email && (
                        <p className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                          {log.actor.email}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Event Action */}
                <TableCell className="px-3 sm:px-4 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border shadow-2xs',
                        badgeClass,
                      )}
                    >
                      <ActionIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-bold text-foreground font-mono text-[11px] block">
                        {log.action}
                      </span>
                      <div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] font-extrabold px-1.5 py-0 h-4 rounded-full uppercase tracking-wider',
                            badgeClass,
                          )}
                        >
                          {label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Client Info (IP & User Agent) */}
                <TableCell className="hidden md:table-cell px-4 text-muted-foreground text-[11px]">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 font-mono text-[10px] text-foreground/80">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <span>{log.ipAddress || 'Internal Gateway'}</span>
                    </div>
                    <span
                      className="text-[10px] text-muted-foreground truncate block max-w-[180px]"
                      title={log.userAgent || undefined}
                    >
                      {clientSummary}
                    </span>
                  </div>
                </TableCell>

                {/* Details / JSON Metadata Expansion */}
                <TableCell className="px-3 sm:px-4 text-right whitespace-nowrap">
                  {hasMetadata ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(log.id)}
                      className="h-7 px-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground gap-1"
                    >
                      <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/60 italic px-2">—</span>
                  )}
                </TableCell>
              </TableRow>

              {/* Expanded JSON Viewer Row */}
              {isExpanded && hasMetadata && (
                <TableRow className="bg-muted/15 hover:bg-muted/15">
                  <TableCell colSpan={5} className="p-4 sm:px-6">
                    <div className="rounded-xl border border-border/80 bg-background/80 p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <span>Event Metadata Payload</span>
                        <span className="font-mono text-[10px]">JSON Object</span>
                      </div>
                      <pre className="text-[11px] font-mono text-foreground/90 overflow-x-auto p-2.5 rounded-lg bg-card border border-border/60 max-h-48 scrollbar-thin">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
