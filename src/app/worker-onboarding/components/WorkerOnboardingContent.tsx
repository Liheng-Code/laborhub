'use client';
import React, { useState } from 'react';
import { UserPlus, UserX, CheckCircle, Clock, AlertCircle, Search, MoreHorizontal } from 'lucide-react';

type WorkerStatus = 'PENDING_REGISTRATION' | 'ACTIVE' | 'SUSPENDED' | 'OFFBOARDED' | 'BLACKLISTED';

interface OnboardingWorker {
  id: string;
  name: string;
  trade: string;
  status: WorkerStatus;
  step: string;
  startDate: string;
  completedSteps: number;
  totalSteps: number;
}

const mockWorkers: OnboardingWorker[] = [
  { id: 'W-1001', name: 'Ahmad Razali', trade: 'Carpenter', status: 'PENDING_REGISTRATION', step: 'Face Registration', startDate: '28 Apr 2026', completedSteps: 2, totalSteps: 6 },
  { id: 'W-1002', name: 'Suresh Kumar', trade: 'Electrician', status: 'PENDING_REGISTRATION', step: 'PIN Setup', startDate: '29 Apr 2026', completedSteps: 3, totalSteps: 6 },
  { id: 'W-1003', name: 'Budi Santoso', trade: 'Welder', status: 'ACTIVE', step: 'Completed', startDate: '25 Apr 2026', completedSteps: 6, totalSteps: 6 },
  { id: 'W-1004', name: 'Ravi Nair', trade: 'Plumber', status: 'SUSPENDED', step: 'Suspended', startDate: '20 Apr 2026', completedSteps: 6, totalSteps: 6 },
  { id: 'W-1005', name: 'Tan Wei Ming', trade: 'Mason', status: 'OFFBOARDED', step: 'Offboarded', startDate: '10 Apr 2026', completedSteps: 6, totalSteps: 6 },
  { id: 'W-1006', name: 'Rajesh Pillai', trade: 'Painter', status: 'PENDING_REGISTRATION', step: 'Device Binding', startDate: '30 Apr 2026', completedSteps: 4, totalSteps: 6 },
  { id: 'W-1007', name: 'Mohd Faizal', trade: 'Ironworker', status: 'BLACKLISTED', step: 'Blacklisted', startDate: '01 Mar 2026', completedSteps: 6, totalSteps: 6 },
];

const onboardingSteps = [
  'Profile Creation',
  'Face Registration',
  'PIN Setup',
  'Device Binding',
  'Orientation Confirmation',
  'Activation',
];

const statusConfig: Record<WorkerStatus, { label: string; color: string; bg: string }> = {
  PENDING_REGISTRATION: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-50 border border-yellow-200' },
  ACTIVE: { label: 'Active', color: 'text-green-700', bg: 'bg-green-50 border border-green-200' },
  SUSPENDED: { label: 'Suspended', color: 'text-orange-700', bg: 'bg-orange-50 border border-orange-200' },
  OFFBOARDED: { label: 'Offboarded', color: 'text-slate-600', bg: 'bg-slate-100 border border-slate-200' },
  BLACKLISTED: { label: 'Blacklisted', color: 'text-red-700', bg: 'bg-red-50 border border-red-200' },
};

export default function WorkerOnboardingContent() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<WorkerStatus | 'ALL'>('ALL');

  const filtered = mockWorkers.filter((w) => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || w.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const kpis = [
    { label: 'Pending Registration', value: mockWorkers.filter(w => w.status === 'PENDING_REGISTRATION').length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Active Workers', value: mockWorkers.filter(w => w.status === 'ACTIVE').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Suspended', value: mockWorkers.filter(w => w.status === 'SUSPENDED').length, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Blacklisted', value: mockWorkers.filter(w => w.status === 'BLACKLISTED').length, icon: UserX, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center shrink-0`}>
              <kpi.icon size={20} className={kpi.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Worker Table */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Worker Lifecycle</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-muted border border-border rounded-md px-3 py-1.5 text-sm text-muted-foreground w-48">
                <Search size={13} />
                <input
                  type="text"
                  placeholder="Search workers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground w-full"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as WorkerStatus | 'ALL')}
                className="text-xs bg-muted border border-border rounded-md px-2 py-1.5 text-foreground outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING_REGISTRATION">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="OFFBOARDED">Offboarded</option>
                <option value="BLACKLISTED">Blacklisted</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Worker</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Trade</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Progress</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Current Step</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => {
                  const sc = statusConfig[w.status];
                  const pct = Math.round((w.completedSteps / w.totalSteps) * 100);
                  return (
                    <tr key={w.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium text-foreground text-sm">{w.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{w.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{w.trade}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{w.step}</td>
                      <td className="px-4 py-3">
                        <button className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground">
                          <MoreHorizontal size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Onboarding Checklist */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Onboarding Checklist</h2>
          <p className="text-xs text-muted-foreground mb-4">Standard 6-step activation flow</p>
          <div className="space-y-3">
            {onboardingSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i < 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground border border-border'}`}>
                  {i < 3 ? <CheckCircle size={14} /> : i + 1}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${i < 3 ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</p>
                </div>
                {i < 3 && <CheckCircle size={14} className="text-green-500 shrink-0" />}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-foreground mb-3">Offboarding Flow</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              {['PM/Admin initiates', 'Assignment clearance', 'Final timesheet', 'Payroll approval', 'Status → OFFBOARDED', 'Account lock'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-mono text-slate-500 shrink-0">{i + 1}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-medium py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
            <UserPlus size={15} />
            Register New Worker
          </button>
        </div>
      </div>
    </div>
  );
}
