import React, { useState } from 'react';
import {
  FolderOpen, Plus, Search, Filter, Clock, AlertTriangle, FileSearch, UserPlus,
  User, Tag, MoreVertical, ChevronRight, Archive, Trash2,
  Phone, Mail, Calendar, DollarSign, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

type CaseStatus = 'Active' | 'Pending' | 'Closed' | 'On Hold';
type CaseType = 'Civil Rights' | 'Personal Injury' | 'Criminal Defense' | 'Family Law' | 'Contract' | 'Employment' | 'Other';

interface Case {
  id: string;
  title: string;
  client: string;
  clientEmail?: string;
  clientPhone?: string;
  type: CaseType;
  status: CaseStatus;
  filed: string;
  nextDeadline?: string;
  nextDeadlineLabel?: string;
  notes: string;
  estimatedValue?: string;
  attorney: string;
  priority: 'High' | 'Medium' | 'Low';
}

const SAMPLE_CASES: Case[] = [
  {
    id: '1',
    title: 'Smith v. ABC Corp',
    client: 'John Smith',
    clientEmail: 'john@email.com',
    clientPhone: '(555) 123-4567',
    type: 'Civil Rights',
    status: 'Active',
    filed: '2026-03-15',
    nextDeadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    nextDeadlineLabel: 'Answer to Complaint',
    notes: 'Police excessive force during traffic stop. Strong video evidence.',
    estimatedValue: '$150,000+',
    attorney: 'You',
    priority: 'High',
  },
  {
    id: '2',
    title: 'Jones v. City of Jackson',
    client: 'Sarah Jones',
    clientEmail: 'sarah.jones@email.com',
    type: 'Civil Rights',
    status: 'Active',
    filed: '2025-11-20',
    nextDeadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    nextDeadlineLabel: 'Discovery Cutoff',
    notes: 'First Amendment retaliation by municipal employer.',
    estimatedValue: '$75,000–$100,000',
    attorney: 'You',
    priority: 'Medium',
  },
];

const STATUS_CONFIG: Record<CaseStatus, { color: string; dot: string }> = {
  Active: { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  Pending: { color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400' },
  Closed: { color: 'bg-slate-500/15 text-slate-400 border-slate-500/30', dot: 'bg-slate-400' },
  'On Hold': { color: 'bg-orange-500/15 text-orange-400 border-orange-500/30', dot: 'bg-orange-400' },
};

const PRIORITY_CONFIG: Record<string, string> = {
  High: 'text-red-400',
  Medium: 'text-yellow-400',
  Low: 'text-slate-400',
};

export default function Cases() {
  const [cases, setCases] = useState<Case[]>(SAMPLE_CASES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'All'>('All');
  const [showNewCase, setShowNewCase] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [form, setForm] = useState<Partial<Case>>({
    type: 'Civil Rights', status: 'Active', priority: 'Medium', attorney: 'You'
  });

  const filtered = cases.filter(c => {
    const matchSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

  const addCase = () => {
    if (!form.title || !form.client) return;
    const newCase: Case = {
      id: Date.now().toString(),
      title: form.title!,
      client: form.client!,
      clientEmail: form.clientEmail,
      clientPhone: form.clientPhone,
      type: form.type as CaseType || 'Civil Rights',
      status: form.status as CaseStatus || 'Active',
      filed: new Date().toISOString().split('T')[0],
      notes: form.notes || '',
      estimatedValue: form.estimatedValue,
      attorney: form.attorney || 'You',
      priority: form.priority as any || 'Medium',
    };
    setCases(prev => [newCase, ...prev]);
    setForm({ type: 'Civil Rights', status: 'Active', priority: 'Medium', attorney: 'You' });
    setShowNewCase(false);
  };

  const deleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
    if (selectedCase?.id === id) setSelectedCase(null);
  };

  if (selectedCase) {
    const days = selectedCase.nextDeadline ? daysUntil(selectedCase.nextDeadline) : null;
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
        <button onClick={() => setSelectedCase(null)} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
          ← Back to Cases
        </button>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/40"
            style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.8))' }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_CONFIG[selectedCase.status].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selectedCase.status].dot}`} />
                    {selectedCase.status}
                  </span>
                  <span className={`text-xs font-medium ${PRIORITY_CONFIG[selectedCase.priority]}`}>
                    {selectedCase.priority} Priority
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white">{selectedCase.title}</h1>
                <p className="text-slate-400 text-sm mt-1">{selectedCase.type}</p>
              </div>
              <button onClick={() => deleteCase(selectedCase.id)}
                className="text-slate-500 hover:text-red-400 transition-colors p-1.5">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-6">
            {/* Client info */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Client</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <User size={14} className="text-blue-400" />
                  <span className="text-white text-sm font-medium">{selectedCase.client}</span>
                </div>
                {selectedCase.clientEmail && (
                  <div className="flex items-center gap-2.5">
                    <Mail size={14} className="text-slate-400" />
                    <a href={`mailto:${selectedCase.clientEmail}`} className="text-blue-400 hover:text-blue-300 text-sm">
                      {selectedCase.clientEmail}
                    </a>
                  </div>
                )}
                {selectedCase.clientPhone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={14} className="text-slate-400" />
                    <span className="text-slate-300 text-sm">{selectedCase.clientPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Case details */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-slate-300 text-sm">Filed: {selectedCase.filed}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <User size={14} className="text-slate-400" />
                  <span className="text-slate-300 text-sm">Attorney: {selectedCase.attorney}</span>
                </div>
                {selectedCase.estimatedValue && (
                  <div className="flex items-center gap-2.5">
                    <DollarSign size={14} className="text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">{selectedCase.estimatedValue}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Next deadline */}
            {selectedCase.nextDeadline && days !== null && (
              <div className="md:col-span-2">
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${days <= 7 ? 'bg-red-500/10 border-red-500/30' : days <= 30 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-slate-700/30 border-slate-600/40'}`}>
                  <AlertTriangle size={16} className={days <= 7 ? 'text-red-400' : days <= 30 ? 'text-yellow-400' : 'text-slate-400'} />
                  <div>
                    <div className="text-white text-sm font-medium">
                      {selectedCase.nextDeadlineLabel || 'Next Deadline'}: {selectedCase.nextDeadline}
                    </div>
                    <div className={`text-xs ${days <= 7 ? 'text-red-400' : days <= 30 ? 'text-yellow-400' : 'text-slate-400'}`}>
                      {days <= 0 ? 'OVERDUE' : `${days} day${days !== 1 ? 's' : ''} remaining`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedCase.notes && (
              <div className="md:col-span-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Notes</h3>
                <p className="text-slate-300 text-sm leading-relaxed bg-slate-700/30 rounded-xl p-3 border border-slate-600/40">
                  {selectedCase.notes}
                </p>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="px-6 pb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { to: '/documents', label: 'Analyze Document', icon: FileSearch },
                { to: '/research', label: 'Research Case', icon: FileText },
                { to: '/deadlines', label: 'Track Deadline', icon: Clock },
                { to: '/trial', label: 'Trial Prep', icon: ChevronRight },
              ].map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-1.5 text-xs font-medium bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors">
                  <Icon size={12} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cases or clients..."
            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none"
          >
            <option value="All">All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>On Hold</option>
            <option>Closed</option>
          </select>
          <button
            onClick={() => setShowNewCase(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus size={15} /> New Case
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-2">
        {(['All', 'Active', 'Pending', 'Closed'] as const).map(s => {
          const count = s === 'All' ? cases.length : cases.filter(c => c.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s as any)}
              className={`text-center p-2.5 rounded-xl border transition-all text-sm ${statusFilter === s
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:border-slate-600'}`}
            >
              <div className="font-bold text-white">{count}</div>
              <div className="text-xs">{s}</div>
            </button>
          );
        })}
      </div>

      {/* Case list */}
      {filtered.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-12 text-center">
          <FolderOpen className="text-slate-600 mx-auto mb-4" size={44} />
          <div className="text-white font-medium">No cases found</div>
          <div className="text-slate-500 text-sm mt-1 mb-5">
            {search ? 'Try a different search term' : 'Start with an AI Intake to automatically create your first case'}
          </div>
          {!search && (
            <Link to="/intake" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <UserPlus size={14} /> Start AI Intake
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => {
            const days = c.nextDeadline ? daysUntil(c.nextDeadline) : null;
            const urgent = days !== null && days <= 7;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className="bg-slate-800/60 border border-slate-700/40 hover:border-slate-600 rounded-xl p-4 cursor-pointer transition-all card-hover group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FolderOpen size={16} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{c.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[c.status].color}`}>
                        {c.status}
                      </span>
                      {urgent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                          ⚠ Deadline Soon
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><User size={10} /> {c.client}</span>
                      <span className="flex items-center gap-1"><Tag size={10} /> {c.type}</span>
                      {c.estimatedValue && <span className="flex items-center gap-1 text-emerald-500"><DollarSign size={10} /> {c.estimatedValue}</span>}
                    </div>
                    {c.nextDeadline && days !== null && (
                      <div className={`mt-1.5 text-xs flex items-center gap-1 ${days <= 7 ? 'text-red-400' : days <= 30 ? 'text-yellow-400' : 'text-slate-500'}`}>
                        <Clock size={10} />
                        {c.nextDeadlineLabel}: {days <= 0 ? 'OVERDUE' : `${days}d`}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={15} className="text-slate-600 group-hover:text-slate-400 flex-shrink-0 mt-1 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Case Modal */}
      {showNewCase && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">New Case</h2>
              <button onClick={() => setShowNewCase(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>
            <div className="space-y-3">
              <input
                value={form.title || ''}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Case title (e.g. Smith v. ABC Corp)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.client || ''}
                  onChange={e => setForm(p => ({ ...p, client: e.target.value }))}
                  placeholder="Client name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <input
                  value={form.clientEmail || ''}
                  onChange={e => setForm(p => ({ ...p, clientEmail: e.target.value }))}
                  placeholder="Client email"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value as CaseType }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                >
                  {['Civil Rights', 'Personal Injury', 'Criminal Defense', 'Family Law', 'Contract', 'Employment', 'Other'].map(t => <option key={t}>{t}</option>)}
                </select>
                <select
                  value={form.priority}
                  onChange={e => setForm(p => ({ ...p, priority: e.target.value as any }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <input
                value={form.estimatedValue || ''}
                onChange={e => setForm(p => ({ ...p, estimatedValue: e.target.value }))}
                placeholder="Estimated case value (optional)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <textarea
                value={form.notes || ''}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Case notes / summary..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowNewCase(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={addCase}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  Create Case
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Need to import UserPlus for empty state
