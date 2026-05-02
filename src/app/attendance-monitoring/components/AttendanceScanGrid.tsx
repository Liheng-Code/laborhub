'use client';

import React, { useState, useEffect } from 'react';
import { Filter, Download, Search } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import ManualOverrideModal from './ManualOverrideModal';
import { supabaseService, AttendanceRecord } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';

interface WorkerScanSummary {
  id: string;
  name: string;
  email: string;
  project: string;
  trade: string;
  morningIn: AttendanceRecord | null;
  morningOut: AttendanceRecord | null;
  afternoonIn: AttendanceRecord | null;
  afternoonOut: AttendanceRecord | null;
  otIn: AttendanceRecord | null;
  otOut: AttendanceRecord | null;
  totalHours: number | null;
  flag: 'GREEN' | 'YELLOW' | 'RED';
}

export default function AttendanceScanGrid() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [workers, setWorkers] = useState<WorkerScanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [overrideModal, setOverrideModal] = useState<{ open: boolean; workerId?: string; workerName?: string }>({ open: false });

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const [workers, records] = await Promise.all([
          supabaseService.getWorkers(user?.companyName || undefined),
          supabaseService.getAttendanceRecords(),
        ]);

        const workerScans: WorkerScanSummary[] = workers.map((w) => {
          const workerRecords = records.filter((r) => r.worker_id === w.id);

          const morningIn = workerRecords.find((r) => {
            const hour = new Date(r.scan_time).getHours();
            return r.scan_type === 'check_in' && hour < 12;
          }) || null;

          const morningOut = workerRecords.find((r) => {
            const hour = new Date(r.scan_time).getHours();
            return r.scan_type === 'check_out' && hour < 12;
          }) || null;

          const afternoonIn = workerRecords.find((r) => {
            const hour = new Date(r.scan_time).getHours();
            return r.scan_type === 'check_in' && hour >= 12 && hour < 17;
          }) || null;

          const afternoonOut = workerRecords.find((r) => {
            const hour = new Date(r.scan_time).getHours();
            return r.scan_type === 'check_out' && hour >= 12 && hour < 17;
          }) || null;

          const otIn = workerRecords.find((r) => {
            const hour = new Date(r.scan_time).getHours();
            return r.scan_type === 'check_in' && hour >= 17;
          }) || null;

          const otOut = workerRecords.find((r) => {
            const hour = new Date(r.scan_time).getHours();
            return r.scan_type === 'check_out' && hour >= 17;
          }) || null;

          const flaggedCount = workerRecords.filter((r) => r.status === 'flagged').length;
          const flag: 'GREEN' | 'YELLOW' | 'RED' = flaggedCount > 0 ? 'RED' : 'GREEN';

          return {
            id: w.id,
            name: w.full_name || w.email,
            email: w.email,
            project: 'Tower A', // TODO: Add project field to user_profiles
            trade: 'General', // TODO: Add trade field to user_profiles
            morningIn,
            morningOut,
            afternoonIn,
            afternoonOut,
            otIn,
            otOut,
            totalHours: null,
            flag,
          };
        });

        setWorkers(workerScans);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchAttendance();
    }
  }, [user]);

  const projects = ['ALL', ...Array.from(new Set(workers.map((w) => w.project)))];

  const filtered = workers.filter((w) => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.email.toLowerCase().includes(search.toLowerCase());
    const matchProject = projectFilter === 'ALL' || w.project === projectFilter;
    return matchSearch && matchProject;
  });

  const formatTime = (record: AttendanceRecord | null) => {
    if (!record) return null;
    return new Date(record.scan_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getStatusClass = (record: AttendanceRecord | null, verifiedClass: string, flaggedClass: string, pendingClass: string) => {
    if (!record) return 'scan-cell-missing';
    if (record.status === 'flagged') return flaggedClass;
    if (record.status === 'pending') return pendingClass;
    return verifiedClass;
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading attendance data...</div>;
  }

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
              placeholder="Search worker or email..."
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
                {['M-IN', 'M-OUT', 'A-IN', 'A-OUT', 'OT-IN', 'OT-OUT'].map((col) => (
                  <th key={`th-${col}`} className="text-center px-2 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {col}
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
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {worker.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
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
                  {[worker.morningIn, worker.morningOut, worker.afternoonIn, worker.afternoonOut, worker.otIn, worker.otOut].map((scan, i) => (
                    <td key={`cell-${worker.id}-${i}`} className="px-2 py-2.5 text-center">
                      {scan ? (
                        <div className={`inline-flex flex-col items-center rounded-md px-2 py-1 min-w-[52px] ${getStatusClass(scan, 'scan-cell-present', 'scan-cell-flagged', 'scan-cell-pending')}`}>
                          <span className="text-xs font-mono font-semibold tabular-nums">
                            {formatTime(scan)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-700">—</span>
                      )}
                    </td>
                  ))}

                  {/* Hours */}
                  <td className="px-3 py-2.5 text-center">
                    <span className="text-sm font-mono font-semibold tabular-nums text-foreground">
                      {worker.totalHours !== null ? `${worker.totalHours}h` : '—'}
                    </span>
                  </td>

                  {/* Flag */}
                  <td className="px-3 py-2.5 text-center">
                    {worker.flag === 'GREEN' && <Badge variant="green" dot>OK</Badge>}
                    {worker.flag === 'YELLOW' && <Badge variant="yellow" dot>Warn</Badge>}
                    {worker.flag === 'RED' && <Badge variant="red" dot>Alert</Badge>}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => setOverrideModal({ open: true, workerId: worker.id, workerName: worker.name })}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted border border-border rounded text-xs text-muted-foreground hover:text-foreground hover:bg-zinc-700 transition-colors"
                      title="Record manual override for this worker"
                    >
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
            Last updated: <span className="font-mono">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span> · Auto-refresh every 30s
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
