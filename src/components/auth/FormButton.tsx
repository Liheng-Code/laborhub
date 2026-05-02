'use client';

import { ButtonHTMLAttributes } from 'react';

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export function FormButton({ 
  children, 
  isLoading = false, 
  className = '',
  disabled,
  ...props 
}: FormButtonProps) {
  return (
    <button
      className={`w-full px-4 py-2 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
