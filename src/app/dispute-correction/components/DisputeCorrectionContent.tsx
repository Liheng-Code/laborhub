'use client';
import React, { useState } from 'react';
import { MessageSquareWarning, Clock, CheckCircle, XCircle, Paperclip, ChevronDown, ChevronUp } from 'lucide-react';

type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

interface Dispute {
  id: string;
  worker: string;
  workerId: string;
  date: string;
  issue: string;
  claimedHours: string;
  recordedHours: string;
  evidence: number;
  status: DisputeStatus;
  reviewer: string;
  submittedOn: string;
}

const mockDisputes: Dispute[] = [
  { id: 'DSP-001', worker: 'Ravi Nair', workerId: 'W-1004', date: '28 Apr 2026', issue: 'Missing 2 OT hours — scan failed at gate', claimedHours: '10h', recordedHours: '8h', evidence: 2, status: 'UNDER_REVIEW', reviewer: 'PM Rajan', submittedOn: '29 Apr 2026' },
  { id: 'DSP-002', worker: 'Ahmad Razali', workerId: 'W-1001', date: '27 Apr 2026', issue: 'Afternoon OUT scan not recorded', claimedHours: '9h', recordedHours: '7.5h', evidence: 1, status: 'OPEN', reviewer: 'Unassigned', submittedOn: '28 Apr 2026' },
  { id: 'DSP-003', worker: 'Suresh Kumar', workerId: 'W-1002', date: '25 Apr 2026', issue: 'Morning IN scan flagged incorrectly', claimedHours: '8h', recordedHours: '8h', evidence: 3, status: 'RESOLVED', reviewer: 'Eng. Priya', submittedOn: '26 Apr 2026' },
  { id: 'DSP-004', worker: 'Budi Santoso', workerId: 'W-1003', date: '24 Apr 2026', issue: 'OT hours not counted due to geofence error', claimedHours: '11h', recordedHours: '8h', evidence: 0, status: 'REJECTED', reviewer: 'PM Rajan', submittedOn: '25 Apr 2026' },
];

const statusConfig: Record<DisputeStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  OPEN: { label: 'Open', color: 'text-yellow-700', bg: 'bg-yellow-50 border border-yellow-200', icon: Clock },
  UNDER_REVIEW: { label: 'Under Review', color: 'text-blue-700', bg: 'bg-blue-50 border border-blue-200', icon: MessageSquareWarning },
  RESOLVED: { label: 'Resolved', color: 'text-green-700', bg: 'bg-green-50 border border-green-200', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-50 border border-red-200', icon: XCircle },
};

export default function DisputeCorrectionContent() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const kpis = [
    { label: 'Open Disputes', value: mockDisputes.filter(d => d.status === 'OPEN').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Under Review', value: mockDisputes.filter(d => d.status === 'UNDER_REVIEW').length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Resolved', value: mockDisputes.filter(d => d.status === 'RESOLVED').length, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Rejected', value: mockDisputes.filter(d => d.status === 'REJECTED').length, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-4">
            <p className={`text-2xl font-bold tabular-nums ${k.color}`}>{k.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Dispute Cards */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Timesheet Disputes</h2>
          <span className="text-xs text-muted-foreground">{mockDisputes.length} total disputes</span>
        </div>
        <div className="divide-y divide-border">
          {mockDisputes.map((d) => {
            const sc = statusConfig[d.status];
            const isExpanded = expanded === d.id;
            return (
              <div key={d.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{d.id}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{d.worker} <span className="font-normal text-muted-foreground text-xs">({d.workerId})</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.issue}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Date: <span className="text-foreground font-medium">{d.date}</span></span>
                      <span>Claimed: <span className="text-green-600 font-medium">{d.claimedHours}</span></span>
                      <span>Recorded: <span className="text-red-600 font-medium">{d.recordedHours}</span></span>
                      {d.evidence > 0 && (
                        <span className="flex items-center gap-1"><Paperclip size={11} />{d.evidence} file{d.evidence > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {d.status === 'OPEN' && (
                      <button className="px-3 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">Assign Reviewer</button>
                    )}
                    {d.status === 'UNDER_REVIEW' && (
                      <div className="flex gap-1">
                        <button className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors">Approve</button>
                        <button className="px-2 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors">Reject</button>
                      </div>
                    )}
                    <button onClick={() => setExpanded(isExpanded ? null : d.id)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">Reviewer</p>
                      <p className="font-medium text-foreground">{d.reviewer}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Submitted On</p>
                      <p className="font-medium text-foreground">{d.submittedOn}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground mb-2">Correction Timeline</p>
                      <div className="flex items-center gap-2">
                        {['Submitted', 'Assigned', 'PM Review', 'Correction Applied'].map((s, i) => (
                          <React.Fragment key={s}>
                            <div className={`flex flex-col items-center gap-1`}>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${i <= 1 ? 'bg-primary text-white' : 'bg-slate-100 border border-slate-200 text-slate-400'}`}>
                                {i <= 1 ? '✓' : i + 1}
                              </div>
                              <span className={`text-xs ${i <= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
                            </div>
                            {i < 3 && <div className={`flex-1 h-0.5 ${i < 1 ? 'bg-primary' : 'bg-slate-200'}`} />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
