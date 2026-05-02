'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { getUserRoleLabel } from '@/lib/permissions';
import { supabaseService, AttendanceRecord } from '@/services/supabase';
import { ScanFace, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function WorkerPortalPage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyAttendance() {
      try {
        const records = await supabaseService.getAttendanceRecords(undefined, user?.id);
        setAttendance(records);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchMyAttendance();
    }
  }, [user]);

  const todayRecords = attendance.filter((r) => {
    const today = new Date().toISOString().split('T')[0];
    return r.scan_time.startsWith(today);
  });

  const checkIns = todayRecords.filter((r) => r.scan_type === 'check_in');
  const checkOuts = todayRecords.filter((r) => r.scan_type === 'check_out');

  return (
    <AppLayout
      title="My Portal"
      subtitle="View your attendance and profile"
    >
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{user?.fullName || 'Worker'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {getUserRoleLabel(user?.userType)}
                {user?.companyName && ` · ${user.companyName}`}
              </p>
            </div>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-green-400" />
              <p className="text-xs font-medium text-muted-foreground uppercase">Check-ins Today</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{checkIns.length}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-blue-400" />
              <p className="text-xs font-medium text-muted-foreground uppercase">Check-outs Today</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{checkOuts.length}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ScanFace size={16} className="text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase">Status</p>
            </div>
            <p className="text-lg font-semibold text-green-400">Active</p>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Recent Attendance</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : attendance.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No attendance records yet</div>
          ) : (
            <div className="divide-y divide-border">
              {attendance.slice(0, 10).map((record) => (
                <div key={record.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {record.status === 'verified' ? (
                      <CheckCircle2 size={14} className="text-green-400" />
                    ) : record.status === 'flagged' ? (
                      <AlertTriangle size={14} className="text-red-400" />
                    ) : (
                      <Clock size={14} className="text-yellow-400" />
                    )}
                    <div>
                      <p className="text-sm text-foreground capitalize">{record.scan_type.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">{new Date(record.scan_time).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    record.status === 'verified' ? 'bg-green-950/30 text-green-400' :
                    record.status === 'flagged' ? 'bg-red-950/30 text-red-400' :
                    'bg-yellow-950/30 text-yellow-400'
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
