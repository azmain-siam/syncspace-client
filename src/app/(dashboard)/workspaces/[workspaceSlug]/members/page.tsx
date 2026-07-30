'use client';

import * as React from 'react';
import { use } from 'react';
import { Loader2 } from 'lucide-react';
import { MembersTable } from '@/features/workspace/components/members-table';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';

export default function WorkspaceMembersPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);
  const { workspace, isLoading } = useCurrentWorkspace(workspaceSlug);

  if (isLoading || !workspace) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <MembersTable workspaceId={workspace.id} />;
}
