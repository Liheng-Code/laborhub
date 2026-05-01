import React from 'react';
import AppLayout from '@/components/AppLayout';
import WorkerProfilesContent from './components/WorkerProfilesContent';

export default function WorkerProfilesPage() {
  return (
    <AppLayout
      title="Worker Profiles"
      subtitle="52 active workers · 3 projects · Face biometric + rate history"
    >
      <WorkerProfilesContent />
    </AppLayout>
  );
}