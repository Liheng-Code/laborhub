import React from 'react';
import { DollarSign, Clock, AlertCircle, UserCheck } from 'lucide-react';

const kpis = [
  {
    id: 'kpi-gross',
    label: 'Total Gross This Week',
    value: '$9,417',
    sub: '12 workers · Wk Apr 28–May 3',
    icon: DollarSign,
    status: 'orange' as const,
  },
  {
    id: 'kpi-pending',
    label: 'Pending Approval',
    value: '4',
    sub: 'Timesheets in PENDING',
    icon: AlertCircle,
    status: 'yellow' as const,
  },
  {
    id: 'kpi-ot-cost',
    label: 'OT Cost',
    value: '$2,097',
    sub: '22.2% of total gross',
    icon: Clock,
    status: 'blue' as const,
  },
  {
    id: 'kpi-deductions',
    label: 'Total Deductions',
    value: '$460',
    sub: '4 workers affected',
    icon: AlertCircle,
    status: 'red' as const,
  },
  {
    id: 'kpi-paid',
    label: 'Workers Paid',
    value: '2 / 12',
    sub: '$1,846 disbursed',
    icon: UserCheck,
    status: 'green' as const,
  },
];

const statusStyles: Record<string, string> = {
  orange: 'border-orange-500/30 bg-orange-950/20',
  yellow: 'border-yellow-500/30 bg-yellow-950/20',
  blue: 'border-blue-500/30 bg-blue-950/20',
  red: 'border-red-500/30 bg-red-950/20',
  green: 'border-green-500/30 bg-green-950/20',
};

const iconStyles: Record<string, string> = {
  orange: 'text-orange-400 bg-orange-950/40',
  yellow: 'text-yellow-400 bg-yellow-950/40',
  blue: 'text-blue-400 bg-blue-950/40',
  red: 'text-red-400 bg-red-950/40',
  green: 'text-green-400 bg-green-950/40',
};

const valueStyles: Record<string, string> = {
  orange: 'text-orange-400',
  yellow: 'text-yellow-400',
  blue: 'text-blue-400',
  red: 'text-red-400',
  green: 'text-green-400',
};

export default function PayrollKPIBar() {
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