'use client';
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { scanCompletionHistory } from '../data/mockAttendanceData';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const rate = payload[0]?.value;
  const target = payload[1]?.value;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-foreground">Completion: <span className="font-mono font-semibold">{rate}%</span></p>
      <p className="text-muted-foreground">Target: <span className="font-mono">{target}%</span></p>
    </div>
  );
};

export default function ScanCompletionChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Scan Completion Rate</h3>
          <p className="text-xs text-muted-foreground mt-0.5">14-day trend vs 95% target</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--primary)' }} />
            <span className="text-muted-foreground">Actual</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-zinc-500" />
            <span className="text-muted-foreground">Target</span>
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={scanCompletionHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
          <YAxis domain={[75, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={95} stroke="var(--muted-foreground)" strokeDasharray="4 4" strokeWidth={1} />
          <Area type="monotone" dataKey="rate" stroke="var(--primary)" strokeWidth={2} fill="url(#scanGrad)" dot={false} activeDot={{ r: 4, fill: 'var(--primary)' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}