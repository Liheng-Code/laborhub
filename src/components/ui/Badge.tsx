import React from 'react';

type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'orange' | 'muted';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: 'status-green',
  yellow: 'status-yellow',
  red: 'status-red',
  blue: 'status-blue',
  orange: 'status-orange',
  muted: 'text-muted-foreground bg-muted',
};

export default function Badge({ variant, children, className = '', dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}