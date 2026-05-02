import React from 'react';
import AppLayout from '@/components/AppLayout';
import AuditLogContent from './components/AuditLogContent';

export default function AuditLogPage() {
  return (
    <AppLayout
      title="Audit Log"
      subtitle="Immutable event log · All system actions, compliance trail & access history"
    >
      <AuditLogContent />
    </AppLayout>
  );
}
