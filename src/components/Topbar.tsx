'use client';
import React, { useState } from 'react';
import { Bell, Search, Calendar, RefreshCw } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const [refreshing, setRefreshing] = useState(false);

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

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-status-green animate-pulse-slow" style={{ backgroundColor: 'var(--status-green)' }} />
          <span className="hidden sm:inline">Live</span>
        </div>
      </div>
    </header>
  );
}