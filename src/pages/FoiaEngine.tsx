import React, { useState, useCallback } from 'react';
import {
  FileSearch, Plus, Send, Clock, CheckCircle, AlertTriangle,
  Download, ChevronDown, ChevronUp, Loader2, Sparkles, X,
  RefreshCw, Building2, Eye, Copy, Archive, Flame
} from 'lucide-react';
import { aiParalegal } from '../lib/api';

type Status = 'drafting' | 'sent' | 'acknowledged' | 'responded' | 'denied' | 'appealed' | 'closed';

interface FoiaRequest {
  id: string;
  agency: string;
  agencyType: 'federal' | 'state' | 'local';
  subject: string;
  requestText: string;
  sentDate: string;
  dueDate: string;
  status: Status;
  trackingNumber: string;
  notes: string;
  appealText?: string;
  caseLink?: string;
}

const STATUS_CFG: Record<Status, { label: string; color: string; bg: string; border: string }> = {
  drafting:     { label: 'Drafting',     color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/30' },
  sent:         { label: 'Sent',         color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30' },
  acknowledged: { label: 'Acknowledged', color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30' },
  responded:    { label: 'Responded',    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  denied:       { label: 'Denied',       color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30' },
  appealed:     { label: 'On Appeal',    color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/30' },
  closed:       { label: 'Closed',       color: 'text-slate-500',   bg: 'bg-slate-800/20',   border: 'border-slate-700/30' },
};

const FEDERAL_AGENCIES = [
  'Department of Justice', 'FBI', 'DEA', 'ATF', 'CBP', 'ICE', 'DHS',
  'Department of Defense', 'CIA (MDR)', 'NSA', 'State Department',
  'Department of Education', 'HHS', 'VA', 'SSA', 'IRS', 'EOUSA',
  'U.S. Marshals Service', 'Bureau of Prisons', 'U.S. Army', 'U.S. Navy',
];

const DENIAL_EXEMPTIONS = [
  { ex: 'Exemption 1', desc: 'Classified national defense/foreign policy info' },
  { ex: 'Exemption 2', desc: 'Internal personnel rules and practices' },
  { ex: 'Exemption 3', desc: 'Prohibited by other statutes' },
  { ex: 'Exemption 4', desc: 'Trade secrets / confidential business info' },
  { ex: 'Exemption 5', desc: 'Deliberative process / attorney-client privilege' },
  { ex: 'Exemption 6', desc: 'Personal privacy (personnel files, medical)' },
  { ex: 'Exemption 7', desc: 'Law enforcement records (7a–7f sub-exemptions)' },
  { ex: 'Exemption 8', desc: 'Financial institution supervision' },
  { ex: 'Exemption 9', desc: 'Geological/geophysical info' },
];

const SAMPLE_REQUESTS: FoiaRequest[] = [
  {
    id: '1', agency: 'Oxford Police Department', agencyType: 'local',
    subject: 'Body Camera Footage — Smith Incident 03/15/2026',
    requestText: 'All body camera footage, dash camera footage, and any other video or audio recordings from the incident on March 15, 2026 involving John Smith (DOB 01/15/1985) at 123 Main Street, Oxford, MS.',
    sentDate: '2026-04-01', dueDate: '2026-05-01',
    status: 'denied', trackingNumber: 'OPD-2026-042', notes: 'Denied under MS Code §25-61-11(2)(e) — active investigation. Need to appeal.',
    caseLink: 'Smith v. City of Oxford',
  },
  {
    id: '2', agency: 'FBI', agencyType: 'federal',
    subject: 'Records re: Use of Force Policy — Joint Task Force Operations',
    requestText: 'All records, policies, training materials, and communications regarding use-of-force protocols for joint task force operations in the Northern District of Mississippi from 2020 to present.',
    sentDate: '2026-03-15', dueDate: '2026-06-15',
    status: 'acknowledged', trackingNumber: 'FBI-2026-03891', notes: 'Complex track — estimated 90 business days.',
  },
];

export default function FoiaEngine() {
  const [requests, setRequests] = useState<FoiaRequest[]>(SAMPLE_REQUESTS);
  const [view, setView] = useState<'list' | 'new' | 'appeal'>('list');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // New request form
  const [form, setForm] = useState({
    agency: '', agencyType: 'local' as 'federal' | 'state' | 'local',
    subject: '', facts: '', requestType: 'Records Request',
    feeWaiver: true, expedited: false, caseLink: '',
  });
  const [generatedText, setGeneratedText] = useState('');

  // Appeal form
  const [appealTarget, setAppealTarget] = useState<FoiaRequest | null>(null);
  const [denialReason, setDenialReason] = useState('');
  const [generatedAppeal, setGeneratedAppeal] = useState('');

  const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

  const generateRequest = async () => {
    if (!form.agency || !form.subject || !form.facts) return;
    setGenerating(true); setGeneratedText('');
    const res = await aiParalegal({
      message: `Generate a professional FOIA/public records request letter.

Agency: ${form.agency} (${form.agencyType})
Request Type: ${form.requestType}
Subject: ${form.subject}
Key Facts: ${form.facts}
Fee Waiver Requested: ${form.feeWaiver}
Expedited Processing: ${form.expedited}
${form.caseLink ? `Related Case: ${form.caseLink}` : ''}

Requirements:
- Cite the correct statute (FOIA 5 U.S.C. § 552 for federal; Mississippi Public Records Act § 25-61-1 et seq. for MS state/local)
- Be specific about records requested with date ranges
- Include fee waiver language citing news media / public interest if applicable
- Include expedited processing request if applicable
- Professional but firm tone
- Include requester's right to appeal and seek judicial review
- Request index of any withheld documents (Vaughn index)
- Set a 20 business-day response deadline (federal) or 7-day (MS state)

Output the full letter text only, ready to send.`,
      context: 'You are a First Amendment attorney and FOIA litigation expert. Draft precise, effective FOIA requests.',
    });
    setGeneratedText(res.response || res.message || '');
    setGenerating(false);
  };

  const generateAppeal = async (req: FoiaRequest) => {
    setAppealTarget(req); setView('appeal'); setGeneratedAppeal('');
    if (!denialReason) return;
    setGenerating(true);
    const res = await aiParalegal({
      message: `Generate a FOIA administrative appeal letter.

Agency: ${req.agency}
Original Request: ${req.subject}
Tracking Number: ${req.trackingNumber}
Denial Reason: ${denialReason}

Draft a compelling appeal that:
1. Challenges each exemption cited with case law (use Reporters Committee, Milner, etc.)
2. Argues segregability — non-exempt portions must be released
3. Requests a Vaughn index for withheld documents
4. Cites agency's burden to prove exemptions apply
5. Preserves right to file suit in federal district court
6. Sets a 20-business-day deadline for appeal response

Include relevant FOIA case law citations. Be aggressive and precise.`,
      context: 'You are a FOIA litigation attorney specializing in First Amendment and government transparency.',
    });
    setGeneratedAppeal(res.response || res.message || '');
    setGenerating(false);
  };

  const saveRequest = () => {
    if (!generatedText || !form.agency) return;
    const newReq: FoiaRequest = {
      id: Date.now().toString(),
      agency: form.agency,
      agencyType: form.agencyType,
      subject: form.subject,
      requestText: generatedText,
      sentDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + (form.agencyType === 'federal' ? 20 : 7) * 86400000 * 1.4).toISOString().split('T')[0],
      status: 'drafting',
      trackingNumber: `REQ-${Date.now().toString().slice(-6)}`,
      notes: '',
      caseLink: form.caseLink,
    };
    setRequests(prev => [newReq, ...prev]);
    setView('list');
    setForm({ agency: '', agencyType: 'local', subject: '', facts: '', requestType: 'Records Request', feeWaiver: true, expedited: false, caseLink: '' });
    setGeneratedText('');
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 2000);
  };

  const downloadText = (text: string, filename: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = filename; a.click();
  };

  const advanceStatus = (id: string) => {
    const order: Status[] = ['drafting','sent','acknowledged','responded','closed'];
    setRequests(prev => prev.map(r => {
      if (r.id !== id) return r;
      const idx = order.indexOf(r.status);
      return { ...r, status: order[Math.min(idx + 1, order.length - 1)] };
    }));
  };

  const pendingCount = requests.filter(r => ['sent','acknowledged'].includes(r.status)).length;
  const deniedCount  = requests.filter(r => r.status === 'denied').length;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-600/20 border border-cyan-500/30 rounded-xl flex items-center justify-center">
            <FileSearch className="text-cyan-400" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">FOIA Request Engine</h1>
            <p className="text-slate-400 text-xs">Generate, track, and appeal government records requests</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {view !== 'list' && (
            <button onClick={() => setView('list')}
              className="text-xs text-slate-400 hover:text-white bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors">
              ← Back
            </button>
          )}
          {view === 'list' && (
            <button onClick={() => setView('new')}
              className="flex items-center gap-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded-xl transition-colors">
              <Plus size={14} /> New Request
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {view === 'list' && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: requests.length, color: 'text-white' },
            { label: 'Pending', value: pendingCount, color: 'text-blue-400' },
            { label: 'Denied', value: deniedCount, color: 'text-red-400' },
            { label: 'Closed', value: requests.filter(r => r.status === 'closed').length, color: 'text-slate-500' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-slate-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ LIST VIEW ═══ */}
      {view === 'list' && (
        <div className="space-y-3">
          {requests.length === 0 && (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-12 text-center">
              <FileSearch size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No FOIA requests yet</p>
              <button onClick={() => setView('new')}
                className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                Generate your first request
              </button>
            </div>
          )}
          {requests.map(req => {
            const cfg = STATUS_CFG[req.status];
            const days = daysUntil(req.dueDate);
            const isOpen = expanded === req.id;
            return (
              <div key={req.id} className={`bg-slate-800/60 border rounded-2xl overflow-hidden transition-all ${cfg.border}`}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${cfg.color.replace('text-','bg-')}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-semibold text-sm">{req.agency}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            {req.caseLink && (
                              <span className="text-[10px] text-slate-500 bg-slate-700/60 px-2 py-0.5 rounded-full">
                                {req.caseLink}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-300 text-xs mt-0.5">{req.subject}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-slate-600 text-xs font-mono">{req.trackingNumber}</span>
                            <span className="text-slate-600 text-xs">Due: {new Date(req.dueDate).toLocaleDateString()}</span>
                            {req.status !== 'closed' && req.status !== 'denied' && (
                              <span className={`text-xs font-medium ${days < 0 ? 'text-red-400' : days < 14 ? 'text-yellow-400' : 'text-slate-500'}`}>
                                {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {req.status === 'denied' && (
                            <button onClick={() => generateAppeal(req)}
                              className="flex items-center gap-1 text-xs font-medium bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 px-2.5 py-1.5 rounded-lg transition-colors">
                              <Flame size={11} /> Appeal
                            </button>
                          )}
                          {req.status !== 'closed' && req.status !== 'denied' && (
                            <button onClick={() => advanceStatus(req.id)}
                              className="text-xs font-medium bg-slate-700/60 hover:bg-slate-700 border border-slate-600/40 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                              <RefreshCw size={11} /> Advance
                            </button>
                          )}
                          <button onClick={() => setExpanded(isOpen ? null : req.id)}
                            className="text-slate-500 hover:text-white p-1.5 rounded-lg transition-colors">
                            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-3 ml-5 space-y-3 animate-fade-in">
                      {req.notes && (
                        <div className="text-xs text-slate-400 bg-slate-700/30 rounded-xl p-3 border border-slate-600/30">
                          {req.notes}
                        </div>
                      )}
                      <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-3 max-h-48 overflow-y-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Request Text</span>
                          <button onClick={() => copy(req.requestText, req.id)}
                            className="text-slate-500 hover:text-white transition-colors">
                            {copied === req.id ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{req.requestText}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ NEW REQUEST VIEW ═══ */}
      {view === 'new' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-1.5">Agency Type</label>
                  <select value={form.agencyType} onChange={e => setForm(f => ({ ...f, agencyType: e.target.value as any }))}
                    className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none">
                    <option value="federal">Federal</option>
                    <option value="state">State</option>
                    <option value="local">Local / Municipal</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-1.5">Request Type</label>
                  <select value={form.requestType} onChange={e => setForm(f => ({ ...f, requestType: e.target.value }))}
                    className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none">
                    <option>Records Request</option>
                    <option>Body Camera Footage</option>
                    <option>Personnel File</option>
                    <option>Internal Affairs Records</option>
                    <option>Use of Force Reports</option>
                    <option>Training Records</option>
                    <option>Policies & Procedures</option>
                    <option>Dispatch Logs</option>
                    <option>Settlement Records</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-1.5">Agency Name</label>
                {form.agencyType === 'federal' ? (
                  <select value={form.agency} onChange={e => setForm(f => ({ ...f, agency: e.target.value }))}
                    className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none">
                    <option value="">Select agency...</option>
                    {FEDERAL_AGENCIES.map(a => <option key={a}>{a}</option>)}
                  </select>
                ) : (
                  <input value={form.agency} onChange={e => setForm(f => ({ ...f, agency: e.target.value }))}
                    placeholder={form.agencyType === 'state' ? 'e.g., Mississippi Highway Patrol' : 'e.g., Oxford Police Department'}
                    className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors" />
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-1.5">Subject / What to request</label>
                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g., Body camera footage — traffic stop on 03/15/2026 at 5:30pm, Hwy 7"
                  className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-1.5">Key Facts</label>
                <textarea value={form.facts} onChange={e => setForm(f => ({ ...f, facts: e.target.value }))} rows={4}
                  placeholder="Date, location, officer names, incident report numbers, client name, what happened..."
                  className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 resize-none transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-1.5">Linked Case (optional)</label>
                <input value={form.caseLink} onChange={e => setForm(f => ({ ...f, caseLink: e.target.value }))}
                  placeholder="e.g., Smith v. City of Oxford"
                  className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.feeWaiver} onChange={e => setForm(f => ({ ...f, feeWaiver: e.target.checked }))}
                    className="rounded border-slate-600" />
                  <span className="text-slate-300 text-xs">Request fee waiver</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.expedited} onChange={e => setForm(f => ({ ...f, expedited: e.target.checked }))}
                    className="rounded border-slate-600" />
                  <span className="text-slate-300 text-xs">Request expedited processing</span>
                </label>
              </div>
              <button onClick={generateRequest}
                disabled={generating || !form.agency || !form.subject || !form.facts}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                {generating
                  ? <><Loader2 className="animate-spin" size={17} /> Generating request...</>
                  : <><Sparkles size={17} /> Generate FOIA Request</>}
              </button>
            </div>

            {/* FOIA Exemptions reference */}
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">FOIA Exemptions Reference</div>
              <div className="space-y-1.5">
                {DENIAL_EXEMPTIONS.map(e => (
                  <div key={e.ex} className="flex gap-2 text-xs">
                    <span className="font-bold text-cyan-400 whitespace-nowrap">{e.ex}</span>
                    <span className="text-slate-500">{e.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            {!generatedText && !generating && (
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-10 text-center">
                <FileSearch size={36} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">AI-generated request will appear here</p>
                <p className="text-slate-600 text-xs mt-1">Cites correct statutes • Fee waiver language • Vaughn index demand</p>
              </div>
            )}
            {generating && (
              <div className="space-y-2">{[...Array(6)].map((_,i) => <div key={i} className="skeleton h-6 rounded-lg" />)}</div>
            )}
            {generatedText && (
              <div className="bg-slate-800/60 border border-cyan-500/20 rounded-2xl overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                  <span className="text-cyan-400 font-semibold text-sm">Generated Request</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copy(generatedText, 'gen')}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-700/60 border border-slate-600/40 px-2.5 py-1.5 rounded-lg transition-colors">
                      {copied === 'gen' ? <CheckCircle size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      {copied === 'gen' ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={() => downloadText(generatedText, `foia-${form.agency.replace(/\s+/g,'-')}.txt`)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-700/60 border border-slate-600/40 px-2.5 py-1.5 rounded-lg transition-colors">
                      <Download size={11} /> Save
                    </button>
                  </div>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  <pre className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans">{generatedText}</pre>
                </div>
                <div className="px-4 py-3 border-t border-slate-700/50">
                  <button onClick={saveRequest}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                    <Archive size={15} /> Save to Tracker
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ APPEAL VIEW ═══ */}
      {view === 'appeal' && appealTarget && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-slate-800/60 border border-red-500/20 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-red-400 font-semibold">
              <Flame size={16} /> Appeal: {appealTarget.agency}
            </div>
            <div className="bg-slate-700/30 rounded-xl p-3 text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Original Request:</strong> {appealTarget.subject}<br/>
              <strong className="text-slate-200">Tracking #:</strong> {appealTarget.trackingNumber}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-1.5">Denial Reason / Exemptions Cited</label>
              <textarea value={denialReason} onChange={e => setDenialReason(e.target.value)} rows={5}
                placeholder="Paste the agency's denial language here, including exemptions cited (e.g., 'Denied under Exemption 7(A) — ongoing investigation')..."
                className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500/60 resize-none transition-colors" />
            </div>
            <button onClick={() => generateAppeal(appealTarget)}
              disabled={generating || !denialReason}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              {generating
                ? <><Loader2 className="animate-spin" size={17} /> Drafting appeal...</>
                : <><Sparkles size={17} /> Generate Appeal Letter</>}
            </button>
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Appeal Strategy</div>
              {['Challenge each exemption with case law', 'Demand Vaughn index for all withheld docs', 'Assert segregability — release non-exempt portions', "Agency bears burden of proving exemption applies", 'Preserve right to federal lawsuit (5 U.S.C. § 552(a)(4)(B))'].map(s => (
                <div key={s} className="flex items-start gap-1.5 text-xs text-slate-400 mb-1">
                  <CheckCircle size={10} className="text-cyan-400 flex-shrink-0 mt-0.5" /> {s}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {!generatedAppeal && !generating && (
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-10 text-center">
                <Flame size={36} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Appeal letter will appear here</p>
              </div>
            )}
            {generating && <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} className="skeleton h-6 rounded-lg" />)}</div>}
            {generatedAppeal && (
              <div className="bg-slate-800/60 border border-red-500/20 rounded-2xl overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                  <span className="text-red-400 font-semibold text-sm">Appeal Letter</span>
                  <div className="flex gap-2">
                    <button onClick={() => copy(generatedAppeal, 'appeal')}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-700/60 border border-slate-600/40 px-2.5 py-1.5 rounded-lg transition-colors">
                      {copied === 'appeal' ? <CheckCircle size={11} className="text-emerald-400" /> : <Copy size={11} />} Copy
                    </button>
                    <button onClick={() => downloadText(generatedAppeal, `foia-appeal-${appealTarget.trackingNumber}.txt`)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-700/60 border border-slate-600/40 px-2.5 py-1.5 rounded-lg transition-colors">
                      <Download size={11} /> Save
                    </button>
                  </div>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  <pre className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans">{generatedAppeal}</pre>
                </div>
                <div className="px-4 py-3 border-t border-slate-700/50">
                  <button onClick={() => {
                    setRequests(prev => prev.map(r => r.id === appealTarget.id ? { ...r, status: 'appealed', appealText: generatedAppeal } : r));
                    setView('list');
                  }} className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                    <Archive size={15} /> Mark as Appealed
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
