'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { useAuth } from '@/context/AuthContext';
import { canAccessRoute } from '@/lib/permissions';
import {
  LayoutDashboard, ScanFace, Banknote, Users, FolderTree, ArrowLeftRight,
  TrendingUp, AlertTriangle, FileText, Settings, CreditCard, Shield,
  ChevronLeft, ChevronRight, LogOut, Building2, UserPlus, SlidersHorizontal,
  GitBranch, MessageSquareWarning, Smartphone, MapPin, Bell, BarChart3,
  Download, ClipboardList,
} from 'lucide-react';

const navGroups = [
  {
    label: 'Operations',
    items: [
      { href: '/', icon: LayoutDashboard, label: 'Dashboard', badge: null, allowedRoles: ['engineer', 'supervisor', 'project_manager', 'admin'] },
      { href: '/attendance-monitoring', icon: ScanFace, label: 'Attendance', badge: '3', allowedRoles: ['engineer', 'supervisor', 'project_manager', 'admin'] },
      { href: '/payroll-management', icon: Banknote, label: 'Payroll', badge: '47', allowedRoles: ['project_manager', 'admin'] },
      { href: '/worker-profiles', icon: Users, label: 'Workers', badge: null, allowedRoles: ['engineer', 'supervisor', 'project_manager', 'admin'] },
    ],
  },
  {
    label: 'Project',
    items: [
      { href: '/wbs-explorer', icon: FolderTree, label: 'WBS Explorer', badge: null, allowedRoles: ['engineer', 'supervisor', 'project_manager', 'admin'] },
      { href: '/relocation-hub', icon: ArrowLeftRight, label: 'Relocation', badge: '2', allowedRoles: ['project_manager', 'admin'] },
      { href: '/productivity', icon: TrendingUp, label: 'Productivity', badge: null, allowedRoles: ['project_manager', 'admin'] },
      { href: '/issue-tracker', icon: AlertTriangle, label: 'Issues', badge: '5', allowedRoles: ['engineer', 'supervisor', 'project_manager', 'admin'] },
    ],
  },
  {
    label: 'Workforce',
    items: [
      { href: '/worker-onboarding', icon: UserPlus, label: 'Onboarding', badge: '4', allowedRoles: ['admin'] },
      { href: '/approval-workflows', icon: GitBranch, label: 'Approvals', badge: '8', allowedRoles: ['supervisor', 'project_manager', 'admin'] },
      { href: '/dispute-correction', icon: MessageSquareWarning, label: 'Disputes', badge: '2', allowedRoles: ['supervisor', 'project_manager', 'admin'] },
      { href: '/device-control', icon: Smartphone, label: 'Devices', badge: null, allowedRoles: ['admin'] },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { href: '/geofence', icon: MapPin, label: 'Geofence', badge: null, allowedRoles: ['admin'] },
      { href: '/notifications', icon: Bell, label: 'Notifications', badge: null, allowedRoles: ['worker', 'foreman', 'engineer', 'supervisor', 'project_manager', 'admin'] },
      { href: '/audit-log', icon: ClipboardList, label: 'Audit Log', badge: null, allowedRoles: ['admin'] },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/reports', icon: FileText, label: 'Reports', badge: null, allowedRoles: ['project_manager', 'admin'] },
      { href: '/commercial-reports', icon: BarChart3, label: 'Analytics', badge: null, allowedRoles: ['project_manager', 'admin'] },
      { href: '/accounting-export', icon: Download, label: 'Export', badge: null, allowedRoles: ['project_manager', 'admin'] },
      { href: '/pay-rules', icon: Settings, label: 'Pay Rules', badge: null, allowedRoles: ['admin'] },
    ],
  },
  {
    label: 'Admin',
    items: [
      { href: '/company-settings', icon: SlidersHorizontal, label: 'Settings', badge: null, allowedRoles: ['admin'] },
      { href: '/subscription', icon: CreditCard, label: 'Subscription', badge: null, allowedRoles: ['admin'] },
      { href: '/super-admin', icon: Shield, label: 'Super Admin', badge: null, allowedRoles: ['platform_owner'] },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside
      className="flex flex-col h-full bg-card border-r border-border transition-all duration-300 ease-in-out overflow-hidden"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <AppLogo size={32} />
          {!collapsed && (
            <span className="font-semibold text-base text-foreground truncate tracking-tight">
              LaborHub
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="ml-auto p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

       {/* Project Switcher */}
        {!collapsed && (
          <div className="px-3 py-2 border-b border-border shrink-0">
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted hover:bg-slate-200 transition-colors text-left">
              <Building2 size={14} className="text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">Company</p>
                <p className="text-xs text-muted-foreground truncate">Select project</p>
              </div>
            </button>
          </div>
        )}

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => {
            if (!item.allowedRoles || !user) return false;
            return canAccessRoute(user.userType, item.allowedRoles);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={`group-${group.label}`} className="mb-1">
              {!collapsed && (
                <p className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  {group.label}
                </p>
              )}
              {visibleItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={`nav-${item.href}`}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`relative flex items-center gap-3 mx-2 px-2 py-2 rounded-md text-sm font-medium transition-all duration-150 group ${
                      isActive
                        ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon size={18} className="shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary tabular-nums">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

       {/* Bottom */}
      {!collapsed && (
        <div className="border-t border-border p-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">LH</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">LaborHub</p>
              <p className="text-xs text-muted-foreground truncate">Project Management</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}