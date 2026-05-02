import React from 'react';
import AppLayout from '@/components/AppLayout';
import AttendanceKPIBar from './components/AttendanceKPIBar';
import AttendanceScanGrid from './components/AttendanceScanGrid';
import FlaggedScanReview from './components/FlaggedScanReview';
import ScanCompletionChart from './components/ScanCompletionChart';

export default function AttendanceMonitoringPage() {
  return (
    <AppLayout
      title="Attendance Monitor"
      subtitle="Live face-scan status · 01 May 2026 · Tower A, Tower B, Podium C"
    >
      <div className="space-y-6">
        {/* KPI Bar */}
        <AttendanceKPIBar />

        {/* Main grid: chart + flagged */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <ScanCompletionChart />
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Flagged Scans</h2>
              <span className="text-xs font-mono text-red-400 bg-red-950/30 px-2 py-0.5 rounded-full">3 need review</span>
            </div>
            <FlaggedScanReview />
          </div>
        </div>

        {/* Scan Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Worker Scan Status Grid</h2>
            <p className="text-xs text-muted-foreground">All 6 scan points · Today 01 May 2026</p>
          </div>
          <AttendanceScanGrid />
        </div>
      </div>
    </AppLayout>
  );
}