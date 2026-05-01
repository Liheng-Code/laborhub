'use client';
import React, { useState } from 'react';
import { BarChart3, Download, Users, Clock, DollarSign, TrendingUp, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const reports = [
  { id: 'R-01', name: 'Daily Manpower Report', icon: Users, desc: 'Headcount by trade, project, and shift per day', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'R-02', name: 'Absentee Report', icon: Clock, desc: 'Workers absent, late, or with incomplete scans', color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'R-03', name: 'OT Cost Report', icon: DollarSign, desc: 'Overtime hours and cost breakdown by worker/trade', color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'R-04', name: 'Labour Cost Report', icon: BarChart3, desc: 'Total labour cost per project, week, and trade', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'R-05', name: 'Productivity by Trade', icon: TrendingUp, desc: 'Output vs benchmark per trade category', color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'R-06', name: 'Worker Performance', icon: Users, desc: 'Individual attendance rate, OT, and productivity score', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 'R-07', name: 'Transfer Cost Report', icon: FileText, desc: 'Cost impact of worker relocations across projects', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { id: 'R-08', name: 'Payroll Summary', icon: DollarSign, desc: 'Weekly payroll totals, deductions, and net pay', color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const weeklyManpower = [
  { week: 'W13', present: 142, absent: 8, ot: 34 },
  { week: 'W14', present: 156, absent: 5, ot: 41 },
  { week: 'W15', present: 148, absent: 12, ot: 28 },
  { week: 'W16', present: 161, absent: 4, ot: 52 },
  { week: 'W17', present: 154, absent: 9, ot: 47 },
];

const otCostData = [
  { trade: 'Carpenter', hours: 124, cost: 4960 },
  { trade: 'Electrician', hours: 98, cost: 4900 },
  { trade: 'Welder', hours: 87, cost: 3915 },
  { trade: 'Plumber', hours: 65, cost: 2925 },
  { trade: 'Mason', hours: 112, cost: 4480 },
];

export default function CommercialReportsContent() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available Reports', value: 8, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg Attendance Rate', value: '94.8%', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total OT Hours (W17)', value: '486h', color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Weekly Labour Cost', value: 'RM 124.5K', color: 'text-purple-600', bg: 'bg-purple-50' },
        ]?.map((k) => (
          <div key={k?.label} className="bg-card border border-border rounded-xl p-4">
            <p className={`text-2xl font-bold tabular-nums ${k?.color}`}>{k?.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k?.label}</p>
          </div>
        ))}
      </div>
      {/* Report Cards Grid */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-4">Report Suite</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports?.map((r) => (
            <div
              key={r?.id}
              onClick={() => setSelectedReport(selectedReport === r?.id ? null : r?.id)}
              className={`bg-card border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${selectedReport === r?.id ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}
            >
              <div className={`w-9 h-9 rounded-lg ${r?.bg} flex items-center justify-center mb-3`}>
                <r.icon size={18} className={r?.color} />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">{r?.name}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{r?.desc}</p>
              <div className="flex items-center gap-2 mt-3">
                <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Download size={11} /> Export PDF
                </button>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <Download size={11} /> Excel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Weekly Manpower Trend</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Present</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Absent</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyManpower} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="present" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="#fca5a5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">OT Cost by Trade (Week 17)</h3>
          <div className="space-y-3">
            {otCostData?.map((d) => {
              const maxCost = Math.max(...otCostData?.map(x => x?.cost));
              const pct = Math.round((d?.cost / maxCost) * 100);
              return (
                <div key={d?.trade} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{d?.trade}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-mono text-foreground w-16 text-right shrink-0">RM {d?.cost?.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground w-10 text-right shrink-0">{d?.hours}h</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
