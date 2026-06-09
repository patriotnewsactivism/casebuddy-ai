import React, { useState } from 'react';
import { Clock, Plus, Trash2, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

interface Deadline {
  id: string;
  title: string;
  deadline_type: string;
  due_date: string;
  description: string;
  is_critical: boolean;
  is_completed: boolean;
  case_name: string;
}

const DEADLINE_TYPES = ['Filing Deadline', 'Discovery Cutoff', 'Trial Date', 'Deposition', 'Mediation', 'Hearing', 'Response Due', 'Statute of Limitations', 'Appeal Deadline', 'Other'];

export default function DeadlineTracker() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([
    { id: '1', title: 'Answer to Complaint', deadline_type: 'Filing Deadline', due_date: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0], description: 'Must file answer within 21 days of service', is_critical: true, is_completed: false, case_name: 'Smith v. ABC Corp' },
    { id: '2', title: 'Discovery Cutoff', deadline_type: 'Discovery Cutoff', due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], description: 'All discovery must be completed', is_critical: false, is_completed: false, case_name: 'Jones v. City' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', deadline_type: 'Filing Deadline', due_date: '', description: '', is_critical: false, case_name: '' });

  const addDeadline = () => {
    if (!form.title || !form.due_date) return;
    setDeadlines(d => [...d, { ...form, id: Date.now().toString(), is_completed: false }]);
    setForm({ title: '', deadline_type: 'Filing Deadline', due_date: '', description: '', is_critical: false, case_name: '' });
    setShowForm(false);
  };

  const toggle = (id: string) => setDeadlines(d => d.map(x => x.id === id ? { ...x, is_completed: !x.is_completed } : x));
  const remove = (id: string) => setDeadlines(d => d.filter(x => x.id !== id));

  const daysUntil = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / (1000*60*60*24));

  const urgencyBadge = (days: number, completed: boolean) => {
    if (completed) return 'bg-green-900/40 text-green-400 border-green-500/30';
    if (days < 0) return 'bg-red-900/40 text-red-400 border-red-500/30';
    if (days <= 3) return 'bg-red-900/40 text-red-400 border-red-500/30';
    if (days <= 14) return 'bg-yellow-900/40 text-yellow-400 border-yellow-500/30';
    return 'bg-slate-700 text-slate-400 border-slate-600';
  };

  const urgencyLabel = (days: number, completed: boolean) => {
    if (completed) return 'Done';
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'TODAY';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  const sorted = [...deadlines].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  const critical = sorted.filter(d => !d.is_completed && d.is_critical);
  const upcoming = sorted.filter(d => !d.is_completed && !d.is_critical);
  const completed = sorted.filter(d => d.is_completed);

  const DeadlineCard = ({ d }: { d: Deadline }) => {
    const days = daysUntil(d.due_date);
    return (
      <div className={`bg-slate-800 border rounded-xl p-4 flex items-start gap-3 ${d.is_completed ? 'opacity-60 border-slate-700' : d.is_critical ? 'border-red-500/40' : 'border-slate-700'}`}>
        <button onClick={() => toggle(d.id)} className="mt-0.5 flex-shrink-0">
          {d.is_completed
            ? <CheckCircle className="text-green-400" size={20} />
            : <div className={`w-5 h-5 rounded-full border-2 ${d.is_critical ? 'border-red-400' : 'border-slate-500'}`} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className={`font-medium text-sm ${d.is_completed ? 'line-through text-slate-500' : 'text-white'}`}>{d.title}</div>
              {d.case_name && <div className="text-xs text-slate-400 mt-0.5">{d.case_name}</div>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${urgencyBadge(days, d.is_completed)}`}>
                {urgencyLabel(days, d.is_completed)}
              </span>
              <button onClick={() => remove(d.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-500">{d.deadline_type}</span>
            <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={11} />{d.due_date}</span>
          </div>
          {d.description && <div className="text-xs text-slate-400 mt-1">{d.description}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="text-yellow-400" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">Deadline Tracker</h1>
            <p className="text-slate-400 text-sm">Never miss a filing deadline or court date</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Deadline
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 border border-yellow-500/30 rounded-xl p-6 space-y-4">
          <div className="text-white font-semibold">New Deadline</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                placeholder="e.g. Answer to Complaint"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Case</label>
              <input value={form.case_name} onChange={e => setForm(f => ({...f, case_name: e.target.value}))}
                placeholder="Case name"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Type</label>
              <select value={form.deadline_type} onChange={e => setForm(f => ({...f, deadline_type: e.target.value}))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                {DEADLINE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Due Date *</label>
              <input type="date" value={form.due_date} onChange={e => setForm(f => ({...f, due_date: e.target.value}))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400 block mb-1">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                placeholder="Notes about this deadline..."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_critical} onChange={e => setForm(f => ({...f, is_critical: e.target.checked}))} className="rounded" />
              <span className="text-sm text-slate-300">Mark as critical</span>
            </label>
            <div className="flex-1" />
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-sm px-4 py-2">Cancel</button>
            <button onClick={addDeadline} disabled={!form.title || !form.due_date}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              Add Deadline
            </button>
          </div>
        </div>
      )}

      {critical.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm"><AlertTriangle size={16} />Critical Deadlines ({critical.length})</div>
          {critical.map(d => <DeadlineCard key={d.id} d={d} />)}
        </div>
      )}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <div className="text-slate-300 font-semibold text-sm">Upcoming ({upcoming.length})</div>
          {upcoming.map(d => <DeadlineCard key={d.id} d={d} />)}
        </div>
      )}
      {completed.length > 0 && (
        <div className="space-y-2">
          <div className="text-slate-500 font-semibold text-sm">Completed ({completed.length})</div>
          {completed.map(d => <DeadlineCard key={d.id} d={d} />)}
        </div>
      )}
      {deadlines.length === 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Clock className="text-slate-600 mx-auto mb-3" size={40} />
          <div className="text-slate-500">No deadlines yet — add your first one above</div>
        </div>
      )}
    </div>
  );
}
