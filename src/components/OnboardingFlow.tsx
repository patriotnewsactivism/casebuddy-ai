import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale, ArrowRight, CheckCircle, Sparkles, DollarSign,
  Clock, Shield, Play, X, ChevronRight, Zap, Star
} from 'lucide-react';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to CaseBuddy AI',
    subtitle: 'Your autonomous AI law firm',
    content: null,
  },
  {
    id: 'roi',
    title: 'See what you\'re leaving on the table',
    subtitle: 'Quick ROI calculation',
    content: 'roi',
  },
  {
    id: 'tour',
    title: 'Meet your 9-agent legal team',
    subtitle: 'Specialist AI personas working in concert',
    content: 'agents',
  },
  {
    id: 'demo',
    title: 'Try it right now',
    subtitle: 'Pre-loaded demo case — no setup required',
    content: 'demo',
  },
];

const AGENTS_PREVIEW = [
  { name: 'Sierra', role: 'Intake', avatar: '👋', desc: 'Qualifies leads 24/7' },
  { name: 'Maya',   role: 'Strategy', avatar: '⚖️', desc: 'Builds litigation roadmap' },
  { name: 'Lex',    role: 'Research', avatar: '📚', desc: 'Real case law, no hallucinations' },
  { name: 'Doc',    role: 'Discovery', avatar: '🔬', desc: 'Extracts facts from documents' },
  { name: 'Max',    role: 'Drafting', avatar: '✍️', desc: 'Generates motions & letters' },
  { name: 'Sol',    role: 'Deadlines', avatar: '⏰', desc: 'Never misses a filing date' },
  { name: 'Rex',    role: 'Trial', avatar: '🦁', desc: 'Builds courtroom narratives' },
  { name: 'Jules',  role: 'Jury Sim', avatar: '👥', desc: 'Predicts verdict probability' },
  { name: 'Claude', role: 'Ethics', avatar: '🛡️', desc: 'Privilege & compliance audit' },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [hourlyRate, setHourlyRate] = useState(250);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  const annualSavings = Math.round(hoursPerWeek * hourlyRate * 52 * 0.6);
  const monthlyValue = Math.round(annualSavings / 12);

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else finish();
  };

  const finish = () => {
    localStorage.setItem('cb_onboarded', '1');
    onComplete();
  };

  const goToWarRoom = () => {
    localStorage.setItem('cb_onboarded', '1');
    onComplete();
    navigate('/war-room');
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative w-full max-w-2xl mx-4 bg-slate-900 border border-slate-700/60 rounded-3xl overflow-hidden shadow-2xl">
        {/* Skip */}
        <button onClick={finish}
          className="absolute top-4 right-4 text-slate-600 hover:text-slate-300 transition-colors z-10">
          <X size={20} />
        </button>

        {/* Progress dots */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {STEPS.map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300 ${
              i === step ? 'w-6 h-1.5 bg-violet-500' : i < step ? 'w-1.5 h-1.5 bg-emerald-500' : 'w-1.5 h-1.5 bg-slate-700'
            }`} />
          ))}
        </div>

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div className="p-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl mb-6 shadow-lg shadow-violet-500/20">
              <Scale className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to CaseBuddy AI</h1>
            <p className="text-slate-400 text-base mb-2">Your autonomous AI law firm</p>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">
              9 specialist AI agents working together — intake, strategy, research, drafting, deadlines, trial prep, jury simulation, and ethics compliance.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: '⏱️', label: '15+ hrs/week', sub: 'saved on avg' },
                { icon: '🏛️', label: 'N.D. Miss. ready', sub: '5th Circuit focused' },
                { icon: '🛡️', label: 'Bar-compliant', sub: 'audit trail built-in' },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3">
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-white font-bold text-sm">{label}</div>
                  <div className="text-slate-500 text-xs">{sub}</div>
                </div>
              ))}
            </div>
            <button onClick={next}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white py-3.5 rounded-2xl font-bold text-base transition-all shadow-lg shadow-violet-500/20">
              Get Started <ArrowRight className="inline ml-1" size={18} />
            </button>
          </div>
        )}

        {/* ── Step 1: ROI Calculator ── */}
        {step === 1 && (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center">
                <DollarSign className="text-emerald-400" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">What's your time worth?</h2>
                <p className="text-slate-400 text-sm">See how much CaseBuddy saves you</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-slate-300 font-medium">Hours/week on drafting, research & admin</label>
                  <span className="text-white font-bold">{hoursPerWeek} hrs</span>
                </div>
                <input type="range" min={2} max={40} value={hoursPerWeek}
                  onChange={e => setHoursPerWeek(Number(e.target.value))}
                  className="w-full accent-violet-500" />
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>2 hrs</span><span>40 hrs</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-slate-300 font-medium">Your effective hourly rate ($)</label>
                  <span className="text-white font-bold">${hourlyRate}/hr</span>
                </div>
                <input type="range" min={100} max={1000} step={25} value={hourlyRate}
                  onChange={e => setHourlyRate(Number(e.target.value))}
                  className="w-full accent-violet-500" />
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>$100</span><span>$1,000</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
                <div className="text-emerald-400 text-xs font-bold uppercase tracking-wide mb-1">Monthly savings</div>
                <div className="text-3xl font-bold text-white">${monthlyValue.toLocaleString()}</div>
                <div className="text-slate-500 text-xs mt-1">60% of time automated</div>
              </div>
              <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-4 text-center">
                <div className="text-violet-400 text-xs font-bold uppercase tracking-wide mb-1">Annual value</div>
                <div className="text-3xl font-bold text-white">${annualSavings.toLocaleString()}</div>
                <div className="text-slate-500 text-xs mt-1">vs. $499/mo subscription</div>
              </div>
            </div>

            <div className="mt-4 bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 text-center text-sm">
              <span className="text-emerald-400 font-bold">
                {Math.round(monthlyValue / 499)}x ROI
              </span>
              <span className="text-slate-400"> — CaseBuddy pays for itself in </span>
              <span className="text-white font-bold">{Math.round(499 / (monthlyValue / 30))} days</span>
            </div>

            <button onClick={next}
              className="w-full mt-5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white py-3.5 rounded-2xl font-bold transition-all">
              Meet Your Team <ArrowRight className="inline ml-1" size={18} />
            </button>
          </div>
        )}

        {/* ── Step 2: Agent roster ── */}
        {step === 2 && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-white mb-1">Your 9-Agent Legal Team</h2>
            <p className="text-slate-400 text-sm mb-5">Each specialist hands off work intelligently — just like a real firm</p>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {AGENTS_PREVIEW.map(agent => (
                <div key={agent.name} className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3">
                  <div className="text-xl mb-1">{agent.avatar}</div>
                  <div className="text-white font-bold text-xs">{agent.name}</div>
                  <div className="text-slate-500 text-[10px]">{agent.desc}</div>
                </div>
              ))}
            </div>

            <div className="bg-slate-800/40 border border-violet-500/20 rounded-xl p-3 text-sm text-slate-400 mb-5">
              <Sparkles size={12} className="inline text-violet-400 mr-1.5" />
              One click runs the <strong className="text-white">Full Pipeline</strong> — all 9 agents analyze your case in sequence, each building on the last.
            </div>

            <button onClick={next}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white py-3.5 rounded-2xl font-bold transition-all">
              Try the Demo Case <ArrowRight className="inline ml-1" size={18} />
            </button>
          </div>
        )}

        {/* ── Step 3: Demo ── */}
        {step === 3 && (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/30 rounded-xl flex items-center justify-center">
                <Play className="text-orange-400" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Pre-loaded: Shumpert v. City of Oxford</h2>
                <p className="text-slate-400 text-sm">§1983 excessive force case — click around immediately</p>
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 mb-5 space-y-2 text-sm">
              {[
                { icon: '🧑', label: 'Client', val: 'Marcus Shumpert — no prior history' },
                { icon: '⚠️', label: 'Incident', val: 'Traffic stop — excessive force, broken arm' },
                { icon: '💰', label: 'Damages', val: '$42K medical + $18K lost wages' },
                { icon: '📹', label: 'Evidence', val: 'Body camera footage + 3 witnesses' },
                { icon: '📋', label: 'Officers', val: 'Both have prior complaints on file' },
              ].map(({ icon, label, val }) => (
                <div key={label} className="flex items-start gap-2">
                  <span className="flex-shrink-0">{icon}</span>
                  <span className="text-slate-500 w-20 flex-shrink-0">{label}:</span>
                  <span className="text-slate-200">{val}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <button onClick={goToWarRoom}
                className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                <Sparkles size={18} /> Open War Room — Run Full Pipeline
              </button>
              <button onClick={finish}
                className="w-full bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 text-slate-300 py-3 rounded-2xl font-medium text-sm transition-all">
                Go to Dashboard instead
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
