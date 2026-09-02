import { supabase } from './supabase';

const USE_SUPABASE = !!(
  process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY
);

// ── Types ────────────────────────────────────────────────────────────────────

export type Role = 'firm_admin' | 'attorney' | 'paralegal' | 'client' | 'reviewer';

export interface Organization {
  id: string;
  name: string;
  created_at?: string;
}

export interface Membership {
  id: string;
  org_id: string;
  user_id: string;
  role: Role;
  created_at?: string;
}

export interface Matter {
  id: string;
  org_id: string;
  case_id?: string;
  title: string;
  status: string;
  created_at?: string;
}

export interface Document {
  id: string;
  org_id: string;
  matter_id?: string;
  case_id?: string;
  file_name: string;
  storage_path: string;
  file_hash: string;
  uploader_id?: string;
  created_at?: string;
}

export interface AuditLog {
  id: string;
  org_id: string;
  user_id?: string;
  action: string;
  details?: any;
  created_at?: string;
}

export interface Case {
  id: string;
  org_id?: string;
  matter_id?: string;
  user_id?: string;
  title: string;
  client: string;
  client_email?: string;
  client_phone?: string;
  type: string;
  status: 'Active' | 'Pending' | 'Closed' | 'On Hold';
  filed: string;
  next_deadline?: string;
  next_deadline_label?: string;
  notes?: string;
  estimated_value?: string;
  attorney?: string;
  priority: 'High' | 'Medium' | 'Low';
  department?: string;
  war_room_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Deadline {
  id: string;
  case_id?: string;
  case_name: string;
  title: string;
  deadline_type: string;
  due_date: string;
  description?: string;
  is_critical: boolean;
  completed: boolean;
  user_id?: string;
  created_at?: string;
}

export interface WarRoomSession {
  id: string;
  case_id?: string;
  case_title: string;
  case_client: string;
  case_type: string;
  case_facts: string;
  agent_outputs: Record<string, string>;
  pipeline_complete: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IntakeSubmission {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  case_type: string;
  jurisdiction: string;
  description: string;
  urgency?: string;
  has_evidence?: boolean;
  status?: string;
  ai_analysis?: any;
  created_at?: string;
}

// ── LocalStorage fallback helpers ────────────────────────────────────────────

function lsGet<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(`cb_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function lsSet(key: string, data: any) {
  localStorage.setItem(`cb_${key}`, JSON.stringify(data));
}

function lsId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Helper to get current user's org id ──────────────────────────────────────

export async function getCurrentOrgId(): Promise<string | null> {
  if (!USE_SUPABASE) return null;

  const user = supabase.auth.user();
  if (!user) return null;

  const { data, error } = await supabase
    .from('memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1);

  if (error) {
    console.error('[db] error getting org:', error.message);
    return null;
  }
  return data?.[0]?.org_id ?? null;
}

// ── Audit log ───────────────────────────────────────────────────────────────

export async function logAudit(action: string, details?: any) {
  if (!USE_SUPABASE) return;

  const org_id = await getCurrentOrgId();
  if (!org_id) return;

  const { error } = await supabase
    .from('audit_logs')
    .insert({ org_id, action, details });

  if (error) console.error('[db] audit error:', error.message);
}

// ── Cases ────────────────────────────────────────────────────────────────────

const DEFAULT_CASES: Case[] = [
  {
    id: 'case-demo-1',
    title: 'Shumpert v. City of Oxford',
    client: 'Marcus Shumpert',
    client_email: 'marcus@email.com',
    client_phone: '(662) 555-0101',
    type: 'Civil Rights',
    status: 'Active',
    filed: '2026-04-10',
    next_deadline: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
    next_deadline_label: 'Discovery Cutoff',
    notes: 'Traffic stop → excessive force → broken arm. Body cam + 3 witnesses. Both officers have prior complaints.',
    estimated_value: '$580K–$1.2M',
    attorney: 'You',
    priority: 'High',
    department: 'Civil Rights Division',
  },
  {
    id: 'case-demo-2',
    title: 'Smith v. ABC Corp',
    client: 'John Smith',
    client_email: 'john@email.com',
    type: 'Civil Rights',
    status: 'Active',
    filed: '2026-03-15',
    next_deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    next_deadline_label: 'Answer to Complaint',
    notes: 'Police excessive force during traffic stop. Strong video evidence.',
    estimated_value: '$150,000+',
    attorney: 'You',
    priority: 'High',
    department: 'Civil Rights Division',
  },
  {
    id: 'case-demo-3',
    title: 'Jones v. City of Jackson',
    client: 'Sarah Jones',
    client_email: 'sarah.jones@email.com',
    type: 'Civil Rights',
    status: 'Active',
    filed: '2025-11-20',
    next_deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    next_deadline_label: 'Discovery Cutoff',
    notes: 'First Amendment retaliation by municipal employer.',
    estimated_value: '$75,000–$100,000',
    attorney: 'You',
    priority: 'Medium',
    department: 'Civil Rights Division',
  },
];

export const CasesDB = {
  async list(): Promise<Case[]> {
    if (USE_SUPABASE) {
      const org_id = await getCurrentOrgId();
      if (!org_id) return [];
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('org_id', org_id);
      if (error) throw error;
      return data as Case[];
    } else {
      return lsGet('cases', DEFAULT_CASES);
    }
  },

  async create(c: Partial<Case>): Promise<Case> {
    if (USE_SUPABASE) {
      const org_id = await getCurrentOrgId();
      if (!org_id) throw new Error('No org');
      const { data, error } = await supabase
        .from('cases')
        .insert({ ...c, org_id })
        .single();
      if (error) throw error;
      await logAudit('case.created', { case_id: data.id });
      return data as Case;
    } else {
      const newCase = { ...c, id: lsId() } as Case;
      const list = lsGet('cases', DEFAULT_CASES);
      list.push(newCase);
      lsSet('cases', list);
      return newCase;
    }
  },

  async update(id: string, updates: Partial<Case>): Promise<Case> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('cases')
        .update(updates)
        .eq('id', id)
        .single();
      if (error) throw error;
      await logAudit('case.updated', { case_id: id });
      return data as Case;
    } else {
      const list = lsGet('cases', DEFAULT_CASES);
      const idx = list.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Case not found');
      const updated = { ...list[idx], ...updates };
      list[idx] = updated;
      lsSet('cases', list);
      return updated;
    }
  },

  async remove(id: string): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('cases').delete().eq('id', id);
      if (error) throw error;
      await logAudit('case.deleted', { case_id: id });
    } else {
      const list = lsGet('cases', DEFAULT_CASES);
      const filtered = list.filter(c => c.id !== id);
      lsSet('cases', filtered);
    }
  },
};

// ── Deadlines ────────────────────────────────────────────────────────────────

export const DeadlinesDB = {
  async list(): Promise<Deadline[]> {
    if (USE_SUPABASE) {
      const org_id = await getCurrentOrgId();
      if (!org_id) return [];
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('org_id', org_id);
      if (error) throw error;
      return data as Deadline[];
    } else {
      return lsGet('deadlines', [] as Deadline[]);
    }
  },

  async create(d: Partial<Deadline>): Promise<Deadline> {
    if (USE_SUPABASE) {
      const org_id = await getCurrentOrgId();
      if (!org_id) throw new Error('No org');
      const { data, error } = await supabase
        .from('deadlines')
        .insert({ ...d, org_id })
        .single();
      if (error) throw error;
      await logAudit('deadline.created', { deadline_id: data.id });
      return data as Deadline;
    } else {
      const newD = { ...d, id: lsId() } as Deadline;
      const list = lsGet('deadlines', [] as Deadline[]);
      list.push(newD);
      lsSet('deadlines', list);
      return newD;
    }
  },

  async update(id: string, updates: Partial<Deadline>): Promise<Deadline> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('deadlines')
        .update(updates)
        .eq('id', id)
        .single();
      if (error) throw error;
      await logAudit('deadline.updated', { deadline_id: id });
      return data as Deadline;
    } else {
      const list = lsGet('deadlines', [] as Deadline[]);
      const idx = list.findIndex(d => d.id === id);
      if (idx === -1) throw new Error('Deadline not found');
      const updated = { ...list[idx], ...updates };
      list[idx] = updated;
      lsSet('deadlines', list);
      return updated;
    }
  },

  async remove(id: string): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('deadlines').delete().eq('id', id);
      if (error) throw error;
      await logAudit('deadline.deleted', { deadline_id: id });
    } else {
      const list = lsGet('deadlines', [] as Deadline[]);
      lsSet('deadlines', list.filter(d => d.id !== id));
    }
  },
};

// ── War Room Sessions ───────────────────────────────────────────────────────

export const WarRoomSessionsDB = {
  async list(): Promise<WarRoomSession[]> {
    if (USE_SUPABASE) {
      const org_id = await getCurrentOrgId();
      if (!org_id) return [];
      const { data, error } = await supabase
        .from('war_room_sessions')
        .select('*')
        .eq('org_id', org_id);
      if (error) throw error;
      return data as WarRoomSession[];
    } else {
      return lsGet('war_room_sessions', [] as WarRoomSession[]);
    }
  },

  async create(s: Partial<WarRoomSession>): Promise<WarRoomSession> {
    if (USE_SUPABASE) {
      const org_id = await getCurrentOrgId();
      if (!org_id) throw new Error('No org');
      const { data, error } = await supabase
        .from('war_room_sessions')
        .insert({ ...s, org_id })
        .single();
      if (error) throw error;
      await logAudit('war_room.created', { session_id: data.id });
      return data as WarRoomSession;
    } else {
      const newS = { ...s, id: lsId() } as WarRoomSession;
      const list = lsGet('war_room_sessions', [] as WarRoomSession[]);
      list.push(newS);
      lsSet('war_room_sessions', list);
      return newS;
    }
  },

  async update(id: string, updates: Partial<WarRoomSession>): Promise<WarRoomSession> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('war_room_sessions')
        .update(updates)
        .eq('id', id)
        .single();
      if (error) throw error;
      await logAudit('war_room.updated', { session_id: id });
      return data as WarRoomSession;
    } else {
      const list = lsGet('war_room_sessions', [] as WarRoomSession[]);
      const idx = list.findIndex(s => s.id === id);
      if (idx === -1) throw new Error('Session not found');
      const updated = { ...list[idx], ...updates };
      list[idx] = updated;
      lsSet('war_room_sessions', list);
      return updated;
    }
  },

  async remove(id: string): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('war_room_sessions').delete().eq('id', id);
      if (error) throw error;
      await logAudit('war_room.deleted', { session_id: id });
    } else {
      const list = lsGet('war_room_sessions', [] as WarRoomSession[]);
      lsSet('war_room_sessions', list.filter(s => s.id !== id));
    }
  },
};

// ── Intake ───────────────────────────────────────────────────────────────────

export const IntakeSubmissionsDB = {
  async list(): Promise<IntakeSubmission[]> {
    if (USE_SUPABASE) {
      const org_id = await getCurrentOrgId();
      if (!org_id) return [];
      const { data, error } = await supabase
        .from('intake_submissions')
        .select('*')
        .eq('org_id', org_id);
      if (error) throw error;
      return data as IntakeSubmission[];
    } else {
      return lsGet('intake_submissions', [] as IntakeSubmission[]);
    }
  },

  async create(s: Partial<IntakeSubmission>): Promise<IntakeSubmission> {
    if (USE_SUPABASE) {
      const org_id = await getCurrentOrgId();
      if (!org_id) throw new Error('No org');
      const { data, error } = await supabase
        .from('intake_submissions')
        .insert({ ...s, org_id })
        .single();
      if (error) throw error;
      await logAudit('intake.created', { submission_id: data.id });
      return data as IntakeSubmission;
    } else {
      const newS = { ...s, id: lsId() } as IntakeSubmission;
      const list = lsGet('intake_submissions', [] as IntakeSubmission[]);
      list.push(newS);
      lsSet('intake_submissions', list);
      return newS;
    }
  },
};

// ── Documents (for discovery uploads) ────────────────────────────────────────

export const DocumentsDB = {
  async list(matterId?: string): Promise<Document[]> {
    if (USE_SUPABASE) {
      const org_id = await getCurrentOrgId();
      if (!org_id) return [];
      let query = supabase
        .from('documents')
        .select('*')
        .eq('org_id', org_id);
      if (matterId) query = query.eq('matter_id', matterId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Document[];
    } else {
      const all = lsGet('documents', [] as Document[]);
      return matterId ? all.filter(d => d.matter_id === matterId) : all;
    }
  },

  async create(d: Partial<Document>): Promise<Document> {
    if (USE_SUPABASE) {
      const org_id = await getCurrentOrgId();
      if (!org_id) throw new Error('No org');
      const { data, error } = await supabase
        .from('documents')
        .insert({ ...d, org_id })
        .single();
      if (error) throw error;
      await logAudit('document.uploaded', { document_id: data.id });
      return data as Document;
    } else {
      const newD = { ...d, id: lsId() } as Document;
      const list = lsGet('documents', [] as Document[]);
      list.push(newD);
      lsSet('documents', list);
      return newD;
    }
  },
};
