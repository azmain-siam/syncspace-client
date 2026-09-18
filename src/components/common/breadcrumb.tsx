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

  if (segments.length === 0) return null;

  // Format path segment names into readable titles
  const getSegmentTitle = (segment: string, index: number) => {
    if (index === 1 && activeWorkspace) {
      return activeWorkspace.name;
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <nav
      aria-label="Breadcrumbs"
      className="flex items-center gap-1 sm:gap-1.5 text-xs text-muted-foreground min-w-0 overflow-hidden flex-nowrap shrink"
    >
      <Link
        href={workspaceSlug ? `/workspaces/${workspaceSlug}` : '/dashboard'}
        className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0 p-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Home"
      >
        <Home className="h-3.5 w-3.5 shrink-0" />
      </Link>

      {/* If more than 2 segments, collapse middle on mobile */}
      {segments.length > 2 ? (
        <>
          {/* Mobile view (< sm): Home > … > Last Segment */}
          <div className="flex sm:hidden items-center gap-1 min-w-0 overflow-hidden flex-nowrap">
            <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground/60 shrink-0 select-none">…</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="font-bold text-foreground truncate max-w-[100px]">
              {getSegmentTitle(segments[segments.length - 1], segments.length - 1)}
            </span>
          </div>

          {/* Desktop/Tablet view (>= sm): Full trail */}
          <div className="hidden sm:flex items-center gap-1.5 min-w-0 overflow-hidden flex-nowrap">
            {segments.map((segment, index) => {
              const href = '/' + segments.slice(0, index + 1).join('/');
              const isLast = index === segments.length - 1;
              const title = getSegmentTitle(segment, index);

              return (
                <React.Fragment key={href}>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  {isLast ? (
                    <span className="font-bold text-foreground truncate max-w-[140px] md:max-w-[200px] lg:max-w-[260px]">
                      {title}
                    </span>
                  ) : (
                    <Link
                      href={href}
                      className="hover:text-foreground transition-colors truncate max-w-[100px] md:max-w-[140px] lg:max-w-[180px]"
                    >
                      {title}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </>
      ) : (
        /* <= 2 segments: always show full trail with responsive max-widths */
        segments.map((segment, index) => {
          const href = '/' + segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;
          const title = getSegmentTitle(segment, index);

          return (
            <React.Fragment key={href}>
              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
              {isLast ? (
                <span className="font-bold text-foreground truncate max-w-[100px] sm:max-w-[180px] lg:max-w-[260px]">
                  {title}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-foreground transition-colors truncate max-w-[80px] sm:max-w-[140px]"
                >
                  {title}
                </Link>
              )}
            </React.Fragment>
          );
        })
      )}
    </nav>
  );
}
