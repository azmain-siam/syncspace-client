'use client';

import * as React from 'react';
import { use, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';
import { WorkspaceSettingsNav } from '@/features/workspace/components/workspace-settings-nav';
import { useWorkspaceAuditLogs } from '@/features/safety';
import { AuditLogTable } from '@/features/safety/components/audit-log-table';
import { AuditAction } from '@/features/safety/types/safety.types';

const AUDIT_ACTION_OPTIONS: Array<{ label: string; value: AuditAction | 'ALL' }> = [
  { label: 'All Security Events', value: 'ALL' },
  { label: 'Successful Logins', value: AuditAction.USER_LOGIN },
  { label: 'Failed Login Attempts', value: AuditAction.FAILED_LOGIN },
  { label: 'Google OAuth Sign-ins', value: AuditAction.GOOGLE_LOGIN },
  { label: 'Password Updates', value: AuditAction.PASSWORD_CHANGED },
  { label: 'Password Reset Requests', value: AuditAction.PASSWORD_RESET_REQUESTED },
  { label: 'Workspace Invitations Created', value: AuditAction.WORKSPACE_INVITATION_CREATED },
  { label: 'Workspace Invitations Accepted', value: AuditAction.WORKSPACE_INVITATION_ACCEPTED },
  { label: 'Trash Emptied / Purged', value: AuditAction.TRASH_EMPTIED },
  { label: 'Trash Item Restored', value: AuditAction.TRASH_ITEM_RESTORED },
  { label: 'Workspace Left', value: AuditAction.WORKSPACE_LEFT },
];

export default function WorkspaceAuditLogsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);
  const { workspace, isLoading: wsLoading } = useCurrentWorkspace(workspaceSlug);
  const currentUser = useAuthStore((s) => s.user);

  const [actionFilter, setActionFilter] = useState<AuditAction | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const workspaceId = workspace?.id || '';
  const isOwnerOrAdmin = !!(
    workspace &&
    currentUser &&
    (workspace.ownerId === currentUser.id ||
      (workspace as { role?: string }).role === 'ADMIN' ||
      (workspace as { role?: string }).role === 'OWNER')
  );

  const { data, isLoading } = useWorkspaceAuditLogs(workspaceId, {
    action: actionFilter !== 'ALL' ? actionFilter : undefined,
    page,
    limit: 20,
  });

  if (wsLoading && !workspace) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-20 rounded-2xl bg-card animate-pulse border border-border" />
        <div className="h-96 rounded-2xl bg-card animate-pulse border border-border" />
      </div>
    );
  }

  // RBAC Access Guard (Owner & Admin only)
  if (workspace && !isOwnerOrAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl border border-border bg-card text-center space-y-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Only workspace <strong>Owners</strong> and <strong>Admins</strong> have permission to inspect security and compliance audit logs.
        </p>
        <Link href={`/workspaces/${workspaceSlug}/settings`}>
          <Button variant="outline" size="sm" className="mt-2 text-xs font-semibold rounded-lg">
            Return to Settings
          </Button>
        </Link>
      </div>
    );
  }

  const logs = data?.auditLogs || [];
  const meta = data?.meta;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Settings Navigation Header */}
      <WorkspaceSettingsNav
        workspaceSlug={workspaceSlug}
        isOwnerOrAdmin={isOwnerOrAdmin}
      />

      {/* Sub-heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Security & Compliance Audit
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Administrative record of authentication, credentials, membership, and data safety events in{' '}
            <strong className="text-foreground">{workspace?.name}</strong>.
          </p>
        </div>
      </div>

      {/* Action Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card rounded-2xl border border-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 h-11 rounded-lg border border-border/80 bg-background text-xs font-semibold">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">Event:</span>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value as AuditAction | 'ALL');
                setPage(1);
              }}
              aria-label="Filter audit event type"
              className="bg-transparent focus:outline-none text-xs font-medium cursor-pointer text-foreground"
            >
              {AUDIT_ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-popover text-foreground">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {meta?.total !== undefined && (
          <span className="text-xs text-muted-foreground font-medium pr-1">
            {meta.total} audit entries recorded
          </span>
        )}
      </div>

      {/* Main Audit Log Table */}
      <AuditLogTable logs={logs} isLoading={isLoading} />

      {/* Pagination Bar */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-muted-foreground">
          <span className="font-medium">
            Page <strong className="text-foreground">{meta.page}</strong> of{' '}
            <strong className="text-foreground">{meta.totalPages}</strong> ({meta.total} total)
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!meta.hasPrevPage || isLoading}
              className="h-8 px-2 text-xs font-semibold rounded-lg"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!meta.hasNextPage || isLoading}
              className="h-8 px-2 text-xs font-semibold rounded-lg"
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
