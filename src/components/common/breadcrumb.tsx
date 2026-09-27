'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useWorkspaceStore } from '@/features/workspace/stores/use-workspace-store';
import { useProjectDetail } from '@/features/project/hooks/use-project-detail';
import { useProjectBoards } from '@/features/board/hooks/use-project-boards';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

const ROUTE_LABELS: Record<string, string> = {
  projects: 'Projects',
  'my-tasks': 'My Tasks',
  settings: 'Settings',
  members: 'Members',
  activities: 'Activity',
  activity: 'Activity',
  trash: 'Trash',
  'audit-logs': 'Audit Logs',
  profile: 'Profile',
};

function BreadcrumbInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);

  const segments = pathname.split('/').filter(Boolean);
  const isWorkspaceRoute = segments[0] === 'workspaces';
  const subSegments = isWorkspaceRoute ? segments.slice(2) : [];
  const projectId = subSegments[0] === 'projects' && subSegments[1] ? subSegments[1] : '';

  // Unconditional queries for real entity names
  const { data: projectResponse } = useProjectDetail(activeWorkspace?.id || '', projectId);
  const projectTitle = projectResponse?.data?.title || (projectId ? 'Project' : '');

  const boardId = searchParams.get('board') || '';
  const { data: boardsResponse } = useProjectBoards(activeWorkspace?.id || '', projectId);
  const boardTitle = boardsResponse?.data?.find((b) => b.id === boardId)?.title;

  // Compute leaf title unconditionally for document.title
  let leafTitle = '';
  if (segments.length > 0) {
    if (!isWorkspaceRoute) {
      leafTitle = ROUTE_LABELS[segments[0]] || segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
    } else if (subSegments.length === 0) {
      leafTitle = activeWorkspace?.name || 'Workspace';
    } else if (subSegments[0] === 'projects') {
      if (subSegments.length === 1) {
        leafTitle = 'Projects';
      } else {
        leafTitle = boardTitle || projectTitle || 'Project';
      }
    } else {
      const routeKey = subSegments[0];
      leafTitle = ROUTE_LABELS[routeKey] || routeKey.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  React.useEffect(() => {
    if (leafTitle && typeof document !== 'undefined') {
      document.title = `${leafTitle} — SyncSpace`;
    }
  }, [leafTitle]);

  if (segments.length === 0) return null;

  // Handle non-workspace root routes (e.g. /profile)
  if (!isWorkspaceRoute) {
    const rootLabel = ROUTE_LABELS[segments[0]] || segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0 p-0.5 rounded focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Home"
        >
          <Home className="h-3.5 w-3.5 shrink-0" />
        </Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="font-bold text-foreground truncate" aria-current="page">
          {rootLabel}
        </span>
      </nav>
    );
  }

  const workspaceSlug = segments[1] || activeWorkspace?.slug || activeWorkspace?.id || '';
  const workspaceHref = `/workspaces/${workspaceSlug}`;
  const workspaceName = activeWorkspace?.name || 'Workspace';

  // Build the list of breadcrumb items
  const items: BreadcrumbItem[] = [];

  // 1. Workspace is the operational root
  if (subSegments.length === 0) {
    items.push({
      label: workspaceName,
      isCurrent: true,
    });
  } else {
    items.push({
      label: workspaceName,
      href: workspaceHref,
    });

    if (subSegments[0] === 'projects') {
      const projectsHref = `${workspaceHref}/projects`;

      if (subSegments.length === 1) {
        // /workspaces/:slug/projects
        items.push({
          label: 'Projects',
          isCurrent: true,
        });
      } else {
        // /workspaces/:slug/projects/:projectId
        items.push({
          label: 'Projects',
          href: projectsHref,
        });

        const projectHref = `${projectsHref}/${projectId}`;

        if (!boardTitle) {
          items.push({
            label: projectTitle,
            isCurrent: true,
          });
        } else {
          items.push({
            label: projectTitle,
            href: projectHref,
          });
          items.push({
            label: boardTitle,
            isCurrent: true,
          });
        }
      }
    } else {
      // Named dashboard route: e.g. /workspaces/:slug/my-tasks
      const routeKey = subSegments[0];
      const humanLabel = ROUTE_LABELS[routeKey] || routeKey.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      items.push({
        label: humanLabel,
        isCurrent: true,
      });
    }
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 sm:gap-1.5 text-xs text-muted-foreground min-w-0 overflow-hidden flex-nowrap shrink"
    >
      <Link
        href={workspaceHref}
        className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0 p-0.5 rounded focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Workspace Dashboard"
      >
        <Home className="h-3.5 w-3.5 shrink-0" />
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
          {item.isCurrent || !item.href ? (
            <span
              className="font-bold text-foreground truncate max-w-[120px] sm:max-w-[180px] lg:max-w-[260px]"
              aria-current="page"
            >
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors truncate max-w-[90px] sm:max-w-[140px] lg:max-w-[180px]"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function Breadcrumb() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Home className="h-3.5 w-3.5" />
        </div>
      }
    >
      <BreadcrumbInner />
    </Suspense>
  );
}
