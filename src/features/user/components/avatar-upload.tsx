'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUploadAvatar } from '../hooks/use-upload-avatar';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

interface AvatarUploadProps {
  currentAvatar?: string | null;
  name?: string;
  className?: string;
}

export function AvatarUpload({
  currentAvatar,
  name = 'User',
  className = '',
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatarMutation = useUploadAvatar();

  const userInitials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  // Revoke object URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // 1. Client-Side Size Validation
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error('Avatar image must be smaller than 5MB.');
      return;
    }

    // 2. Client-Side MIME Type Validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error(
        'Unsupported image format. Allowed formats: JPEG, PNG, WEBP, and GIF.',
      );
      return;
    }

    // 3. Immediate local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // 4. Dispatch upload mutation
    uploadAvatarMutation.mutate(file, {
      onError: () => {
        // Revert to current server avatar on failure
        setPreviewUrl(null);
        URL.revokeObjectURL(objectUrl);
      },
      onSuccess: () => {
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(null);
      },
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
    // Reset input so re-selecting the same file triggers onChange
    if (e.target) {
      e.target.value = '';
    }
  };

  const displayAvatarSrc = previewUrl || currentAvatar || undefined;

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-5 ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleInputChange}
        disabled={uploadAvatarMutation.isPending}
      />

      {/* Interactive Avatar Circle with Camera Overlay */}
      <div
        className="relative group cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload profile avatar"
      >
        <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-border/80 shadow-md transition-all group-hover:opacity-90">
          <AvatarImage
            src={displayAvatarSrc}
            alt={name}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
            {userInitials}
          </AvatarFallback>
        </Avatar>

        {/* Hover / Loading Overlay */}
        <div
          className={`absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center text-white transition-opacity ${
            uploadAvatarMutation.isPending
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {uploadAvatarMutation.isPending ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-white mb-1" />
              <span className="text-[10px] font-semibold tracking-wider uppercase">
                Uploading
              </span>
            </>
          ) : (
            <>
              <Camera className="h-6 w-6 text-white mb-1" />
              <span className="text-[10px] font-semibold tracking-wider uppercase">
                Change
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action Guidance & Direct Trigger Button */}
      <div className="space-y-2 text-center sm:text-left">
        <div>
          <h3 className="text-sm font-bold text-foreground">Profile Picture</h3>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP, or GIF up to 5MB.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold rounded-lg cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadAvatarMutation.isPending}
          >
            <UploadCloud className="h-4 w-4" />
            <span>{uploadAvatarMutation.isPending ? 'Uploading...' : 'Upload Image'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
