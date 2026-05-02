'use client';
import React, { useState } from 'react';
import { MapPin, CheckCircle, AlertTriangle, XCircle, Settings } from 'lucide-react';

type EnforcementMode = 'OFF' | 'WARN_ONLY' | 'BLOCK';

interface ProjectZone {
  id: string;
  project: string;
  location: string;
  radius: number;
  lat: string;
  lng: string;
  mode: EnforcementMode;
  todayScans: number;
  outsideScans: number;
  overrideRequests: number;
}

interface GeofenceEvent {
  id: string;
  worker: string;
  project: string;
  time: string;
  distance: string;
  action: string;
  status: 'BLOCKED' | 'WARNED' | 'OVERRIDE_REQUESTED' | 'ALLOWED';
}

const mockZones: ProjectZone[] = [
  { id: 'Z-001', project: 'Tower A', location: 'Jalan Ampang, KL', radius: 150, lat: '3.1570', lng: '101.7120', mode: 'BLOCK', todayScans: 312, outsideScans: 4, overrideRequests: 2 },
  { id: 'Z-002', project: 'Tower B', location: 'Jalan Ampang, KL', radius: 120, lat: '3.1572', lng: '101.7125', mode: 'WARN_ONLY', todayScans: 198, outsideScans: 7, overrideRequests: 0 },
  { id: 'Z-003', project: 'Podium C', location: 'Jalan Ampang, KL', radius: 200, lat: '3.1565', lng: '101.7115', mode: 'OFF', todayScans: 87, outsideScans: 0, overrideRequests: 0 },
];

const mockEvents: GeofenceEvent[] = [
  { id: 'GEO-001', worker: 'Budi Santoso', project: 'Tower A', time: '08:14', distance: '2.3km outside', action: 'Scan blocked', status: 'BLOCKED' },
  { id: 'GEO-002', worker: 'Ahmad Razali', project: 'Tower B', time: '07:58', distance: '85m outside', action: 'Warning issued', status: 'WARNED' },
  { id: 'GEO-003', worker: 'Suresh Kumar', project: 'Tower A', time: '12:32', distance: '320m outside', action: 'Override requested', status: 'OVERRIDE_REQUESTED' },
  { id: 'GEO-004', worker: 'Ravi Nair', project: 'Tower B', time: '17:05', distance: '45m outside', action: 'Warning issued', status: 'WARNED' },
];

const modeConfig: Record<EnforcementMode, { label: string; color: string; bg: string; desc: string }> = {
  OFF: { label: 'Off', color: 'text-slate-600', bg: 'bg-slate-100 border border-slate-200', desc: 'No enforcement' },
  WARN_ONLY: { label: 'Warn Only', color: 'text-yellow-700', bg: 'bg-yellow-50 border border-yellow-200', desc: 'Alert but allow' },
  BLOCK: { label: 'Block', color: 'text-red-700', bg: 'bg-red-50 border border-red-200', desc: 'Deny outside scans' },
};

const eventStatusConfig: Record<GeofenceEvent['status'], { color: string; bg: string }> = {
  BLOCKED: { color: 'text-red-700', bg: 'bg-red-50 border border-red-200' },
  WARNED: { color: 'text-yellow-700', bg: 'bg-yellow-50 border border-yellow-200' },
  OVERRIDE_REQUESTED: { color: 'text-blue-700', bg: 'bg-blue-50 border border-blue-200' },
  ALLOWED: { color: 'text-green-700', bg: 'bg-green-50 border border-green-200' },
};

export default function GeofenceContent() {
  const [selectedMode, setSelectedMode] = useState<Record<string, EnforcementMode>>({ 'Z-001': 'BLOCK', 'Z-002': 'WARN_ONLY', 'Z-003': 'OFF' });

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Zones', value: mockZones.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: MapPin },
          { label: 'Total Scans Today', value: mockZones.reduce((a, z) => a + z.todayScans, 0), color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
          { label: 'Outside Scans', value: mockZones.reduce((a, z) => a + z.outsideScans, 0), color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
          { label: 'Override Requests', value: mockZones.reduce((a, z) => a + z.overrideRequests, 0), color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertTriangle },
        ].map((k) => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${k.bg} flex items-center justify-center shrink-0`}>
              <k.icon size={20} className={k.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Zone Config */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Project Zones</h2>
          {mockZones.map((zone) => {
            const mode = selectedMode[zone.id] || zone.mode;
            const mc = modeConfig[mode];
            return (
              <div key={zone.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{zone.project}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${mc.bg} ${mc.color}`}>{mc.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={11} />{zone.location} · Radius: {zone.radius}m</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{zone.lat}°N, {zone.lng}°E</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={mode}
                      onChange={(e) => setSelectedMode(prev => ({ ...prev, [zone.id]: e.target.value as EnforcementMode }))}
                      className="text-xs bg-muted border border-border rounded-md px-2 py-1.5 text-foreground outline-none"
                    >
                      <option value="OFF">Off</option>
                      <option value="WARN_ONLY">Warn Only</option>
                      <option value="BLOCK">Block</option>
                    </select>
                    <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"><Settings size={14} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Scans Today', value: zone.todayScans, color: 'text-green-600' },
                    { label: 'Outside Scans', value: zone.outsideScans, color: 'text-red-600' },
                    { label: 'Override Requests', value: zone.overrideRequests, color: 'text-orange-600' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-muted rounded-lg p-3 text-center">
                      <p className={`text-xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Events */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Events</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Today · Outside geofence alerts</p>
          </div>
          <div className="divide-y divide-border">
            {mockEvents.map((ev) => {
              const sc = eventStatusConfig[ev.status];
              return (
                <div key={ev.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground">{ev.worker}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${sc.bg} ${sc.color}`}>{ev.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{ev.project} · {ev.time}</p>
                  <p className="text-xs text-muted-foreground">{ev.distance} · {ev.action}</p>
                  {ev.status === 'OVERRIDE_REQUESTED' && (
                    <div className="flex gap-1 mt-2">
                      <button className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors">Allow</button>
                      <button className="px-2 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors">Deny</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
