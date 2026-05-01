import React from 'react';
import { ScanFace, AlertTriangle, Users, Clock, WifiOff } from 'lucide-react';

const kpis = [
  {
    id: 'kpi-scan-rate',
    label: 'Scan Completion',
    value: '82%',
    sub: '↓ vs 94% yesterday',
    icon: ScanFace,
    status: 'red' as const,
  },
  {
    id: 'kpi-unverified',
    label: 'Unverified Scans',
    value: '3',
    sub: 'Needs PM review',
    icon: AlertTriangle,
    status: 'red' as const,
  },
  {
    id: 'kpi-on-site',
    label: 'Workers On Site',
    value: '47 / 52',
    sub: '5 missing this block',
    icon: Users,
    status: 'yellow' as const,
  },
  {
    id: 'kpi-ot-active',
    label: 'OT Active Now',
    value: '9',
    sub: 'Scanning OT block',
    icon: Clock,
    status: 'blue' as const,
  },
  {
    id: 'kpi-pending-sync',
    label: 'Pending Sync',
    value: '12',
    sub: 'Offline queue',
    icon: WifiOff,
    status: 'muted' as const,
  },
];

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
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className={`rounded-xl border p-4 ${statusStyles[kpi.status]}`}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {kpi.label}
            </p>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconStyles[kpi.status]}`}>
              <kpi.icon size={16} />
            </div>
          </div>
          <p className={`text-2xl font-bold tabular-nums font-mono ${valueStyles[kpi.status]}`}>
            {kpi.value}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
        </div>
      ))}
    </div>
  );
}