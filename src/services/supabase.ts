'use client';

import { createClient } from '@supabase/supabase-js';

import type { UserRole } from '@/context/AuthContext';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// User Profile Types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  user_type: UserRole;
  company_name: string | null;
  created_at: string;
  updated_at: string;
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  worker_id: string;
  worker_name?: string;
  scan_time: string;
  scan_type: 'check_in' | 'check_out';
  status: 'verified' | 'flagged' | 'pending';
  location?: string;
  notes?: string;
}

// Worker Profile Types
export interface WorkerProfile {
  id: string;
  email: string;
  full_name: string | null;
  user_type: 'worker';
  company_name: string | null;
  created_at: string;
  attendance_summary?: {
    total_hours: number;
    days_present: number;
    last_scan?: string;
  };
}

// Supabase Service Functions
export const supabaseService = {
  // User Profiles
  async getWorkers(companyName?: string): Promise<WorkerProfile[]> {
    let query = supabase
      .from('user_profiles')
      .select('*')
      .eq('user_type', 'worker');

    if (companyName) {
      query = query.eq('company_name', companyName);
    }

    const { data, error } = await query.order('full_name');
    if (error) throw error;
    return data || [];
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Attendance
  async getAttendanceRecords(date?: string, workerId?: string): Promise<AttendanceRecord[]> {
    let query = supabase
      .from('attendance_records')
      .select(`
        *,
        user_profiles!inner(full_name)
      `)
      .order('scan_time', { ascending: false });

    if (date) {
      query = query.eq('scan_date', date);
    }
    if (workerId) {
      query = query.eq('worker_id', workerId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((record: any) => ({
      ...record,
      worker_name: record.user_profiles?.full_name,
    }));
  },

  async getAttendanceStats(date?: string) {
    const today = date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance_records')
      .select('status, scan_type')
      .eq('scan_date', today);

    if (error) throw error;

    return {
      total: data?.length || 0,
      verified: data?.filter((r) => r.status === 'verified').length || 0,
      flagged: data?.filter((r) => r.status === 'flagged').length || 0,
      checkIns: data?.filter((r) => r.scan_type === 'check_in').length || 0,
    };
  },

  // Company Settings
  async getCompanyWorkers(companyName: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('company_name', companyName)
      .order('full_name');

    if (error) throw error;
    return data || [];
  },

  // Realtime subscriptions
  subscribeToAttendance(callback: (payload: any) => void) {
    return supabase
      .channel('attendance_records')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, callback)
      .subscribe();
  },

  subscribeToProfiles(callback: (payload: any) => void) {
    return supabase
      .channel('user_profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, callback)
      .subscribe();
  },

  // Approve flagged scan
  async approveFlaggedScan(scanId: string) {
    const { error } = await supabase
      .from('attendance_records')
      .update({ status: 'verified' })
      .eq('id', scanId);

    if (error) throw error;
  },

  // Reject flagged scan (mark as pending for re-scan)
  async rejectFlaggedScan(scanId: string) {
    const { error } = await supabase
      .from('attendance_records')
      .update({ status: 'pending' })
      .eq('id', scanId);

    if (error) throw error;
  },
};
