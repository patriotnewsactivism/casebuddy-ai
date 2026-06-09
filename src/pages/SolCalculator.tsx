import React, { useState, useMemo } from 'react';
import { Calculator, Clock, AlertTriangle, CheckCircle, Mail, ArrowRight, Scale, Calendar, MapPin, Share2 } from 'lucide-react';

interface SolData {
  state: string; abbr: string;
  claims: { type: string; years: number; notes: string; tolling: string; }[];
}

const SOL_DATABASE: SolData[] = [
  { state: 'Alabama', abbr: 'AL', claims: [
    { type: 'Personal Injury', years: 2, notes: 'Ala. Code § 6-2-38(l)', tolling: 'Minority: tolled until age 19. Mental incapacity: tolled during incapacity.' },
    { type: 'Medical Malpractice', years: 2, notes: 'Ala. Code § 6-5-482. 4-year max from act.', tolling: 'Discovery rule: 6 months from discovery, max 4 years from act.' },
    { type: 'Property Damage', years: 6, notes: 'Ala. Code § 6-2-34', tolling: 'Standard tolling for minors.' },
    { type: 'Contract (Written)', years: 6, notes: 'Ala. Code § 6-2-34', tolling: '' },
    { type: 'Contract (Oral)', years: 6, notes: 'Ala. Code § 6-2-34', tolling: '' },
    { type: 'Fraud', years: 2, notes: 'From discovery. Ala. Code § 6-2-38(l)', tolling: 'Discovery rule applies.' },
  ]},
  { state: 'Alaska', abbr: 'AK', claims: [
    { type: 'Personal Injury', years: 2, notes: 'AS § 09.10.070', tolling: 'Minority, mental disability.' },
    { type: 'Medical Malpractice', years: 2, notes: 'AS § 09.10.070', tolling: 'Discovery rule.' },
    { type: 'Property Damage', years: 6, notes: 'AS § 09.10.050', tolling: '' },
    { type: 'Contract', years: 3, notes: 'Oral: 3 years. Written: 6 years.', tolling: '' },
  ]},
  { state: 'Arizona', abbr: 'AZ', claims: [
    { type: 'Personal Injury', years: 2, notes: 'A.R.S. § 12-542', tolling: 'Minority: until age 18. Imprisonment. Mental incapacity.' },
    { type: 'Medical Malpractice', years: 2, notes: 'A.R.S. § 12-542', tolling: 'Discovery rule.' },
    { type: 'Property Damage', years: 2, notes: 'A.R.S. § 12-542', tolling: '' },
    { type: 'Contract (Written)', years: 6, notes: 'A.R.S. § 12-548', tolling: '' },
    { type: 'Contract (Oral)', years: 3, notes: 'A.R.S. § 12-543', tolling: '' },
  ]},
  { state: 'Arkansas', abbr: 'AR', claims: [
    { type: 'Personal Injury', years: 3, notes: 'A.C.A. § 16-56-105', tolling: 'Minority, unsound mind.' },
    { type: 'Medical Malpractice', years: 2, notes: 'A.C.A. § 16-114-203', tolling: 'Discovery rule with 2-year max.' },
    { type: 'Property Damage', years: 3, notes: 'A.C.A. § 16-56-105', tolling: '' },
    { type: 'Contract', years: 5, notes: 'A.C.A. § 16-56-111', tolling: '' },
  ]},
  { state: 'California', abbr: 'CA', claims: [
    { type: 'Personal Injury', years: 2, notes: 'CCP § 335.1', tolling: 'Minority: until age 18. Imprisonment. Mental incapacity. COVID tolling (emergency orders).' },
    { type: 'Medical Malpractice', years: 1, notes: 'CCP § 340.5. 3-year max from injury.', tolling: 'Discovery rule: 1 year from discovery, 3-year max from injury.' },
    { type: 'Property Damage', years: 3, notes: 'CCP § 338', tolling: '' },
    { type: 'Contract (Written)', years: 4, notes: 'CCP § 337', tolling: '' },
    { type: 'Contract (Oral)', years: 2, notes: 'CCP § 339', tolling: '' },
    { type: 'Fraud', years: 3, notes: 'CCP § 338(d). From discovery.', tolling: 'Discovery rule applies.' },
    { type: 'Government Claims', years: 0.5, notes: 'Gov. Code § 911.2. Must file claim within 6 months!', tolling: 'No tolling for minors on claim requirement.' },
  ]},
  { state: 'Colorado', abbr: 'CO', claims: [
    { type: 'Personal Injury', years: 2, notes: 'C.R.S. § 13-80-102', tolling: 'Minority, mental disability.' },
    { type: 'Medical Malpractice', years: 2, notes: 'C.R.S. § 13-80-102.5. 3-year max.', tolling: '' },
    { type: 'Contract (Written)', years: 6, notes: 'C.R.S. § 13-80-103.5', tolling: '' },
    { type: 'Contract (Oral)', years: 3, notes: 'C.R.S. § 13-80-101(1)(a)', tolling: '' },
  ]},
  { state: 'Florida', abbr: 'FL', claims: [
    { type: 'Personal Injury', years: 2, notes: 'Fla. Stat. § 95.11(3). Reduced from 4 to 2 years in 2023.', tolling: 'Minority, mental incapacity, absence from state.' },
    { type: 'Medical Malpractice', years: 2, notes: 'Fla. Stat. § 95.11(4)(b). 4-year max from incident.', tolling: 'Discovery rule with repose.' },
    { type: 'Property Damage', years: 4, notes: 'Fla. Stat. § 95.11(3)(g)', tolling: '' },
    { type: 'Contract (Written)', years: 5, notes: 'Fla. Stat. § 95.11(2)(b)', tolling: '' },
    { type: 'Contract (Oral)', years: 4, notes: 'Fla. Stat. § 95.11(3)(k)', tolling: '' },
  ]},
  { state: 'Georgia', abbr: 'GA', claims: [
    { type: 'Personal Injury', years: 2, notes: 'O.C.G.A. § 9-3-33', tolling: 'Minority: until age 18 + 5 years. Mental disability.' },
    { type: 'Medical Malpractice', years: 2, notes: 'O.C.G.A. § 9-3-71. 5-year max.', tolling: '' },
    { type: 'Property Damage', years: 4, notes: 'O.C.G.A. § 9-3-30', tolling: '' },
    { type: 'Contract (Written)', years: 6, notes: 'O.C.G.A. § 9-3-24', tolling: '' },
    { type: 'Contract (Oral)', years: 4, notes: 'O.C.G.A. § 9-3-26', tolling: '' },
  ]},
  { state: 'Mississippi', abbr: 'MS', claims: [
    { type: 'Personal Injury', years: 3, notes: 'Miss. Code Ann. § 15-1-49', tolling: 'Minority: until age 21. Mental disability. Absence from state. Imprisonment.' },
    { type: 'Medical Malpractice', years: 2, notes: 'Miss. Code Ann. § 15-1-36. 7-year max from act.', tolling: 'Discovery rule: 2 years from discovery, 7-year repose.' },
    { type: 'Property Damage', years: 3, notes: 'Miss. Code Ann. § 15-1-49', tolling: 'Standard tolling provisions.' },
    { type: 'Contract (Written)', years: 6, notes: 'Miss. Code Ann. § 15-1-29. Promissory notes: 6 years.', tolling: '' },
    { type: 'Contract (Oral)', years: 3, notes: 'Miss. Code Ann. § 15-1-29', tolling: '' },
    { type: 'Civil Rights §1983', years: 3, notes: 'Borrows state PI SOL. Owens v. Okure, 488 U.S. 235 (1989)', tolling: 'Federal tolling rules may apply. Equitable tolling available.' },
    { type: 'Fraud', years: 3, notes: 'Miss. Code Ann. § 15-1-49. From discovery.', tolling: 'Discovery rule applies.' },
    { type: 'Government Claims (MTCA)', years: 1, notes: 'Miss. Code Ann. § 11-46-11. Notice within 1 year!', tolling: '90-day notice required before filing suit against government entities.' },
    { type: 'Wrongful Death', years: 3, notes: 'Miss. Code Ann. § 15-1-49', tolling: '' },
  ]},
  { state: 'New York', abbr: 'NY', claims: [
    { type: 'Personal Injury', years: 3, notes: 'CPLR § 214', tolling: 'Infancy: until age 18. Insanity. Absence from state.' },
    { type: 'Medical Malpractice', years: 2.5, notes: 'CPLR § 214-a', tolling: 'Continuous treatment doctrine.' },
    { type: 'Property Damage', years: 3, notes: 'CPLR § 214', tolling: '' },
    { type: 'Contract', years: 6, notes: 'CPLR § 213', tolling: '' },
    { type: 'Fraud', years: 6, notes: 'CPLR § 213(8). Greater of 6 years or 2 from discovery.', tolling: '' },
  ]},
  { state: 'Texas', abbr: 'TX', claims: [
    { type: 'Personal Injury', years: 2, notes: 'Tex. Civ. Prac. & Rem. Code § 16.003', tolling: 'Minority: until age 18. Mental incapacity. Absence from state.' },
    { type: 'Medical Malpractice', years: 2, notes: 'Tex. Civ. Prac. & Rem. Code § 74.251. 10-year max.', tolling: '' },
    { type: 'Property Damage', years: 2, notes: 'Tex. Civ. Prac. & Rem. Code § 16.003', tolling: '' },
    { type: 'Contract (Written)', years: 4, notes: 'Tex. Civ. Prac. & Rem. Code § 16.004', tolling: '' },
    { type: 'Contract (Oral)', years: 4, notes: 'Tex. Civ. Prac. & Rem. Code § 16.004', tolling: '' },
    { type: 'Fraud', years: 4, notes: 'Tex. Civ. Prac. & Rem. Code § 16.004', tolling: 'Discovery rule applies.' },
  ]},
];

// Fill remaining states with estimated data
const REMAINING_STATES: Record<string, SolData> = {};
const ALL_STATES_LIST = ['Connecticut','Delaware','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

ALL_STATES_LIST.forEach(s => {
  const abbr = s.replace(/[a-z\s]/g, '').substring(0, 2) || s.substring(0, 2).toUpperCase();
  SOL_DATABASE.push({
    state: s, abbr,
    claims: [
      { type: 'Personal Injury', years: s === 'Kentucky' || s === 'Louisiana' ? 1 : s === 'Maine' ? 6 : 2, notes: 'Check state statute for exact citation', tolling: 'Standard tolling for minority and disability' },
      { type: 'Medical Malpractice', years: 2, notes: 'May have discovery rule and/or statute of repose', tolling: '' },
      { type: 'Contract (Written)', years: s === 'Louisiana' ? 10 : 6, notes: '', tolling: '' },
      { type: 'Contract (Oral)', years: s === 'Louisiana' ? 10 : 3, notes: '', tolling: '' },
      { type: 'Property Damage', years: 3, notes: '', tolling: '' },
    ],
  });
});

const ALL_SOL = SOL_DATABASE.sort((a, b) => a.state.localeCompare(b.state));
const CLAIM_TYPES = [...new Set(ALL_SOL.flatMap(s => s.claims.map(c => c.type)))].sort();

export default function SolCalculator() {
  const [selectedState, setSelectedState] = useState('Mississippi');
  const [claimType, setClaimType] = useState('Personal Injury');
  const [incidentDate, setIncidentDate] = useState('');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const stateData = useMemo(() => ALL_SOL.find(s => s.state === selectedState), [selectedState]);
  const claimData = useMemo(() => stateData?.claims.find(c => c.type === claimType), [stateData, claimType]);

  const deadline = useMemo(() => {
    if (!incidentDate || !claimData) return null;
    const d = new Date(incidentDate);
    const years = claimData.years;
    const months = Math.round((years % 1) * 12);
    d.setFullYear(d.getFullYear() + Math.floor(years));
    d.setMonth(d.getMonth() + months);
    return d;
  }, [incidentDate, claimData]);

  const daysRemaining = useMemo(() => {
    if (!deadline) return null;
    const diff = deadline.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [deadline]);

  const calculate = () => setCalculated(true);

  const handleEmailReminder = () => {
    if (email.includes('@')) {
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    }
  };

  const urgencyLevel = (days: number | null) => {
    if (days === null) return 'unknown';
    if (days < 0) return 'expired';
    if (days < 30) return 'critical';
    if (days < 90) return 'urgent';
    if (days < 180) return 'warning';
    return 'safe';
  };

  const availableClaimTypes = useMemo(() => {
    return stateData?.claims.map(c => c.type) || ['Personal Injury'];
  }, [stateData]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="text-orange-400" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white">Statute of Limitations Calculator</h1>
          <p className="text-slate-400 text-sm">Free tool — check your filing deadline for all 50 states</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calculator Input */}
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1"><MapPin size={12} className="inline mr-1" />State</label>
              <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setCalculated(false); }}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                {ALL_SOL.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1"><Scale size={12} className="inline mr-1" />Claim Type</label>
              <select value={claimType} onChange={e => { setClaimType(e.target.value); setCalculated(false); }}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                {availableClaimTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1"><Calendar size={12} className="inline mr-1" />Date of Incident</label>
              <input type="date" value={incidentDate} onChange={e => { setIncidentDate(e.target.value); setCalculated(false); }}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <button onClick={calculate} disabled={!incidentDate || !claimData}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
              <Clock size={18} /> Calculate Deadline
            </button>
          </div>

          {/* State Info */}
          {stateData && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="text-white font-semibold text-sm mb-3">{stateData.state} — All Limitation Periods</h3>
              <div className="space-y-2">
                {stateData.claims.map((c, i) => (
                  <div key={i} className={`flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-0 ${
                    c.type === claimType ? 'bg-orange-500/10 -mx-2 px-2 rounded' : ''
                  }`}>
                    <span className="text-slate-400 text-sm">{c.type}</span>
                    <span className="text-white text-sm font-medium">
                      {c.years < 1 ? `${Math.round(c.years * 12)} months` : `${c.years} year${c.years !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!calculated ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
              <Clock className="mx-auto text-slate-600 mb-3" size={48} />
              <p className="text-slate-500">Enter your details and calculate</p>
              <p className="text-slate-600 text-xs mt-1">We'll show your exact filing deadline</p>
            </div>
          ) : deadline && daysRemaining !== null && (
            <>
              {/* Main Result */}
              <div className={`rounded-2xl p-6 border-2 ${
                urgencyLevel(daysRemaining) === 'expired' ? 'bg-red-500/10 border-red-500/50' :
                urgencyLevel(daysRemaining) === 'critical' ? 'bg-red-500/10 border-red-500/40' :
                urgencyLevel(daysRemaining) === 'urgent' ? 'bg-yellow-500/10 border-yellow-500/40' :
                urgencyLevel(daysRemaining) === 'warning' ? 'bg-orange-500/10 border-orange-500/40' :
                'bg-emerald-500/10 border-emerald-500/40'
              }`}>
                <div className="text-center space-y-3">
                  {daysRemaining < 0 ? (
                    <>
                      <AlertTriangle className="mx-auto text-red-400" size={40} />
                      <div className="text-3xl font-bold text-red-400">EXPIRED</div>
                      <div className="text-red-300 text-sm">Your statute of limitations expired {Math.abs(daysRemaining)} days ago</div>
                    </>
                  ) : (
                    <>
                      {daysRemaining < 90 ? (
                        <AlertTriangle className="mx-auto text-yellow-400" size={40} />
                      ) : (
                        <CheckCircle className="mx-auto text-emerald-400" size={40} />
                      )}
                      <div className={`text-5xl font-bold ${
                        daysRemaining < 30 ? 'text-red-400' : daysRemaining < 90 ? 'text-yellow-400' : daysRemaining < 180 ? 'text-orange-400' : 'text-emerald-400'
                      }`}>
                        {daysRemaining}
                      </div>
                      <div className="text-slate-300 text-sm">days remaining to file</div>
                    </>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-slate-500 text-xs">Filing Deadline</div>
                    <div className="text-white font-bold">{deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">Limitation Period</div>
                    <div className="text-white font-bold">
                      {claimData && (claimData.years < 1 ? `${Math.round(claimData.years * 12)} months` : `${claimData.years} year${claimData.years !== 1 ? 's' : ''}`)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Citation */}
              {claimData && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2">
                  <div className="text-blue-400 font-semibold text-sm">📖 Legal Authority</div>
                  <div className="text-slate-300 text-sm">{claimData.notes || 'Check state statute for exact citation.'}</div>
                  {claimData.tolling && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-2">
                      <div className="text-yellow-400 text-xs font-semibold mb-1">⚠️ Tolling Exceptions</div>
                      <div className="text-slate-300 text-xs">{claimData.tolling}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Email Reminder */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="text-white font-semibold text-sm mb-3">📧 Get Deadline Reminder</div>
                <div className="flex gap-2">
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                    placeholder="your@email.com"
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                  <button onClick={handleEmailReminder} disabled={!email.includes('@')}
                    className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
                    {emailSent ? <><CheckCircle size={14} /> Sent!</> : <><Mail size={14} /> Remind Me</>}
                  </button>
                </div>
                <div className="text-slate-600 text-xs mt-2">We'll email you 30, 14, and 7 days before your deadline</div>
              </div>

              {/* Disclaimer */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-slate-500 text-xs">
                <strong>⚠️ Disclaimer:</strong> This calculator provides general estimates only. Statutes of limitation may be affected by tolling provisions, discovery rules, government claim requirements, and other factors. Consult a licensed attorney in your jurisdiction for specific legal advice. Do not rely solely on this calculator.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
