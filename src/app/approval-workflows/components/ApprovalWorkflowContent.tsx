'use client';
import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type ApprovalType = 'ATTENDANCE_OVERRIDE' | 'OT_REQUEST' | 'TRANSFER_REQUEST' | 'PAYROLL_APPROVAL' | 'DISPUTED_TIMESHEET' | 'RATE_CHANGE';
type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';

interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  worker: string;
  workerId: string;
  submittedBy: string;
  date: string;
  status: ApprovalStatus;
  stage: number;
  totalStages: number;
  description: string;
  timeLimit: string;
}

const mockRequests: ApprovalRequest[] = [
  { id: 'APR-001', type: 'OT_REQUEST', worker: 'Ahmad Razali', workerId: 'W-1001', submittedBy: 'Foreman Ali', date: '01 May 2026', status: 'PENDING', stage: 1, totalStages: 2, description: 'OT request for 3 hrs on 30 Apr', timeLimit: '2h remaining' },
  { id: 'APR-002', type: 'ATTENDANCE_OVERRIDE', worker: 'Suresh Kumar', workerId: 'W-1002', submittedBy: 'Eng. Priya', date: '01 May 2026', status: 'PENDING', stage: 2, totalStages: 3, description: 'Manual override for missed AM scan', timeLimit: '45m remaining' },
  { id: 'APR-003', type: 'TRANSFER_REQUEST', worker: 'Budi Santoso', workerId: 'W-1003', submittedBy: 'PM Rajan', date: '30 Apr 2026', status: 'ESCALATED', stage: 2, totalStages: 2, description: 'Transfer from Tower A to Podium C', timeLimit: 'Escalated' },
  { id: 'APR-004', type: 'PAYROLL_APPROVAL', worker: 'Week 17 Batch', workerId: 'BATCH', submittedBy: 'System', date: '28 Apr 2026', status: 'APPROVED', stage: 3, totalStages: 3, description: '47 workers · RM 124,500 total', timeLimit: 'Completed' },
  { id: 'APR-005', type: 'DISPUTED_TIMESHEET', worker: 'Ravi Nair', workerId: 'W-1004', submittedBy: 'Ravi Nair', date: '29 Apr 2026', status: 'PENDING', stage: 1, totalStages: 2, description: 'Dispute: missing 2 OT hours on 28 Apr', timeLimit: '6h remaining' },
  { id: 'APR-006', type: 'RATE_CHANGE', worker: 'Tan Wei Ming', workerId: 'W-1005', submittedBy: 'Admin Siti', date: '27 Apr 2026', status: 'REJECTED', stage: 1, totalStages: 2, description: 'Rate change from RM 85 to RM 95/day', timeLimit: 'Closed' },
];

const typeConfig: Record<ApprovalType, { label: string; color: string; bg: string }> = {
  ATTENDANCE_OVERRIDE: { label: 'Attendance Override', color: 'text-blue-700', bg: 'bg-blue-50 border border-blue-200' },
  OT_REQUEST: { label: 'OT Request', color: 'text-orange-700', bg: 'bg-orange-50 border border-orange-200' },
  TRANSFER_REQUEST: { label: 'Transfer', color: 'text-purple-700', bg: 'bg-purple-50 border border-purple-200' },
  PAYROLL_APPROVAL: { label: 'Payroll', color: 'text-green-700', bg: 'bg-green-50 border border-green-200' },
  DISPUTED_TIMESHEET: { label: 'Dispute', color: 'text-red-700', bg: 'bg-red-50 border border-red-200' },
  RATE_CHANGE: { label: 'Rate Change', color: 'text-slate-700', bg: 'bg-slate-100 border border-slate-200' },
};

const statusConfig: Record<ApprovalStatus, { label: string; icon: React.ElementType; color: string }> = {
  PENDING: { label: 'Pending', icon: Clock, color: 'text-yellow-600' },
  APPROVED: { label: 'Approved', icon: CheckCircle, color: 'text-green-600' },
  REJECTED: { label: 'Rejected', icon: XCircle, color: 'text-red-600' },
  ESCALATED: { label: 'Escalated', icon: AlertCircle, color: 'text-orange-600' },
};

export default function ApprovalWorkflowContent() {
  const [activeTab, setActiveTab] = useState<ApprovalStatus | 'ALL'>('ALL');

  const filtered = activeTab === 'ALL' ? mockRequests : mockRequests.filter(r => r.status === activeTab);

  const counts = {
    ALL: mockRequests.length,
    PENDING: mockRequests.filter(r => r.status === 'PENDING').length,
    ESCALATED: mockRequests.filter(r => r.status === 'ESCALATED').length,
    APPROVED: mockRequests.filter(r => r.status === 'APPROVED').length,
    REJECTED: mockRequests.filter(r => r.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', value: counts.PENDING, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
          { label: 'Escalated', value: counts.ESCALATED, color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertCircle },
          { label: 'Approved Today', value: counts.APPROVED, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
          { label: 'Rejected', value: counts.REJECTED, color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
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

      {/* Tabs + Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-1 px-5 pt-4 border-b border-border">
          {(['ALL', 'PENDING', 'ESCALATED', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-medium rounded-t-md transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()} ({counts[tab]})
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Request ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Worker</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Description</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Stage</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Time Limit</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => {
                const tc = typeConfig[req.type];
                const sc = statusConfig[req.status];
                return (
                  <tr key={req.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{req.id}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>{tc.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{req.worker}</p>
                        <p className="text-xs text-muted-foreground">{req.submittedBy}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{req.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: req.totalStages }).map((_, i) => (
                          <div key={i} className={`w-5 h-1.5 rounded-full ${i < req.stage ? 'bg-primary' : 'bg-slate-200'}`} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{req.stage}/{req.totalStages}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1 text-xs font-medium ${sc.color}`}>
                        <sc.icon size={13} />
                        {sc.label}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{req.timeLimit}</td>
                    <td className="px-4 py-3">
                      {req.status === 'PENDING' && (
                        <div className="flex items-center gap-1">
                          <button className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors">Approve</button>
                          <button className="px-2 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors">Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
