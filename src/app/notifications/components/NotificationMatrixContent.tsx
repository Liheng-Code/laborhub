'use client';
import React, { useState } from 'react';
import { Mail, MessageSquare, Smartphone, CheckCircle, AlertCircle, Clock, Settings } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


type Channel = 'PUSH' | 'SMS' | 'EMAIL' | 'TELEGRAM';
type Urgency = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

interface NotificationEvent {
  id: string;
  event: string;
  category: string;
  recipients: string[];
  channels: Channel[];
  urgency: Urgency;
  retries: number;
  enabled: boolean;
}

interface NotificationLog {
  id: string;
  event: string;
  recipient: string;
  channel: Channel;
  sentAt: string;
  status: 'DELIVERED' | 'FAILED' | 'PENDING';
}

const mockEvents: NotificationEvent[] = [
  { id: 'NE-001', event: 'Worker scan missed', category: 'Attendance', recipients: ['Foreman', 'PM'], channels: ['PUSH', 'TELEGRAM'], urgency: 'HIGH', retries: 3, enabled: true },
  { id: 'NE-002', event: 'OT request submitted', category: 'Approval', recipients: ['PM', 'Admin'], channels: ['PUSH', 'EMAIL'], urgency: 'NORMAL', retries: 2, enabled: true },
  { id: 'NE-003', event: 'Payroll approved', category: 'Payroll', recipients: ['Worker', 'Admin'], channels: ['PUSH', 'SMS'], urgency: 'NORMAL', retries: 1, enabled: true },
  { id: 'NE-004', event: 'Fraud flag detected', category: 'Security', recipients: ['Admin', 'PM'], channels: ['PUSH', 'EMAIL', 'SMS'], urgency: 'CRITICAL', retries: 5, enabled: true },
  { id: 'NE-005', event: 'Geofence violation', category: 'Compliance', recipients: ['Foreman', 'PM'], channels: ['PUSH'], urgency: 'HIGH', retries: 3, enabled: true },
  { id: 'NE-006', event: 'Payslip ready', category: 'Payroll', recipients: ['Worker'], channels: ['PUSH', 'TELEGRAM'], urgency: 'LOW', retries: 1, enabled: true },
  { id: 'NE-007', event: 'Worker blacklisted', category: 'Security', recipients: ['Admin'], channels: ['EMAIL', 'PUSH'], urgency: 'CRITICAL', retries: 5, enabled: true },
  { id: 'NE-008', event: 'Dispute submitted', category: 'Dispute', recipients: ['PM', 'Admin'], channels: ['PUSH', 'EMAIL'], urgency: 'HIGH', retries: 2, enabled: false },
];

const mockLogs: NotificationLog[] = [
  { id: 'LOG-001', event: 'Fraud flag detected', recipient: 'Admin Siti', channel: 'PUSH', sentAt: '01 May 08:14', status: 'DELIVERED' },
  { id: 'LOG-002', event: 'Worker scan missed', recipient: 'Foreman Ali', channel: 'TELEGRAM', sentAt: '01 May 07:35', status: 'DELIVERED' },
  { id: 'LOG-003', event: 'OT request submitted', recipient: 'PM Rajan', channel: 'EMAIL', sentAt: '01 May 07:20', status: 'FAILED' },
  { id: 'LOG-004', event: 'Payslip ready', recipient: 'Ahmad Razali', channel: 'PUSH', sentAt: '30 Apr 18:00', status: 'DELIVERED' },
  { id: 'LOG-005', event: 'Geofence violation', recipient: 'PM Rajan', channel: 'PUSH', sentAt: '30 Apr 12:32', status: 'PENDING' },
];

const channelIcons: Record<Channel, React.ElementType> = {
  PUSH: Smartphone,
  SMS: MessageSquare,
  EMAIL: Mail,
  TELEGRAM: MessageSquare,
};

const urgencyConfig: Record<Urgency, { color: string; bg: string }> = {
  CRITICAL: { color: 'text-red-700', bg: 'bg-red-50 border border-red-200' },
  HIGH: { color: 'text-orange-700', bg: 'bg-orange-50 border border-orange-200' },
  NORMAL: { color: 'text-blue-700', bg: 'bg-blue-50 border border-blue-200' },
  LOW: { color: 'text-slate-600', bg: 'bg-slate-100 border border-slate-200' },
};

const logStatusConfig: Record<NotificationLog['status'], { color: string; icon: React.ElementType }> = {
  DELIVERED: { color: 'text-green-600', icon: CheckCircle },
  FAILED: { color: 'text-red-600', icon: AlertCircle },
  PENDING: { color: 'text-yellow-600', icon: Clock },
};

export default function NotificationMatrixContent() {
  const [events, setEvents] = useState(mockEvents);

  const toggleEvent = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Events', value: events.filter(e => e.enabled).length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Critical Alerts', value: events.filter(e => e.urgency === 'CRITICAL').length, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Sent Today', value: mockLogs.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Failed Today', value: mockLogs.filter(l => l.status === 'FAILED').length, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((k) => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-4">
            <p className={`text-2xl font-bold tabular-nums ${k.color}`}>{k.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Event Matrix */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Notification Events</h2>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Settings size={13} /> Configure
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {['Event', 'Category', 'Recipients', 'Channels', 'Urgency', 'Retries', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => {
                  const uc = urgencyConfig[ev.urgency];
                  return (
                    <tr key={ev.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${!ev.enabled ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{ev.event}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{ev.category}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {ev.recipients.map(r => (
                            <span key={r} className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{r}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {ev.channels.map(ch => {
                            const Icon = channelIcons[ch];
                            return <Icon key={ch} size={13} className="text-muted-foreground" title={ch} />;
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${uc.bg} ${uc.color}`}>{ev.urgency}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">{ev.retries}x</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleEvent(ev.id)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${ev.enabled ? 'bg-primary' : 'bg-slate-200'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${ev.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Log */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Notifications</h2>
          </div>
          <div className="divide-y divide-border">
            {mockLogs.map((log) => {
              const sc = logStatusConfig[log.status];
              const ChIcon = channelIcons[log.channel];
              return (
                <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <ChIcon size={13} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{log.event}</p>
                    <p className="text-xs text-muted-foreground">{log.recipient} · {log.sentAt}</p>
                  </div>
                  <sc.icon size={14} className={`${sc.color} shrink-0 mt-0.5`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
