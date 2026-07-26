import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'Sign In — SyncSpace',
  description: 'Sign in to your SyncSpace workspace to collaborate with your team.',
};

export default function LoginPage() {
  return <LoginForm />;
}
