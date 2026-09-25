import { redirect } from 'next/navigation';

export default async function ProjectBoardRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string; projectId: string; boardId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { workspaceSlug, projectId, boardId } = await params;
  const resolvedSearchParams = await searchParams;
  const q = new URLSearchParams();

  for (const [key, val] of Object.entries(resolvedSearchParams)) {
    if (typeof val === 'string') {
      q.set(key, val);
    } else if (Array.isArray(val)) {
      val.forEach((v) => q.append(key, v));
    }
  }

  q.set('tab', 'boards');
  q.set('board', boardId);
  redirect(`/workspaces/${workspaceSlug}/projects/${projectId}?${q.toString()}`);
}
