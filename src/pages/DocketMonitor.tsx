import React, { useState } from 'react';
import {
  Bell, Plus, ExternalLink, Clock, CheckCircle, AlertTriangle,
  Trash2, RefreshCw, ChevronDown, ChevronUp, Building2,
  FileText, Scale, Loader2, Eye, BellOff
} from 'lucide-react';

interface WatchedCase {
  id: string;
  caseNumber: string;
  caption: string;
  court: string;
  type: 'my-case' | 'similar';
  status: 'active' | 'closed' | 'paused';
  pacerUrl: string;
  lastChecked: string;
  alerts: DocketAlert[];
  notes: string;
}

interface DocketAlert {
  id: string;
  date: string;
  docNumber: string;
  description: string;
  isNew: boolean;
  type: 'order' | 'motion' | 'filing' | 'judgment' | 'other';
}

const ALERT_TYPES = {
  order:    { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Order' },
  motion:   { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   label: 'Motion' },
  filing:   { color: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/20',  label: 'Filing' },
  judgment: { color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    label: 'Judgment' },
  other:    { color: 'text-slate-400',  bg: 'bg-slate-700/30',  border: 'border-slate-600/20',  label: 'Update' },
};

const SAMPLE_CASES: WatchedCase[] = [
  {
    id: '1',
    caseNumber: '3:26-cv-00142-MPM',
    caption: 'Smith v. City of Oxford et al.',
    court: 'N.D. Mississippi',
    type: 'my-case',
    status: 'active',
    pacerUrl: 'https://ecf.msnd.uscourts.gov/cgi-bin/DktRpt.pl?3:26-cv-00142-MPM',
    lastChecked: new Date(Date.now() - 2 * 3600000).toISOString(),
    notes: 'Main §1983 case — excessive force. Scheduling order pending.',
    alerts: [
      { id: 'a1', date: '2026-06-08', docNumber: '12', description: 'ORDER granting in part Motion to Extend Discovery Deadline. Discovery cutoff extended to 12/01/2026.', isNew: true, type: 'order' },
      { id: 'a2', date: '2026-06-05', docNumber: '11', description: "DEFENDANT'S MOTION for Protective Order re: body camera footage production.", isNew: true, type: 'motion' },
      { id: 'a3', date: '2026-06-01', docNumber: '10', description: "PLAINTIFF'S RESPONSE in Opposition to Motion to Dismiss filed.", isNew: false, type: 'filing' },
    ],
  },
  {
    id: '2',
    caseNumber: '3:25-cv-00789-GHD',
    caption: 'Jones v. Lafayette County Sheriff',
    court: 'N.D. Mississippi',
    type: 'similar',
    status: 'active',
    pacerUrl: 'https://ecf.msnd.uscourts.gov/cgi-bin/DktRpt.pl?3:25-cv-00789-GHD',
    lastChecked: new Date(Date.now() - 12 * 3600000).toISOString(),
    notes: 'Similar §1983 excessive force case — watch for MSJ ruling on qualified immunity.',
    alerts: [
      { id: 'b1', date: '2026-06-07', docNumber: '45', description: "ORDER denying Defendant's Motion for Summary Judgment on qualified immunity grounds. Trial date set for 09/15/2026.", isNew: true, type: 'judgment' },
    ],
  },
  {
    id: '3',
    caseNumber: '3:24-cv-01201-NBB',
    caption: 'Davis v. City of Columbus',
    court: 'N.D. Mississippi',
    type: 'similar',
    status: 'closed',
    pacerUrl: 'https://ecf.msnd.uscourts.gov/cgi-bin/DktRpt.pl?3:24-cv-01201-NBB',
    lastChecked: new Date(Date.now() - 24 * 3600000).toISOString(),
    notes: 'Settled for $425,000. Useful as comparable for damages.',
    alerts: [
      { id: 'c1', date: '2026-05-20', docNumber: '67', description: 'NOTICE of Settlement. Case dismissed with prejudice. Settlement amount not disclosed in public filing.', isNew: false, type: 'filing' },
    ],
  },
];

const COURTS = [
  { name: 'N.D. Mississippi — Oxford', code: 'msnd', url: 'https://ecf.msnd.uscourts.gov' },
  { name: 'S.D. Mississippi', code: 'mssd', url: 'https://ecf.mssd.uscourts.gov' },
  { name: '5th Circuit', code: 'ca5', url: 'https://ecf.ca5.uscourts.gov' },
  { name: 'N.D. Texas', code: 'txnd', url: 'https://ecf.txnd.uscourts.gov' },
  { name: 'N.D. Alabama', code: 'alnd', url: 'https://ecf.alnd.uscourts.gov' },
  { name: 'N.D. Georgia', code: 'gand', url: 'https://ecf.gand.uscourts.gov' },
  { name: 'Federal — PACER', code: 'pacer', url: 'https://pacer.uscourts.gov' },
];

export default function DocketMonitor() {
  const [cases, setCases] = useState<WatchedCase[]>(SAMPLE_CASES);
  const [filter, setFilter] = useState<'all' | 'my-case' | 'similar'>('all');
  const [expanded, setExpanded] = useState<string | null>('1');
  const [showAdd, setShowAdd] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const [form, setForm] = useState({
    caseNumber: '', caption: '', court: 'N.D. Mississippi — Oxford',
    type: 'my-case' as 'my-case' | 'similar', notes: '',
  });

  const newAlerts = cases.flatMap(c => c.alerts.filter(a => a.isNew)).length;
  const myCount  = cases.filter(c => c.type === 'my-case').length;
  const watchCount = cases.filter(c => c.type === 'similar').length;

  const filtered = cases.filter(c => filter === 'all' ? true : c.type === filter);

  const dismissAlert = (caseId: string, alertId: string) => {
    setCases(prev => prev.map(c => c.id !== caseId ? c : {
      ...c, alerts: c.alerts.map(a => a.id !== alertId ? a : { ...a, isNew: false }),
    }));
  };

  const refreshCase = (id: string) => {
    setRefreshing(id);
    setTimeout(() => {
      setCases(prev => prev.map(c => c.id !== id ? c : { ...c, lastChecked: new Date().toISOString() }));
      setRefreshing(null);
    }, 1500);
  };

  const addCase = () => {
    if (!form.caseNumber || !form.caption) return;
    const court = COURTS.find(c => c.name === form.court);
    setCases(prev => [...prev, {
      id: Date.now().toString(),
      caseNumber: form.caseNumber,
      caption: form.caption,
      court: form.court,
      type: form.type,
      status: 'active',
      pacerUrl: `${court?.url || ''}/cgi-bin/DktRpt.pl?${form.caseNumber}`,
      lastChecked: new Date().toISOString(),
      alerts: [],
      notes: form.notes,
    }]);
    setForm({ caseNumber: '', caption: '', court: 'N.D. Mississippi — Oxford', type: 'my-case', notes: '' });
    setShowAdd(false);
  };

  const removeCase = (id: string) => setCases(prev => prev.filter(c => c.id !== id));

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
            <Bell className="text-blue-400" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Docket Monitor
              {newAlerts > 0 && (
                <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                  {newAlerts} new
                </span>
              )}
            </h1>
            <p className="text-slate-400 text-xs">Watch your cases AND similar cases for key rulings</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl transition-colors">
          <Plus size={14} /> Watch Case
        </button>
      </div>

      {/* Stats + PACER quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'My Cases', value: myCount, color: 'text-blue-400' },
          { label: 'Watching', value: watchCount, color: 'text-violet-400' },
          { label: 'New Alerts', value: newAlerts, color: 'text-red-400' },
          { label: 'Total Watched', value: cases.length, color: 'text-white' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Case form */}
      {showAdd && (
        <div className="bg-slate-800/60 border border-blue-500/20 rounded-2xl p-5 space-y-3 animate-fade-in">
          <div className="text-sm font-semibold text-white mb-1">Add Case to Watch</div>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={form.caseNumber} onChange={e => setForm(f => ({ ...f, caseNumber: e.target.value }))}
              placeholder="Case number (e.g., 3:26-cv-00142-MPM)"
              className="bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors" />
            <input value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
              placeholder="Caption (e.g., Smith v. City of Oxford)"
              className="bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors" />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <select value={form.court} onChange={e => setForm(f => ({ ...f, court: e.target.value }))}
              className="bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none">
              {COURTS.map(c => <option key={c.code}>{c.name}</option>)}
            </select>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
              className="bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none">
              <option value="my-case">My Case</option>
              <option value="similar">Similar Case (watching)</option>
            </select>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Notes (optional)"
              className="bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors" />
          </div>
          <div className="flex gap-2">
            <button onClick={addCase} disabled={!form.caseNumber || !form.caption}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              Add to Watchlist
            </button>
            <button onClick={() => setShowAdd(false)}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-xl text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* PACER quick links */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { label: 'All', value: 'all' as const },
          { label: 'My Cases', value: 'my-case' as const },
          { label: 'Watching', value: 'similar' as const },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-white'
            }`}>
            {f.label}
          </button>
        ))}
        <div className="flex-1" />
        {COURTS.slice(0, 3).map(c => (
          <a key={c.code} href={c.url} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 bg-slate-800/60 border border-slate-700/40 hover:border-blue-500/30 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap">
            <ExternalLink size={10} /> {c.name.split('—')[0].trim()}
          </a>
        ))}
      </div>

      {/* Case list */}
      <div className="space-y-3">
        {filtered.map(wc => {
          const isOpen = expanded === wc.id;
          const newCount = wc.alerts.filter(a => a.isNew).length;
          return (
            <div key={wc.id} className={`bg-slate-800/60 border rounded-2xl overflow-hidden transition-all ${
              newCount > 0 ? 'border-blue-500/30' : 'border-slate-700/40'
            }`}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    wc.status === 'closed' ? 'bg-slate-600' :
                    wc.type === 'my-case' ? 'bg-blue-400' : 'bg-violet-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-semibold text-sm">{wc.caption}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            wc.type === 'my-case'
                              ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                              : 'text-violet-400 bg-violet-500/10 border-violet-500/20'
                          }`}>
                            {wc.type === 'my-case' ? 'My Case' : 'Watching'}
                          </span>
                          {newCount > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                              {newCount} new
                            </span>
                          )}
                          {wc.status === 'closed' && (
                            <span className="text-[10px] text-slate-500 bg-slate-700/40 border border-slate-600/30 px-2 py-0.5 rounded-full">Closed</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-slate-500 text-xs font-mono">{wc.caseNumber}</span>
                          <span className="text-slate-600 text-xs">·</span>
                          <span className="text-slate-500 text-xs">{wc.court}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-slate-600 text-xs">checked {timeAgo(wc.lastChecked)}</span>
                        <button onClick={() => refreshCase(wc.id)}
                          className={`text-slate-500 hover:text-blue-400 p-1.5 rounded-lg transition-colors ${refreshing === wc.id ? 'animate-spin' : ''}`}>
                          <RefreshCw size={13} />
                        </button>
                        <a href={wc.pacerUrl} target="_blank" rel="noreferrer"
                          className="text-slate-500 hover:text-blue-400 p-1.5 rounded-lg transition-colors">
                          <ExternalLink size={13} />
                        </a>
                        <button onClick={() => removeCase(wc.id)}
                          className="text-slate-600 hover:text-red-400 p-1.5 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                        <button onClick={() => setExpanded(isOpen ? null : wc.id)}
                          className="text-slate-500 hover:text-white p-1.5 rounded-lg transition-colors">
                          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 ml-5 space-y-2 animate-fade-in">
                    {wc.notes && (
                      <p className="text-slate-400 text-xs bg-slate-700/30 rounded-xl p-2.5 border border-slate-600/30">{wc.notes}</p>
                    )}
                    {wc.alerts.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Docket Activity</div>
                        {wc.alerts.map(alert => {
                          const cfg = ALERT_TYPES[alert.type];
                          return (
                            <div key={alert.id}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                                alert.isNew ? `${cfg.bg} ${cfg.border}` : 'bg-slate-700/20 border-slate-700/30 opacity-60'
                              }`}>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                                    {cfg.label}
                                  </span>
                                  <span className="text-slate-500 text-xs font-mono">Doc #{alert.docNumber}</span>
                                  <span className="text-slate-600 text-xs">{new Date(alert.date).toLocaleDateString()}</span>
                                  {alert.isNew && <span className="text-[9px] font-bold text-blue-400 uppercase">NEW</span>}
                                </div>
                                <p className="text-slate-200 text-xs leading-relaxed">{alert.description}</p>
                              </div>
                              {alert.isNew && (
                                <button onClick={() => dismissAlert(wc.id, alert.id)}
                                  className="ml-auto text-slate-600 hover:text-slate-400 flex-shrink-0 transition-colors">
                                  <Eye size={13} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {wc.alerts.length === 0 && (
                      <div className="text-slate-600 text-xs text-center py-4">No docket activity yet</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
