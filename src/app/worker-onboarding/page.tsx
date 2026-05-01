import React from 'react';
import AppLayout from '@/components/AppLayout';
import WorkerOnboardingContent from './components/WorkerOnboardingContent';

export default function WorkerOnboardingPage() {
  return (
    <AppLayout
      title="Worker Onboarding & Offboarding"
      subtitle="Manage worker lifecycle · Registration, activation, suspension & offboarding"
    >
      <WorkerOnboardingContent />
    </AppLayout>
  );
}
