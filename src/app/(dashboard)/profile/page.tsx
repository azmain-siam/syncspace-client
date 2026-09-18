'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  KeyRound,
  Loader2,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import { ProfileForm } from '@/features/user/components/profile-form';
import { ChangePasswordForm } from '@/features/user/components/change-password-form';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const { user, isLoading } = useCurrentUser();

  if (isLoading && !user) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">
          Loading your profile settings...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-4 py-16">
        <div className="h-12 w-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
          <Shield className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">User Session Not Found</h2>
        <p className="text-sm text-muted-foreground">
          Unable to load your profile session. Please try signing in again.
        </p>
        <Link href="/login">
          <Button variant="outline" className="cursor-pointer">
            Go to Login
          </Button>
        </Link>
      </div>
    );
  }

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Breadcrumb / Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Account & Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your personal identity, contact information, and security preferences.
          </p>
        </div>

        {joinDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border/60 px-3 py-1.5 rounded-lg w-fit">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>Member since {joinDate}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/50 w-full sm:w-fit overflow-x-auto max-w-full">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'profile'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          role="tab"
          aria-selected={activeTab === 'profile'}
        >
          <UserIcon className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Profile & Information</span>
          <span className="sm:hidden">Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'security'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          role="tab"
          aria-selected={activeTab === 'security'}
        >
          <KeyRound className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Security & Password</span>
          <span className="sm:hidden">Security</span>
          {user.provider === 'GOOGLE' && (
            <Badge variant="outline" className="text-[9px] py-0 px-1 ml-1 shrink-0">
              OAuth
            </Badge>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'profile' ? (
          <ProfileForm user={user} />
        ) : (
          <ChangePasswordForm user={user} />
        )}
      </div>
    </div>
  );
}
