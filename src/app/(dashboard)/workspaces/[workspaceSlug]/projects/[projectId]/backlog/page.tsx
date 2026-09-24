'use client';

import * as React from 'react';
import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProjectBacklogPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
}) {
  const { workspaceSlug, projectId } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/workspaces/${workspaceSlug}/projects/${projectId}?tab=tasks`);
  }, [workspaceSlug, projectId, router]);

  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2.5">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Opening project backlog...</span>
      </div>
    </div>
  );
}
