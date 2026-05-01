'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { Loader2 } from 'lucide-react';

interface OverrideForm {
  workerId: string;
  scanType: string;
  manualTime: string;
  reason: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  workerName?: string;
  workerId?: string;
  onSuccess?: () => void;
}

const SCAN_TYPES = [
  'MORNING_IN', 'MORNING_OUT',
  'AFTERNOON_IN', 'AFTERNOON_OUT',
  'OT_IN', 'OT_OUT',
];

export default function ManualOverrideModal({ open, onClose, workerName, workerId, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OverrideForm>({
    defaultValues: { workerId: workerId ?? '', scanType: 'MORNING_IN', manualTime: '', reason: '' },
  });

  const onSubmit = async (data: OverrideForm) => {
    setSubmitting(true);
    // BACKEND: POST /scans/manual-override — body: { worker_id, date, scan_type, manual_time, reason }
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      reset();
      onSuccess?.();
      onClose();
    }, 1200);
  };

  return (
    <Modal open={open} onClose={onClose} title="Manual Scan Override" subtitle={workerName ? `Recording override for ${workerName}` : 'Supervisor-level action — logged in audit trail'} size="md">
      {success ? (
        <div className="flex flex-col items-center py-6 gap-3">
          <div className="w-12 h-12 rounded-full bg-green-950/40 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground">Override recorded</p>
          <p className="text-xs text-muted-foreground">Audit log updated. Timesheet will recalculate.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Worker ID */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Worker</label>
            <p className="text-xs text-muted-foreground mb-1">Worker ID auto-filled from selected row</p>
            <input
              {...register('workerId', { required: 'Worker ID is required' })}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="worker-001"
            />
            {errors.workerId && <p className="text-xs text-red-400 mt-1">{errors.workerId.message}</p>}
          </div>

          {/* Scan Type */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Scan Type</label>
            <select
              {...register('scanType', { required: 'Scan type is required' })}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SCAN_TYPES.map((t) => (
                <option key={`scan-type-${t}`} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Manual Time */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Override Time</label>
            <p className="text-xs text-muted-foreground mb-1">Date defaults to today (2026-05-01)</p>
            <input
              type="time"
              {...register('manualTime', { required: 'Time is required' })}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.manualTime && <p className="text-xs text-red-400 mt-1">{errors.manualTime.message}</p>}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Reason for Override</label>
            <p className="text-xs text-muted-foreground mb-1">Required for audit log — be specific</p>
            <textarea
              {...register('reason', { required: 'Reason is required', minLength: { value: 10, message: 'Minimum 10 characters' } })}
              rows={3}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="e.g. Worker phone battery died — foreman confirmed on site at 07:00"
            />
            {errors.reason && <p className="text-xs text-red-400 mt-1">{errors.reason.message}</p>}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-md hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ minWidth: 140 }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Override'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}