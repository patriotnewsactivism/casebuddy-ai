/**
 * CaseBuddy database layer — wraps Supabase for all persistent data.
 * Falls back to localStorage when Supabase is not configured (dev mode).
 */
import { supabase } from './supabase';

const USE_SUPABASE = !!(
  process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY
);

// ── Types ────────────────────────────────────────────────────────────────────

export interface Case {
  id: string;
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
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Case[];
    }
    return lsGet<Case>('cases', DEFAULT_CASES);
  },

  async create(c: Omit<Case, 'id' | 'created_at' | 'updated_at'>): Promise<Case> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('cases').insert(c).select().single();
      if (error) throw error;
      return data as Case;
    }
    const newCase: Case = { ...c, id: lsId(), created_at: new Date().toISOString() } as Case;
    const all = lsGet<Case>('cases', DEFAULT_CASES);
    lsSet('cases', [newCase, ...all]);
    return newCase;
  },

  async update(id: string, updates: Partial<Case>): Promise<Case> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('cases').update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id).select().single();
      if (error) throw error;
      return data as Case;
    }
    const all = lsGet<Case>('cases', DEFAULT_CASES);
    const updated = all.map(c => c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c);
    lsSet('cases', updated);
    return updated.find(c => c.id === id) as Case;
  },

  async delete(id: string): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('cases').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const all = lsGet<Case>('cases', DEFAULT_CASES);
    lsSet('cases', all.filter(c => c.id !== id));
  },

  async get(id: string): Promise<Case | null> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('cases').select('*').eq('id', id).single();
      if (error) return null;
      return data as Case;
    }
    const all = lsGet<Case>('cases', DEFAULT_CASES);
    return all.find(c => c.id === id) || null;
  },
};

// ── Deadlines ────────────────────────────────────────────────────────────────

const DEFAULT_DEADLINES: Deadline[] = [
  {
    id: 'dl-demo-1',
    case_name: 'Shumpert v. City of Oxford',
    title: 'Discovery Cutoff',
    deadline_type: 'Discovery',
    due_date: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
    description: 'All discovery requests must be served',
    is_critical: true,
    completed: false,
  },
  {
    id: 'dl-demo-2',
    case_name: 'Smith v. ABC Corp',
    title: 'Answer to Complaint',
    deadline_type: 'Filing Deadline',
    due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    description: 'Answer due under FRCP 12(a)',
    is_critical: true,
    completed: false,
  },
  {
    id: 'dl-demo-3',
    case_name: 'Jones v. City of Jackson',
    title: 'Expert Witness Disclosure',
    deadline_type: 'Expert Disclosure',
    due_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
    description: 'FRCP 26(a)(2) expert disclosures',
    is_critical: false,
    completed: false,
  },
];

export const DeadlinesDB = {
  async list(): Promise<Deadline[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return (data || []) as Deadline[];
    }
    return lsGet<Deadline>('deadlines', DEFAULT_DEADLINES);
  },

  async create(d: Omit<Deadline, 'id' | 'created_at'>): Promise<Deadline> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('deadlines').insert(d).select().single();
      if (error) throw error;
      return data as Deadline;
    }
    const newD: Deadline = { ...d, id: lsId(), created_at: new Date().toISOString() } as Deadline;
    const all = lsGet<Deadline>('deadlines', DEFAULT_DEADLINES);
    lsSet('deadlines', [...all, newD]);
    return newD;
  },

  async update(id: string, updates: Partial<Deadline>): Promise<Deadline> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('deadlines').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as Deadline;
    }
    const all = lsGet<Deadline>('deadlines', DEFAULT_DEADLINES);
    const updated = all.map(d => d.id === id ? { ...d, ...updates } : d);
    lsSet('deadlines', updated);
    return updated.find(d => d.id === id) as Deadline;
  },

  async delete(id: string): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('deadlines').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const all = lsGet<Deadline>('deadlines', DEFAULT_DEADLINES);
    lsSet('deadlines', all.filter(d => d.id !== id));
  },
};

// ── War Room Sessions ─────────────────────────────────────────────────────────

export const WarRoomDB = {
  async list(): Promise<WarRoomSession[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('war_room_sessions')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) return [];
      return (data || []) as WarRoomSession[];
    }
    return lsGet<WarRoomSession>('war_room_sessions', []);
  },

  async save(session: Omit<WarRoomSession, 'id' | 'created_at' | 'updated_at'>): Promise<WarRoomSession> {
    const now = new Date().toISOString();
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('war_room_sessions')
        .insert({ ...session, created_at: now, updated_at: now })
        .select().single();
      if (error) throw error;
      return data as WarRoomSession;
    }
    const newS: WarRoomSession = { ...session, id: lsId(), created_at: now, updated_at: now } as WarRoomSession;
    const all = lsGet<WarRoomSession>('war_room_sessions', []);
    lsSet('war_room_sessions', [newS, ...all.slice(0, 49)]);
    return newS;
  },

  async update(id: string, updates: Partial<WarRoomSession>): Promise<void> {
    if (USE_SUPABASE) {
      await supabase.from('war_room_sessions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      return;
    }
    const all = lsGet<WarRoomSession>('war_room_sessions', []);
    lsSet('war_room_sessions', all.map(s => s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s));
  },
};

// ── Intake Submissions ────────────────────────────────────────────────────────

export const IntakeDB = {
  async list(): Promise<IntakeSubmission[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('intake_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return [];
      return (data || []) as IntakeSubmission[];
    }
    return lsGet<IntakeSubmission>('intakes', []);
  },

  async create(sub: Omit<IntakeSubmission, 'id' | 'created_at'>): Promise<IntakeSubmission> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('intake_submissions').insert(sub).select().single();
      if (error) throw error;
      return data as IntakeSubmission;
    }
    const newS: IntakeSubmission = { ...sub, id: lsId(), created_at: new Date().toISOString() } as IntakeSubmission;
    const all = lsGet<IntakeSubmission>('intakes', []);
    lsSet('intakes', [newS, ...all]);
    return newS;
  },

  async updateStatus(id: string, status: string, ai_analysis?: any): Promise<void> {
    if (USE_SUPABASE) {
      await supabase.from('intake_submissions').update({ status, ...(ai_analysis ? { ai_analysis } : {}) }).eq('id', id);
      return;
    }
    const all = lsGet<IntakeSubmission>('intakes', []);
    lsSet('intakes', all.map(s => s.id === id ? { ...s, status, ...(ai_analysis ? { ai_analysis } : {}) } : s));
  },
};
