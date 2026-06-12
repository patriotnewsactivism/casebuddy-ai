-- Run this in your Supabase SQL editor:
-- https://supabase.com/dashboard/project/jpzkumgndqsdwimbvjku/sql/new

-- ── Add missing columns to existing cases table ───────────────────────────────
ALTER TABLE cases ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS next_deadline_label TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS estimated_value TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS attorney TEXT DEFAULT 'You';
ALTER TABLE cases ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
ALTER TABLE cases ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS war_room_data JSONB;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own deadlines' AND tablename = 'deadlines') THEN
    CREATE POLICY "Users manage own deadlines" ON deadlines FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own war rooms' AND tablename = 'war_room_sessions') THEN
    CREATE POLICY "Users manage own war rooms" ON war_room_sessions FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can submit intake' AND tablename = 'intake_submissions') THEN
    CREATE POLICY "Anyone can submit intake" ON intake_submissions FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can view intakes' AND tablename = 'intake_submissions') THEN
    CREATE POLICY "Authenticated can view intakes" ON intake_submissions FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can update intakes' AND tablename = 'intake_submissions') THEN
    CREATE POLICY "Authenticated can update intakes" ON intake_submissions FOR UPDATE USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users manage messages' AND tablename = 'case_messages') THEN
    CREATE POLICY "Auth users manage messages" ON case_messages FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS cases_updated_at ON cases;
CREATE TRIGGER cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS war_room_updated_at ON war_room_sessions;
CREATE TRIGGER war_room_updated_at BEFORE UPDATE ON war_room_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ── RLS on cases (if not already enabled) ────────────────────────────────────
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own cases' AND tablename = 'cases') THEN
    CREATE POLICY "Users manage own cases" ON cases FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
