import { AuthLayout } from '@/components/AuthLayout';
import { SignUpForm } from '@/components/auth/SignUpForm';

export const metadata = {
  title: 'Sign Up - Labor Management System',
  description: 'Create a new Labor Management System account',
};

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Get started"
      subtitle="Create your account to manage your labor and payroll."
    >
      <SignUpForm />
    </AuthLayout>
  );
}
