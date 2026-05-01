'use client';
import React, { useState } from 'react';
import { Search, UserPlus, ScanFace, AlertTriangle } from 'lucide-react';

import { mockWorkerProfiles, WorkerProfile } from '../data/mockWorkerProfileData';

const biometricIcon = (status: WorkerProfile['biometricStatus']) => {
  if (status === 'REGISTERED') return <ScanFace size={12} className="text-green-400" />;
  if (status === 'FAILED') return <AlertTriangle size={12} className="text-red-400" />;
  return <ScanFace size={12} className="text-yellow-400" />;
};

const scanRateColor = (rate: number) => {
  if (rate >= 95) return 'text-green-400';
  if (rate >= 80) return 'text-yellow-400';
  return 'text-red-400';
};

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function WorkerListPanel({ selectedId, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [tradeFilter, setTradeFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const trades = ['ALL', ...Array.from(new Set(mockWorkerProfiles.map((w) => w.trade)))];
  const projects = ['ALL', ...Array.from(new Set(mockWorkerProfiles.map((w) => w.project)))];

  const filtered = mockWorkerProfiles.filter((w) => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.trade.toLowerCase().includes(search.toLowerCase()) ||
      w.crewName.toLowerCase().includes(search.toLowerCase());
    const matchTrade = tradeFilter === 'ALL' || w.trade === tradeFilter;
    const matchProject = projectFilter === 'ALL' || w.project === projectFilter;
    const matchStatus = statusFilter === 'ALL' || w.status === statusFilter;
    return matchSearch && matchTrade && matchProject && matchStatus;
  });

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Workers</h2>
          <button className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:opacity-90 active:scale-95 transition-all">
            <UserPlus size={12} />
            Add Worker
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-muted border border-border rounded-md px-3 py-1.5 mb-2">
          <Search size={13} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, trade, crew..."
            className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none flex-1"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
            className="bg-muted border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none flex-1 min-w-0"
          >
            {trades.map((t) => <option key={`trade-f-${t}`} value={t}>{t === 'ALL' ? 'All Trades' : t}</option>)}
          </select>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-muted border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none flex-1 min-w-0"
          >
            {projects.map((p) => <option key={`proj-f-${p}`} value={p}>{p === 'ALL' ? 'All Projects' : p}</option>)}
          </select>
        </div>
      </div>

      {/* Count */}
      <div className="px-4 py-2 border-b border-border bg-zinc-900/30">
        <p className="text-xs text-muted-foreground">{filtered.length} of {mockWorkerProfiles.length} workers</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.map((worker) => (
          <button
            key={`wlist-${worker.id}`}
            onClick={() => onSelect(worker.id)}
            className={`w-full flex items-start gap-3 px-4 py-3 border-b border-border text-left transition-colors hover:bg-zinc-800/60 ${
              selectedId === worker.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
              style={{ background: worker.avatarColor }}
            >
              {worker.avatarInitials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground truncate">{worker.name}</p>
                <span className={`text-xs font-mono tabular-nums shrink-0 ${scanRateColor(worker.scanCompletionRate)}`}>
                  {worker.scanCompletionRate}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{worker.trade} · {worker.project}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1">
                  {biometricIcon(worker.biometricStatus)}
                  <span className="text-xs text-muted-foreground">{worker.biometricStatus}</span>
                </div>
                <span className="text-zinc-700">·</span>
                <span className="text-xs font-mono text-muted-foreground tabular-nums">
                  ${worker.dailyRate}/day
                </span>
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Search size={24} className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No workers found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}