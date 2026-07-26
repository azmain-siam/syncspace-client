import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export const metadata: Metadata = {
  title: 'Reset Password — SyncSpace',
  description: 'Request a password reset link for your SyncSpace account.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
