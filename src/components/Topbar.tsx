'use client';
import React, { useState } from 'react';
import { Bell, Search, Calendar, RefreshCw, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserRoleLabel = (userType?: string) => {
    switch (userType) {
      case 'worker':
        return 'Worker';
      case 'foreman':
        return 'Foreman';
      case 'engineer':
        return 'Engineer';
      case 'supervisor':
        return 'Supervisor';
      case 'project_manager':
        return 'Project Manager';
      case 'admin':
        return 'Company Admin';
      case 'platform_owner':
        return 'Platform Owner';
      default:
        return 'User';
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/auth/signin');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-6 gap-4 shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-muted border border-border rounded-md px-3 py-1.5 text-sm text-muted-foreground w-56">
          <Search size={14} />
          <span>Search workers...</span>
          <kbd className="ml-auto text-xs bg-background px-1.5 py-0.5 rounded border border-border font-mono">⌘K</kbd>
        </div>

        {/* Date */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted border border-border rounded-md px-3 py-1.5">
          <Calendar size={13} />
          <span>Fri, 01 May 2026</span>
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Refresh data"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>

        {/* User Profile - Top Right */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            {/* User Info */}
            <div className="hidden md:block text-right">
              <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                {user.fullName || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">
                {getUserRoleLabel(user.userType)}
              </p>
            </div>

            {/* User Avatar with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {user.fullName ? getUserInitials(user.fullName) : 'U'}
                  </span>
                </div>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-md shadow-lg z-20 py-1">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-semibold text-foreground truncate">{user.fullName || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logout Button - Always Visible */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-md transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}

        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-status-green animate-pulse-slow" style={{ backgroundColor: 'var(--status-green)' }} />
          <span className="inline">Live</span>
        </div>
      </div>
    </header>
  );
}