import React from 'react';
import AppLayout from '@/components/AppLayout';
import AccountingExportContent from './components/AccountingExportContent';

export default function AccountingExportPage() {
  return (
    <AppLayout
      title="Accounting & Export"
      subtitle="Multi-format exports · PDF, Excel, CSV, ZIP · QuickBooks & Xero ready"
    >
      <AccountingExportContent />
    </AppLayout>
  );
}
