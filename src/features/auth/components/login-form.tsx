/* eslint-disable react-hooks/incompatible-library */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LayoutDashboard,
  Lock,
  Mail,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useLogin } from "../hooks/use-login";
import { useResendVerification } from "../hooks/use-resend-verification";
import { loginSchema, type LoginInput } from "../schemas/login.schema";
import { AuthDivider } from "./auth-divider";
import { SocialAuthButtons } from "./social-auth-buttons";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const emailParam = searchParams.get("email");

  const loginMutation = useLogin();
  const resendMutation = useResendVerification();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailParam || "",
      password: "",
    },
  });

  const emailValue = watch("email");

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  const rawErrorMessage =
    (loginMutation.error?.response?.data as { message?: string | string[] })
      ?.message || "";
  const errorMessageText = Array.isArray(rawErrorMessage)
    ? rawErrorMessage.join(" ")
    : rawErrorMessage;

  const isUnverifiedEmail =
    errorMessageText.toLowerCase().includes("verify your email") ||
    loginMutation.error?.response?.status === 401 &&
      errorMessageText.toLowerCase().includes("verify");

  const isOAuthAccount =
    errorMessageText.toLowerCase().includes("oauth provider") ||
    errorMessageText.toLowerCase().includes("google");

  const handleResendVerification = () => {
    if (emailValue) {
      resendMutation.mutate({ email: emailValue });
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col lg:flex-row">
      {/* ─── Left Hero Side (Desktop Only) ─── */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-[#1e1b4b] via-[#0f172a] to-[#020617] text-white p-12 flex-col justify-between relative overflow-hidden border-r border-white/10">
        {/* Top Logo */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-base shadow-xs">
            S
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            SyncSpace
          </span>
        </div>

        {/* Center Visual Mockup & Hero Copy */}
        <div className="space-y-8 my-auto max-w-lg mx-auto text-center">
          {/* Mockup Tablet Screen */}
          <div className="rounded-2xl border border-white/20 bg-[#09090b] text-white p-4 shadow-2xl space-y-3 text-left transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-white">SyncSpace</span>
              </div>
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="p-2 rounded bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-white/70">To Do</div>
                <div className="p-1.5 rounded bg-[#18181c] border border-white/10 text-white font-medium text-[9px]">
                  Engine keyword optimization
                </div>
              </div>
              <div className="p-2 rounded bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-white/70">In Progress</div>
                <div className="p-1.5 rounded bg-[#18181c] border border-white/10 text-white font-medium text-[9px]">
                  Marketing & Application
                </div>
              </div>
              <div className="p-2 rounded bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-white/70">Done</div>
                <div className="p-1.5 rounded bg-[#18181c] border border-white/10 text-white font-medium text-[9px]">
                  Create development plan
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-3xl font-extrabold tracking-tight text-white">
              Master your workflow.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              Experience a high-fidelity workspace designed for focused
              engineering and creative teams.
            </p>
          </div>
        </div>

        {/* Bottom Left Brand Mark */}
        <div className="text-xs text-white/60 font-semibold">SyncSpace</div>
      </div>

      {/* ─── Right Form Side (Mobile & Desktop) ─── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-4 sm:p-8 lg:p-12 min-h-screen bg-background">
        {/* Top Mobile Brand Mark */}
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-base shadow-xs">
            S
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground">
            SyncSpace
          </span>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto space-y-6">
          <div className="space-y-1 text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sign in to continue your projects.
            </p>
          </div>

          {/* Social Auth Grid */}
          <SocialAuthButtons />

          {/* Divider */}
          <AuthDivider text="OR CONTINUE WITH EMAIL" />

          {/* Contextual Error Callouts */}
          {isUnverifiedEmail && (
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs space-y-2 text-left">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Email verification required</p>
                  <p className="text-muted-foreground dark:text-amber-200/80 leading-relaxed">
                    Please verify your email address before signing in. If you did not receive a link, you can request a new one below.
                  </p>
                </div>
              </div>

              {resendMutation.isSuccess ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Verification link sent! Check your inbox.</span>
                </div>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-semibold gap-1.5 border-amber-500/40 hover:bg-amber-500/20 text-foreground cursor-pointer mt-1"
                  onClick={handleResendVerification}
                  isLoading={resendMutation.isPending}
                >
                  <Send className="h-3 w-3" /> Resend Verification Email
                </Button>
              )}
            </div>
          )}

          {isOAuthAccount && (
            <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/10 text-foreground text-xs space-y-1 text-left">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Google Account Detected</p>
                  <p className="text-muted-foreground leading-relaxed">
                    This account was registered via Google. Please use the &quot;Google&quot; button above to sign in.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  className="pl-10 h-11"
                  error={!!errors.email}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p id="email-error" role="alert" className="text-xs text-danger font-medium mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline transition-all"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11"
                  error={!!errors.password}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="text-xs text-danger font-medium mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-xs gap-2 rounded-lg cursor-pointer"
              isLoading={loginMutation.isPending}
            >
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs text-muted-foreground pt-2">
            Don&apos;t have an account?{" "}
            <Link
              href={
                redirectParam
                  ? `/register?redirect=${encodeURIComponent(redirectParam)}`
                  : "/register"
              }
              className="font-bold text-primary hover:underline transition-all"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="w-full max-w-100 mx-auto pt-8 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
          <div>© {new Date().getFullYear()} SyncSpace</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
