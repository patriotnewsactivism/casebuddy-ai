import React, { useState } from 'react';
import {
  Scale, FolderOpen, UserPlus, FileSearch, Microscope, Swords,
  BookOpen, Clock, BarChart2, TrendingUp, AlertTriangle, Shield,
  Gavel, MessageSquare, Store, Globe2, ArrowRight, Zap, Star,
  ChevronRight, Activity, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MODULES = [
  {
    to: '/intake',
    label: 'AI Intake',
    desc: 'Smart client intake with Alex, your AI paralegal',
    icon: UserPlus,
    gradient: 'from-violet-600 to-purple-700',
    glow: 'rgba(139,92,246,0.2)',
    tag: 'Most Popular',
    tagColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  },
  {
    to: '/documents',
    label: 'Document Lab',
    desc: 'Upload docs — get facts, risks & admissibility analysis',
    icon: FileSearch,
    gradient: 'from-blue-600 to-cyan-600',
    glow: 'rgba(59,130,246,0.2)',
    tag: null,
    tagColor: '',
  },
  {
    to: '/discovery',
    label: 'Discovery Miner',
    desc: 'Cross-reference documents to find smoking guns',
    icon: Microscope,
    gradient: 'from-emerald-600 to-teal-600',
    glow: 'rgba(16,185,129,0.2)',
    tag: null,
    tagColor: '',
  },
  {
    to: '/research',
    label: 'Legal Research',
    desc: 'Case law, statutes, strategy & win probability',
    icon: BookOpen,
    gradient: 'from-indigo-600 to-violet-600',
    glow: 'rgba(99,102,241,0.2)',
    tag: null,
    tagColor: '',
  },
  {
    to: '/trial',
    label: 'Trial Command Center',
    desc: 'Practice against AI judge, witnesses & jury',
    icon: Swords,
    gradient: 'from-orange-600 to-red-600',
    glow: 'rgba(234,88,12,0.2)',
    tag: 'AI Battle',
    tagColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
  {
    to: '/deadlines',
    label: 'Deadline Tracker',
    desc: 'Never miss a filing deadline or SOL',
    icon: Clock,
    gradient: 'from-yellow-600 to-amber-600',
    glow: 'rgba(202,138,4,0.2)',
    tag: null,
    tagColor: '',
  },
  {
    to: '/conflict-checker',
    label: 'Conflict Checker',
    desc: 'ABA Rules conflict analysis & waiver generation',
    icon: Shield,
    gradient: 'from-amber-600 to-orange-600',
    glow: 'rgba(217,119,6,0.2)',
    tag: null,
    tagColor: '',
  },
  {
    to: '/cases',
    label: 'Case Manager',
    desc: 'Track all cases, parties, notes & billing',
    icon: FolderOpen,
    gradient: 'from-slate-600 to-slate-700',
    glow: 'rgba(71,85,105,0.2)',
    tag: null,
    tagColor: '',
  },
  {
    to: '/legal-secretary',
    label: 'AI Legal Secretary',
    desc: 'Embeddable AI intake chatbot for your website',
    icon: MessageSquare,
    gradient: 'from-pink-600 to-rose-600',
    glow: 'rgba(219,39,119,0.2)',
    tag: 'Lead Gen',
    tagColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  },
];

const STATS = [
  { label: 'AI Modules', value: '9', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10', sub: 'All Gemini-powered' },
  { label: 'Time Saved', value: '10h+', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10', sub: 'Per case, on average' },
  { label: 'Trial Modes', value: '8', icon: Swords, color: 'text-orange-400', bg: 'bg-orange-500/10', sub: 'Judge, witness & jury' },
  { label: 'State SOLs', value: '50+', icon: BarChart2, color: 'text-violet-400', bg: 'bg-violet-500/10', sub: 'Deadline database' },
];

const QUICK_ACTIONS = [
  { to: '/intake', label: 'New Client Intake', icon: UserPlus, color: 'text-violet-400' },
  { to: '/deadlines', label: 'Add Deadline', icon: Clock, color: 'text-yellow-400' },
  { to: '/documents', label: 'Analyze Document', icon: FileSearch, color: 'text-blue-400' },
  { to: '/research', label: 'Research a Case', icon: BookOpen, color: 'text-indigo-400' },
];

const RECENT_ACTIVITY = [
  { action: 'New case opened', detail: 'Smith v. ABC Corp', time: '2h ago', icon: FolderOpen, color: 'text-blue-400' },
  { action: 'SOL deadline added', detail: 'Jones v. City — 89 days remaining', time: '4h ago', icon: AlertTriangle, color: 'text-yellow-400' },
  { action: 'Document analyzed', detail: 'Police report — 3 key findings', time: '1d ago', icon: FileSearch, color: 'text-emerald-400' },
  { action: 'Conflict check passed', detail: 'Williams family matter', time: '2d ago', icon: CheckCircle2, color: 'text-green-400' },
];

export default function Dashboard() {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 p-6 md:p-8"
        style={{ background: 'linear-gradient(135deg, #0d1526 0%, #1a1040 50%, #0d1526 100%)' }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #3b82f6 0%, transparent 60%), radial-gradient(circle at 70% 50%, #8b5cf6 0%, transparent 60%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
                <Scale className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">CaseBuddy AI</h1>
                <p className="text-slate-400 text-sm">Your all-in-one AI legal intelligence platform</p>
              </div>
            </div>
            <p className="text-slate-400 mt-3 max-w-lg text-sm leading-relaxed">
              From intake to verdict — AI-powered tools built for attorneys who win.
              Powered by <span className="text-blue-400 font-medium">Gemini 2.5 Flash</span>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map(({ to, label, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-xs font-medium transition-all"
              >
                <Icon size={13} className={color} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={15} className={color} />
              </div>
              <Activity size={12} className="text-slate-600" />
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-white text-sm font-medium">{label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">AI Modules</h2>
          <span className="text-xs text-slate-500">{MODULES.length} tools available</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODULES.map(({ to, label, desc, icon: Icon, gradient, glow, tag, tagColor }) => (
            <Link
              key={to}
              to={to}
              onMouseEnter={() => setHoveredModule(to)}
              onMouseLeave={() => setHoveredModule(null)}
              className="group relative bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-all card-hover overflow-hidden"
              style={{ boxShadow: hoveredModule === to ? `0 0 20px ${glow}` : 'none' }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <Icon className="text-white" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">{label}</span>
                    {tag && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tagColor}`}>
                        {tag}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs text-slate-500 group-hover:text-blue-400 transition-colors">
                <span>Open</span>
                <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom row: Recent activity + Tip */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Activity size={14} className="text-blue-400" /> Recent Activity
          </h3>
          <div className="space-y-2">
            {RECENT_ACTIVITY.map(({ action, detail, time, icon: Icon, color }, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-700/40 last:border-0">
                <div className="w-7 h-7 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={13} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-300 text-xs font-medium">{action}</div>
                  <div className="text-slate-500 text-xs truncate">{detail}</div>
                </div>
                <div className="text-slate-600 text-xs whitespace-nowrap">{time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro tip / Getting started */}
        <div className="bg-gradient-to-br from-blue-900/30 to-violet-900/20 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} className="text-yellow-400" />
            <h3 className="text-white font-semibold text-sm">Getting Started</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { step: '1', text: 'Run AI Intake to create your first case file automatically', to: '/intake' },
              { step: '2', text: 'Upload any document to Document Lab for instant analysis', to: '/documents' },
              { step: '3', text: 'Add your SOL deadline in Deadlines & SOL', to: '/deadlines' },
              { step: '4', text: 'Practice cross-examination in Trial Command Center', to: '/trial' },
            ].map(({ step, text, to }) => (
              <Link key={step} to={to} className="flex items-start gap-2.5 group">
                <div className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-blue-400">{step}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed group-hover:text-slate-300 transition-colors">{text}</p>
                <ChevronRight size={12} className="text-slate-600 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors" />
              </Link>
            ))}
          </div>
          <Link
            to="/video-tour"
            className="mt-4 flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Watch the full product tour
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
