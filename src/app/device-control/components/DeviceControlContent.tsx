'use client';
import React, { useState } from 'react';
import { Smartphone, AlertTriangle, CheckCircle, Shield, RefreshCw } from 'lucide-react';

type FraudSeverity = 'HIGH' | 'MEDIUM' | 'LOW';
type DeviceStatus = 'BOUND' | 'PENDING_CHANGE' | 'UNBOUND' | 'FLAGGED';

interface WorkerDevice {
  id: string;
  worker: string;
  workerId: string;
  device: string;
  os: string;
  boundDate: string;
  status: DeviceStatus;
  lastSeen: string;
}

interface FraudFlag {
  id: string;
  worker: string;
  type: string;
  severity: FraudSeverity;
  detectedAt: string;
  description: string;
  resolved: boolean;
}

const mockDevices: WorkerDevice[] = [
  { id: 'DEV-001', worker: 'Ahmad Razali', workerId: 'W-1001', device: 'Samsung Galaxy A54', os: 'Android 14', boundDate: '01 Apr 2026', status: 'BOUND', lastSeen: '2m ago' },
  { id: 'DEV-002', worker: 'Suresh Kumar', workerId: 'W-1002', device: 'Redmi Note 12', os: 'Android 13', boundDate: '05 Apr 2026', status: 'PENDING_CHANGE', lastSeen: '1h ago' },
  { id: 'DEV-003', worker: 'Budi Santoso', workerId: 'W-1003', device: 'OPPO A78', os: 'Android 13', boundDate: '10 Apr 2026', status: 'FLAGGED', lastSeen: '30m ago' },
  { id: 'DEV-004', worker: 'Ravi Nair', workerId: 'W-1004', device: 'iPhone 13', os: 'iOS 17', boundDate: '15 Apr 2026', status: 'BOUND', lastSeen: '5m ago' },
  { id: 'DEV-005', worker: 'Tan Wei Ming', workerId: 'W-1005', device: 'Unbound', os: '—', boundDate: '—', status: 'UNBOUND', lastSeen: 'Never' },
];

const mockFlags: FraudFlag[] = [
  { id: 'FRD-001', worker: 'Budi Santoso', type: 'Outside Geofence Scan', severity: 'HIGH', detectedAt: '01 May 2026 08:14', description: 'Scan detected 2.3km from project site boundary', resolved: false },
  { id: 'FRD-002', worker: 'Suresh Kumar', type: 'Multiple Workers on One Device', severity: 'HIGH', detectedAt: '30 Apr 2026 17:22', description: 'Device DEV-002 used for 2 different worker scans within 5 minutes', resolved: false },
  { id: 'FRD-003', worker: 'Ahmad Razali', type: 'Rapid Location Change', severity: 'MEDIUM', detectedAt: '29 Apr 2026 12:05', description: 'Location changed 15km in 3 minutes between scans', resolved: true },
  { id: 'FRD-004', worker: 'Ravi Nair', type: 'Repeated Face Failures', severity: 'LOW', detectedAt: '28 Apr 2026 07:55', description: '4 consecutive face scan failures before success', resolved: true },
];

const deviceStatusConfig: Record<DeviceStatus, { label: string; color: string; bg: string }> = {
  BOUND: { label: 'Bound', color: 'text-green-700', bg: 'bg-green-50 border border-green-200' },
  PENDING_CHANGE: { label: 'Pending Change', color: 'text-yellow-700', bg: 'bg-yellow-50 border border-yellow-200' },
  UNBOUND: { label: 'Unbound', color: 'text-slate-600', bg: 'bg-slate-100 border border-slate-200' },
  FLAGGED: { label: 'Flagged', color: 'text-red-700', bg: 'bg-red-50 border border-red-200' },
};

const severityConfig: Record<FraudSeverity, { color: string; bg: string }> = {
  HIGH: { color: 'text-red-700', bg: 'bg-red-50 border border-red-200' },
  MEDIUM: { color: 'text-orange-700', bg: 'bg-orange-50 border border-orange-200' },
  LOW: { color: 'text-yellow-700', bg: 'bg-yellow-50 border border-yellow-200' },
};

export default function DeviceControlContent() {
  const [activeTab, setActiveTab] = useState<'devices' | 'fraud'>('devices');

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Bound Devices', value: mockDevices.filter(d => d.status === 'BOUND').length, color: 'text-green-600', bg: 'bg-green-50', icon: Smartphone },
          { label: 'Pending Changes', value: mockDevices.filter(d => d.status === 'PENDING_CHANGE').length, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: RefreshCw },
          { label: 'Active Fraud Flags', value: mockFlags.filter(f => !f.resolved).length, color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle },
          { label: 'Resolved Flags', value: mockFlags.filter(f => f.resolved).length, color: 'text-slate-600', bg: 'bg-slate-100', icon: CheckCircle },
        ].map((k) => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${k.bg} flex items-center justify-center shrink-0`}>
              <k.icon size={20} className={k.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-1 px-5 pt-4 border-b border-border">
          {(['devices', 'fraud'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-medium rounded-t-md transition-colors capitalize ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab === 'devices' ? 'Device Registry' : 'Fraud Flags'}
            </button>
          ))}
        </div>

        {activeTab === 'devices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {['Worker', 'Device', 'OS', 'Bound Date', 'Status', 'Last Seen', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockDevices.map((d) => {
                  const sc = deviceStatusConfig[d.status];
                  return (
                    <tr key={d.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-foreground text-sm">{d.worker}</p>
                        <p className="text-xs text-muted-foreground font-mono">{d.workerId}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{d.device}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{d.os}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{d.boundDate}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{d.lastSeen}</td>
                      <td className="px-5 py-3">
                        {d.status === 'PENDING_CHANGE' && (
                          <div className="flex gap-1">
                            <button className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors">Approve</button>
                            <button className="px-2 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors">Deny</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'fraud' && (
          <div className="divide-y divide-border">
            {mockFlags.map((f) => {
              const sc = severityConfig[f.severity];
              return (
                <div key={f.id} className={`px-5 py-4 flex items-start justify-between gap-4 ${f.resolved ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${f.severity === 'HIGH' ? 'bg-red-50' : f.severity === 'MEDIUM' ? 'bg-orange-50' : 'bg-yellow-50'}`}>
                      <Shield size={15} className={f.severity === 'HIGH' ? 'text-red-600' : f.severity === 'MEDIUM' ? 'text-orange-600' : 'text-yellow-600'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs text-muted-foreground">{f.id}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{f.severity}</span>
                        {f.resolved && <span className="text-xs text-green-600 font-medium">✓ Resolved</span>}
                      </div>
                      <p className="text-sm font-semibold text-foreground">{f.type}</p>
                      <p className="text-xs text-muted-foreground">{f.worker} · {f.detectedAt}</p>
                      <p className="text-xs text-muted-foreground mt-1">{f.description}</p>
                    </div>
                  </div>
                  {!f.resolved && (
                    <button className="px-3 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-primary/90 transition-colors shrink-0">Investigate</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
