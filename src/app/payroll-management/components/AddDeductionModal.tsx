'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { Loader2 } from 'lucide-react';

interface DeductionForm {
  type: string;
  amount: string;
  note: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  workerName?: string;
  timesheetId?: string;
  onSuccess?: (data: { type: string; amount: number; note: string }) => void;
}

export default function AddDeductionModal({ open, onClose, workerName, timesheetId, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DeductionForm>({
    defaultValues: { type: 'ABSENCE', amount: '', note: '' },
  });

  const onSubmit = async (data: DeductionForm) => {
    setSubmitting(true);
    // BACKEND: POST /payroll/deductions — body: { timesheet_id, type, amount, note }
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    onSuccess?.({ type: data.type, amount: parseFloat(data.amount), note: data.note });
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Deduction" subtitle={workerName ? `Adding deduction to ${workerName}'s timesheet` : undefined} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Deduction Type</label>
          <select
            {...register('type', { required: true })}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ABSENCE">Absence</option>
            <option value="ADVANCE">Cash Advance</option>
            <option value="PENALTY">Penalty</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Amount (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('amount', { required: 'Amount required', min: { value: 0.01, message: 'Must be positive' } })}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
            placeholder="0.00"
          />
          {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Note</label>
          <p className="text-xs text-muted-foreground mb-1">Describe the reason — appears on payslip</p>
          <input
            {...register('note', { required: 'Note is required' })}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g. Absent Wednesday full day"
          />
          {errors.note && <p className="text-xs text-red-400 mt-1">{errors.note.message}</p>}
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-md hover:bg-zinc-700 transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 size={14} className="animate-spin" />Saving...</> : 'Add Deduction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}