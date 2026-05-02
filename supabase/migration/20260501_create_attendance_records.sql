-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scan_date DATE DEFAULT CURRENT_DATE,
  scan_type TEXT CHECK (scan_type IN ('check_in', 'check_out')) NOT NULL,
  status TEXT CHECK (status IN ('verified', 'flagged', 'pending')) DEFAULT 'pending',
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_worker_id ON attendance_records(worker_id);
CREATE INDEX IF NOT EXISTS idx_attendance_scan_date ON attendance_records(scan_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);

-- Enable Row Level Security
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Workers can view own attendance" ON attendance_records;
DROP POLICY IF EXISTS "Workers can insert own attendance" ON attendance_records;
DROP POLICY IF EXISTS "Admins can view company attendance" ON attendance_records;
DROP POLICY IF EXISTS "Project managers can view company attendance" ON attendance_records;

-- Policy: Workers can view their own attendance
CREATE POLICY "Workers can view own attendance"
  ON attendance_records FOR SELECT
  USING (auth.uid() = worker_id);

-- Policy: Workers can insert their own attendance
CREATE POLICY "Workers can insert own attendance"
  ON attendance_records FOR INSERT
  WITH CHECK (auth.uid() = worker_id);

-- Policy: Admins can view company attendance (via join with user_profiles)
CREATE POLICY "Admins can view company attendance"
  ON attendance_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
      AND user_profiles.company_name = (
        SELECT up.company_name FROM user_profiles up WHERE up.id = attendance_records.worker_id
      )
    )
  );

-- Policy: Project managers can view company attendance
CREATE POLICY "Project managers can view company attendance"
  ON attendance_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'project_manager'
      AND user_profiles.company_name = (
        SELECT up.company_name FROM user_profiles up WHERE up.id = attendance_records.worker_id
      )
    )
  );
