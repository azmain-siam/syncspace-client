'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createWorkspaceSchema,
  type CreateWorkspaceInput,
} from '../schemas/create-workspace.schema';
import { useCreateWorkspace } from '../hooks/use-create-workspace';

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceModal({
  open,
  onOpenChange,
}: CreateWorkspaceModalProps) {
  const createWorkspaceMutation = useCreateWorkspace(() => {
    onOpenChange(false);
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      logo: '',
    },
  });

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = (data: CreateWorkspaceInput) => {
    createWorkspaceMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl">
        <DialogHeader>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <Building2 className="h-5 w-5" />
          </div>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Workspaces are shared spaces where your team collaborates on projects and tasks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Workspace Name */}
          <div className="space-y-1.5">
            <Label htmlFor="ws-name">Workspace Name</Label>
            <Input
              id="ws-name"
              placeholder="e.g. Acme Engineering"
              className="h-11 rounded-lg"
              error={!!errors.name}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Logo URL */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="ws-logo">Workspace Logo URL</Label>
              <span className="text-[11px] text-muted-foreground">(Optional)</span>
            </div>
            <div className="relative">
              <Image className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="ws-logo"
                type="url"
                placeholder="https://example.com/logo.png"
                className="pl-10 h-11 rounded-lg"
                error={!!errors.logo}
                {...register('logo')}
              />
            </div>
            {errors.logo && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.logo.message}
              </p>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 font-semibold rounded-lg shadow-xs"
              isLoading={createWorkspaceMutation.isPending}
            >
              Create Workspace
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
