'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Settings, Shield, Trash2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkspaceSettingsNavProps {
  workspaceSlug: string;
  isOwnerOrAdmin?: boolean;
}

export function WorkspaceSettingsNav({
  workspaceSlug,
  isOwnerOrAdmin = false,
}: WorkspaceSettingsNavProps) {
  const pathname = usePathname();

  const isTrash = pathname.endsWith('/settings/trash');
  const isAuditLogs = pathname.endsWith('/settings/audit-logs');
  const isGeneral = !isTrash && !isAuditLogs;

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" /> Workspace Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage workspace configuration, team data safety, and compliance records.
          </p>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-px overflow-x-auto scrollbar-none">
        <Link
          href={`/workspaces/${workspaceSlug}/settings`}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px shrink-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 select-none',
            isGeneral
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40',
          )}
        >
          <Building2 className="h-4 w-4" />
          <span>General</span>
        </Link>

        {isOwnerOrAdmin && (
          <Link
            href={`/workspaces/${workspaceSlug}/settings/trash`}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px shrink-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 select-none',
              isTrash
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40',
            )}
          >
            <Trash2 className="h-4 w-4" />
            <span>Trash Bin</span>
          </Link>
        )}

        {isOwnerOrAdmin && (
          <Link
            href={`/workspaces/${workspaceSlug}/settings/audit-logs`}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px shrink-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 select-none',
              isAuditLogs
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40',
            )}
          >
            <Shield className="h-4 w-4" />
            <span>Audit Logs</span>
          </Link>
        )}

        <Link
          href={`/workspaces/${workspaceSlug}/members`}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 ml-auto shrink-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 select-none"
        >
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>Members & Roles →</span>
        </Link>
      </div>
    </div>
  );
}
