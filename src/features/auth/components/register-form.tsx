/* eslint-disable react-hooks/incompatible-library */
'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, Sparkles, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema, type RegisterInput } from '../schemas/register.schema';
import { useRegister } from '../hooks/use-register';
import { SocialAuthButtons } from './social-auth-buttons';
import { AuthDivider } from './auth-divider';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');
  const passwordLength = passwordValue.length;

  const onSubmit = (data: RegisterInput) => {
    // If username is empty, auto-generate from email prefix
    if (!data.username && data.email) {
      data.username = data.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_');
    }
    registerMutation.mutate(data);
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row">
      {/* ─── Left Hero Side (Desktop Only - Image 1) ─── */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-[#1e1b4b] via-[#0f172a] to-[#020617] text-white p-12 flex-col justify-between relative overflow-hidden border-r border-white/10">
        {/* Decorative Glow */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/30 rounded-full blur-3xl pointer-events-none" />

        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary-foreground text-xs font-bold tracking-wider w-fit">
          <Sparkles className="h-3.5 w-3.5" /> NEW ERA OF WORK
        </div>

        {/* Center Copy & Showcase Mockup */}
        <div className="space-y-8 my-auto max-w-lg mx-auto text-left">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Collaborate in real-time, across any distance.
            </h1>
            <p className="text-sm text-white/70 leading-relaxed font-normal">
              Experience frictionless teamwork with our proprietary sync engine. From wireframes to deep work, SyncSpace keeps your team in flow.
            </p>
          </div>

          {/* Interactive Multi-Cursor Screen Mockup */}
          <div className="rounded-2xl border border-white/15 bg-[#09090b] p-4 shadow-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="text-[10px] font-mono text-white/40">SyncSpace Canvas</div>
            </div>

            {/* Document Content with Live Cursors */}
            <div className="p-4 rounded-xl bg-white/5 space-y-2 relative text-xs text-white/80">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              {/* Simulated Live Cursors */}
              <div className="absolute top-3 right-12 px-2 py-0.5 rounded bg-emerald-500 text-black font-bold text-[9px] shadow-sm flex items-center gap-1">
                <span>Alex S.</span>
              </div>
              <div className="absolute bottom-2 left-1/3 px-2 py-0.5 rounded bg-purple-500 text-white font-bold text-[9px] shadow-sm flex items-center gap-1">
                <span>Maria G.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Proof Text */}
        <div className="text-[11px] font-bold uppercase tracking-widest text-white/40">
          JOIN 10,000+ HIGH-PERFORMING TEAMS WORLDWIDE.
        </div>
      </div>

      {/* ─── Right Form Side (Mobile & Desktop) ─── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 min-h-screen bg-background">
        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-base shadow-xs">
            S
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground">
            SyncSpace
          </span>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-100 mx-auto my-auto space-y-5">
          <div className="space-y-1 text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Create your workspace
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Start your 14-day free trial. No credit card required.
            </p>
          </div>

          {/* Social Auth Buttons Grid */}
          <SocialAuthButtons />

          {/* Divider */}
          <AuthDivider text="OR CONTINUE WITH EMAIL" />

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-10 h-11"
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

            {/* Work Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-10 h-11"
                  error={!!errors.email}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-danger font-medium mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Hidden Username Field (auto-filled if empty) */}
            <input type="hidden" {...register('username')} />
            <input type="hidden" {...register('confirmPassword')} value={passwordValue} />

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11"
                  error={!!errors.password}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-muted-foreground/60 hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator Bars */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <div className={`h-1 rounded-full ${passwordLength > 0 ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`h-1 rounded-full ${passwordLength >= 6 ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`h-1 rounded-full ${passwordLength >= 8 ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`h-1 rounded-full ${passwordLength >= 10 ? 'bg-emerald-500' : 'bg-muted'}`} />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Enter at least 8 characters
              </p>

              {errors.password && (
                <p className="text-xs text-danger font-medium mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-xs rounded-lg mt-2"
              isLoading={registerMutation.isPending}
            >
              Create Account
            </Button>
          </form>

          {/* Legal note */}
          <p className="text-[11px] text-center text-muted-foreground leading-normal">
            By signing up, you agree to our{' '}
            <span className="font-semibold text-primary hover:underline cursor-pointer">Terms of Service</span>{' '}
            and{' '}
            <span className="font-semibold text-primary hover:underline cursor-pointer">Privacy Policy</span>.
          </p>

          <div className="border-t border-border/40 pt-4 text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-primary hover:underline transition-all"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="w-full max-w-100 mx-auto pt-6 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
          <div>© {new Date().getFullYear()} SyncSpace Technologies.</div>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer">Security</span>
            <span className="hover:text-foreground cursor-pointer">Help Center</span>
          </div>
        </div>
      </div>
    </div>
  );
}
