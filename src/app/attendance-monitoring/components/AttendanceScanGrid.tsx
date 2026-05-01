'use client';
import React, { useState } from 'react';
import { Filter, Download, UserX, Search } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import ManualOverrideModal from './ManualOverrideModal';
import { mockWorkerScans, ScanType, ScanStatus, WorkerScanRow } from '../data/mockAttendanceData';

const SCAN_COLS: { key: ScanType; label: string; short: string }[] = [
  { key: 'MORNING_IN', label: 'Morning In', short: 'M-IN' },
  { key: 'MORNING_OUT', label: 'Morning Out', short: 'M-OUT' },
  { key: 'AFTERNOON_IN', label: 'Aftn In', short: 'A-IN' },
  { key: 'AFTERNOON_OUT', label: 'Aftn Out', short: 'A-OUT' },
  { key: 'OT_IN', label: 'OT In', short: 'OT-IN' },
  { key: 'OT_OUT', label: 'OT Out', short: 'OT-OUT' },
];

function ScanCell({ status, time, score }: { status: ScanStatus; time: string | null; score: number | null }) {
  if (status === 'NA') {
    return (
      <td className="px-2 py-2.5 text-center">
        <span className="text-xs text-zinc-700">—</span>
      </td>
    );
  }

  const cellClass =
    status === 'SYNCED' ? 'scan-cell-present' :
    status === 'FLAGGED' ? 'scan-cell-flagged' :
    status === 'PENDING'? 'scan-cell-pending' : 'scan-cell-missing';

  return (
    <td className="px-2 py-2.5 text-center">
      <div className={`inline-flex flex-col items-center rounded-md px-2 py-1 min-w-[52px] ${cellClass}`}>
        <span className="text-xs font-mono font-semibold tabular-nums">
          {time ?? '—'}
        </span>
        {score !== null && (
          <span className="text-xs opacity-70">{Math.round(score * 100)}%</span>
        )}
      </div>
    </td>
  );
}

const flagBadge = (flag: WorkerScanRow['flag']) => {
  if (flag === 'GREEN') return <Badge variant="green" dot>OK</Badge>;
  if (flag === 'YELLOW') return <Badge variant="yellow" dot>Warn</Badge>;
  if (flag === 'RED') return <Badge variant="red" dot>Alert</Badge>;
  return null;
};

export default function AttendanceScanGrid() {
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [flagFilter, setFlagFilter] = useState('ALL');
  const [overrideModal, setOverrideModal] = useState<{ open: boolean; workerId?: string; workerName?: string }>({ open: false });

  const projects = ['ALL', ...Array.from(new Set(mockWorkerScans.map((w) => w.project)))];

  const filtered = mockWorkerScans.filter((w) => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.trade.toLowerCase().includes(search.toLowerCase());
    const matchProject = projectFilter === 'ALL' || w.project === projectFilter;
    const matchFlag = flagFilter === 'ALL' || w.flag === flagFilter;
    return matchSearch && matchProject && matchFlag;
  });

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2 bg-muted border border-border rounded-md px-3 py-1.5 flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search worker or trade..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-muted border border-border rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {projects.map((p) => (
                <option key={`proj-filter-${p}`} value={p}>{p === 'ALL' ? 'All Projects' : p}</option>
              ))}
            </select>
            <select
              value={flagFilter}
              onChange={(e) => setFlagFilter(e.target.value)}
              className="bg-muted border border-border rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Status</option>
              <option value="GREEN">Green</option>
              <option value="YELLOW">Warning</option>
              <option value="RED">Alert</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{filtered.length} workers</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-zinc-700 transition-colors">
              <Download size={13} />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm" style={{ minWidth: 900 }}>
            <thead>
              <tr className="border-b border-border bg-zinc-900/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-48">Worker</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Project</th>
                {SCAN_COLS.map((col) => (
                  <th key={`th-${col.key}`} className="text-center px-2 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {col.short}
                  </th>
                ))}
                <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Hours</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((worker, idx) => (
                <tr
                  key={`scan-row-${worker.id}`}
                  className={`border-b border-border hover:bg-zinc-800/40 transition-colors ${idx % 2 === 1 ? 'bg-zinc-900/20' : ''}`}
                >
                  {/* Worker */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: worker.avatarColor }}
                      >
                        {worker.photoInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{worker.name}</p>
                        <p className="text-xs text-muted-foreground">{worker.trade}</p>
                      </div>
                    </div>
                  </td>

                  {/* Project */}
                  <td className="px-3 py-2.5">
                    <span className="text-xs text-foreground">{worker.project}</span>
                  </td>

                  {/* Scan cells */}
                  {SCAN_COLS.map((col) => (
                    <ScanCell
                      key={`cell-${worker.id}-${col.key}`}
                      status={worker.scans[col.key].status}
                      time={worker.scans[col.key].time}
                      score={worker.scans[col.key].serverScore ?? worker.scans[col.key].localScore}
                    />
                  ))}

                  {/* Hours */}
                  <td className="px-3 py-2.5 text-center">
                    <span className="text-sm font-mono font-semibold tabular-nums text-foreground">
                      {worker.totalHours !== null ? `${worker.totalHours}h` : '—'}
                    </span>
                  </td>

                  {/* Flag */}
                  <td className="px-3 py-2.5 text-center">{flagBadge(worker.flag)}</td>

                  {/* Actions */}
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => setOverrideModal({ open: true, workerId: worker.id, workerName: worker.name })}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted border border-border rounded text-xs text-muted-foreground hover:text-foreground hover:bg-zinc-700 transition-colors"
                      title="Record manual override for this worker"
                    >
                      <UserX size={12} />
                      Override
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-zinc-900/30">
          <p className="text-xs text-muted-foreground">
            Last updated: <span className="font-mono">09:24 AM</span> · Auto-refresh every 30s
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded scan-cell-present inline-block" />Verified</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded scan-cell-pending inline-block" />Pending</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded scan-cell-flagged inline-block" />Flagged</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded scan-cell-missing inline-block" />Missing</span>
          </div>
        </div>
      </div>

      <ManualOverrideModal
        open={overrideModal.open}
        onClose={() => setOverrideModal({ open: false })}
        workerId={overrideModal.workerId}
        workerName={overrideModal.workerName}
      />
    </>
  );
}