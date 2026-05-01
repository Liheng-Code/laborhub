import React from 'react';
import AppLayout from '@/components/AppLayout';
import PayrollKPIBar from './components/PayrollKPIBar';
import PayrollTimesheetTable from './components/PayrollTimesheetTable';
import OTBreakdownChart from './components/OTBreakdownChart';

export default function PayrollManagementPage() {
  return (
    <AppLayout
      title="Payroll Management"
      subtitle="Week Apr 28 – May 3, 2026 · 12 workers · Pending PM approval"
    >
      <div className="space-y-6">
        {/* Week selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
            <span className="text-xs text-muted-foreground">Pay week:</span>
            <select className="bg-transparent text-sm font-medium text-foreground focus:outline-none">
              <option>Apr 28 – May 3, 2026</option>
              <option>Apr 21 – Apr 27, 2026</option>
              <option>Apr 14 – Apr 20, 2026</option>
              <option>Apr 7 – Apr 13, 2026</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
            <span className="text-xs text-muted-foreground">Project:</span>
            <select className="bg-transparent text-sm font-medium text-foreground focus:outline-none">
              <option>All Projects</option>
              <option>Tower A</option>
              <option>Tower B</option>
              <option>Podium C</option>
            </select>
          </div>
          <p className="text-xs text-muted-foreground ml-auto">
            Payroll cron ran: <span className="font-mono">Sun Apr 27 23:00</span>
          </p>
        </div>

        {/* KPI Bar */}
        <PayrollKPIBar />

        {/* OT Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <OTBreakdownChart />
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Pay Rule Summary</h3>
            <p className="text-xs text-muted-foreground mb-4">Active rules · Effective Apr 1, 2026</p>
            <div className="space-y-3">
              {[
                { label: 'OT Threshold', value: '8.0 hrs/day', color: 'text-foreground' },
                { label: 'Weekday OT', value: '1.5×', color: 'text-orange-400' },
                { label: 'Sunday Regular', value: '2.0×', color: 'text-blue-400' },
                { label: 'Sunday OT', value: '2.5×', color: 'text-blue-400' },
                { label: 'Holiday Regular', value: '3.0×', color: 'text-yellow-400' },
                { label: 'Holiday OT', value: '3.0×', color: 'text-yellow-400' },
              ].map((rule) => (
                <div key={`rule-${rule.label}`} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground">{rule.label}</span>
                  <span className={`text-xs font-mono font-semibold tabular-nums ${rule.color}`}>{rule.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
              Base daily rate: <span className="font-mono text-foreground">$80.00</span> · Hourly: <span className="font-mono text-foreground">$10.00</span>
            </p>
          </div>
        </div>

        {/* Timesheet Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Weekly Timesheets</h2>
            <p className="text-xs text-muted-foreground">Approve timesheets to trigger PDF payslip generation</p>
          </div>
          <PayrollTimesheetTable />
        </div>
      </div>
    </AppLayout>
  );
}