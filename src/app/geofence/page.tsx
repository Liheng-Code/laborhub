import React from 'react';
import AppLayout from '@/components/AppLayout';
import GeofenceContent from './components/GeofenceContent';

export default function GeofencePage() {
  return (
    <AppLayout
      title="Project Location Geofence"
      subtitle="GPS attendance validation · Enforcement modes, override requests & zone management"
    >
      <GeofenceContent />
    </AppLayout>
  );
}
