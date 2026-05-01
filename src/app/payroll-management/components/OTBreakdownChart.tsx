'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { weeklyOTData } from '../data/mockPayrollData';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-foreground">OT Hours: <span className="font-mono font-semibold">{payload[0]?.value}h</span></p>
      <p className="text-muted-foreground">Cost: <span className="font-mono">${(payload[0]?.value * 18).toFixed(0)}</span></p>
    </div>
  );
};

export default function OTBreakdownChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">OT Hours by Worker</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Week Apr 28 – May 3 · 1.5× multiplier</p>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={weeklyOTData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="worker" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="ot" fill="var(--primary)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}