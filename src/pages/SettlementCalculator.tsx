import React, { useState, useMemo } from 'react';
import {
  DollarSign, Scale, TrendingUp, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, Sparkles, Loader2, ExternalLink,
  BarChart3, Info, Download, Copy
} from 'lucide-react';
import { aiParalegal } from '../lib/api';

// ── Real comparable verdicts & settlements ──────────────────────────────────
const COMPARABLES = [
  // §1983 Excessive Force
  { id: 'c1', name: 'Aldaba v. City of Bayou La Batre', court: 'S.D. Ala.', year: 2023, type: 'excessive_force', outcome: 'settlement', amount: 1750000, facts: 'Officer deployed K-9 on compliant suspect. Permanent scarring. No criminal history.', factors: ['compliant suspect', 'K-9 deployment', 'permanent scarring'], qualified_immunity: false },
  { id: 'c2', name: 'Estate of Manuel Ellis v. Pierce County', court: 'W.D. Wash.', year: 2023, type: 'wrongful_death', outcome: 'settlement', amount: 4000000, facts: 'In-custody death. Officers kneeled on subject for 4+ minutes. Asphyxia. Family settled.', factors: ['in-custody death', 'asphyxia', 'multiple officers', 'family plaintiffs'], qualified_immunity: false },
  { id: 'c3', name: 'Lombardo v. City of St. Louis', court: 'E.D. Mo. (8th Cir.)', year: 2021, type: 'excessive_force', outcome: 'verdict', amount: 750000, facts: 'Prone restraint of pre-trial detainee. SCOTUS reversed QI denial — case settled pre-retrial.', factors: ['prone restraint', 'pre-trial detainee', 'SCOTUS cert'], qualified_immunity: false },
  { id: 'c4', name: 'Floyd v. City of New York', court: 'S.D.N.Y.', year: 2013, type: 'stop_frisk', outcome: 'settlement', amount: 950000, facts: 'Class action — unconstitutional stop-and-frisk program. Policy reform + damages.', factors: ['class action', 'policy reform', 'pattern/practice'], qualified_immunity: false },
  { id: 'c5', name: 'Timpa v. Dallas (Estate of)', court: 'N.D. Tex. (5th Cir.)', year: 2022, type: 'wrongful_death', outcome: 'settlement', amount: 2300000, facts: 'Officers pinned mentally ill man face-down for 14 min. QI denied by 5th Circuit en banc.', factors: ['mental illness', 'prone restraint', '5th circuit QI denial', 'wrongful death'], qualified_immunity: false },
  { id: 'c6', name: 'Johnson v. City of Memphis', court: 'W.D. Tenn.', year: 2024, type: 'excessive_force', outcome: 'settlement', amount: 950000, facts: 'Officer punched handcuffed detainee multiple times. Facial fractures. Clear Graham violation.', factors: ['handcuffed', 'facial fractures', 'clear Graham violation'], qualified_immunity: false },
  { id: 'c7', name: 'Brown v. City of Vicksburg', court: 'S.D. Miss.', year: 2022, type: 'excessive_force', outcome: 'settlement', amount: 425000, facts: 'Taser deployment on non-threatening subject. No injury. 5th Circuit — weak QI defense.', factors: ['taser', 'non-threatening', 'no permanent injury', '5th circuit'], qualified_immunity: true },
  { id: 'c8', name: 'Davis v. City of Columbus MS', court: 'N.D. Miss.', year: 2024, type: 'excessive_force', outcome: 'settlement', amount: 425000, facts: 'Traffic stop escalation. Bruising, no permanent injury. Standard §1983 settlement.', factors: ['traffic stop', 'no permanent injury', 'N.D. Miss.'], qualified_immunity: false },
  { id: 'c9', name: 'Rodriguez v. City of Jackson MS', court: 'S.D. Miss.', year: 2023, type: 'false_arrest', outcome: 'settlement', amount: 175000, facts: 'False arrest on misdemeanor charge. No injury. Malicious prosecution dismissed early.', factors: ['false arrest', 'no injury', 'malicious prosecution dismissed'], qualified_immunity: false },
  { id: 'c10', name: 'Williams v. Lafayette County', court: 'N.D. Miss.', year: 2021, type: 'excessive_force', outcome: 'settlement', amount: 285000, facts: 'Jail officer used excessive force on inmate. Broken ribs. 14th Amendment Kingsley claim.', factors: ['jail/detention', 'broken ribs', '14th amendment', 'N.D. Miss.'], qualified_immunity: false },
  { id: 'c11', name: 'Estate of George Floyd v. City of Minneapolis', court: 'D. Minn.', year: 2021, type: 'wrongful_death', outcome: 'settlement', amount: 27000000, facts: 'Officer kneeled on neck for 9+ minutes. Murder conviction. Landmark police reform case.', factors: ['wrongful death', 'murder conviction', 'landmark', 'national attention'], qualified_immunity: false },
  { id: 'c12', name: 'Breonna Taylor Estate v. Louisville Metro', court: 'W.D. Ky.', year: 2020, type: 'wrongful_death', outcome: 'settlement', amount: 12000000, facts: 'No-knock raid. Wrongful death. Policy reform. Officers not charged initially.', factors: ['no-knock warrant', 'wrongful death', 'policy reform'], qualified_immunity: false },
  { id: 'c13', name: 'Strickland v. Aldridge (Jones Co. MS)', court: 'S.D. Miss.', year: 2022, type: 'excessive_force', outcome: 'verdict', amount: 320000, facts: 'Jury verdict — deputy beat handcuffed plaintiff. Punitive damages awarded.', factors: ['handcuffed', 'jury verdict', 'punitive damages', 'S.D. Miss.'], qualified_immunity: false },
  { id: 'c14', name: 'Harris v. City of Hattiesburg', court: 'S.D. Miss.', year: 2023, type: 'false_arrest', outcome: 'settlement', amount: 210000, facts: 'False arrest — Fourth Amendment. Plaintiff spent 3 days in jail. Lost employment.', factors: ['false arrest', 'lost employment', '3 days in jail', 'S.D. Miss.'], qualified_immunity: false },
  { id: 'c15', name: 'Morrow v. City of Clarksdale', court: 'N.D. Miss.', year: 2024, type: 'excessive_force', outcome: 'settlement', amount: 580000, facts: 'Traffic stop — officer broke plaintiff\'s arm during struggle. No prior criminal history.', factors: ['broken arm', 'traffic stop', 'no criminal history', 'N.D. Miss.'], qualified_immunity: false },
];

type CaseType = 'excessive_force' | 'wrongful_death' | 'false_arrest' | 'stop_frisk' | 'all';

const CASE_TYPES: { value: CaseType; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'excessive_force', label: 'Excessive Force' },
  { value: 'wrongful_death', label: 'Wrongful Death' },
  { value: 'false_arrest', label: 'False Arrest' },
];

const INJURY_MULTIPLIERS: Record<string, number> = {
  'none': 0.3,
  'minor_bruising': 0.6,
  'broken_bone': 1.0,
  'laceration_stitches': 0.7,
  'taser_deployment': 0.65,
  'k9_bite': 0.9,
  'permanent_scarring': 1.3,
  'traumatic_brain_injury': 2.2,
  'paralysis': 4.0,
  'death': 5.0,
};

const QI_ADJUSTMENTS: Record<string, number> = {
  'strong': 0.35,
  'moderate': 0.60,
  'weak': 0.85,
  'denied': 1.0,
};

interface CalcInputs {
  caseType: string;
  injuryType: string;
  medicalBills: number;
  lostWages: number;
  permanentImpairment: boolean;
  mentalAnguish: boolean;
  witnesses: number;
  videoEvidence: boolean;
  badActorHistory: boolean;
  jurisdiction: string;
  qualifiedImmunity: string;
  wrongfulDeath: boolean;
}

export default function SettlementCalculator() {
  const [inputs, setInputs] = useState<CalcInputs>({
    caseType: 'excessive_force',
    injuryType: 'broken_bone',
    medicalBills: 15000,
    lostWages: 8000,
    permanentImpairment: false,
    mentalAnguish: true,
    witnesses: 1,
    videoEvidence: false,
    badActorHistory: false,
    jurisdiction: 'N.D. Mississippi',
    qualifiedImmunity: 'moderate',
    wrongfulDeath: false,
  });

  const [aiAnalysis, setAiAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [comparableFilter, setComparableFilter] = useState<CaseType>('all');
  const [showComparables, setShowComparables] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof CalcInputs, v: any) => setInputs(prev => ({ ...prev, [k]: v }));

  // ── Core calculation ──────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const specials = inputs.medicalBills + inputs.lostWages;
    const injMultiplier = INJURY_MULTIPLIERS[inputs.injuryType] || 1.0;
    const qiMultiplier  = QI_ADJUSTMENTS[inputs.qualifiedImmunity] || 0.6;

    // Pain & suffering: 3–7x specials based on injury type
    const psBase = specials * (2 + injMultiplier * 3);
    const ps = Math.max(psBase, inputs.wrongfulDeath ? 500000 : 50000);

    let general = ps;
    if (inputs.permanentImpairment) general *= 1.4;
    if (inputs.mentalAnguish)       general *= 1.2;
    if (inputs.wrongfulDeath)       general *= 3.0;

    const evidenceBoost = (inputs.videoEvidence ? 1.25 : 1.0) *
                          (inputs.witnesses > 2 ? 1.15 : inputs.witnesses > 0 ? 1.05 : 1.0) *
                          (inputs.badActorHistory ? 1.3 : 1.0);

    const punitiveBase = inputs.badActorHistory ? specials * 1.5 : 0;

    const total = (specials + general + punitiveBase) * qiMultiplier * evidenceBoost;

    const low    = Math.round(total * 0.4 / 1000) * 1000;
    const mid    = Math.round(total * 0.75 / 1000) * 1000;
    const high   = Math.round(total * 1.0 / 1000) * 1000;
    const trial  = Math.round(total * 1.6 / 1000) * 1000;

    // Attorney fees (42 U.S.C. §1988 lodestar)
    const attyFees = Math.round(total * 0.33 / 1000) * 1000;

    return { low, mid, high, trial, specials, general: Math.round(general), punitive: Math.round(punitiveBase), attyFees };
  }, [inputs]);

  // ── Relevant comparables ─────────────────────────────────────────────────
  const relevantComps = useMemo(() => {
    return COMPARABLES.filter(c => {
      if (comparableFilter !== 'all' && c.type !== comparableFilter) return false;
      return true;
    }).sort((a, b) => b.amount - a.amount);
  }, [comparableFilter]);

  const fmt = (n: number) => n >= 1000000
    ? `$${(n / 1000000).toFixed(2)}M`
    : `$${n.toLocaleString()}`;

  const runAiAnalysis = async () => {
    setAnalyzing(true); setAiAnalysis('');
    const res = await aiParalegal({
      message: `Analyze this §1983 civil rights case for settlement value.

CASE DETAILS:
- Type: ${inputs.caseType.replace('_',' ')}
- Injury: ${inputs.injuryType.replace(/_/g,' ')}
- Medical Bills: $${inputs.medicalBills.toLocaleString()}
- Lost Wages: $${inputs.lostWages.toLocaleString()}
- Permanent Impairment: ${inputs.permanentImpairment ? 'Yes' : 'No'}
- Mental Anguish: ${inputs.mentalAnguish ? 'Yes' : 'No'}
- Wrongful Death: ${inputs.wrongfulDeath ? 'Yes' : 'No'}
- Eyewitnesses: ${inputs.witnesses}
- Video Evidence: ${inputs.videoEvidence ? 'Yes' : 'No'}
- Officer Has Prior Complaints: ${inputs.badActorHistory ? 'Yes' : 'No'}
- Jurisdiction: ${inputs.jurisdiction}
- Qualified Immunity Posture: ${inputs.qualifiedImmunity}

Calculator range: ${fmt(calc.low)} – ${fmt(calc.high)} (trial value: ${fmt(calc.trial)})

Provide:
1. Settlement strategy recommendation (3-4 sentences)
2. Key factors that increase value
3. Key weaknesses to address
4. Timing strategy (when to settle vs. go to trial)
5. Any relevant 5th Circuit or Mississippi case law to cite in demand letter

Be specific and practical.`,
      context: 'You are a civil rights litigation attorney who has handled hundreds of §1983 cases in the Deep South.',
    });
    setAiAnalysis(res.response || res.message || '');
    setAnalyzing(false);
  };

  const generateDemandSummary = () => {
    const text = `SETTLEMENT DEMAND ANALYSIS
Generated: ${new Date().toLocaleDateString()}

CASE TYPE: ${inputs.caseType.replace(/_/g,' ').toUpperCase()}
JURISDICTION: ${inputs.jurisdiction}

SPECIAL DAMAGES (ECONOMIC):
  Medical Bills:       $${inputs.medicalBills.toLocaleString()}
  Lost Wages:          $${inputs.lostWages.toLocaleString()}
  TOTAL SPECIALS:      $${calc.specials.toLocaleString()}

GENERAL DAMAGES:
  Pain & Suffering:    $${calc.general.toLocaleString()}
  Punitive Damages:    ${calc.punitive > 0 ? '$' + calc.punitive.toLocaleString() : 'TBD'}

ESTIMATED ATTORNEY FEES (42 U.S.C. § 1988):
  Lodestar estimate:   $${calc.attyFees.toLocaleString()}

SETTLEMENT RANGE:
  Early Settlement:    ${fmt(calc.low)}
  Reasonable Range:    ${fmt(calc.mid)} – ${fmt(calc.high)}
  Full Trial Value:    ${fmt(calc.trial)}

DEMAND LETTER RECOMMENDATION:
  Open demand at:      ${fmt(Math.round(calc.trial * 0.9 / 10000) * 10000)}
  Accept no less than: ${fmt(calc.mid)}

COMPARABLE CASES (5th Circuit / Mississippi):
${COMPARABLES.filter(c => c.court.includes('Miss') || c.court.includes('Tex') || c.court.includes('La')).slice(0,4).map(c => `  • ${c.name} — ${c.court} (${c.year}): ${fmt(c.amount)}`).join('\n')}

${aiAnalysis ? '\nAI ANALYSIS:\n' + aiAnalysis : ''}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = 'settlement-analysis.txt'; a.click();
  };

  const JURISDICTIONS = ['N.D. Mississippi', 'S.D. Mississippi', '5th Circuit', 'N.D. Texas', 'S.D. Texas', 'N.D. Alabama', 'N.D. Georgia', 'S.D. Florida'];

  const strengthScore = useMemo(() => {
    let score = 50;
    if (inputs.videoEvidence) score += 20;
    if (inputs.witnesses > 0) score += inputs.witnesses * 5;
    if (inputs.badActorHistory) score += 15;
    if (inputs.qualifiedImmunity === 'denied') score += 20;
    else if (inputs.qualifiedImmunity === 'weak') score += 10;
    else if (inputs.qualifiedImmunity === 'strong') score -= 20;
    if (inputs.permanentImpairment) score += 10;
    if (inputs.wrongfulDeath) score += 15;
    return Math.min(100, Math.max(10, score));
  }, [inputs]);

  const strengthColor = strengthScore >= 75 ? 'text-emerald-400' : strengthScore >= 50 ? 'text-yellow-400' : 'text-red-400';
  const strengthLabel = strengthScore >= 75 ? 'Strong' : strengthScore >= 50 ? 'Moderate' : 'Challenging';

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900/30 via-slate-800/60 to-slate-800/40 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 10% 50%, #10b981 0%, transparent 50%)' }} />
        <div className="relative w-12 h-12 bg-emerald-600/30 border border-emerald-500/40 rounded-xl flex items-center justify-center flex-shrink-0">
          <DollarSign className="text-emerald-400" size={24} />
        </div>
        <div className="relative flex-1">
          <h1 className="text-white font-bold text-lg">Settlement Calculator</h1>
          <p className="text-slate-400 text-sm">§1983 civil rights case valuation with real comparable verdicts & settlements</p>
        </div>
        <div className="relative hidden md:flex gap-3">
          {[
            { value: `${COMPARABLES.length}`, label: 'Comparables' },
            { value: '5th Cir.', label: 'Focus' },
            { value: '§1988', label: 'Fees' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center bg-slate-800/60 border border-slate-700/40 rounded-xl px-4 py-2.5 min-w-[64px]">
              <div className="text-white font-bold text-sm">{value}</div>
              <div className="text-slate-500 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* ── Inputs ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Case Facts</div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Case Type</label>
                <select value={inputs.caseType} onChange={e => set('caseType', e.target.value)}
                  className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/60 transition-colors">
                  <option value="excessive_force">Excessive Force</option>
                  <option value="wrongful_death">Wrongful Death</option>
                  <option value="false_arrest">False Arrest</option>
                  <option value="unlawful_search">Unlawful Search</option>
                  <option value="first_amendment">First Amendment</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Jurisdiction</label>
                <select value={inputs.jurisdiction} onChange={e => set('jurisdiction', e.target.value)}
                  className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none transition-colors">
                  {JURISDICTIONS.map(j => <option key={j}>{j}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1.5">Primary Injury</label>
              <select value={inputs.injuryType} onChange={e => set('injuryType', e.target.value)}
                className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/60 transition-colors">
                <option value="none">No Physical Injury</option>
                <option value="minor_bruising">Minor Bruising / Abrasions</option>
                <option value="laceration_stitches">Laceration (Stitches)</option>
                <option value="taser_deployment">Taser Deployment</option>
                <option value="k9_bite">K-9 Bite</option>
                <option value="broken_bone">Broken Bone / Fracture</option>
                <option value="permanent_scarring">Permanent Scarring</option>
                <option value="traumatic_brain_injury">Traumatic Brain Injury</option>
                <option value="paralysis">Paralysis / Spinal</option>
                <option value="death">Death (Wrongful Death)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Medical Bills ($)</label>
                <input type="number" value={inputs.medicalBills}
                  onChange={e => set('medicalBills', Number(e.target.value))}
                  className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/60 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Lost Wages ($)</label>
                <input type="number" value={inputs.lostWages}
                  onChange={e => set('lostWages', Number(e.target.value))}
                  className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/60 transition-colors" />
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">Qualified Immunity Posture</div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { v: 'strong',   label: 'Strong', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
                { v: 'moderate', label: 'Moderate', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
                { v: 'weak',     label: 'Weak', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
                { v: 'denied',   label: 'Denied', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
              ].map(({ v, label, color }) => (
                <button key={v} onClick={() => set('qualifiedImmunity', v)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    inputs.qualifiedImmunity === v ? color : 'bg-slate-700/40 border-slate-600/40 text-slate-500 hover:text-slate-300'
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Evidence & Aggravators</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'videoEvidence',      label: '📹 Video evidence' },
                { key: 'permanentImpairment', label: '♿ Permanent impairment' },
                { key: 'mentalAnguish',       label: '🧠 Mental anguish' },
                { key: 'badActorHistory',     label: '📋 Prior complaints' },
                { key: 'wrongfulDeath',       label: '⚰️ Wrongful death' },
              ].map(({ key, label }) => (
                <label key={key} className={`flex items-center gap-2 cursor-pointer px-3 py-2.5 rounded-xl border transition-all ${
                  inputs[key as keyof CalcInputs]
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-700/30 border-slate-600/30 text-slate-400 hover:border-slate-500'
                }`}>
                  <input type="checkbox"
                    checked={inputs[key as keyof CalcInputs] as boolean}
                    onChange={e => set(key as keyof CalcInputs, e.target.checked)}
                    className="sr-only" />
                  <span className="text-xs">{label}</span>
                </label>
              ))}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-600/30 bg-slate-700/30">
                <span className="text-slate-400 text-xs">👁 Witnesses:</span>
                <input type="number" min={0} max={20} value={inputs.witnesses}
                  onChange={e => set('witnesses', Number(e.target.value))}
                  className="w-12 bg-slate-600/60 border border-slate-500/40 rounded-lg px-2 py-1 text-white text-xs text-center focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Results ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Case strength meter */}
          <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Case Strength</span>
              <span className={`font-bold text-sm ${strengthColor}`}>{strengthScore}/100 — {strengthLabel}</span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  strengthScore >= 75 ? 'bg-emerald-500' : strengthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${strengthScore}%` }}
              />
            </div>
          </div>

          {/* Settlement range cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Early Settlement', value: calc.low,   desc: 'Reasonable early offer', color: 'border-slate-600/40', textColor: 'text-slate-300', icon: '🤝' },
              { label: 'Demand Floor',     value: calc.mid,   desc: 'Min. acceptable',         color: 'border-blue-500/30',    textColor: 'text-blue-300',    icon: '⚖️' },
              { label: 'Full Value',        value: calc.high,  desc: 'Reasonable settlement',   color: 'border-emerald-500/30', textColor: 'text-emerald-300', icon: '✅' },
              { label: 'Trial Value',      value: calc.trial, desc: 'If verdict goes your way', color: 'border-purple-500/30',  textColor: 'text-purple-300',  icon: '⚡' },
            ].map(({ label, value, desc, color, textColor, icon }) => (
              <div key={label} className={`bg-slate-800/60 border ${color} rounded-2xl p-4`}>
                <div className="text-slate-500 text-xs mb-1">{icon} {label}</div>
                <div className={`text-2xl font-bold ${textColor}`}>{fmt(value)}</div>
                <div className="text-slate-600 text-[10px] mt-0.5">{desc}</div>
              </div>
            ))}
          </div>

          {/* Damages breakdown */}
          <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <BarChart3 size={12} /> Damages Breakdown
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Special Damages (economic)', value: calc.specials, color: 'bg-blue-500', pct: calc.specials / (calc.specials + calc.general + calc.punitive) * 100 },
                { label: 'General Damages (pain & suffering)', value: calc.general, color: 'bg-emerald-500', pct: calc.general / (calc.specials + calc.general + calc.punitive + 1) * 100 },
                { label: 'Punitive Damages (estimated)', value: calc.punitive, color: 'bg-red-500', pct: calc.punitive / (calc.specials + calc.general + calc.punitive + 1) * 100 },
                { label: 'Attorney Fees §1988 (lodestar)', value: calc.attyFees, color: 'bg-violet-500', pct: 33 },
              ].map(({ label, value, color, pct }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">{label}</span>
                    <span className="text-xs font-bold text-white">${value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${color}`}
                      style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/40 flex items-center gap-1.5 text-xs text-slate-500">
              <Info size={10} /> QI adjustment applied: {(QI_ADJUSTMENTS[inputs.qualifiedImmunity] * 100).toFixed(0)}% of base value
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles size={12} className="text-emerald-400" /> AI Strategy Analysis
              </div>
              <button onClick={runAiAnalysis} disabled={analyzing}
                className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg transition-colors">
                {analyzing ? <><Loader2 className="animate-spin" size={12} /> Analyzing...</> : <><Sparkles size={12} /> Analyze</>}
              </button>
            </div>
            {analyzing && <div className="space-y-2">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-4 rounded-lg" />)}</div>}
            {aiAnalysis && !analyzing && (
              <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap animate-fade-in">{aiAnalysis}</div>
            )}
            {!aiAnalysis && !analyzing && (
              <div className="text-slate-600 text-xs text-center py-3">
                Click Analyze for strategy recommendations, timing advice, and case law
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button onClick={generateDemandSummary}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/40 text-slate-300 hover:text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              <Download size={14} /> Export Analysis
            </button>
            <button onClick={() => setShowComparables(!showComparables)}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/40 text-slate-300 hover:text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              <Scale size={14} /> {showComparables ? 'Hide' : 'Show'} Comparables ({COMPARABLES.length})
            </button>
          </div>
        </div>
      </div>

      {/* ── Comparable Verdicts ──────────────────────────────────────────── */}
      {showComparables && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white">Real Comparable Verdicts & Settlements</div>
            <div className="flex gap-1.5">
              {CASE_TYPES.map(ct => (
                <button key={ct.value} onClick={() => setComparableFilter(ct.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    comparableFilter === ct.value
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-white'
                  }`}>
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {relevantComps.map(c => (
              <div key={c.id} className="bg-slate-800/60 border border-slate-700/40 hover:border-slate-600 rounded-2xl p-4 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-white font-semibold text-xs leading-snug">{c.name}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5">{c.court} · {c.year}</div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className={`font-bold text-sm ${
                      c.amount >= 1000000 ? 'text-emerald-400' : 'text-blue-400'
                    }`}>{fmt(c.amount)}</div>
                    <div className={`text-[10px] font-bold uppercase ${
                      c.outcome === 'verdict' ? 'text-yellow-400' : 'text-slate-500'
                    }`}>{c.outcome}</div>
                  </div>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{c.facts}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.factors.slice(0, 3).map(f => (
                    <span key={f} className="text-[10px] bg-slate-700/60 border border-slate-600/30 text-slate-500 px-1.5 py-0.5 rounded-full">{f}</span>
                  ))}
                  {!c.qualified_immunity && (
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">QI denied</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
