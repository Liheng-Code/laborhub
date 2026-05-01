import React from 'react';
import AppLayout from '@/components/AppLayout';
import ApprovalWorkflowContent from './components/ApprovalWorkflowContent';

export default function ApprovalWorkflowsPage() {
  return (
    <AppLayout
      title="Approval Workflows"
      subtitle="Multi-stage approval engine · OT, transfers, payroll, disputes & overrides"
    >
      <ApprovalWorkflowContent />
    </AppLayout>
  );
}
