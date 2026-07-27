'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createWorkspaceSchema,
  type CreateWorkspaceInput,
} from '@/features/workspace/schemas/create-workspace.schema';
import { useCreateWorkspace } from '@/features/workspace/hooks/use-create-workspace';

export default function StandaloneCreateWorkspacePage() {
  const createWorkspaceMutation = useCreateWorkspace();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      logo: '',
    },
  });

  const onSubmit = (data: CreateWorkspaceInput) => {
    createWorkspaceMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md mx-auto py-8">
      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 mx-auto sm:mx-0">
            <Building2 className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Create your workspace
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Workspaces are shared hubs where your team manages projects, boards, and tasks.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="create-ws-name">Workspace Name</Label>
            <Input
              id="create-ws-name"
              placeholder="e.g. Platform Engineering"
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

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="create-ws-logo">Workspace Logo URL</Label>
              <span className="text-[11px] text-muted-foreground">(Optional)</span>
            </div>
            <div className="relative">
              <Image className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="create-ws-logo"
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

          <Button
            type="submit"
            className="w-full h-11 font-semibold rounded-lg shadow-xs mt-2"
            isLoading={createWorkspaceMutation.isPending}
          >
            Create & Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
