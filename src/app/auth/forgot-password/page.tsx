'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FormField } from '@/components/auth/FormField';
import { FormButton } from '@/components/auth/FormButton';
import { AuthLayout } from '@/components/AuthLayout';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await resetPassword(data.email);
      setSuccessMessage(
        'Password reset link sent! Check your email for instructions.'
      );
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to send reset link. Please try again.');
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive a password reset link."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            {successMessage}
          </div>
        )}

        <FormField
          label="Email"
          type="email"
          placeholder="you@example.com"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          error={errors.email}
        />

        <FormButton type="submit" isLoading={isSubmitting}>
          Send Reset Link
        </FormButton>

        <div className="text-center text-sm text-slate-600">
          Remember your password?{' '}
          <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
