import { AuthLayout } from '@/components/AuthLayout';
import { SignInForm } from '@/components/auth/SignInForm';

export const metadata = {
  title: 'Sign In - Labor Management System',
  description: 'Sign in to your Labor Management System account',
};

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome"
      subtitle="Sign in or start your company on LMS."
    >
      <SignInForm />
    </AuthLayout>
  );
}
