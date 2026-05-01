import React from 'react';
import AppLayout from '@/components/AppLayout';
import DeviceControlContent from './components/DeviceControlContent';

export default function DeviceControlPage() {
  return (
    <AppLayout
      title="Device Control & Anti-Fraud"
      subtitle="Device binding · Fraud detection, flag management & device change requests"
    >
      <DeviceControlContent />
    </AppLayout>
  );
}
