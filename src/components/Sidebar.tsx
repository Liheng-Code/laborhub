'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
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
      { href: '/', icon: LayoutDashboard, label: 'Dashboard', badge: null },
      { href: '/attendance-monitoring', icon: ScanFace, label: 'Attendance', badge: '3' },
      { href: '/payroll-management', icon: Banknote, label: 'Payroll', badge: '47' },
      { href: '/worker-profiles', icon: Users, label: 'Workers', badge: null },
    ],
  },
  {
    label: 'Project',
    items: [
      { href: '/wbs-explorer', icon: FolderTree, label: 'WBS Explorer', badge: null },
      { href: '/relocation-hub', icon: ArrowLeftRight, label: 'Relocation', badge: '2' },
      { href: '/productivity', icon: TrendingUp, label: 'Productivity', badge: null },
      { href: '/issue-tracker', icon: AlertTriangle, label: 'Issues', badge: '5' },
    ],
  },
  {
    label: 'Workforce',
    items: [
      { href: '/worker-onboarding', icon: UserPlus, label: 'Onboarding', badge: '4' },
      { href: '/approval-workflows', icon: GitBranch, label: 'Approvals', badge: '8' },
      { href: '/dispute-correction', icon: MessageSquareWarning, label: 'Disputes', badge: '2' },
      { href: '/device-control', icon: Smartphone, label: 'Devices', badge: null },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { href: '/geofence', icon: MapPin, label: 'Geofence', badge: null },
      { href: '/notifications', icon: Bell, label: 'Notifications', badge: null },
      { href: '/audit-log', icon: ClipboardList, label: 'Audit Log', badge: null },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/reports', icon: FileText, label: 'Reports', badge: null },
      { href: '/commercial-reports', icon: BarChart3, label: 'Analytics', badge: null },
      { href: '/accounting-export', icon: Download, label: 'Export', badge: null },
      { href: '/pay-rules', icon: Settings, label: 'Pay Rules', badge: null },
    ],
  },
  {
    label: 'Admin',
    items: [
      { href: '/company-settings', icon: SlidersHorizontal, label: 'Settings', badge: null },
      { href: '/subscription', icon: CreditCard, label: 'Subscription', badge: null },
      { href: '/super-admin', icon: Shield, label: 'Super Admin', badge: null },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

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
              <p className="text-xs font-medium text-foreground truncate">Alpha Builders Co.</p>
              <p className="text-xs text-muted-foreground truncate">Tower A · 3 active projects</p>
            </div>
          </button>
        </div>
      )}

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={`group-${group.label}`} className="mb-1">
            {!collapsed && (
              <p className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
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
        ))}
      </nav>

      {/* Bottom User */}
      <div className="border-t border-border p-3 shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">PM</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">Rajan Mehta</p>
              <p className="text-xs text-muted-foreground truncate">Project Manager</p>
            </div>
            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">PM</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}