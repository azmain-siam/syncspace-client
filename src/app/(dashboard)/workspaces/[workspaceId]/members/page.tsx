'use client';

import * as React from 'react';
import { use } from 'react';
import { MembersTable } from '@/features/workspace/components/members-table';

export default function WorkspaceMembersPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);

  return <MembersTable workspaceId={workspaceId} />;
}
