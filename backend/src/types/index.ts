export type UserRole = 'worker' | 'foreman' | 'engineer' | 'supervisor' | 'project_manager' | 'admin' | 'platform_owner';

export type ScanType =
  | 'MORNING_IN'
  | 'MORNING_OUT'
  | 'AFTERNOON_IN'
  | 'AFTERNOON_OUT'
  | 'OT_IN'
  | 'OT_OUT';

export type SyncStatus = 'PENDING' | 'SYNCED' | 'REJECTED';
export type WorkerStatus = 'ACTIVE' | 'INACTIVE';
export type DayType = 'WEEKDAY' | 'SUNDAY' | 'HOLIDAY';

export interface DecodedToken {
  userId: string;
  tenantId: string;
  role: UserRole;
  email: string;
}

export interface Tenant {
  id: string;
  company_name: string;
  slug: string;
  plan: 'starter' | 'growth' | 'enterprise';
  status: 'active' | 'suspended' | 'inactive';
  region: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  worker_limit: number;
  project_limit: number;
  current_period_end: string;
  status: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  photo_url: string | null;
  trade: string | null;
  crew_id: string | null;
  daily_rate: number;
  bank_account_encrypted: string | null;
  pin_hash: string;
  biometric_registered: boolean;
  face_reference_photo_url: string | null;
  status: WorkerStatus;
  created_at: string;
}

export interface AttendanceScan {
  id: string;
  worker_id: string;
  project_id: string;
  scan_type: ScanType;
  scanned_at: string;
  lat: number | null;
  lng: number | null;
  face_photo_url: string | null;
  face_match_score_local: number | null;
  face_match_score_server: number | null;
  face_verified: boolean;
  sync_status: SyncStatus;
}

export interface WorkSession {
  id: string;
  worker_id: string;
  project_id: string;
  date: string;
  morning_hours: number | null;
  afternoon_hours: number | null;
  ot_hours: number | null;
  total_regular_hours: number | null;
  total_ot_hours: number | null;
  is_manual_override: boolean;
  override_note: string | null;
  overridden_by: string | null;
  computed_at: string;
}

export interface PayRule {
  id: string;
  rule_type: string;
  multiplier: number;
  ot_threshold_hours: number | null;
  effective_from: string;
  effective_to: string | null;
}

export interface Timesheet {
  id: string;
  worker_id: string;
  week_start_date: string;
  regular_hours: number;
  ot_hours: number;
  sunday_hours: number;
  holiday_hours: number;
  gross_regular: number;
  gross_ot: number;
  gross_sunday: number;
  gross_holiday: number;
  total_gross: number;
  total_deductions: number;
  net_pay: number;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PAID';
  pdf_url: string | null;
  approved_by: string | null;
  approved_at: string | null;
  paid_at: string | null;
}

export interface AuditLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  action: string;
  ip_address: string;
  created_at: string;
}
