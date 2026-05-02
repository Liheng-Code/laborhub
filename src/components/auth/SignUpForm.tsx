'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FormField } from './FormField';
import { FormButton } from './FormButton';

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
}

export function SignUpForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    mode: 'onBlur',
  });

  const onSubmit = async (data: SignUpFormData) => {
    setErrorMessage('');
    try {
      await signUp(data.companyName, data.email, data.password, data.fullName);
      router.push('/attendance-monitoring');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to create account. Please try again.');
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
        label="Full name"
        type="text"
        placeholder="John Doe"
        {...register('fullName', {
          required: 'Full name is required',
          minLength: {
            value: 2,
            message: 'Full name must be at least 2 characters',
          },
        })}
        error={errors.fullName}
      />

      <FormField
        label="Email"
        type="email"
        placeholder="you@example.com"
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
            value: 8,
            message: 'Password must be at least 8 characters',
          },
        })}
        error={errors.password}
      />

      <FormField
        label="Company name"
        type="text"
        placeholder="Acme Construction"
        {...register('companyName', {
          required: 'Company name is required',
        })}
        error={errors.companyName}
      />

      <FormButton type="submit" isLoading={isSubmitting}>
        Create account
      </FormButton>

      <div className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in
        </Link>
      </div>
    </form>
  );
}
