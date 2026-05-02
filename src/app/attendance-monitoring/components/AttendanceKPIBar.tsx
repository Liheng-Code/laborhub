'use client';

import React, { useEffect, useState } from 'react';
import { ScanFace, AlertTriangle, Users, Clock, WifiOff } from 'lucide-react';
import { api } from '@/lib/api/client';

interface KPI {
  id: string;
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  status: 'red' | 'yellow' | 'green' | 'blue' | 'muted';
}

const statusStyles: Record<string, string> = {
  red: 'border-red-500/30 bg-red-950/20',
  yellow: 'border-yellow-500/30 bg-yellow-950/20',
  green: 'border-green-500/30 bg-green-950/20',
  blue: 'border-blue-500/30 bg-blue-950/20',
  muted: 'border-border bg-card',
};

const iconStyles: Record<string, string> = {
  red: 'text-red-400 bg-red-950/40',
  yellow: 'text-yellow-400 bg-yellow-950/40',
  green: 'text-green-400 bg-green-950/40',
  blue: 'text-blue-400 bg-blue-950/40',
  muted: 'text-muted-foreground bg-muted',
};

const valueStyles: Record<string, string> = {
  red: 'text-red-400',
  yellow: 'text-yellow-400',
  green: 'text-green-400',
  blue: 'text-blue-400',
  muted: 'text-foreground',
};

export default function AttendanceKPIBar() {
  const [kpis, setKpis] = useState<KPI[]>([
    { id: 'kpi-scan-rate', label: 'Scan Completion', value: '...', sub: 'Loading...', icon: ScanFace, status: 'muted' },
    { id: 'kpi-unverified', label: 'Unverified Scans', value: '...', sub: 'Loading...', icon: AlertTriangle, status: 'muted' },
    { id: 'kpi-on-site', label: 'Workers On Site', value: '...', sub: 'Loading...', icon: Users, status: 'muted' },
    { id: 'kpi-ot-active', label: 'OT Active Now', value: '...', sub: 'Loading...', icon: Clock, status: 'muted' },
    { id: 'kpi-pending-sync', label: 'Pending Sync', value: '...', sub: 'Loading...', icon: WifiOff, status: 'muted' },
  ]);

  useEffect(() => {
    async function fetchKPIs() {
      try {
        const response = await api.get<any[]>('/scans/today');

        if (response.data) {
          const scans = response.data;
          const verified = scans.filter((s) => s.face_verified).length;
          const flagged = scans.filter((s) => !s.face_verified && s.sync_status === 'SYNCED').length;
          const pending = scans.filter((s) => s.sync_status === 'PENDING').length;
          const morningIns = scans.filter((s) => s.scan_type === 'MORNING_IN').length;
          const otActive = scans.filter((s) => s.scan_type === 'OT_IN').length;
          const totalWorkers = 52;

          const newKpis: KPI[] = [
            {
              id: 'kpi-scan-rate',
              label: 'Scan Completion',
              value: `${scans.length > 0 ? Math.round((verified / scans.length) * 100) : 0}%`,
              sub: `${scans.length} scans today`,
              icon: ScanFace,
              status: scans.length > 0 && verified / scans.length > 0.8 ? 'green' : 'red',
            },
            {
              id: 'kpi-unverified',
              label: 'Unverified Scans',
              value: `${flagged}`,
              sub: flagged > 0 ? 'Needs PM review' : 'All verified',
              icon: AlertTriangle,
              status: flagged > 0 ? 'red' : 'green',
            },
            {
              id: 'kpi-on-site',
              label: 'Workers On Site',
              value: `${morningIns} / ${totalWorkers}`,
              sub: `${totalWorkers - morningIns} missing this block`,
              icon: Users,
              status: morningIns >= totalWorkers * 0.8 ? 'green' : 'yellow',
            },
            {
              id: 'kpi-ot-active',
              label: 'OT Active Now',
              value: `${otActive}`,
              sub: otActive > 0 ? 'Workers in OT' : 'No OT scheduled',
              icon: Clock,
              status: otActive > 0 ? 'blue' : 'muted',
            },
            {
              id: 'kpi-pending-sync',
              label: 'Pending Sync',
              value: `${pending}`,
              sub: pending > 0 ? 'Waiting for sync' : 'All synced',
              icon: WifiOff,
              status: pending === 0 ? 'green' : 'yellow',
            },
          ];

          setKpis(newKpis);
        }
      } catch (error) {
        console.error('Error fetching KPIs:', error);
      }
    }

    fetchKPIs();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.id} className={`rounded-xl border p-4 ${statusStyles[kpi.status]}`}>
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconStyles[kpi.status]}`}>
              <kpi.icon size={16} />
            </div>
          </div>
          <p className={`text-2xl font-bold tabular-nums font-mono ${valueStyles[kpi.status]}`}>{kpi.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
        </div>
      ))}
    </div>
  );
}
