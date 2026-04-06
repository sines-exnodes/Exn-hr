-- Add late tracking to attendance
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS is_late BOOLEAN DEFAULT false;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS late_minutes INT DEFAULT 0;

-- Add half-day leave support
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS is_half_day BOOLEAN DEFAULT false;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS half_day_period VARCHAR(20) DEFAULT '';
