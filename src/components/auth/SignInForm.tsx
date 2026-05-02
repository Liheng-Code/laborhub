'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FormField } from './FormField';
import { FormButton } from './FormButton';

interface SignInFormData {
  tenantSlug: string;
  email: string;
  password: string;
}

export function SignInForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    mode: 'onBlur',
    defaultValues: {
      tenantSlug: 'acme_demo',
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setErrorMessage('');
    try {
      await signIn(data.email, data.password, data.tenantSlug);
      router.push('/attendance-monitoring');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <FormField
        label="Company slug"
        type="text"
        placeholder="acme_demo"
        {...register('tenantSlug', {
          required: 'Company slug is required',
        })}
        error={errors.tenantSlug}
      />

      <FormField
        label="Email"
        type="email"
        placeholder="admin@acme.com"
        {...register('email', {
          required: 'Email is required',
        })}
        error={errors.email}
      />

      <FormField
        label="Password"
        type="password"
        placeholder="••••••••"
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
          },
        })}
        error={errors.password}
      />

      <FormButton type="submit" isLoading={isSubmitting}>
        Sign in
      </FormButton>

      <div className="text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign up
        </Link>
      </div>
    </form>
  );
}
