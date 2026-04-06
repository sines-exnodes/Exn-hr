ALTER TABLE attendance_records DROP COLUMN IF EXISTS is_late;
ALTER TABLE attendance_records DROP COLUMN IF EXISTS late_minutes;
ALTER TABLE leave_requests DROP COLUMN IF EXISTS is_half_day;
ALTER TABLE leave_requests DROP COLUMN IF EXISTS half_day_period;
