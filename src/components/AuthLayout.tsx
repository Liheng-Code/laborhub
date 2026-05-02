'use client';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
}

export function AuthLayout({
  children,
  title = 'Welcome',
  subtitle = 'Sign in or start your company on LMS.',
  description = 'Multi-tenant SaaS for contractor companies. Track attendance with AI face verification, assign workers to projects, configure pay rules, and sign off payroll in clicks — not days.',
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Sidebar - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-slate-900">
              📦
            </div>
            <h1 className="text-xl font-semibold">Labor Management System</h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Bring your crews, payroll and projects into one place.
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            {description}
          </p>
        </div>

        <div className="text-slate-400 text-sm">
          v1 · 2026
        </div>
      </div>

      {/* Right Side - Form Area */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
            <p className="text-slate-600">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
