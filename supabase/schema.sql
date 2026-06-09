-- CaseBuddy AI - Schema additions (compatible with existing case-companion tables)
-- Uses user_id instead of owner_id since cases table already exists with user_id

-- Intake submissions (public form → AI evaluation)
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

-- Case messages (client ↔ attorney communication)
CREATE TABLE IF NOT EXISTS case_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID,
  client_email TEXT,
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conflict check database
CREATE TABLE IF NOT EXISTS conflict_parties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID,
  name TEXT NOT NULL,
  role TEXT,
  aliases TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication log
CREATE TABLE IF NOT EXISTS communication_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID,
  type TEXT NOT NULL,
  subject TEXT,
  summary TEXT,
  participants TEXT[],
  ai_generated_summary TEXT,
  logged_by UUID REFERENCES auth.users(id),
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time tracking / billing
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID,
  description TEXT NOT NULL,
  hours DECIMAL(5,2) NOT NULL,
  rate DECIMAL(8,2) DEFAULT 0,
  billable BOOLEAN DEFAULT true,
  billed BOOLEAN DEFAULT false,
  invoice_id UUID,
  user_id UUID REFERENCES auth.users(id),
  entry_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit trail
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE intake_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflict_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can submit intake') THEN
    CREATE POLICY "Anyone can submit intake" ON intake_submissions FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can view intakes') THEN
    CREATE POLICY "Authenticated can view intakes" ON intake_submissions FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can update intakes') THEN
    CREATE POLICY "Authenticated can update intakes" ON intake_submissions FOR UPDATE USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users manage messages') THEN
    CREATE POLICY "Auth users manage messages" ON case_messages FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users manage conflicts') THEN
    CREATE POLICY "Auth users manage conflicts" ON conflict_parties FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users manage comms') THEN
    CREATE POLICY "Auth users manage comms" ON communication_log FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users manage time') THEN
    CREATE POLICY "Auth users manage time" ON time_entries FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users view audit') THEN
    CREATE POLICY "Auth users view audit" ON audit_log FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System inserts audit') THEN
    CREATE POLICY "System inserts audit" ON audit_log FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_intake_status ON intake_submissions(status);
CREATE INDEX IF NOT EXISTS idx_messages_case ON case_messages(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_log(resource_type, resource_id);
