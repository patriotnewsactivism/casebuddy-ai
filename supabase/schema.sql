-- CaseBuddy AI — Full Schema
-- Run this in your Supabase SQL editor

-- ── Cases ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  type TEXT NOT NULL DEFAULT 'Civil Rights',
  status TEXT NOT NULL DEFAULT 'Active',
  filed DATE DEFAULT CURRENT_DATE,
  next_deadline DATE,
  next_deadline_label TEXT,
  notes TEXT,
  estimated_value TEXT,
  attorney TEXT DEFAULT 'You',
  priority TEXT DEFAULT 'Medium',
  department TEXT,
  war_room_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cases" ON cases FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_cases_user ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);

-- ── Deadlines ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deadlines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  case_name TEXT NOT NULL,
  title TEXT NOT NULL,
  deadline_type TEXT DEFAULT 'Filing Deadline',
  due_date DATE NOT NULL,
  description TEXT,
  is_critical BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own deadlines" ON deadlines FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_user ON deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due ON deadlines(due_date);

-- ── War Room Sessions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS war_room_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  case_title TEXT NOT NULL,
  case_client TEXT NOT NULL,
  case_type TEXT NOT NULL,
  case_facts TEXT NOT NULL,
  agent_outputs JSONB DEFAULT '{}',
  pipeline_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE war_room_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own war rooms" ON war_room_sessions FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_war_room_user ON war_room_sessions(user_id);

-- ── Intake Submissions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS intake_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  case_type TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT DEFAULT 'standard',
  has_evidence BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'new',
  ai_analysis JSONB,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE intake_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit intake" ON intake_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can view intakes" ON intake_submissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update intakes" ON intake_submissions FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ── Case Messages ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  client_email TEXT,
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage messages" ON case_messages FOR ALL USING (auth.uid() IS NOT NULL);

-- ── Time Entries ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  description TEXT NOT NULL,
  hours DECIMAL(5,2) NOT NULL,
  rate DECIMAL(8,2) DEFAULT 0,
  billable BOOLEAN DEFAULT true,
  billed BOOLEAN DEFAULT false,
  entry_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage time" ON time_entries FOR ALL USING (auth.uid() IS NOT NULL);

-- ── Audit Log ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users view audit" ON audit_log FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "System inserts audit" ON audit_log FOR INSERT WITH CHECK (true);

-- ── Updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER war_room_updated_at BEFORE UPDATE ON war_room_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
