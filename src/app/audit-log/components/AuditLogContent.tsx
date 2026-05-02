'use client';
import React, { useState } from 'react';
import { ClipboardList, Search, Shield, User, Settings, Database, Key, Users } from 'lucide-react';

type EventCategory = 'AUTH' | 'ATTENDANCE' | 'PAYROLL' | 'WORKER' | 'SYSTEM' | 'SECURITY' | 'ROLE';

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  category: EventCategory;
  action: string;
  target: string;
  ipAddress: string;
  result: 'SUCCESS' | 'FAILURE';
}

const mockEvents: AuditEvent[] = [
  { id: 'AUD-0891', timestamp: '01 May 2026 09:38:12', actor: 'PM Rajan', actorRole: 'Project Manager', category: 'PAYROLL', action: 'PAYROLL_APPROVED', target: 'Week 17 Batch · 47 workers', ipAddress: '192.168.1.45', result: 'SUCCESS' },
  { id: 'AUD-0890', timestamp: '01 May 2026 09:14:05', actor: 'Admin Siti', actorRole: 'Admin', category: 'SECURITY', action: 'FRAUD_FLAG_CREATED', target: 'Worker W-1003 · DEV-003', ipAddress: '192.168.1.12', result: 'SUCCESS' },
  { id: 'AUD-0889', timestamp: '01 May 2026 08:55:33', actor: 'System', actorRole: 'Cron Job', category: 'ATTENDANCE', action: 'SESSION_CALCULATED', target: 'All workers · 01 May 2026', ipAddress: 'internal', result: 'SUCCESS' },
  { id: 'AUD-0888', timestamp: '01 May 2026 08:22:17', actor: 'Eng. Priya', actorRole: 'Engineer', category: 'ATTENDANCE', action: 'MANUAL_OVERRIDE_APPROVED', target: 'Worker W-1002 · APR-002', ipAddress: '192.168.1.78', result: 'SUCCESS' },
  { id: 'AUD-0887', timestamp: '01 May 2026 07:45:01', actor: 'Ahmad Razali', actorRole: 'Worker', category: 'AUTH', action: 'LOGIN_ATTEMPT', target: 'Mobile App', ipAddress: '10.0.0.55', result: 'FAILURE' },
  { id: 'AUD-0886', timestamp: '30 Apr 2026 18:00:00', actor: 'System', actorRole: 'Cron Job', category: 'PAYROLL', action: 'PAYSLIP_GENERATED', target: '47 payslips · Week 17', ipAddress: 'internal', result: 'SUCCESS' },
  { id: 'AUD-0885', timestamp: '30 Apr 2026 17:22:44', actor: 'Admin Siti', actorRole: 'Admin', category: 'WORKER', action: 'WORKER_SUSPENDED', target: 'Worker W-1004 · Ravi Nair', ipAddress: '192.168.1.12', result: 'SUCCESS' },
  { id: 'AUD-0884', timestamp: '30 Apr 2026 16:10:09', actor: 'PM Rajan', actorRole: 'Project Manager', category: 'SYSTEM', action: 'GEOFENCE_MODE_CHANGED', target: 'Tower A · WARN_ONLY → BLOCK', ipAddress: '192.168.1.45', result: 'SUCCESS' },
  { id: 'AUD-0883', timestamp: '30 Apr 2026 15:30:22', actor: 'Admin Siti', actorRole: 'Admin', category: 'ROLE', action: 'ROLE_ASSIGNED', target: 'User u-4452 · worker → foreman', ipAddress: '192.168.1.12', result: 'SUCCESS' },
  { id: 'AUD-0882', timestamp: '30 Apr 2026 14:18:55', actor: 'Admin Siti', actorRole: 'Admin', category: 'ROLE', action: 'ROLE_REVOKED', target: 'User u-3301 · supervisor → engineer', ipAddress: '192.168.1.12', result: 'SUCCESS' },
  { id: 'AUD-0881', timestamp: '30 Apr 2026 11:05:40', actor: 'Admin Siti', actorRole: 'Admin', category: 'ROLE', action: 'PAY_RULE_CHANGED', target: 'Overtime rate · 1.5x → 2.0x', ipAddress: '192.168.1.12', result: 'SUCCESS' },
];

const categoryConfig: Record<EventCategory, { icon: React.ElementType; color: string; bg: string }> = {
  AUTH: { icon: Key, color: 'text-blue-600', bg: 'bg-blue-50' },
  ATTENDANCE: { icon: ClipboardList, color: 'text-green-600', bg: 'bg-green-50' },
  PAYROLL: { icon: Database, color: 'text-purple-600', bg: 'bg-purple-50' },
  WORKER: { icon: User, color: 'text-orange-600', bg: 'bg-orange-50' },
  SYSTEM: { icon: Settings, color: 'text-slate-600', bg: 'bg-slate-100' },
  SECURITY: { icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
  ROLE: { icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

export default function AuditLogContent() {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<EventCategory | 'ALL'>('ALL');

  const filtered = mockEvents.filter((e) => {
    const matchSearch = e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.target.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'ALL' || e.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Events Today', value: mockEvents.filter(e => e.timestamp.startsWith('01 May')).length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Security Events', value: mockEvents.filter(e => e.category === 'SECURITY').length, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Failed Actions', value: mockEvents.filter(e => e.result === 'FAILURE').length, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Total Log Entries', value: '891', color: 'text-slate-600', bg: 'bg-slate-100' },
        ].map((k) => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-4">
            <p className={`text-2xl font-bold tabular-nums ${k.color}`}>{k.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Immutable notice */}
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <Shield size={15} className="text-blue-600 shrink-0" />
        <p className="text-xs text-blue-700">This log is <strong>immutable and append-only</strong>. All entries are cryptographically signed and cannot be modified or deleted.</p>
      </div>

      {/* Log Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border gap-3">
          <h2 className="text-sm font-semibold text-foreground shrink-0">Event Log</h2>
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="flex items-center gap-2 bg-muted border border-border rounded-md px-3 py-1.5 flex-1">
              <Search size={13} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search actor, action, target..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground w-full"
              />
            </div>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value as EventCategory | 'ALL')}
              className="text-xs bg-muted border border-border rounded-md px-2 py-1.5 text-foreground outline-none shrink-0"
            >
              <option value="ALL">All Categories</option>
              {(['AUTH', 'ATTENDANCE', 'PAYROLL', 'WORKER', 'SYSTEM', 'SECURITY', 'ROLE'] as EventCategory[]).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['Event ID', 'Timestamp', 'Actor', 'Category', 'Action', 'Target', 'IP', 'Result'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => {
                const cc = categoryConfig[ev.category];
                return (
                  <tr key={ev.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{ev.id}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{ev.timestamp}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-foreground">{ev.actor}</p>
                      <p className="text-xs text-muted-foreground">{ev.actorRole}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md ${cc.bg}`}>
                        <cc.icon size={11} className={cc.color} />
                        <span className={`text-xs font-medium ${cc.color}`}>{ev.category}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{ev.action}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{ev.target}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{ev.ipAddress}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${ev.result === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                        {ev.result === 'SUCCESS' ? '✓ Success' : '✗ Failed'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of 891 entries</p>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 text-xs bg-muted border border-border rounded hover:bg-slate-200 transition-colors text-muted-foreground">← Prev</button>
            <button className="px-2 py-1 text-xs bg-muted border border-border rounded hover:bg-slate-200 transition-colors text-muted-foreground">Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
