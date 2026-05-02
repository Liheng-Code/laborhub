import React from 'react';
import AppLayout from '@/components/AppLayout';
import DisputeCorrectionContent from './components/DisputeCorrectionContent';

export default function DisputeCorrectionPage() {
  return (
    <AppLayout
      title="Dispute & Correction"
      subtitle="Timesheet disputes · Evidence review, PM approval & correction audit trail"
    >
      <DisputeCorrectionContent />
    </AppLayout>
  );
}
