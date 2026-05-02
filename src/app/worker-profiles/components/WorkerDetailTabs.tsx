'use client';
import React, { useState } from 'react';
import { Download, Plus, Edit2, TrendingUp, Clock, DollarSign, ScanFace, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Badge from '@/components/ui/Badge';
import { WorkerProfile, ProductivityBenchmark } from '../data/mockWorkerProfileData';
import { mockWorkerProfiles } from '../data/mockWorkerProfileData';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'benchmarks', label: 'Benchmarks' },
  { id: 'payslips', label: 'Payslips' },
];

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ worker }: { worker: WorkerProfile }) {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Hrs This Week', value: `${worker.totalHoursThisWeek}h`, icon: Clock, color: 'text-blue-400' },
          { label: 'OT This Week', value: `${worker.totalOTHoursThisWeek}h`, icon: TrendingUp, color: 'text-orange-400' },
          { label: 'Daily Rate', value: `$${worker.dailyRate}`, icon: DollarSign, color: 'text-green-400' },
          { label: 'Scan Rate', value: `${worker.scanCompletionRate}%`, icon: ScanFace, color: worker.scanCompletionRate >= 90 ? 'text-green-400' : worker.scanCompletionRate >= 75 ? 'text-yellow-400' : 'text-red-400' },
        ].map((stat) => (
          <div key={`stat-${stat.label}`} className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <stat.icon size={14} className={stat.color} />
            </div>
            <p className={`text-xl font-bold font-mono tabular-nums ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Identity */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Identity & Assignment</h3>
        <div className="bg-muted rounded-lg divide-y divide-border">
          {[
            { label: 'Phone', value: worker.phone },
            { label: 'Trade', value: worker.trade },
            { label: 'Crew', value: worker.crewName },
            { label: 'Project', value: worker.project },
            { label: 'Joined', value: worker.joinedAt },
            { label: 'Bank (last 4)', value: `····  ····  ····  ${worker.bankLast4}` },
          ].map((field) => (
            <div key={`field-${field.label}`} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-muted-foreground">{field.label}</span>
              <span className="text-xs font-medium text-foreground font-mono">{field.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Biometric */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Face Biometric</h3>
        <div className="bg-muted rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {worker.biometricStatus === 'REGISTERED' ? (
              <CheckCircle2 size={20} className="text-green-400" />
            ) : worker.biometricStatus === 'FAILED' ? (
              <AlertTriangle size={20} className="text-red-400" />
            ) : (
              <ScanFace size={20} className="text-yellow-400" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {worker.biometricStatus === 'REGISTERED' ? 'Face reference registered' :
                  worker.biometricStatus === 'FAILED'? 'Registration failed — re-register required' : 'Pending face registration'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {worker.faceRegisteredAt ? `Registered ${worker.faceRegisteredAt}` : 'Not yet registered'}
              </p>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-card border border-border text-xs font-medium text-muted-foreground rounded-md hover:text-foreground hover:bg-zinc-700 transition-colors">
            {worker.biometricStatus === 'REGISTERED' ? 'Re-register' : 'Register Now'}
          </button>
        </div>
      </div>

      {/* Rate History */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Daily Rate History <span className="text-zinc-600 normal-case">(insert-only · immutable)</span>
        </h3>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-zinc-900/50">
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Effective From</th>
                <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Daily Rate</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Set By</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Recorded At</th>
              </tr>
            </thead>
            <tbody>
              {[...worker.rateHistory].reverse().map((entry, idx) => (
                <tr
                  key={`rh-${entry.id}`}
                  className={`border-b border-border last:border-0 ${idx === 0 ? 'bg-primary/5' : ''}`}
                >
                  <td className="px-4 py-2.5 font-mono text-foreground">{entry.effectiveFrom}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold tabular-nums">
                    {idx === 0 ? (
                      <span className="text-green-400">${entry.dailyRate} <span className="text-xs text-muted-foreground font-normal">current</span></span>
                    ) : (
                      <span className="text-muted-foreground">${entry.dailyRate}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{entry.setBy}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{entry.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Rate changes apply to future sessions only. Historical payroll uses the rate active on each session date.
        </p>
      </div>
    </div>
  );
}

// ── Sessions Tab ──────────────────────────────────────────────────────────────
function SessionsTab({ worker }: { worker: WorkerProfile }) {
  const flagBadge = (flag: 'GREEN' | 'YELLOW' | 'RED') => {
    if (flag === 'GREEN') return <Badge variant="green" dot>OK</Badge>;
    if (flag === 'YELLOW') return <Badge variant="yellow" dot>Warn</Badge>;
    return <Badge variant="red" dot>Alert</Badge>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent Work Sessions</h3>
        <p className="text-xs text-muted-foreground">Last 6 days</p>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-zinc-900/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">WBS Node</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Reg Hrs</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">OT Hrs</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Flag</th>
            </tr>
          </thead>
          <tbody>
            {worker.recentSessions.map((session, idx) => (
              <tr
                key={`sess-row-${session.id}`}
                className={`border-b border-border last:border-0 hover:bg-zinc-800/40 transition-colors ${idx % 2 === 1 ? 'bg-zinc-900/20' : ''}`}
              >
                <td className="px-4 py-3 font-mono text-sm text-foreground">{session.date}</td>
                <td className="px-4 py-3">
                  <p className="text-sm text-foreground">{session.wbsNode}</p>
                  <p className="text-xs text-muted-foreground">{session.project}</p>
                </td>
                <td className="px-3 py-3 text-right font-mono tabular-nums text-sm text-foreground">{session.regularHours}h</td>
                <td className="px-3 py-3 text-right font-mono tabular-nums text-sm">
                  <span className={session.otHours > 0 ? 'text-orange-400' : 'text-muted-foreground'}>
                    {session.otHours > 0 ? `${session.otHours}h` : '—'}
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-mono tabular-nums text-sm font-semibold text-foreground">{session.totalHours}h</td>
                <td className="px-3 py-3 text-center">{flagBadge(session.flag)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Benchmarks Tab ────────────────────────────────────────────────────────────
interface BenchmarkForm {
  taskType: string;
  unit: string;
  targetOutputPerHour: string;
}

function BenchmarksTab({ worker }: { worker: WorkerProfile }) {
  const [benchmarks, setBenchmarks] = useState<ProductivityBenchmark[]>(worker.benchmarks);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BenchmarkForm>({
    defaultValues: { taskType: '', unit: '', targetOutputPerHour: '' },
  });

  const onSubmit = async (data: BenchmarkForm) => {
    setSaving(true);
    // BACKEND: POST /workers/:id/benchmarks — body: { task_type, unit, target_output_per_hour }
    await new Promise((r) => setTimeout(r, 800));
    const newBenchmark: ProductivityBenchmark = {
      id: `bm-new-${Date.now()}`,
      taskType: data.taskType,
      unit: data.unit,
      targetOutputPerHour: parseFloat(data.targetOutputPerHour),
      configuredBy: 'Rajan Mehta',
      updatedAt: '2026-05-01',
    };
    setBenchmarks((prev) => [...prev, newBenchmark]);
    setSaving(false);
    setShowForm(false);
    reset();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Productivity Benchmarks</h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={12} />
          Add Benchmark
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-muted border border-border rounded-lg p-4 space-y-3 animate-slide-up">
          <p className="text-xs font-medium text-foreground">New Benchmark</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Task Type</label>
              <input
                {...register('taskType', { required: 'Required' })}
                placeholder="e.g. Rebar Tying"
                className="w-full bg-input border border-border rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.taskType && <p className="text-xs text-red-400 mt-1">{errors.taskType.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Unit</label>
              <input
                {...register('unit', { required: 'Required' })}
                placeholder="e.g. kg, m², pcs"
                className="w-full bg-input border border-border rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.unit && <p className="text-xs text-red-400 mt-1">{errors.unit.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Target / Hour</label>
              <input
                type="number"
                step="0.1"
                min="0"
                {...register('targetOutputPerHour', { required: 'Required', min: { value: 0.1, message: 'Must be > 0' } })}
                placeholder="0.0"
                className="w-full bg-input border border-border rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
              />
              {errors.targetOutputPerHour && <p className="text-xs text-red-400 mt-1">{errors.targetOutputPerHour.message}</p>}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowForm(false); reset(); }} className="px-3 py-1.5 bg-card border border-border text-xs text-muted-foreground rounded hover:text-foreground transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? <><Loader2 size={11} className="animate-spin" />Saving...</> : 'Save Benchmark'}
            </button>
          </div>
        </form>
      )}

      {/* Benchmarks table */}
      {benchmarks.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-zinc-900/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Task Type</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Target / Hour</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Unit</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Configured By</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Updated</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((bm, idx) => (
                <tr
                  key={`bm-row-${bm.id}`}
                  className={`border-b border-border last:border-0 hover:bg-zinc-800/40 transition-colors ${idx % 2 === 1 ? 'bg-zinc-900/20' : ''}`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{bm.taskType}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-sm text-orange-400 font-semibold">{bm.targetOutputPerHour}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{bm.unit}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{bm.configuredBy}</td>
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{bm.updatedAt}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Edit this benchmark target"
                    >
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg flex flex-col items-center justify-center py-10">
          <TrendingUp size={24} className="text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No benchmarks configured</p>
          <p className="text-xs text-muted-foreground mt-1">Add a productivity target to enable performance tracking for this worker</p>
        </div>
      )}
    </div>
  );
}

// ── Payslips Tab ──────────────────────────────────────────────────────────────
function PayslipsTab({ worker }: { worker: WorkerProfile }) {
  const statusBadge = (status: string) => {
    if (status === 'PAID') return <Badge variant="green" dot>Paid</Badge>;
    if (status === 'APPROVED') return <Badge variant="blue" dot>Approved</Badge>;
    if (status === 'PENDING') return <Badge variant="yellow" dot>Pending</Badge>;
    return <Badge variant="muted" dot>Draft</Badge>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payslip History</h3>
        <p className="text-xs text-muted-foreground">PDF generated on approval</p>
      </div>
      <div className="space-y-2">
        {worker.payslips.map((ps) => (
          <div
            key={`ps-card-${ps.id}`}
            className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3 hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <DollarSign size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {ps.weekStart} – {ps.weekEnd}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gross: <span className="font-mono text-foreground">${ps.grossPay.toLocaleString()}</span>
                  <span className="mx-1.5 text-zinc-700">·</span>
                  Net: <span className="font-mono font-semibold text-green-400">${ps.netPay.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {statusBadge(ps.status)}
              {ps.pdfUrl ? (
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-950/30 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded hover:bg-blue-950/50 transition-colors"
                  title="Download PDF payslip"
                  // BACKEND: GET /payroll/payslips/:id/download — returns pre-signed S3 URL (1hr expiry)
                >
                  <Download size={12} />
                  PDF
                </button>
              ) : (
                <span className="text-xs text-muted-foreground px-2.5 py-1">Pending PDF</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
interface Props {
  workerId: string;
}

export default function WorkerDetailTabs({ workerId }: Props) {
  const [activeTab, setActiveTab] = useState('overview');

  const worker = mockWorkerProfiles.find((w) => w.id === workerId);
  if (!worker) return null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full">
      {/* Profile Header */}
      <div className="px-6 py-5 border-b border-border bg-zinc-900/40">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0"
            style={{ background: worker.avatarColor }}
          >
            {worker.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-foreground">{worker.name}</h2>
              <Badge variant={worker.status === 'ACTIVE' ? 'green' : 'muted'} dot>
                {worker.status}
              </Badge>
              {worker.biometricStatus === 'FAILED' && (
                <Badge variant="red">
                  <AlertTriangle size={10} className="mr-1" />
                  Biometric Failed
                </Badge>
              )}
              {worker.biometricStatus === 'PENDING' && (
                <Badge variant="yellow">Face Pending</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {worker.trade} · {worker.crewName} · {worker.project}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ID: <span className="font-mono text-foreground">{worker.id}</span>
              <span className="mx-2 text-zinc-700">·</span>
              Joined: <span className="font-mono text-foreground">{worker.joinedAt}</span>
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border text-xs font-medium text-muted-foreground rounded-md hover:text-foreground hover:bg-zinc-700 transition-colors shrink-0">
            <Edit2 size={13} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-6 bg-zinc-900/20">
        {TABS.map((tab) => (
          <button
            key={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        {activeTab === 'overview' && <OverviewTab worker={worker} />}
        {activeTab === 'sessions' && <SessionsTab worker={worker} />}
        {activeTab === 'benchmarks' && <BenchmarksTab worker={worker} />}
        {activeTab === 'payslips' && <PayslipsTab worker={worker} />}
      </div>
    </div>
  );
}