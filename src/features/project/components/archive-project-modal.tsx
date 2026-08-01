'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Project } from '@/types/domain';
import { useArchiveProject } from '../hooks/use-archive-project';

interface ArchiveProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  project: Project | null;
}

export function ArchiveProjectModal({
  open,
  onOpenChange,
  workspaceId,
  project,
}: ArchiveProjectModalProps) {
  const archiveMutation = useArchiveProject(workspaceId, () => {
    onOpenChange(false);
  });

  if (!project) return null;

  const handleArchive = () => {
    archiveMutation.mutate(project.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-danger">
            <AlertTriangle className="h-5 w-5" /> Archive Project
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to archive project{' '}
            <strong className="text-foreground font-semibold">&quot;{project.title}&quot;</strong>?
            This will hide the project and its boards from active workspace views.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleArchive}
              className="h-11 rounded-lg font-semibold"
              isLoading={archiveMutation.isPending}
            >
              Archive Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
