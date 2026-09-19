'use client';

import * as React from 'react';
import {
  Download,
  File,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from '../hooks/use-attachments';
import type { TaskAttachment } from '../types/task.types';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function getFileIcon(mimeType: string, fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return <ImageIcon className="size-5 text-indigo-500" />;
  }
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext) || mimeType.includes('pdf') || mimeType.includes('word')) {
    return <FileText className="size-5 text-rose-500" />;
  }
  if (['xls', 'xlsx', 'csv'].includes(ext) || mimeType.includes('sheet') || mimeType.includes('csv')) {
    return <FileSpreadsheet className="size-5 text-emerald-500" />;
  }
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext) || mimeType.includes('zip') || mimeType.includes('archive')) {
    return <FileArchive className="size-5 text-amber-500" />;
  }
  if (['ts', 'tsx', 'js', 'jsx', 'json', 'html', 'css', 'py', 'go'].includes(ext)) {
    return <FileCode className="size-5 text-cyan-500" />;
  }
  return <File className="size-5 text-muted-foreground" />;
}

interface TaskAttachmentsProps {
  taskId: string;
  canManage?: boolean;
}

export function TaskAttachments({ taskId, canManage = true }: TaskAttachmentsProps) {
  const { data: attachmentsResponse, isLoading } = useAttachments(taskId);
  const attachments = attachmentsResponse?.data || [];

  const uploadMutation = useUploadAttachment(taskId);
  const deleteMutation = useDeleteAttachment(taskId);

  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller file.`);
      return;
    }
    uploadMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canManage) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (!canManage) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const isImageAttachment = (att: TaskAttachment) => {
    const ext = att.fileName.split('.').pop()?.toLowerCase() || '';
    return att.mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
  };

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-foreground">
          <Paperclip className="size-4 text-primary" />
          <span>Attachments</span>
          {attachments.length > 0 && (
            <span className="text-muted-foreground font-medium">
              ({attachments.length})
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground font-normal">
          Max 10MB per file
        </span>
      </div>

      {/* Upload Dropzone */}
      {canManage && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id={`file-upload-${taskId}`}
          />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'group relative flex flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center transition-all cursor-pointer',
              isDragOver
                ? 'border-primary bg-primary/10'
                : 'border-border/80 hover:border-primary/50 hover:bg-muted/40',
              uploadMutation.isPending && 'pointer-events-none opacity-60',
            )}
          >
            {uploadMutation.isPending ? (
              <div className="flex items-center gap-2 text-xs text-primary font-medium py-1">
                <Loader2 className="size-4 animate-spin" />
                <span>Uploading to secure cloud...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <div className="rounded-full bg-primary/10 p-2 text-primary group-hover:scale-110 transition-transform">
                  <UploadCloud className="size-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    Click to upload
                  </span>{' '}
                  <span className="text-muted-foreground">or drag and drop</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Images, PDF, Documents, Code or Archives
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attachments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin mr-2" />
          Loading attachments...
        </div>
      ) : attachments.length === 0 ? (
        <div className="rounded-lg border border-border/40 p-3 text-center text-xs text-muted-foreground">
          No files attached yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {attachments.map((att) => {
            const isImage = isImageAttachment(att);
            return (
              <div
                key={att.id}
                className="group relative flex items-center gap-3 rounded-lg border border-border/70 bg-card p-2.5 transition-all hover:border-border hover:shadow-xs"
              >
                {/* Thumbnail or File Icon */}
                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/60 border border-border/50">
                  {isImage && att.fileUrl ? (
                    <Image
                      src={att.fileUrl}
                      alt={att.fileName}
                      width={40}
                      height={40}
                      unoptimized
                      className="size-full object-cover"
                    />
                  ) : (
                    getFileIcon(att.mimeType, att.fileName)
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-1">
                  <p
                    className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors"
                    title={att.fileName}
                  >
                    {att.fileName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatBytes(att.fileSize)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open or Download"
                    download
                    className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Download className="size-3.5" />
                  </a>

                  {canManage && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(att.id)}
                      className="size-7 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete attachment"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
