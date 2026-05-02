'use client';
import React, { useState } from 'react';
import { Building2, Clock, DollarSign, MapPin, Smartphone, Palette, Save } from 'lucide-react';

type SettingsTab = 'company' | 'payroll' | 'attendance' | 'geofence' | 'device' | 'branding';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'payroll', label: 'Payroll & OT', icon: DollarSign },
  { id: 'attendance', label: 'Scan Windows', icon: Clock },
  { id: 'geofence', label: 'Geofence', icon: MapPin },
  { id: 'device', label: 'Device Binding', icon: Smartphone },
  { id: 'branding', label: 'Branding', icon: Palette },
];

export default function CompanySettingsContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-1 px-5 pt-4 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'company' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-sm font-semibold text-foreground">Company Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Company Name', value: 'Alpha Builders Co.', type: 'text' },
                  { label: 'Registration No.', value: 'ROC-123456-A', type: 'text' },
                  { label: 'Timezone', value: 'Asia/Kuala_Lumpur (UTC+8)', type: 'select' },
                  { label: 'Currency', value: 'MYR — Malaysian Ringgit', type: 'select' },
                  { label: 'Country', value: 'Malaysia', type: 'select' },
                  { label: 'Contact Email', value: 'admin@alphabuilders.com', type: 'email' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">{field.label}</label>
                    <input
                      type={field.type === 'select' ? 'text' : field.type}
                      defaultValue={field.value}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-sm font-semibold text-foreground">Payroll & OT Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Payroll Cycle', value: 'Weekly (Monday–Sunday)' },
                  { label: 'Payroll Release Day', value: 'Wednesday' },
                  { label: 'Standard Daily Hours', value: '8' },
                  { label: 'OT Threshold (hrs/day)', value: '8' },
                  { label: 'OT Rate Multiplier', value: '1.5x' },
                  { label: 'Sunday Rate Multiplier', value: '2.0x' },
                  { label: 'Public Holiday Multiplier', value: '2.0x' },
                  { label: 'Min Wage (RM/day)', value: '80.00' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">{field.label}</label>
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-sm font-semibold text-foreground">Daily Scan Windows</h3>
              <p className="text-xs text-muted-foreground">Configure the 6 scan time windows per day. Workers must scan within these windows for attendance to be recorded.</p>
              <div className="space-y-4">
                {[
                  { label: 'Morning IN', start: '06:30', end: '08:30' },
                  { label: 'Morning OUT', start: '11:30', end: '13:00' },
                  { label: 'Afternoon IN', start: '13:00', end: '14:30' },
                  { label: 'Afternoon OUT', start: '17:00', end: '18:30' },
                  { label: 'OT IN', start: '18:30', end: '20:00' },
                  { label: 'OT OUT', start: '21:00', end: '23:59' },
                ].map((window) => (
                  <div key={window.label} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-foreground w-32 shrink-0">{window.label}</span>
                    <div className="flex items-center gap-2">
                      <input type="time" defaultValue={window.start} className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/30" />
                      <span className="text-xs text-muted-foreground">to</span>
                      <input type="time" defaultValue={window.end} className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/30" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'geofence' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-sm font-semibold text-foreground">Geofence Defaults</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Default Radius (meters)', value: '150' },
                  { label: 'Default Enforcement Mode', value: 'WARN_ONLY' },
                  { label: 'GPS Accuracy Threshold (m)', value: '50' },
                  { label: 'Override Approval Required', value: 'Yes' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">{field.label}</label>
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'device' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-sm font-semibold text-foreground">Device Binding Rules</h3>
              <div className="space-y-4">
                {[
                  { label: 'Require Device Binding', enabled: true, desc: 'Workers must scan from their registered device only' },
                  { label: 'Allow Device Change Requests', enabled: true, desc: 'Workers can request to change their bound device' },
                  { label: 'Admin Approval for Device Change', enabled: true, desc: 'Device changes require admin approval' },
                  { label: 'Block Scan on Unbound Device', enabled: true, desc: 'Scans from unbound devices are rejected' },
                  { label: 'Multi-Device Fraud Detection', enabled: true, desc: 'Alert when multiple workers scan from same device' },
                ].map((rule) => (
                  <div key={rule.label} className="flex items-start justify-between gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{rule.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{rule.desc}</p>
                    </div>
                    <div className={`relative w-9 h-5 rounded-full shrink-0 mt-0.5 ${rule.enabled ? 'bg-primary' : 'bg-slate-200'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-sm font-semibold text-foreground">Branding & Appearance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Company Display Name', value: 'Alpha Builders Co.' },
                  { label: 'App Title', value: 'LaborHub' },
                  { label: 'Primary Color', value: '#f97316' },
                  { label: 'Support Email', value: 'support@alphabuilders.com' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">{field.label}</label>
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Changes apply to all projects under this tenant unless overridden at project level.</p>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${saved ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary/90'}`}
            >
              <Save size={14} />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
