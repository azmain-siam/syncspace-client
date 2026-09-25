import { redirect } from 'next/navigation';

export default async function ProjectBacklogPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
}) {
  const { workspaceSlug, projectId } = await params;
  redirect(`/workspaces/${workspaceSlug}/projects/${projectId}?tab=tasks`);
}
