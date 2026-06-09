import React, { useState } from 'react';
import {
  Shield, Search, AlertTriangle, CheckCircle, Plus, X,
  Loader2, Download, User, Building2, Scale, Gavel, Sparkles
} from 'lucide-react';
import { analyzeDocument } from '../lib/api';

interface Party { id: string; name: string; role: string; aliases: string; }
interface ConflictResult {
  severity: 'high' | 'medium' | 'low' | 'clear';
  party: string; matchedCase: string; details: string; rule: string;
}

const ROLES = ['Client', 'Opposing Party', 'Witness', 'Co-Defendant', 'Third Party', 'Judge', 'Attorney', 'Entity'];
const CASE_TYPES = ['Civil Rights', 'Personal Injury', 'Criminal Defense', 'Family Law', 'Corporate', 'Real Estate', 'Employment', 'Bankruptcy', 'Immigration', 'Other'];
const JURISDICTIONS = ['Federal', 'Alabama', 'California', 'Florida', 'Georgia', 'Mississippi', 'New York', 'Texas'];

const SEVERITY = {
  high:   { label: 'High Risk',   bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-400',     icon: AlertTriangle },
  medium: { label: 'Medium Risk', bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30',  text: 'text-yellow-400',  icon: AlertTriangle },
  low:    { label: 'Low Risk',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    text: 'text-blue-400',    icon: AlertTriangle },
  clear:  { label: 'No Conflict', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: CheckCircle  },
};

const ABA_RULES = [
  { rule: 'Rule 1.7', desc: 'Current client conflicts — directly adverse or material limitation' },
  { rule: 'Rule 1.8', desc: 'Specific prohibited transactions with current clients' },
  { rule: 'Rule 1.9', desc: 'Former client conflicts — same or substantially related matters' },
  { rule: 'Rule 1.10', desc: 'Imputed disqualification within a firm' },
  { rule: 'Rule 1.11', desc: 'Government attorney conflicts — revolving door' },
];

export default function ConflictChecker() {
  const [parties, setParties] = useState<Party[]>([
    { id: '1', name: '', role: 'Client', aliases: '' },
  ]);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<ConflictResult[] | null>(null);
  const [caseType, setCaseType] = useState('Civil Rights');
  const [jurisdiction, setJurisdiction] = useState('Federal');
  const [summary, setSummary] = useState('');

  const addParty = () =>
    setParties(prev => [...prev, { id: Math.random().toString(36).slice(2), name: '', role: 'Opposing Party', aliases: '' }]);
  const removeParty = (id: string) => setParties(prev => prev.filter(p => p.id !== id));
  const updateParty = (id: string, field: keyof Party, value: string) =>
    setParties(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

  const checkConflicts = async () => {
    if (parties.every(p => !p.name.trim())) return;
    setChecking(true); setResults(null); setSummary('');
    const prompt = `You are a legal ethics expert checking for conflicts of interest.

Case Type: ${caseType}
Jurisdiction: ${jurisdiction}

Parties:
${parties.filter(p => p.name.trim()).map(p =>
  `- ${p.name} (${p.role})${p.aliases ? ` / AKA: ${p.aliases}` : ''}`
).join('\n')}

Check ABA Model Rules 1.7, 1.8, 1.9, 1.10, 1.11.

Respond ONLY valid JSON — no markdown:
{
  "summary": "2-sentence plain-English conclusion",
  "conflicts": [
    {
      "severity": "high|medium|low|clear",
      "party": "party name",
      "matchedCase": "short conflict description",
      "details": "full explanation",
      "rule": "ABA Rule X.X"
    }
  ]
}

If no conflicts: one object with severity "clear".`;

    try {
      const res = await analyzeDocument({ text: prompt, document_type: 'Conflict Check', case_summary: `${caseType} in ${jurisdiction}` });
      if (res.analysis) {
        const raw = typeof res.analysis === 'string' ? res.analysis : JSON.stringify(res.analysis);
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          setSummary(parsed.summary || '');
          setResults(Array.isArray(parsed.conflicts) ? parsed.conflicts : [parsed]);
        } else {
          setResults([{ severity: 'low', party: 'All Parties', matchedCase: 'Manual review needed', details: String(res.analysis), rule: 'N/A' }]);
        }
      }
    } catch {
      setResults([{ severity: 'low', party: 'System', matchedCase: 'Analysis error', details: 'Unable to complete AI analysis. Please verify manually.', rule: 'N/A' }]);
    }
    setChecking(false);
  };

  const generateWaiver = () => {
    const flagged = results?.filter(r => r.severity !== 'clear') || [];
    const text = `CONFLICT OF INTEREST WAIVER
Date: ${new Date().toLocaleDateString()}
Case Type: ${caseType} | Jurisdiction: ${jurisdiction}

PARTIES INVOLVED:
${parties.filter(p => p.name.trim()).map(p => `  ${p.role}: ${p.name}${p.aliases ? ` (${p.aliases})` : ''}`).join('\n')}

IDENTIFIED POTENTIAL CONFLICTS:
${flagged.length ? flagged.map(c => `  • ${c.party}: ${c.details} [${c.rule}]`).join('\n') : '  None identified.'}

DISCLOSURE AND WAIVER:
I, _________________________, have been fully informed of the potential conflicts
of interest identified above. I understand the nature of each conflict and the
potential risks to my representation. After full disclosure and having had the
opportunity to seek independent legal counsel, I voluntarily waive any conflict
and consent to continued representation by this firm.

Client Signature: _________________________ Date: ___________
Printed Name: _________________________

Attorney Signature: _________________________ Date: ___________`;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'conflict-waiver.txt'; a.click();
  };

  const allClear = results?.every(r => r.severity === 'clear');
  const hasHigh   = results?.some(r => r.severity === 'high');
  const hasMed    = results?.some(r => r.severity === 'medium');

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-1.5">Case Type</label>
                <select value={caseType} onChange={e => setCaseType(e.target.value)}
                  className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60 transition-colors">
                  {CASE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-1.5">Jurisdiction</label>
                <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)}
                  className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60 transition-colors">
                  {JURISDICTIONS.map(j => <option key={j}>{j}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Parties</label>
                <button onClick={addParty}
                  className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 px-2 py-1 rounded-lg transition-all">
                  <Plus size={11} /> Add Party
                </button>
              </div>
              <div className="space-y-2.5">
                {parties.map((p, idx) => (
                  <div key={p.id} className="bg-slate-700/40 border border-slate-600/40 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-amber-600/30 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-amber-400">{idx + 1}</span>
                      </div>
                      <input value={p.name} onChange={e => updateParty(p.id, 'name', e.target.value)}
                        placeholder="Full name or entity"
                        className="flex-1 bg-slate-700/60 border border-slate-600/40 rounded-lg px-2.5 py-1.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors" />
                      {parties.length > 1 && (
                        <button onClick={() => removeParty(p.id)} className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
                          <X size={13} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={p.role} onChange={e => updateParty(p.id, 'role', e.target.value)}
                        className="bg-slate-700/60 border border-slate-600/40 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none">
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                      </select>
                      <input value={p.aliases} onChange={e => updateParty(p.id, 'aliases', e.target.value)}
                        placeholder="AKA / aliases"
                        className="bg-slate-700/60 border border-slate-600/40 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={checkConflicts}
              disabled={checking || parties.every(p => !p.name.trim())}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              {checking
                ? <><Loader2 className="animate-spin" size={17} /> Checking conflicts...</>
                : <><Sparkles size={17} /> Run Conflict Check</>}
            </button>
          </div>

          {/* ABA Rules reference */}
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Scale size={11} /> ABA Rules Checked
            </div>
            <div className="space-y-2">
              {ABA_RULES.map(r => (
                <div key={r.rule} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-amber-400 whitespace-nowrap mt-0.5">{r.rule}</span>
                  <span className="text-xs text-slate-500 leading-relaxed">{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Status header */}
          {results && !checking && (
            <div className={`rounded-2xl p-4 border flex items-start gap-3 animate-fade-in ${
              allClear
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : hasHigh
                ? 'bg-red-500/10 border-red-500/30'
                : hasMed
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
            }`}>
              {allClear
                ? <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                : <AlertTriangle size={20} className={`flex-shrink-0 mt-0.5 ${hasHigh ? 'text-red-400' : 'text-yellow-400'}`} />
              }
              <div>
                <div className={`font-bold text-sm ${allClear ? 'text-emerald-400' : hasHigh ? 'text-red-400' : hasMed ? 'text-yellow-400' : 'text-blue-400'}`}>
                  {allClear ? 'No conflicts detected' : hasHigh ? 'High-risk conflicts found' : hasMed ? 'Potential conflicts identified' : 'Review recommended'}
                </div>
                {summary && <p className="text-slate-300 text-xs mt-1 leading-relaxed">{summary}</p>}
              </div>
              {!allClear && (
                <button onClick={generateWaiver}
                  className="ml-auto flex items-center gap-1.5 text-xs font-medium bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
                  <Download size={11} /> Waiver
                </button>
              )}
            </div>
          )}

          {/* Conflict cards */}
          {checking && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
            </div>
          )}

          {results && !checking && (
            <div className="space-y-3">
              {results.map((r, i) => {
                const cfg = SEVERITY[r.severity] || SEVERITY.clear;
                const Icon = cfg.icon;
                return (
                  <div key={i} className={`rounded-2xl border p-4 animate-fade-in ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg} border ${cfg.border}`}>
                        <Icon size={15} className={cfg.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-white font-semibold text-sm">{r.party}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{r.rule}</span>
                        </div>
                        <p className="text-white text-sm font-medium mb-1">{r.matchedCase}</p>
                        <p className="text-slate-400 text-xs leading-relaxed">{r.details}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!results && !checking && (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-10 text-center">
              <Shield size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-white font-medium mb-2">Add parties and run the conflict check</p>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                AI will cross-reference all parties against ABA ethical rules and flag any
                potential disqualification issues.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 max-w-xs mx-auto">
                {[
                  { icon: User, label: 'Current clients' },
                  { icon: User, label: 'Former clients' },
                  { icon: Building2, label: 'Adverse parties' },
                  { icon: Gavel, label: 'Government rules' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2">
                    <Icon size={11} className="text-amber-400" /> {label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
