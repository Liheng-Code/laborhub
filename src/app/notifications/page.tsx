import React from 'react';
import AppLayout from '@/components/AppLayout';
import NotificationMatrixContent from './components/NotificationMatrixContent';

export default function NotificationsPage() {
  return (
    <AppLayout
      title="Notification Matrix"
      subtitle="Event-triggered alerts · Channel config, urgency levels & user preferences"
    >
      <NotificationMatrixContent />
    </AppLayout>
  );
}
