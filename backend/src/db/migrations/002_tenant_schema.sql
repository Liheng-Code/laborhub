-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Per-Tenant Schema: Workers
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) UNIQUE,
  photo_url TEXT,
  trade VARCHAR(100),
  crew_id VARCHAR(100),
  daily_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  bank_account_encrypted TEXT,
  pin_hash VARCHAR(255),
  biometric_registered BOOLEAN DEFAULT false,
  face_reference_photo_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workers_status ON workers(status);
CREATE INDEX idx_workers_phone ON workers(phone);

-- Worker Rate History (append-only)
CREATE TABLE IF NOT EXISTS worker_rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  daily_rate DECIMAL(10, 2) NOT NULL,
  effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
  set_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Face Reference Photos
CREATE TABLE IF NOT EXISTS face_reference_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  embedding_vector TEXT,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  registered_by UUID
);

-- Attendance Scans
CREATE TABLE IF NOT EXISTS attendance_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  project_id UUID,
  scan_date DATE NOT NULL,
  scan_type VARCHAR(20) NOT NULL CHECK (scan_type IN (
    'MORNING_IN', 'MORNING_OUT',
    'AFTERNOON_IN', 'AFTERNOON_OUT',
    'OT_IN', 'OT_OUT'
  )),
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  face_photo_url TEXT,
  face_match_score_local DECIMAL(3, 2),
  face_match_score_server DECIMAL(3, 2),
  face_verified BOOLEAN DEFAULT false,
  sync_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (sync_status IN ('PENDING', 'SYNCED', 'REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (worker_id, scan_date, scan_type)
);

CREATE INDEX idx_scans_worker_date ON attendance_scans(worker_id, scan_date);
CREATE INDEX idx_scans_sync_status ON attendance_scans(sync_status);
CREATE INDEX idx_scans_face_verified ON attendance_scans(face_verified);

-- Work Sessions (computed from scan pairs)
CREATE TABLE IF NOT EXISTS work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  project_id UUID,
  date DATE NOT NULL,
  morning_hours DECIMAL(5, 2),
  afternoon_hours DECIMAL(5, 2),
  ot_hours DECIMAL(5, 2),
  total_regular_hours DECIMAL(5, 2),
  total_ot_hours DECIMAL(5, 2),
  is_manual_override BOOLEAN DEFAULT false,
  override_note TEXT,
  overridden_by UUID,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (worker_id, date)
);

CREATE INDEX idx_sessions_worker_date ON work_sessions(worker_id, date);

-- Pay Rules (versioned by effective date)
CREATE TABLE IF NOT EXISTS pay_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
    'WEEKDAY_OT', 'SUNDAY_REGULAR', 'SUNDAY_OT',
    'HOLIDAY_REGULAR', 'HOLIDAY_OT'
  )),
  multiplier DECIMAL(3, 1) NOT NULL,
  ot_threshold_hours DECIMAL(4, 1),
  effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
  effective_to TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_pay_rules_type_date ON pay_rules(rule_type, effective_from);

-- Public Holidays
CREATE TABLE IF NOT EXISTS public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  name VARCHAR(255) NOT NULL,
  country_code VARCHAR(10) DEFAULT 'SG',
  UNIQUE (date, country_code)
);

-- Timesheets (one per worker per week)
CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  regular_hours DECIMAL(6, 2) DEFAULT 0,
  ot_hours DECIMAL(6, 2) DEFAULT 0,
  sunday_hours DECIMAL(6, 2) DEFAULT 0,
  holiday_hours DECIMAL(6, 2) DEFAULT 0,
  gross_regular DECIMAL(10, 2) DEFAULT 0,
  gross_ot DECIMAL(10, 2) DEFAULT 0,
  gross_sunday DECIMAL(10, 2) DEFAULT 0,
  gross_holiday DECIMAL(10, 2) DEFAULT 0,
  total_gross DECIMAL(10, 2) DEFAULT 0,
  total_deductions DECIMAL(10, 2) DEFAULT 0,
  net_pay DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'PAID')),
  pdf_url TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (worker_id, week_start_date)
);

CREATE INDEX idx_timesheets_worker_week ON timesheets(worker_id, week_start_date);
CREATE INDEX idx_timesheets_status ON timesheets(status);

-- Payroll Deductions
CREATE TABLE IF NOT EXISTS payroll_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('ABSENCE', 'ADVANCE', 'PENALTY', 'OTHER')),
  amount DECIMAL(10, 2) NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_deductions_worker_week ON payroll_deductions(worker_id, week_start_date);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WBS Nodes (self-referential tree)
CREATE TABLE IF NOT EXISTS wbs_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES wbs_nodes(id),
  level INTEGER NOT NULL DEFAULT 0,
  zone VARCHAR(100),
  label VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wbs_project ON wbs_nodes(project_id);
CREATE INDEX idx_wbs_parent ON wbs_nodes(parent_id);

-- Daily Assignments
CREATE TABLE IF NOT EXISTS daily_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id),
  wbs_node_id UUID REFERENCES wbs_nodes(id),
  task_id UUID,
  date DATE NOT NULL,
  time_block VARCHAR(20) NOT NULL CHECK (time_block IN ('AM', 'PM', 'FULL')),
  hours DECIMAL(4, 1),
  cost_center VARCHAR(100),
  entry_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (worker_id, date, time_block)
);

CREATE INDEX idx_assignments_date_project ON daily_assignments(date, project_id);
CREATE INDEX idx_assignments_worker ON daily_assignments(worker_id);

-- Transfer Requests
CREATE TABLE IF NOT EXISTS transfer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_project_id UUID NOT NULL REFERENCES projects(id),
  to_project_id UUID NOT NULL REFERENCES projects(id),
  worker_ids UUID[] NOT NULL,
  date DATE NOT NULL,
  time_block VARCHAR(20) NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  cost_split_pct_origin DECIMAL(5, 2) DEFAULT 50.00,
  cost_split_pct_destination DECIMAL(5, 2) DEFAULT 50.00,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transfers_status ON transfer_requests(status);
CREATE INDEX idx_transfers_date ON transfer_requests(date);

-- Productivity Benchmarks
CREATE TABLE IF NOT EXISTS productivity_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  task_type_id UUID NOT NULL,
  unit VARCHAR(50) NOT NULL,
  target_output_per_hour DECIMAL(8, 2) NOT NULL,
  configured_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_benchmarks_worker ON productivity_benchmarks(worker_id);

-- Productivity Snapshots
CREATE TABLE IF NOT EXISTS productivity_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wbs_node_id UUID NOT NULL REFERENCES wbs_nodes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  manpower_count INTEGER NOT NULL,
  output DECIMAL(10, 2),
  unit VARCHAR(50),
  productivity_ratio DECIMAL(5, 2),
  flag VARCHAR(20) NOT NULL DEFAULT 'GREEN' CHECK (flag IN ('GREEN', 'YELLOW', 'RED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_snapshots_node_date ON productivity_snapshots(wbs_node_id, date);
CREATE INDEX idx_snapshots_flag ON productivity_snapshots(flag);

-- Progress Logs (append-only)
CREATE TABLE IF NOT EXISTS progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wbs_node_id UUID NOT NULL REFERENCES wbs_nodes(id) ON DELETE CASCADE,
  task_id UUID,
  date DATE NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  photos TEXT[],
  logged_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_progress_node_date ON progress_logs(wbs_node_id, date);

-- Issues
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  wbs_node_id UUID REFERENCES wbs_nodes(id),
  type VARCHAR(50) NOT NULL CHECK (type IN ('MATERIAL', 'DRAWING', 'MANPOWER', 'EQUIPMENT')),
  severity VARCHAR(20) NOT NULL DEFAULT 'LOW' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
  description TEXT NOT NULL,
  photos TEXT[],
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
  raised_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_issues_project ON issues(project_id);
CREATE INDEX idx_issues_status ON issues(status);

-- Audit Log (append-only)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);
