'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, Phone, User as UserIcon, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema, type RegisterInput } from '../schemas/register.schema';
import { useRegister } from '../hooks/use-register';
import { GoogleAuthButton } from './google-auth-button';
import { AuthDivider } from './auth-divider';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
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

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="w-full space-y-5">
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Start collaborating with your team in real time
        </p>
      </div>

      <GoogleAuthButton label="Sign up with Google" />

      <AuthDivider text="or register with email" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Username & Full Name in 2 Columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                className="pl-9 text-sm"
                error={!!errors.username}
                {...register('username')}
              />
            </div>
            {errors.username && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                className="pl-9 text-sm"
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
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <Input
              id="email"
              type="email"
              placeholder="john@company.com"
              className="pl-9 text-sm"
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

        {/* Phone Field (Optional) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="phone">Phone Number</Label>
            <span className="text-xs text-muted-foreground">(Optional)</span>
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <Input
              id="phone"
              type="tel"
              placeholder="+1 555-0123"
              className="pl-9 text-sm"
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

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-9 pr-9 text-sm"
                error={!!errors.password}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground/60 hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-9 pr-9 text-sm"
                error={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground/60 hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-danger font-medium mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-10 font-semibold shadow-sm mt-2"
          isLoading={registerMutation.isPending}
        >
          Create Account
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline transition-all"
        >
          Sign in instead
        </Link>
      </div>
    </div>
  );
}
