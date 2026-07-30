'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useWorkspaceStore } from '@/features/workspace/stores/use-workspace-store';

export function Breadcrumb() {
  const pathname = usePathname();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const workspaceSlug = activeWorkspace?.slug || activeWorkspace?.id;

  const segments = pathname.split('/').filter(Boolean);

  // Format path segment names into readable titles
  const getSegmentTitle = (segment: string, index: number) => {
    if (index === 1 && activeWorkspace) {
      return activeWorkspace.name;
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link
        href={workspaceSlug ? `/workspaces/${workspaceSlug}` : '/'}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;
        const title = getSegmentTitle(segment, index);

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
            {isLast ? (
              <span className="font-bold text-foreground truncate max-w-[140px]">
                {title}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground transition-colors truncate max-w-[120px]"
              >
                {title}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
