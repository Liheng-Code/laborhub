'use client';
import React, { useState } from 'react';
import { Download, FileText, Table, Archive, CheckCircle, Clock, AlertCircle } from 'lucide-react';

type ExportFormat = 'PDF' | 'EXCEL' | 'CSV' | 'ZIP';
type ExportStatus = 'READY' | 'PROCESSING' | 'FAILED';

interface ExportJob {
  id: string;
  name: string;
  format: ExportFormat;
  period: string;
  size: string;
  status: ExportStatus;
  createdAt: string;
}

const mockJobs: ExportJob[] = [
  { id: 'EXP-001', name: 'Payroll Week 17 — All Workers', format: 'PDF', period: '21–27 Apr 2026', size: '2.4 MB', status: 'READY', createdAt: '28 Apr 2026 09:00' },
  { id: 'EXP-002', name: 'Attendance Log — April 2026', format: 'EXCEL', period: '01–30 Apr 2026', size: '1.1 MB', status: 'READY', createdAt: '01 May 2026 08:30' },
  { id: 'EXP-003', name: 'Payroll Week 16 + Payslips Bundle', format: 'ZIP', period: '14–20 Apr 2026', size: '18.7 MB', status: 'READY', createdAt: '21 Apr 2026 10:15' },
  { id: 'EXP-004', name: 'OT Cost Report — Q1 2026', format: 'CSV', period: 'Jan–Mar 2026', size: '340 KB', status: 'PROCESSING', createdAt: '01 May 2026 09:41' },
  { id: 'EXP-005', name: 'Worker Performance — April', format: 'EXCEL', period: '01–30 Apr 2026', size: '—', status: 'FAILED', createdAt: '30 Apr 2026 17:00' },
];

const formatConfig: Record<ExportFormat, { icon: React.ElementType; color: string; bg: string }> = {
  PDF: { icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
  EXCEL: { icon: Table, color: 'text-green-600', bg: 'bg-green-50' },
  CSV: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  ZIP: { icon: Archive, color: 'text-purple-600', bg: 'bg-purple-50' },
};

const statusConfig: Record<ExportStatus, { icon: React.ElementType; color: string; label: string }> = {
  READY: { icon: CheckCircle, color: 'text-green-600', label: 'Ready' },
  PROCESSING: { icon: Clock, color: 'text-yellow-600', label: 'Processing' },
  FAILED: { icon: AlertCircle, color: 'text-red-600', label: 'Failed' },
};

const exportTemplates = [
  { name: 'Weekly Payroll Export', desc: 'All workers · PDF + Excel bundle', formats: ['PDF', 'EXCEL'] },
  { name: 'Monthly Attendance', desc: 'Full attendance log · CSV format', formats: ['CSV'] },
  { name: 'Payslip Bundle', desc: 'Individual PDFs zipped per worker', formats: ['ZIP'] },
  { name: 'QuickBooks Import', desc: 'Chart of accounts compatible CSV', formats: ['CSV'] },
  { name: 'Xero Payroll Feed', desc: 'Xero-compatible payroll export', formats: ['CSV', 'EXCEL'] },
  { name: 'Full Data Archive', desc: 'All data types in ZIP archive', formats: ['ZIP'] },
];

export default function AccountingExportContent() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ready to Download', value: mockJobs.filter(j => j.status === 'READY').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Processing', value: mockJobs.filter(j => j.status === 'PROCESSING').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Export Templates', value: exportTemplates.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Exports', value: mockJobs.length, color: 'text-slate-600', bg: 'bg-slate-100' },
        ].map((k) => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-4">
            <p className={`text-2xl font-bold tabular-nums ${k.color}`}>{k.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Export Jobs */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Export History</h2>
            <div className="flex items-center gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="text-xs bg-muted border border-border rounded-md px-2 py-1.5 text-foreground outline-none"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              <button className="flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
                <Download size={13} /> New Export
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {['Export', 'Format', 'Period', 'Size', 'Status', 'Created', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockJobs.map((job) => {
                  const fc = formatConfig[job.format];
                  const sc = statusConfig[job.status];
                  return (
                    <tr key={job.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">{job.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{job.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md ${fc.bg}`}>
                          <fc.icon size={12} className={fc.color} />
                          <span className={`text-xs font-medium ${fc.color}`}>{job.format}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{job.period}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{job.size}</td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1 text-xs font-medium ${sc.color}`}>
                          <sc.icon size={13} />{sc.label}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{job.createdAt}</td>
                      <td className="px-4 py-3">
                        {job.status === 'READY' && (
                          <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <Download size={12} /> Download
                          </button>
                        )}
                        {job.status === 'FAILED' && (
                          <button className="text-xs text-muted-foreground hover:text-foreground">Retry</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Templates */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Export Templates</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Pre-configured export formats</p>
          </div>
          <div className="divide-y divide-border">
            {exportTemplates.map((t) => (
              <div key={t.name} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                  <div className="flex gap-1 mt-1">
                    {t.formats.map(f => {
                      const fc = formatConfig[f as ExportFormat];
                      return (
                        <span key={f} className={`text-xs px-1.5 py-0.5 rounded ${fc.bg} ${fc.color} font-medium`}>{f}</span>
                      );
                    })}
                  </div>
                </div>
                <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-primary shrink-0">
                  <Download size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
