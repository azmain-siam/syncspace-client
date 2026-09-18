/* eslint-disable react-hooks/incompatible-library */
'use client';

import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AtSign,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  Save,
  User as UserIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { UserProfile } from '@/types/domain';
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from '../schemas/update-profile.schema';
import { useUpdateProfile } from '../hooks/use-update-profile';
import { AvatarUpload } from './avatar-upload';

const POPULAR_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada) - New York' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada) - Chicago' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada) - Denver' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada) - Los Angeles' },
  { value: 'America/Toronto', label: 'Eastern Time - Toronto' },
  { value: 'America/Sao_Paulo', label: 'Brasilia Time - São Paulo' },
  { value: 'Europe/London', label: 'Greenwich Mean Time - London' },
  { value: 'Europe/Paris', label: 'Central European Time - Paris' },
  { value: 'Europe/Berlin', label: 'Central European Time - Berlin' },
  { value: 'Europe/Amsterdam', label: 'Central European Time - Amsterdam' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time - Dubai' },
  { value: 'Asia/Dhaka', label: 'Bangladesh Standard Time - Dhaka' },
  { value: 'Asia/Kolkata', label: 'India Standard Time - Kolkata' },
  { value: 'Asia/Bangkok', label: 'Indochina Time - Bangkok' },
  { value: 'Asia/Singapore', label: 'Singapore Standard Time - Singapore' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong Time - Hong Kong' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time - Tokyo' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time - Sydney' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time - Auckland' },
];

interface ProfileFormProps {
  user: UserProfile;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const updateProfileMutation = useUpdateProfile();

  const detectedTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }, []);

  const timezoneOptions = useMemo(() => {
    const options = [...POPULAR_TIMEZONES];
    const currentTz = user.timezone || detectedTimezone;
    if (currentTz && !options.some((tz) => tz.value === currentTz)) {
      options.unshift({ value: currentTz, label: `${currentTz} (Current)` });
    }
    return options;
  }, [user.timezone, detectedTimezone]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name || '',
      bio: user.bio || '',
      phone: user.phone || '',
      timezone: user.timezone || detectedTimezone,
    },
  });

  const bioValue = watch('bio') || '';
  const bioLength = bioValue.length;

  // Reset default values when user profile updates
  useEffect(() => {
    reset({
      name: user.name || '',
      bio: user.bio || '',
      phone: user.phone || '',
      timezone: user.timezone || detectedTimezone,
    });
  }, [user, reset, detectedTimezone]);

  const onSubmit = (data: UpdateProfileInput) => {
    const payload = {
      name: data.name?.trim() || undefined,
      bio: data.bio?.trim() || '',
      phone: data.phone?.trim() || undefined,
      timezone: data.timezone?.trim() || undefined,
    };
    updateProfileMutation.mutate(payload);
  };

  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
          <UserIcon className="h-5 w-5 text-primary" /> Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload Section */}
        <AvatarUpload
          currentAvatar={user.avatar}
          name={user.name}
          className="pb-4 border-b border-border/60"
        />

        {/* Read-Only Identity Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Username Handle
            </span>
            <div className="flex items-center gap-2">
              <AtSign className="h-4 w-4 text-muted-foreground/80" />
              <span className="font-mono text-sm font-semibold text-foreground">
                {user.username}
              </span>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 ml-auto">
                Permanent
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Email Address
            </span>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground/80" />
              <span className="text-sm font-medium text-foreground truncate">
                {user.email}
              </span>
              <Badge variant="success" className="text-[10px] py-0 px-1.5 ml-auto gap-1">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </Badge>
            </div>
          </div>
        </div>

        {/* Editable Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
          {/* Display Name */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Full Display Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="profile-name"
                placeholder="Alex Mercer"
                className="pl-10 h-11 rounded-lg"
                error={!!errors.name}
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Phone Number (E.164 Format) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-phone">Phone Number</Label>
              <span className="text-[11px] text-muted-foreground">E.164 format (e.g. +14155552671)</span>
            </div>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="profile-phone"
                type="tel"
                placeholder="+14155552671"
                className="pl-10 h-11 rounded-lg font-mono text-sm"
                error={!!errors.phone}
                {...register('phone')}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-timezone">Timezone</Label>
              <span className="text-[11px] text-muted-foreground">For activity & calendar alignment</span>
            </div>
            <div className="relative">
              <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
              <select
                id="profile-timezone"
                className="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-xs sm:text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                {...register('timezone')}
              >
                {timezoneOptions.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.timezone && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.timezone.message}
              </p>
            )}
          </div>

          {/* Bio / About */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-bio">Bio & Role</Label>
              <span
                className={`text-[11px] ${
                  bioLength > 500
                    ? 'text-danger font-semibold'
                    : 'text-muted-foreground'
                }`}
              >
                {bioLength}/500 characters
              </span>
            </div>
            <Textarea
              id="profile-bio"
              rows={3}
              placeholder="Tell your team a bit about your role, projects, or interests..."
              className="resize-none"
              error={!!errors.bio || bioLength > 500}
              {...register('bio')}
            />
            {errors.bio && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.bio.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              className="h-11 font-semibold rounded-lg shadow-xs gap-2 cursor-pointer"
              isLoading={updateProfileMutation.isPending}
              disabled={!isDirty && !updateProfileMutation.isPending}
            >
              <Save className="h-4 w-4" /> Save Profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
