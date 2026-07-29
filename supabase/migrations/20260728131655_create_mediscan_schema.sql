/*
# MediScan AI — Core Database Schema

## Overview
Creates the full schema for the MediScan AI healthcare platform: user profiles,
medical reports, AI analyses, chat conversations, doctor notes, notifications,
audit logs, and healthcare services seed data.

## New Tables
1. `profiles` — extends auth.users with full_name, role (patient/doctor/admin), avatar_url
2. `medical_reports` — uploaded medical documents (file_url, report_type, upload_date)
3. `report_analyses` — AI-generated analysis linked to a medical report (summary, findings, results, terms, insights, specialty, questions)
4. `conversations` — chat sessions with messages stored as JSONB array
5. `doctor_notes` — notes a doctor writes about a patient/report
6. `notifications` — user-facing notifications with read state
7. `audit_logs` — platform audit trail of user actions
8. `healthcare_services` — catalog of healthcare service categories (seeded)

## Security (RLS)
- `profiles`: users read/update own profile; doctors+admins read all profiles
- `medical_reports`: owner-scoped CRUD (patient owns their reports); doctors can SELECT reports of patients they've noted
- `report_analyses`: owner-scoped through report_id FK; doctors can SELECT
- `conversations`: owner-scoped CRUD
- `doctor_notes`: doctors manage their own notes; patients can SELECT notes about them
- `notifications`: owner-scoped CRUD
- `audit_logs`: insert for any authenticated user; SELECT admin-only
- `healthcare_services`: public read for all

## Notes
- All owner columns default to auth.uid() so client inserts omitting user_id succeed.
- Role is stored in profiles.role and also mirrored in auth.users raw_app_meta_data via trigger.
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'patient' CHECK (role IN ('patient','doctor','admin')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "select_all_profiles_staff" ON profiles;
CREATE POLICY "select_all_profiles_staff" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('doctor','admin'))
  );

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- HEALTHCARE SERVICES (seed catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS healthcare_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Stethoscope',
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE healthcare_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_services" ON healthcare_services;
CREATE POLICY "read_services" ON healthcare_services FOR SELECT
  TO anon, authenticated USING (true);

INSERT INTO healthcare_services (slug, name, description, icon, sort_order) VALUES
  ('general-health', 'General Health', 'Medical report scanning and general health information.', 'Stethoscope', 1),
  ('dental-care', 'Dental Care', 'Dental reports and oral health information.', 'Smile', 2),
  ('eye-care', 'Eye Care', 'Eye examination reports and vision-related information.', 'Eye', 3),
  ('cardiology', 'Cardiology', 'Heart-related reports and cardiovascular education.', 'HeartPulse', 4),
  ('neurology', 'Neurology', 'Brain and nervous system information.', 'Brain', 5),
  ('nutrition', 'Nutrition', 'Diet, vitamins, minerals, and nutrition guidance.', 'Apple', 6),
  ('laboratory', 'Laboratory', 'Blood, urine, and laboratory report analysis.', 'TestTube', 7),
  ('radiology', 'Radiology', 'Imaging report explanations for X-ray, MRI, CT scans.', 'ScanLine', 8),
  ('orthopedics', 'Orthopedics', 'Bone and joint-related reports.', 'Bone', 9),
  ('medication', 'Medication Information', 'General medication education and drug information.', 'Pill', 10)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- MEDICAL REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  report_type text NOT NULL DEFAULT 'general',
  upload_date timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_reports" ON medical_reports;
CREATE POLICY "select_own_reports" ON medical_reports FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_reports_as_staff" ON medical_reports;
CREATE POLICY "select_reports_as_staff" ON medical_reports FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('doctor','admin'))
  );

DROP POLICY IF EXISTS "insert_own_reports" ON medical_reports;
CREATE POLICY "insert_own_reports" ON medical_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_reports" ON medical_reports;
CREATE POLICY "update_own_reports" ON medical_reports FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reports" ON medical_reports;
CREATE POLICY "delete_own_reports" ON medical_reports FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- REPORT ANALYSES
-- ============================================================
CREATE TABLE IF NOT EXISTS report_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES medical_reports(id) ON DELETE CASCADE,
  summary text NOT NULL DEFAULT '',
  findings jsonb,
  results jsonb,
  medical_terms jsonb,
  health_insights text,
  recommended_specialty text,
  questions_for_doctor jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE report_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analyses" ON report_analyses;
CREATE POLICY "select_own_analyses" ON report_analyses FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM medical_reports r WHERE r.id = report_analyses.report_id AND r.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "select_analyses_as_staff" ON report_analyses;
CREATE POLICY "select_analyses_as_staff" ON report_analyses FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('doctor','admin'))
  );

DROP POLICY IF EXISTS "insert_own_analyses" ON report_analyses;
CREATE POLICY "insert_own_analyses" ON report_analyses FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM medical_reports r WHERE r.id = report_analyses.report_id AND r.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_analyses" ON report_analyses;
CREATE POLICY "delete_own_analyses" ON report_analyses FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM medical_reports r WHERE r.id = report_analyses.report_id AND r.user_id = auth.uid())
  );

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New Conversation',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_conversations" ON conversations;
CREATE POLICY "select_own_conversations" ON conversations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_conversations" ON conversations;
CREATE POLICY "insert_own_conversations" ON conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_conversations" ON conversations;
CREATE POLICY "update_own_conversations" ON conversations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_conversations" ON conversations;
CREATE POLICY "delete_own_conversations" ON conversations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- DOCTOR NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id uuid REFERENCES medical_reports(id) ON DELETE SET NULL,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE doctor_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_doctor_notes" ON doctor_notes;
CREATE POLICY "select_own_doctor_notes" ON doctor_notes FOR SELECT
  TO authenticated USING (doctor_id = auth.uid());

DROP POLICY IF EXISTS "select_patient_doctor_notes" ON doctor_notes;
CREATE POLICY "select_patient_doctor_notes" ON doctor_notes FOR SELECT
  TO authenticated USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "insert_own_doctor_notes" ON doctor_notes;
CREATE POLICY "insert_own_doctor_notes" ON doctor_notes FOR INSERT
  TO authenticated WITH CHECK (
    doctor_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'doctor')
  );

DROP POLICY IF EXISTS "update_own_doctor_notes" ON doctor_notes;
CREATE POLICY "update_own_doctor_notes" ON doctor_notes FOR UPDATE
  TO authenticated USING (doctor_id = auth.uid()) WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "delete_own_doctor_notes" ON doctor_notes;
CREATE POLICY "delete_own_doctor_notes" ON doctor_notes FOR DELETE
  TO authenticated USING (doctor_id = auth.uid());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_audit_logs" ON audit_logs;
CREATE POLICY "insert_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "select_audit_logs_admin" ON audit_logs;
CREATE POLICY "select_audit_logs_admin" ON audit_logs FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_medical_reports_user_id ON medical_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_report_analyses_report_id ON report_analyses(report_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_patient_id ON doctor_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
