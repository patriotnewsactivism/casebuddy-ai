import React, { useState, useMemo } from 'react';
import { Globe, Search, Scale, Clock, FileText, DollarSign, ArrowLeftRight, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface JurisdictionData {
  name: string; abbr: string; type: 'state' | 'federal';
  sol: Record<string, string>; filingFees: Record<string, string>;
  discoveryRules: string[]; deadlines: Record<string, string>; localRules: string[];
}

const JURISDICTIONS: JurisdictionData[] = [
  { name: 'Federal — All Districts', abbr: 'FED', type: 'federal',
    sol: { 'Personal Injury': '2–3 years (varies by underlying state)', 'Civil Rights §1983': '1–3 years (borrows state PI SOL)', 'Contract': 'Varies by state', 'Employment Discrimination': '90 days after EEOC right-to-sue', 'RICO': '4 years' },
    filingFees: { 'Civil Complaint': '$405', 'Appeal': '$605', 'Habeas Corpus': '$5', 'Bankruptcy Ch. 7': '$338', 'Bankruptcy Ch. 13': '$313' },
    discoveryRules: ['FRCP Rule 26: Initial disclosures within 14 days of Rule 26(f) conference', 'FRCP Rule 33: Up to 25 interrogatories', 'FRCP Rule 34: Document requests — 30 days to respond', 'FRCP Rule 30: Depositions limited to 10 per side, 7 hours each', 'FRCP Rule 36: Requests for admission — 30 days to respond', 'FRCP Rule 26(a)(2): Expert disclosures per scheduling order'],
    deadlines: { 'Answer': '21 days (60 if waiver)', 'Motion to Dismiss': 'Before responsive pleading', 'Summary Judgment': 'Per scheduling order (typically 30 days before trial)', 'Discovery': 'Per scheduling order (typically 4-8 months)', 'Pretrial Motions in Limine': '14–21 days before trial' },
    localRules: ['Check individual district local rules at uscourts.gov', 'Meet and confer required before most discovery motions', 'Mandatory mediation in many districts', 'Page limits: briefs typically 25 pages or 6,250 words'] },
  { name: 'Alabama', abbr: 'AL', type: 'state',
    sol: { 'Personal Injury': '2 years', 'Medical Malpractice': '2 years', 'Property Damage': '6 years', 'Contract (Written)': '6 years', 'Contract (Oral)': '6 years', 'Fraud': '2 years' },
    filingFees: { 'Circuit Court Complaint': '$306', 'District Court': '$211', 'Small Claims': '$72' },
    discoveryRules: ['ARCP Rule 26–37 (mirrors FRCP)', '30 interrogatories without leave', 'Depositions: no presumptive limit'],
    deadlines: { 'Answer': '30 days', 'Responsive Pleading': '30 days after service' },
    localRules: ['Mandatory arbitration in some counties for claims under $50,000'] },
  { name: 'Alaska', abbr: 'AK', type: 'state', sol: { 'Personal Injury': '2 years', 'Medical Malpractice': '2 years', 'Property Damage': '6 years', 'Contract': '3 years (oral) / 6 years (written)' }, filingFees: { 'Superior Court': '$250', 'Small Claims': '$75' }, discoveryRules: ['Alaska Civil Rule 26–37'], deadlines: { 'Answer': '20 days' }, localRules: [] },
  { name: 'Arizona', abbr: 'AZ', type: 'state', sol: { 'Personal Injury': '2 years', 'Medical Malpractice': '2 years', 'Property Damage': '2 years', 'Contract (Written)': '6 years', 'Contract (Oral)': '3 years' }, filingFees: { 'Superior Court': '$349', 'Justice Court': '$86' }, discoveryRules: ['ARCP Rule 26.1: Mandatory initial disclosure', '40 interrogatories limit'], deadlines: { 'Answer': '20 days' }, localRules: ['Mandatory initial disclosure system (unique to AZ)'] },
  { name: 'Arkansas', abbr: 'AR', type: 'state', sol: { 'Personal Injury': '3 years', 'Medical Malpractice': '2 years', 'Property Damage': '3 years', 'Contract': '5 years' }, filingFees: { 'Circuit Court': '$165' }, discoveryRules: ['ARCP mirrors FRCP'], deadlines: { 'Answer': '30 days' }, localRules: [] },
  { name: 'California', abbr: 'CA', type: 'state', sol: { 'Personal Injury': '2 years', 'Medical Malpractice': '1 year (3 year max discovery)', 'Property Damage': '3 years', 'Contract (Written)': '4 years', 'Contract (Oral)': '2 years', 'Fraud': '3 years' }, filingFees: { 'Unlimited Civil ($25K+)': '$435', 'Limited Civil': '$225', 'Small Claims': '$75' }, discoveryRules: ['CCP §2030: 35 interrogatories', 'CCP §2025: Depositions — no limit on number', 'CCP §2031: Document demands — 35 without leave', 'CCP §2033: Requests for admission — 35 without leave'], deadlines: { 'Answer': '30 days', 'Demurrer': '30 days after service', 'Anti-SLAPP Motion': '60 days after service' }, localRules: ['Government claims: 6-month claim filing before suit', 'Each county has extensive local rules'] },
  { name: 'Colorado', abbr: 'CO', type: 'state', sol: { 'Personal Injury': '2 years', 'Medical Malpractice': '2 years', 'Property Damage': '2 years', 'Contract': '3 years (oral) / 6 years (written)' }, filingFees: { 'District Court': '$235', 'County Court': '$97' }, discoveryRules: ['CRCP 26–37'], deadlines: { 'Answer': '21 days' }, localRules: [] },
  { name: 'Connecticut', abbr: 'CT', type: 'state', sol: { 'Personal Injury': '2 years', 'Medical Malpractice': '2 years', 'Property Damage': '2 years', 'Contract': '6 years' }, filingFees: { 'Superior Court': '$360' }, discoveryRules: ['CT Practice Book §13-1 through 13-32'], deadlines: { 'Answer': '15 days' }, localRules: [] },
  { name: 'Delaware', abbr: 'DE', type: 'state', sol: { 'Personal Injury': '2 years', 'Medical Malpractice': '2 years', 'Contract': '3 years' }, filingFees: { 'Superior Court': '$250' }, discoveryRules: ['Del. Super. Ct. Civ. R. 26–37'], deadlines: { 'Answer': '20 days' }, localRules: [] },
  { name: 'Florida', abbr: 'FL', type: 'state', sol: { 'Personal Injury': '2 years', 'Medical Malpractice': '2 years', 'Property Damage': '4 years', 'Contract (Written)': '5 years', 'Contract (Oral)': '4 years' }, filingFees: { 'Circuit Court': '$401', 'County Court': '$301', 'Small Claims': '$175' }, discoveryRules: ['Fla. R. Civ. P. 1.340: 30 interrogatories', 'Broad discovery — Florida is a notice-pleading state', 'Expert discovery per Fla. R. Civ. P. 1.390'], deadlines: { 'Answer': '20 days', 'Motion to Dismiss': '20 days' }, localRules: ['Mandatory mediation before trial', 'E-filing required in all courts'] },
  { name: 'Georgia', abbr: 'GA', type: 'state', sol: { 'Personal Injury': '2 years', 'Medical Malpractice': '2 years', 'Property Damage': '4 years', 'Contract (Written)': '6 years', 'Contract (Oral)': '4 years' }, filingFees: { 'Superior Court': '$225–$270' }, discoveryRules: ['O.C.G.A. §9-11-26 through 9-11-37'], deadlines: { 'Answer': '30 days' }, localRules: ['Ante litem notice required for claims against government (O.C.G.A. §36-33-5)'] },
  { name: 'Mississippi', abbr: 'MS', type: 'state', sol: { 'Personal Injury': '3 years', 'Medical Malpractice': '2 years', 'Property Damage': '3 years', 'Contract': '3 years (oral) / 6 years (written)', 'Civil Rights §1983': '3 years (borrows PI SOL)', 'Fraud': '3 years' }, filingFees: { 'Circuit Court': '$250', 'Chancery Court': '$250', 'Justice Court': '$50', 'County Court': '$150' }, discoveryRules: ['MRCP Rule 26: Initial disclosures not required (opt-in)', 'MRCP Rule 33: 30 interrogatories without leave', 'MRCP Rule 30: Depositions — 10 per side without leave', 'MRCP Rule 34: Document requests — 30 days to respond', 'MRCP Rule 36: Requests for admission — 30 days'], deadlines: { 'Answer': '30 days after service', 'Motion to Dismiss': 'Before or with responsive pleading', 'Discovery': 'Per case management order', 'Designation of Experts': 'Per scheduling order' }, localRules: ['Tort Claims Act: 90-day notice for government claims', 'Mandatory case management conferences in circuit court', 'E-filing available in most counties via MEC'] },
  { name: 'New York', abbr: 'NY', type: 'state', sol: { 'Personal Injury': '3 years', 'Medical Malpractice': '2.5 years', 'Property Damage': '3 years', 'Contract': '6 years', 'Fraud': '6 years' }, filingFees: { 'Supreme Court': '$210', 'Civil Court': '$45–$95', 'Small Claims': '$20' }, discoveryRules: ['CPLR 3101: Full disclosure of relevant matter', 'CPLR 3130: Interrogatories (not commonly used in Supreme Court)'], deadlines: { 'Answer': '20 days (30 if served by mail)', 'Note of Issue': 'Per scheduling order' }, localRules: ['Preliminary conference required', 'Mandatory e-filing in most counties'] },
  { name: 'Texas', abbr: 'TX', type: 'state', sol: { 'Personal Injury': '2 years', 'Medical Malpractice': '2 years', 'Property Damage': '2 years', 'Contract (Written)': '4 years', 'Contract (Oral)': '4 years', 'Fraud': '4 years' }, filingFees: { 'District Court': '$300+', 'County Court': '$200+', 'Justice Court': '$54' }, discoveryRules: ['TRCP 190: Discovery control plans (Level 1, 2, 3)', 'Level 1: 6-hour depo limit, 15 interrogatories', 'Level 2: 50 hours total depo, 25 interrogatories', 'TRCP 196: Document requests'], deadlines: { 'Answer': '20 days + Monday', 'Discovery Period': '9–18 months per Level' }, localRules: ['Each county has detailed local rules', 'Mandatory initial disclosures in many counties'] },
];

// Fill remaining states with placeholder data
const ALL_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

const EXISTING_ABBRS = JURISDICTIONS.map(j => j.abbr);
const EXTRA_STATES: JurisdictionData[] = ALL_STATES
  .filter(s => !JURISDICTIONS.find(j => j.name === s))
  .map(s => ({
    name: s, abbr: s.substring(0, 2).toUpperCase(), type: 'state' as const,
    sol: { 'Personal Injury': '2–3 years', 'Medical Malpractice': '2–3 years', 'Contract': '4–6 years', 'Property Damage': '2–6 years' },
    filingFees: { 'General Civil': '$150–$400' },
    discoveryRules: ['State rules of civil procedure (mirrors FRCP with local variations)'],
    deadlines: { 'Answer': '20–30 days' },
    localRules: ['Check state court website for detailed local rules'],
  }));

const ALL_JURISDICTIONS = [...JURISDICTIONS, ...EXTRA_STATES].sort((a, b) => {
  if (a.type === 'federal') return -1;
  if (b.type === 'federal') return 1;
  return a.name.localeCompare(b.name);
});

type Tab = 'overview' | 'deadlines' | 'discovery' | 'fees' | 'sol' | 'local';

export default function JurisdictionEngine() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<JurisdictionData | null>(null);
  const [compareWith, setCompareWith] = useState<JurisdictionData | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [comparing, setComparing] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return ALL_JURISDICTIONS;
    const s = search.toLowerCase();
    return ALL_JURISDICTIONS.filter(j =>
      j.name.toLowerCase().includes(s) || j.abbr.toLowerCase().includes(s)
    );
  }, [search]);

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: Globe },
    { key: 'deadlines', label: 'Deadlines', icon: Clock },
    { key: 'discovery', label: 'Discovery', icon: FileText },
    { key: 'fees', label: 'Filing Fees', icon: DollarSign },
    { key: 'sol', label: 'Statutes of Limitation', icon: Scale },
    { key: 'local', label: 'Local Rules', icon: BookOpen },
  ];

  const renderJurisdictionDetail = (j: JurisdictionData, showCompareBtn = true) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">{j.name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${j.type === 'federal' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            {j.type === 'federal' ? 'Federal' : 'State'}
          </span>
        </div>
        {showCompareBtn && !comparing && (
          <button onClick={() => { setComparing(true); setCompareWith(null); }}
            className="text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <ArrowLeftRight size={14} /> Compare
          </button>
        )}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-3">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-blue-400 text-xs font-semibold mb-2">KEY DEADLINES</div>
            {Object.entries(j.deadlines).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-1 border-b border-slate-600/50 last:border-0">
                <span className="text-slate-400">{k}</span><span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-emerald-400 text-xs font-semibold mb-2">FILING FEES</div>
            {Object.entries(j.filingFees).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-1 border-b border-slate-600/50 last:border-0">
                <span className="text-slate-400">{k}</span><span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-yellow-400 text-xs font-semibold mb-2">STATUTES OF LIMITATION</div>
            {Object.entries(j.sol).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-1 border-b border-slate-600/50 last:border-0">
                <span className="text-slate-400">{k}</span><span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'deadlines' && (
        <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
          {Object.entries(j.deadlines).map(([k, v]) => (
            <div key={k} className="flex items-center gap-3 py-2 border-b border-slate-600/50 last:border-0">
              <Clock size={14} className="text-blue-400 shrink-0" />
              <span className="text-slate-400 text-sm flex-1">{k}</span>
              <span className="text-white text-sm font-medium">{v}</span>
            </div>
          ))}
        </div>
      )}
      {tab === 'discovery' && (
        <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
          {j.discoveryRules.map((r, i) => (
            <div key={i} className="flex items-start gap-2 py-1.5">
              <span className="text-emerald-400 text-sm mt-0.5">•</span>
              <span className="text-slate-300 text-sm">{r}</span>
            </div>
          ))}
        </div>
      )}
      {tab === 'fees' && (
        <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
          {Object.entries(j.filingFees).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2 border-b border-slate-600/50 last:border-0">
              <span className="text-slate-400 text-sm">{k}</span>
              <span className="text-emerald-400 text-sm font-bold">{v}</span>
            </div>
          ))}
        </div>
      )}
      {tab === 'sol' && (
        <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
          {Object.entries(j.sol).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2 border-b border-slate-600/50 last:border-0">
              <span className="text-slate-400 text-sm">{k}</span>
              <span className="text-yellow-400 text-sm font-medium">{v}</span>
            </div>
          ))}
        </div>
      )}
      {tab === 'local' && (
        <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
          {j.localRules.length > 0 ? j.localRules.map((r, i) => (
            <div key={i} className="flex items-start gap-2 py-1.5">
              <BookOpen size={14} className="text-purple-400 shrink-0 mt-0.5" />
              <span className="text-slate-300 text-sm">{r}</span>
            </div>
          )) : <p className="text-slate-500 text-sm italic">Check your local court's website for specific rules.</p>}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="text-blue-400" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white">Multi-Jurisdiction Rules Engine</h1>
          <p className="text-slate-400 text-sm">All 50 states + federal — deadlines, discovery rules, filing fees, SOL</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Jurisdiction List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search jurisdiction..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-h-[60vh] overflow-y-auto">
            {filtered.map(j => (
              <button key={j.abbr + j.name} onClick={() => { setSelected(j); if (comparing && !compareWith) setCompareWith(j); }}
                className={`w-full text-left px-4 py-2.5 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors flex items-center gap-3 ${
                  selected?.name === j.name ? 'bg-blue-600/20 border-l-2 border-l-blue-500' : ''
                } ${compareWith?.name === j.name ? 'bg-emerald-600/20 border-l-2 border-l-emerald-500' : ''}`}>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${j.type === 'federal' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                  {j.abbr}
                </span>
                <span className="text-white text-sm">{j.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          {comparing && !compareWith && selected && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4 text-yellow-400 text-sm">
              👆 Select a second jurisdiction from the list to compare with {selected.name}
              <button onClick={() => setComparing(false)} className="ml-3 text-slate-400 hover:text-white text-xs">[Cancel]</button>
            </div>
          )}

          {!selected ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
              <Globe className="mx-auto text-slate-600 mb-3" size={48} />
              <p className="text-slate-500">Select a jurisdiction to view rules</p>
            </div>
          ) : comparing && compareWith ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-4">
                {renderJurisdictionDetail(selected, false)}
              </div>
              <div className="bg-slate-800 border border-emerald-500/30 rounded-xl p-4">
                {renderJurisdictionDetail(compareWith, false)}
              </div>
              <div className="md:col-span-2 text-center">
                <button onClick={() => { setComparing(false); setCompareWith(null); }}
                  className="text-sm text-slate-400 hover:text-white">Exit comparison</button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              {renderJurisdictionDetail(selected)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
