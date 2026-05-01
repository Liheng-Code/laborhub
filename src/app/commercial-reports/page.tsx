import React from 'react';
import AppLayout from '@/components/AppLayout';
import CommercialReportsContent from './components/CommercialReportsContent';

export default function CommercialReportsPage() {
  return (
    <AppLayout
      title="Commercial Report Suite"
      subtitle="8 targeted reports · Manpower, OT cost, productivity, payroll summary & more"
    >
      <CommercialReportsContent />
    </AppLayout>
  );
}
