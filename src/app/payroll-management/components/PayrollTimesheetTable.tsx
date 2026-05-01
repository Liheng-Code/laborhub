'use client';
import React, { useState } from 'react';
import { CheckCircle2, Download, Plus, Filter, Search } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import AddDeductionModal from './AddDeductionModal';
import { mockTimesheets, TimesheetRow, TimesheetStatus } from '../data/mockPayrollData';

const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const statusBadge = (s: TimesheetStatus) => {
  if (s === 'PAID') return <Badge variant="green" dot>Paid</Badge>;
  if (s === 'APPROVED') return <Badge variant="blue" dot>Approved</Badge>;
  if (s === 'PENDING') return <Badge variant="yellow" dot>Pending</Badge>;
  return <Badge variant="muted" dot>Draft</Badge>;
};

export default function PayrollTimesheetTable() {
  const [rows, setRows] = useState<TimesheetRow[]>(mockTimesheets);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deductionModal, setDeductionModal] = useState<{ open: boolean; timesheetId?: string; workerName?: string }>({ open: false });
  const [approving, setApproving] = useState<Set<string>>(new Set());

  const filtered = rows.filter((r) => {
    const matchSearch = r.workerName.toLowerCase().includes(search.toLowerCase()) || r.trade.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };

  const handleApprove = async (id: string) => {
    setApproving((prev) => new Set([...prev, id]));
    // BACKEND: POST /payroll/timesheets/:id/approve — triggers PDF generation job
    await new Promise((r) => setTimeout(r, 1000));
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: 'APPROVED', approvedBy: 'Rajan Mehta', approvedAt: '2026-05-01 09:24' } : r));
    setApproving((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleBulkApprove = async () => {
    const ids = Array.from(selected).filter((id) => {
      const row = rows.find((r) => r.id === id);
      return row?.status === 'PENDING' || row?.status === 'DRAFT';
    });
    for (const id of ids) await handleApprove(id);
    setSelected(new Set());
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2 bg-muted border border-border rounded-md px-3 py-1.5 flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search worker or trade..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-muted border border-border rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{filtered.length} timesheets</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-zinc-700 transition-colors">
              <Download size={13} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm" style={{ minWidth: 1100 }}>
            <thead>
              <tr className="border-b border-border bg-zinc-900/50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded border-border accent-orange-500"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Worker</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Reg Hrs</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">OT Hrs</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Sun Hrs</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Gross Reg</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Gross OT</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Gross Sun</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Deductions</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Net Pay</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr
                  key={`ts-row-${row.id}`}
                  className={`border-b border-border hover:bg-zinc-800/40 transition-colors ${selected.has(row.id) ? 'bg-primary/5' : idx % 2 === 1 ? 'bg-zinc-900/20' : ''}`}
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="rounded border-border accent-orange-500"
                    />
                  </td>

                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: row.avatarColor }}>
                        {row.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{row.workerName}</p>
                        <p className="text-xs text-muted-foreground">{row.trade} · {row.project}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-sm text-foreground">{row.regularHours}h</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-sm">
                    <span className={row.otHours > 15 ? 'text-orange-400' : 'text-foreground'}>{row.otHours}h</span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-sm text-foreground">{row.sundayHours}h</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-sm text-foreground">{fmt(row.grossRegular)}</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-sm text-orange-400">{fmt(row.grossOT)}</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-sm text-blue-400">{fmt(row.grossSunday)}</td>
                  <td className="px-3 py-2.5 text-right">
                    {row.totalDeductions > 0 ? (
                      <span className="font-mono tabular-nums text-sm text-red-400">-{fmt(row.totalDeductions)}</span>
                    ) : (
                      <span className="font-mono tabular-nums text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="font-mono tabular-nums text-sm font-bold text-foreground">{fmt(row.netPay)}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">{statusBadge(row.status)}</td>

                  {/* Actions */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {(row.status === 'DRAFT' || row.status === 'PENDING') && (
                        <button
                          onClick={() => handleApprove(row.id)}
                          disabled={approving.has(row.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-green-950/30 border border-green-500/30 text-green-400 text-xs font-semibold rounded hover:bg-green-950/50 transition-colors disabled:opacity-50"
                          title="Approve this timesheet and trigger PDF payslip generation"
                        >
                          {approving.has(row.id) ? (
                            <span className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 size={12} />
                          )}
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => setDeductionModal({ open: true, timesheetId: row.id, workerName: row.workerName })}
                        className="flex items-center gap-1 px-2 py-1 bg-muted border border-border text-muted-foreground text-xs font-medium rounded hover:text-foreground hover:bg-zinc-700 transition-colors"
                        title="Add deduction to this worker's timesheet"
                      >
                        <Plus size={12} />
                        Deduction
                      </button>
                      {row.pdfUrl && (
                        <button
                          className="flex items-center gap-1 px-2 py-1 bg-blue-950/30 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded hover:bg-blue-950/50 transition-colors"
                          title="Download PDF payslip"
                          // BACKEND: GET /payroll/timesheets/:id/payslip — returns pre-signed S3 URL
                        >
                          <Download size={12} />
                          PDF
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-zinc-900/30">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {rows.length} timesheets · Week Apr 28 – May 3, 2026
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Rows per page:</span>
            <select className="bg-muted border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none">
              <option>12</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-zinc-800 border border-border rounded-xl px-5 py-3 shadow-2xl animate-slide-up">
          <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
          <button
            onClick={handleBulkApprove}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:opacity-90 active:scale-95 transition-all"
          >
            <CheckCircle2 size={14} />
            Approve All
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      <AddDeductionModal
        open={deductionModal.open}
        onClose={() => setDeductionModal({ open: false })}
        timesheetId={deductionModal.timesheetId}
        workerName={deductionModal.workerName}
      />
    </>
  );
}