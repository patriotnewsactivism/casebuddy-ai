-- CaseBuddy AI - Database Schema for Autonomous Law Firm
-- Run this in your Supabase SQL editor

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
  status TEXT DEFAULT 'new', -- new, reviewed, accepted, declined
  ai_analysis JSONB,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cases (core case management)
CREATE TABLE IF NOT EXISTS cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  case_type TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, pending, closed, archived
  client_email TEXT,
  client_name TEXT,
  jurisdiction TEXT,
  description TEXT,
  opposing_party TEXT,
  opposing_counsel TEXT,
  court_name TEXT,
  case_number TEXT,
  next_deadline TIMESTAMPTZ,
  next_deadline_label TEXT,
  ai_strength_score INTEGER,
  intake_id UUID REFERENCES intake_submissions(id),
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case messages (client ↔ attorney communication)
CREATE TABLE IF NOT EXISTS case_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  client_email TEXT,
  content TEXT NOT NULL,
  sender TEXT NOT NULL, -- 'client', 'attorney', 'ai'
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case deadlines
CREATE TABLE IF NOT EXISTS case_deadlines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES cases(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  category TEXT, -- filing, discovery, motion, hearing, trial
  status TEXT DEFAULT 'pending', -- pending, completed, overdue
  auto_generated BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case documents
CREATE TABLE IF NOT EXISTS case_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES cases(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  category TEXT, -- medical, police_report, correspondence, billing, evidence, filing
  ai_summary TEXT,
  ai_extracted_dates JSONB,
  ai_key_facts JSONB,
  bates_number TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conflict check database
CREATE TABLE IF NOT EXISTS conflict_parties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  name TEXT NOT NULL,
  role TEXT, -- client, opposing_party, witness, counsel
  aliases TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication log
CREATE TABLE IF NOT EXISTS communication_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  type TEXT NOT NULL, -- email, phone, letter, meeting, filing
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
  case_id UUID REFERENCES cases(id) NOT NULL,
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
  action TEXT NOT NULL, -- viewed, created, updated, deleted, downloaded, shared
  resource_type TEXT NOT NULL, -- case, document, message, deadline
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE intake_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflict_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Authenticated users can CRUD their own data
-- Intake submissions are publicly insertable (for the form)
CREATE POLICY "Anyone can submit intake" ON intake_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can view intakes" ON intake_submissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update intakes" ON intake_submissions FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Cases: owner can do everything, clients can view their own
CREATE POLICY "Owner manages cases" ON cases FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Clients view own cases" ON cases FOR SELECT USING (client_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Messages: participants can view and send
CREATE POLICY "Auth users manage messages" ON case_messages FOR ALL USING (auth.uid() IS NOT NULL);

-- Deadlines, documents, etc: authenticated users
CREATE POLICY "Auth users manage deadlines" ON case_deadlines FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users manage documents" ON case_documents FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users manage conflicts" ON conflict_parties FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users manage comms" ON communication_log FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users manage time" ON time_entries FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users view audit" ON audit_log FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "System inserts audit" ON audit_log FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cases_owner ON cases(owner_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_email ON cases(client_email);
CREATE INDEX IF NOT EXISTS idx_deadlines_case ON case_deadlines(case_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due ON case_deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_documents_case ON case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_messages_case ON case_messages(case_id);
CREATE INDEX IF NOT EXISTS idx_intake_status ON intake_submissions(status);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_log(resource_type, resource_id);
