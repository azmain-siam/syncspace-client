'use client';

import * as React from 'react';
import { use, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function ProjectBoardRedirectContent({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectId: string; boardId: string }>;
}) {
  const { workspaceSlug, projectId, boardId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = new URLSearchParams(searchParams.toString());
    q.set('tab', 'boards');
    q.set('board', boardId);
    router.replace(`/workspaces/${workspaceSlug}/projects/${projectId}?${q.toString()}`);
  }, [workspaceSlug, projectId, boardId, router, searchParams]);

  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2.5">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Opening board...</span>
      </div>
    </div>
  );
}

export default function ProjectBoardRedirectPage(props: {
  params: Promise<{ workspaceSlug: string; projectId: string; boardId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <ProjectBoardRedirectContent {...props} />
    </Suspense>
  );
}
