import React from 'react';
import AppLayout from '@/components/AppLayout';
import CompanySettingsContent from './components/CompanySettingsContent';

export default function CompanySettingsPage() {
  return (
    <AppLayout
      title="Company & Project Settings"
      subtitle="Per-tenant configuration · Payroll cycle, OT policy, geofence defaults & branding"
    >
      <CompanySettingsContent />
    </AppLayout>
  );
}
