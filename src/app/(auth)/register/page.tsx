import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = {
  title: 'Create Account — SyncSpace',
  description: 'Create a free SyncSpace account and start collaborating in real time.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
