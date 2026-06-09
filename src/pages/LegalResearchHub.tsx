import React, { useState, useMemo } from 'react';
import { BookOpen, Loader2, Globe, Search, ArrowLeftRight, Scale, ChevronRight, Download, Sparkles, TrendingUp } from 'lucide-react';
import { analyzeDocument } from '../lib/api';

type Tab = 'research' | 'jurisdiction';
type JurTab = 'overview' | 'deadlines' | 'discovery' | 'fees' | 'sol' | 'local';

interface JurisdictionData {
  state: string; abbr: string; overview: string; discovery: string;
  fees: string; sol: string; localRules: string; deadlines: string;
}

const JURISDICTIONS: JurisdictionData[] = [
  { state: 'Mississippi', abbr: 'MS', overview: 'Mississippi Rules of Civil Procedure govern state court actions. Circuit courts have general jurisdiction. Chancery courts handle equity matters, including injunctions and trusts.', discovery: 'MRCP Rules 26–37. Initial disclosures required. 30 interrogatories limit. Depositions: 10 per side. Supplementation required.', fees: 'Circuit Court filing: ~$250. Chancery: ~$200. Service: ~$75–100. Certified copies: $1/page.', sol: 'PI: 3 years. Med Mal: 2 years (7-year repose). Contract: 3–6 years. §1983: 3 years. MTCA: 1 year + notice.', localRules: "Each circuit has local rules. Northern District follows 5th Circuit. Check individual judge's preferences. Oxford: strict local rules.", deadlines: 'Answer: 30 days. Discovery: per scheduling order. Motions: 10 days before hearing. Pre-trial: 14 days out.' },
  { state: 'Texas', abbr: 'TX', overview: 'Texas Rules of Civil Procedure. District courts have general jurisdiction over $500. County courts handle smaller civil matters. Justice courts for claims under $20K.', discovery: 'TRCP Rules 190–215. Level 1/2/3 discovery plans. 25 interrogatories. 6-hour deposition limit. Expert designations required.', fees: 'District Court: ~$300–400. County: ~$200. E-filing required statewide. Service of process: ~$75.', sol: 'PI: 2 years. Med Mal: 2 years (10-year repose). Contract: 4 years. Fraud: 4 years. DTPA: 2 years.', localRules: "Each district has local rules. Dallas County: e-service required. Check judge's standing orders on page limits.", deadlines: 'Answer: Monday after 20 days from service. Discovery: per scheduling order. MSJ: 21 days before hearing.' },
  { state: 'California', abbr: 'CA', overview: 'California Code of Civil Procedure. Superior Courts have general jurisdiction. Unlimited civil ($25K+) vs. limited civil. Small claims up to $12,500.', discovery: 'CCP §2016–2036. 35 specially prepared interrogatories. Form interrogatories available. Depositions: 7 hours max. 35 RFAs.', fees: 'Unlimited civil filing: ~$435. Limited civil: ~$225. Complex designation: additional $1,000+. Pro hac: $500.', sol: 'PI: 2 years. Med Mal: 1 year (3-year repose). Written contract: 4 years. Oral: 2 years. Fraud: 3 years.', localRules: 'Each county has extensive local rules. LA County especially complex. Dept. assignment matters. Check tentative rulings.', deadlines: 'Answer: 30 days. Demurrer: 30 days. Discovery motions: 45 days after service. MSJ: 75 days before trial.' },
  { state: 'Florida', abbr: 'FL', overview: 'Florida Rules of Civil Procedure. Circuit Courts have general jurisdiction ($30K+). County courts for $30K and under. Small claims up to $8,000.', discovery: 'Fla. R. Civ. P. 1.280–1.390. 30 interrogatories. Expert witness disclosure required. Apex doctrine for executives.', fees: 'Circuit filing: ~$400. County: ~$300. Re-opening fee: ~$50. Service by sheriff: ~$40.', sol: 'PI: 2 years (changed 2023). Med Mal: 2 years. Written contract: 5 years. Oral: 4 years. Fraud: 4 years.', localRules: 'Each circuit has administrative orders. Miami-Dade especially complex. Broward has strict motion practice rules.', deadlines: 'Answer: 20 days. Discovery: per CMO. Daubert motions: 60 days before trial. Pre-trial: 30 days out.' },
  { state: 'New York', abbr: 'NY', overview: 'CPLR governs. Supreme Court has general jurisdiction. Civil Court for NYC claims under $25K. Commercial Division for complex business disputes.', discovery: 'CPLR Article 31. Unlimited interrogatories (court may limit). IMEs available. Preliminary conference order governs timeline.', fees: 'Supreme Court RJI: ~$210. Index number: ~$210. Note of Issue: ~$30. Commercial Division: additional fees.', sol: 'PI: 3 years. Med Mal: 2.5 years. Contract: 6 years. Fraud: 6 years or 2 from discovery. NYCHRL: 3 years.', localRules: 'Individual Part Rules vary enormously by judge. Commercial Division has special rules. Check justice\'s published preferences.', deadlines: 'Answer: 20–30 days. Note of Issue: per scheduling order. CPLR 3212 MSJ: 120 days from filing.' },
  { state: 'Georgia', abbr: 'GA', overview: 'Georgia Civil Practice Act (O.C.G.A. Title 9). Superior Courts have general jurisdiction. State Courts for lesser civil claims. Magistrate Courts for small claims.', discovery: 'O.C.G.A. §9-11-26 to 37. 50 interrogatories. Depositions: reasonable limits. Expert witness affidavit required in med mal.', fees: 'Superior Court: ~$200–300. State Court: ~$200. Service: ~$50 sheriff + $25 process server.', sol: 'PI: 2 years. Med Mal: 2 years (5-year repose). Written contract: 6 years. Oral: 4 years. Fraud: 4 years.', localRules: 'Uniform Superior Court Rules. Each circuit may have local amendments. Cherokee Circuit: strict scheduling rules.', deadlines: 'Answer: 30 days. Discovery: per scheduling order. MSJ: 30 days before hearing.' },
  { state: 'Alabama', abbr: 'AL', overview: 'Alabama Rules of Civil Procedure. Circuit Courts have general jurisdiction. District Courts for lesser claims under $20K. Small claims up to $6,000.', discovery: 'ARCP Rules 26–37. 40 interrogatories without leave. Similar to federal rules. Expert testimony: Daubert standard adopted.', fees: 'Circuit Court: ~$300. District Court: ~$200. Service by sheriff: ~$25–50. Certified copies: $1/page.', sol: 'PI: 2 years. Med Mal: 2 years (4-year repose). Contract: 6 years. Property: 6 years. Fraud: 2 years.', localRules: "Each circuit has local rules. Jefferson County: complex local rules. Check judge's courtroom procedures.", deadlines: 'Answer: 30 days from service. Motions: per court schedule. Pre-trial: 21 days before trial.' },
  { state: 'Federal', abbr: 'US', overview: 'Federal Rules of Civil Procedure. Article III courts. Diversity jurisdiction: $75K+. Federal question jurisdiction. Supplemental jurisdiction over state claims.', discovery: 'FRCP Rules 26–37. Initial disclosures: 14 days after Rule 26(f) conference. 25 interrogatories. 10 depositions. ESI protocols.', fees: 'Filing fee: $405. Appeal: $505. IFP available for indigent parties. Pro hac vice: varies by district.', sol: 'Borrows state SOL for §1983. Federal claims vary by statute. FTCA: 2 years. Title VII: 180/300 days (EEOC first).', localRules: 'Each district has local rules. Individual judge practices critical. CM/ECF required. Page limits strictly enforced.', deadlines: 'Answer: 21 days (60 if waiver). Rule 26(f): 21 days before scheduling conference. Discovery: per Rule 16 scheduling order.' },
];

const AREAS = [
  'Civil Rights', 'Police Misconduct', 'First Amendment', 'Constitutional Law',
  'Tort Law', 'Contract Law', 'Criminal Law', 'Employment Law',
  'Personal Injury', 'Family Law', 'Evidence', 'Procedure',
];

const JUR_TABS: { id: JurTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'deadlines', label: 'Deadlines' },
  { id: 'discovery', label: 'Discovery' },
  { id: 'fees', label: 'Filing Fees' },
  { id: 'sol', label: 'SOL' },
  { id: 'local', label: 'Local Rules' },
];

export default function LegalResearchHub() {
  const [tab, setTab] = useState<Tab>('research');

  // Research state
  const [question, setQuestion] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Federal');
  const [area, setArea] = useState('Civil Rights');
  const [facts, setFacts] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Jurisdiction state
  const [selectedState, setSelectedState] = useState('Mississippi');
  const [compareState, setCompareState] = useState('');
  const [activeJurTab, setActiveJurTab] = useState<JurTab>('overview');

  const jurisdictionNames = ['Federal', ...JURISDICTIONS.filter(j => j.state !== 'Federal').map(j => j.state)];

  const research = async () => {
    if (!question.trim()) return;
    setLoading(true); setResult(null);
    const prompt = `You are a senior partner at a top law firm conducting legal research for a client.

RESEARCH QUESTION: ${question}
JURISDICTION: ${jurisdiction}
AREA OF LAW: ${area}
${facts ? `CASE FACTS:\n${facts}` : ''}

Respond ONLY with valid JSON — no markdown, no preamble:
{
  "research_summary": "2-3 paragraph comprehensive analysis",
  "key_cases": [{"name": "Case Name", "citation": "123 F.3d 456", "holding": "what the case held", "relevance": "why relevant to our facts"}],
  "applicable_statutes": [{"statute": "42 U.S.C. § 1983", "text": "key statutory text", "application": "how it applies"}],
  "strength_assessment": {"plaintiff": 7, "defense": 5, "reasoning": "why"},
  "recommended_strategy": "what to do next strategically",
  "potential_motions": ["Motion to Dismiss under Rule 12(b)(6)", "Motion for Summary Judgment"],
  "key_issues": ["Issue one", "Issue two"],
  "risks": ["Risk one", "Risk two"]
}`;
    const res = await analyzeDocument({ text: prompt, document_type: 'Legal Research', case_summary: facts });
    if (res.analysis) {
      try {
        const raw = typeof res.analysis === 'string' ? res.analysis : JSON.stringify(res.analysis);
        const match = raw.match(/\{[\s\S]*\}/);
        setResult(match ? JSON.parse(match[0]) : res.analysis);
      } catch { setResult(res.analysis); }
    }
    setLoading(false);
  };

  const downloadResult = () => {
    if (!result) return;
    const lines = [
      `LEGAL RESEARCH — ${new Date().toLocaleDateString()}`,
      `Question: ${question}`,
      `Jurisdiction: ${jurisdiction} | Area: ${area}`, '',
      'SUMMARY', result.research_summary || '', '',
      'KEY CASES',
      ...(result.key_cases?.map((c: any) => `• ${c.name} (${c.citation})\n  ${c.holding}`) || []), '',
      'STATUTES',
      ...(result.applicable_statutes?.map((s: any) => `• ${s.statute}: ${s.text}`) || []), '',
      'STRATEGY', result.recommended_strategy || '', '',
      'MOTIONS', ...(result.potential_motions?.map((m: string) => `• ${m}`) || []),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'research.txt'; a.click();
  };

  const stateData = useMemo(() => JURISDICTIONS.find(j => j.state === selectedState), [selectedState]);
  const compareData = useMemo(() => compareState ? JURISDICTIONS.find(j => j.state === compareState) : null, [compareState]);

  const getJurTabValue = (data: JurisdictionData) => {
    const map: Record<JurTab, string> = {
      overview: data.overview, deadlines: data.deadlines, discovery: data.discovery,
      fees: data.fees, sol: data.sol, local: data.localRules,
    };
    return map[activeJurTab];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-1">
        {[
          { id: 'research' as Tab, label: 'AI Legal Research', icon: Sparkles },
          { id: 'jurisdiction' as Tab, label: 'Jurisdiction Guide', icon: Globe },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
            }`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* ═══ RESEARCH TAB ═══ */}
      {tab === 'research' && (
        <div className="grid lg:grid-cols-5 gap-5">
          {/* Input */}
          <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wide">Research Question</label>
              <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3}
                placeholder="What is the standard for excessive force under the Fourth Amendment in the 5th Circuit?"
                className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 resize-none transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wide">Jurisdiction</label>
                <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)}
                  className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none transition-colors">
                  {['Federal', '5th Circuit', '11th Circuit', ...JURISDICTIONS.filter(j => j.state !== 'Federal').map(j => j.state)].map(j =>
                    <option key={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wide">Area of Law</label>
                <select value={area} onChange={e => setArea(e.target.value)}
                  className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none transition-colors">
                  {AREAS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wide">Case Facts (optional)</label>
              <textarea value={facts} onChange={e => setFacts(e.target.value)} rows={4}
                placeholder="Brief description of your facts to tailor the research..."
                className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 resize-none transition-colors" />
            </div>
            <button onClick={research} disabled={loading || !question.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              {loading
                ? <><Loader2 className="animate-spin" size={17} /> Researching...</>
                : <><Search size={17} /> Research</>}
            </button>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {loading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
              </div>
            )}

            {!result && !loading && (
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-10 text-center">
                <BookOpen size={36} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Ask any legal research question</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    'Qualified immunity analysis',
                    'Monell liability elements',
                    '§1983 claim requirements',
                    'Excessive force standard',
                  ].map(q => (
                    <button key={q} onClick={() => setQuestion(q)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 border border-indigo-500/20 hover:border-indigo-500/40 px-3 py-2 rounded-lg text-left transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-end">
                  <button onClick={downloadResult}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg transition-colors">
                    <Download size={12} /> Export Research
                  </button>
                </div>

                {/* Strength assessment */}
                {result.strength_assessment && (
                  <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Case Strength</div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {[
                        { label: 'Plaintiff', value: result.strength_assessment.plaintiff, color: '#3b82f6' },
                        { label: 'Defense', value: result.strength_assessment.defense, color: '#f59e0b' },
                      ].map(({ label, value, color }) => (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-400 text-xs">{label}</span>
                            <span className="text-white font-bold text-sm">{value}/10</span>
                          </div>
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${value * 10}%`, background: color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    {result.strength_assessment.reasoning && (
                      <p className="text-slate-400 text-xs leading-relaxed">{result.strength_assessment.reasoning}</p>
                    )}
                  </div>
                )}

                {/* Summary */}
                {result.research_summary && (
                  <div className="bg-slate-800/60 border border-indigo-500/20 rounded-2xl p-4">
                    <div className="text-indigo-400 font-semibold text-sm mb-2 flex items-center gap-2">
                      <Sparkles size={14} /> Research Summary
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{result.research_summary}</p>
                  </div>
                )}

                {/* Key cases */}
                {result.key_cases?.length > 0 && (
                  <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
                    <div className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                      <Scale size={14} className="text-blue-400" /> Key Cases ({result.key_cases.length})
                    </div>
                    <div className="space-y-3">
                      {result.key_cases.map((c: any, i: number) => (
                        <div key={i} className="border border-slate-700/40 rounded-xl p-3">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-blue-400 font-medium text-sm">{c.name}</span>
                            <span className="text-slate-500 text-xs font-mono whitespace-nowrap">{c.citation}</span>
                          </div>
                          <p className="text-slate-300 text-xs leading-relaxed mb-1">{c.holding}</p>
                          <p className="text-slate-500 text-xs italic">{c.relevance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statutes */}
                {result.applicable_statutes?.length > 0 && (
                  <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
                    <div className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                      <BookOpen size={14} className="text-emerald-400" /> Applicable Statutes
                    </div>
                    <div className="space-y-3">
                      {result.applicable_statutes.map((s: any, i: number) => (
                        <div key={i} className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-3">
                          <div className="text-emerald-400 font-medium text-sm mb-1">{s.statute}</div>
                          {s.text && <p className="text-slate-300 text-xs italic mb-1">"{s.text}"</p>}
                          {s.application && <p className="text-slate-400 text-xs">{s.application}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategy + motions */}
                <div className="grid grid-cols-2 gap-3">
                  {result.recommended_strategy && (
                    <div className="bg-slate-800/60 border border-violet-500/20 rounded-2xl p-4">
                      <div className="text-violet-400 font-semibold text-xs uppercase tracking-wide mb-2">Strategy</div>
                      <p className="text-slate-300 text-xs leading-relaxed">{result.recommended_strategy}</p>
                    </div>
                  )}
                  {result.potential_motions?.length > 0 && (
                    <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
                      <div className="text-white font-semibold text-xs uppercase tracking-wide mb-2">Motions to Consider</div>
                      <ul className="space-y-1.5">
                        {result.potential_motions.map((m: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                            <ChevronRight size={11} className="text-blue-400 flex-shrink-0 mt-0.5" /> {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {result.key_issues?.length > 0 && (
                  <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
                    <div className="text-white font-semibold text-xs uppercase tracking-wide mb-2">Key Legal Issues</div>
                    <div className="flex flex-wrap gap-2">
                      {result.key_issues.map((issue: string, i: number) => (
                        <span key={i} className="text-xs bg-slate-700/60 border border-slate-600/50 text-slate-300 px-2.5 py-1 rounded-full">
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ JURISDICTION TAB ═══ */}
      {tab === 'jurisdiction' && (
        <div className="space-y-5">
          {/* State selectors */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex-1">
              <label className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wide">Primary Jurisdiction</label>
              <select value={selectedState} onChange={e => setSelectedState(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none">
                {JURISDICTIONS.map(j => <option key={j.state}>{j.state}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 mt-5 sm:mt-0">
              <ArrowLeftRight size={16} className="text-slate-500" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wide">Compare with (optional)</label>
              <select value={compareState} onChange={e => setCompareState(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none">
                <option value="">Select to compare...</option>
                {JURISDICTIONS.filter(j => j.state !== selectedState).map(j =>
                  <option key={j.state}>{j.state}</option>)}
              </select>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-1 overflow-x-auto bg-slate-800/40 border border-slate-700/40 rounded-xl p-1">
            {JUR_TABS.map(t => (
              <button key={t.id} onClick={() => setActiveJurTab(t.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeJurTab === t.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className={`grid gap-4 ${compareData ? 'md:grid-cols-2' : ''}`}>
            {[stateData, ...(compareData ? [compareData] : [])].filter(Boolean).map((data, idx) => (
              <div key={idx} className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-5 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                    <Globe size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white font-bold">{data!.state}</div>
                    <div className="text-slate-500 text-xs">{data!.abbr}</div>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{getJurTabValue(data!)}</p>
              </div>
            ))}
          </div>

          {/* Quick reference grid */}
          {!compareData && stateData && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {JUR_TABS.filter(t => t.id !== activeJurTab && t.id !== 'overview').map(t => (
                <button key={t.id} onClick={() => setActiveJurTab(t.id)}
                  className="bg-slate-800/40 border border-slate-700/40 hover:border-slate-600 rounded-xl p-3 text-left transition-all card-hover">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{t.label}</div>
                  <p className="text-slate-500 text-xs line-clamp-2">{getJurTabValue(stateData)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
