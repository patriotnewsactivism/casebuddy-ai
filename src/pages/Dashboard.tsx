import React, { useState } from 'react';
import {
  Scale, FolderOpen, UserPlus, FileSearch, Microscope, Swords,
  BookOpen, Clock, BarChart2, TrendingUp, AlertTriangle, Shield,
  Gavel, MessageSquare, Store, Globe2, ArrowRight, Zap, Star,
  ChevronRight, Activity, CheckCircle2, Users, DollarSign,
  Bell, Search, Film, Calculator, Play, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AGENTS_MINI = [
  { name: 'Sierra', avatar: '👋', role: 'Intake' },
  { name: 'Maya',   avatar: '⚖️', role: 'Strategy' },
  { name: 'Lex',    avatar: '📚', role: 'Research' },
  { name: 'Doc',    avatar: '🔬', role: 'Discovery' },
  { name: 'Max',    avatar: '✍️', role: 'Drafting' },
  { name: 'Sol',    avatar: '⏰', role: 'Deadlines' },
  { name: 'Rex',    avatar: '🦁', role: 'Trial' },
  { name: 'Jules',  avatar: '👥', role: 'Jury Sim' },
  { name: 'Claude', avatar: '🛡️', role: 'Ethics' },
];

const MODULES = [
  {
    to: '/intake',
    label: 'AI Intake',
    desc: 'Smart client intake with Sierra, your AI paralegal',
    icon: UserPlus,
    gradient: 'from-violet-600 to-purple-700',
    glow: 'rgba(139,92,246,0.2)',
    tag: 'AI',
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
  {
    to: '/settlement',
    label: 'Settlement Calculator',
    desc: '§1983 valuation with real comparable verdicts',
    icon: Calculator,
    gradient: 'from-emerald-600 to-green-700',
    glow: 'rgba(5,150,105,0.2)',
    tag: null,
    tagColor: '',
  },
  {
    to: '/foia',
    label: 'FOIA Engine',
    desc: 'Generate, track & appeal government records requests',
    icon: Search,
    gradient: 'from-cyan-600 to-teal-700',
    glow: 'rgba(8,145,178,0.2)',
    tag: 'AI',
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  {
    to: '/docket-monitor',
    label: 'Docket Monitor',
    desc: 'Watch your cases and similar rulings for key alerts',
    icon: Bell,
    gradient: 'from-blue-600 to-indigo-700',
    glow: 'rgba(37,99,235,0.2)',
    tag: null,
    tagColor: '',
  },
];

const STATS = [
  { label: 'AI Agents', value: '9',    icon: Users,    color: 'text-violet-400', bg: 'bg-violet-500/10', sub: 'Specialist personas' },
  { label: 'Tools',     value: '23+',  icon: Zap,      color: 'text-blue-400',   bg: 'bg-blue-500/10',   sub: 'Fully integrated' },
  { label: 'Time Saved', value: '15h+', icon: Clock,   color: 'text-emerald-400',bg: 'bg-emerald-500/10',sub: 'Per week on average' },
  { label: 'Comparables', value: '15', icon: BarChart2, color: 'text-orange-400',bg: 'bg-orange-500/10', sub: 'Real §1983 verdicts' },
];

const QUICK_ACTIONS = [
  { to: '/war-room', label: 'Open War Room', icon: Users, color: 'text-violet-400' },
  { to: '/intake',   label: 'New Intake',   icon: UserPlus, color: 'text-purple-400' },
  { to: '/deadlines',label: 'Add Deadline', icon: Clock,    color: 'text-yellow-400' },
  { to: '/documents',label: 'Analyze Doc',  icon: FileSearch, color: 'text-blue-400' },
];

const RECENT_ACTIVITY = [
  { action: 'War Room pipeline complete', detail: 'Shumpert v. City of Oxford — all 9 agents', time: 'just now', icon: Users, color: 'text-violet-400' },
  { action: 'New case opened', detail: 'Smith v. ABC Corp — §1983 excessive force', time: '2h ago', icon: FolderOpen, color: 'text-blue-400' },
  { action: 'SOL deadline flagged', detail: 'Jones v. City — 89 days remaining', time: '4h ago', icon: AlertTriangle, color: 'text-yellow-400' },
  { action: 'Settlement calculated', detail: 'Shumpert — range $580K–$1.2M', time: '1d ago', icon: Calculator, color: 'text-emerald-400' },
];

export default function Dashboard() {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── War Room Hero Banner ── */}
      <Link to="/war-room" className="block group">
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 p-6 md:p-7 cursor-pointer hover:border-violet-500/60 transition-all"
          style={{ background: 'linear-gradient(135deg, #0d0820 0%, #150d30 40%, #0d1526 100%)' }}>
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(circle at 85% 30%, rgba(245,158,11,0.1) 0%, transparent 50%)' }} />
          {/* Animated particles */}
          <div className="absolute top-4 right-12 w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse opacity-60" />
          <div className="absolute top-8 right-24 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-6 right-16 w-1 h-1 bg-amber-400 rounded-full animate-pulse opacity-50" style={{ animationDelay: '1s' }} />

          <div className="relative flex flex-col md:flex-row md:items-center gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Live — All 9 Agents Ready</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">⚔️ AI War Room</h1>
              <p className="text-slate-400 text-sm mb-3 max-w-lg">
                Run the Full Pipeline — all 9 specialist agents analyze your case in sequence: intake → strategy → research → discovery → drafting → deadlines → trial prep → jury simulation → ethics check.
              </p>
              {/* Agent avatars */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {AGENTS_MINI.map(a => (
                  <div key={a.name} className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/40 rounded-lg px-2 py-1">
                    <span className="text-xs">{a.avatar}</span>
                    <span className="text-slate-400 text-[10px] font-medium">{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2 bg-violet-600 group-hover:bg-violet-500 text-white px-6 py-3.5 rounded-2xl font-bold text-base transition-all shadow-lg shadow-violet-500/20">
                <Play size={18} className="group-hover:scale-110 transition-transform" />
                Open War Room
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </Link>

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

      {/* Quick actions */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_ACTIONS.map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-medium transition-all">
            <Icon size={13} className={color} />
            {label}
          </Link>
        ))}
      </div>

      {/* Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">All Tools</h2>
          <span className="text-xs text-slate-500">{MODULES.length} modules available</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODULES.map(({ to, label, desc, icon: Icon, gradient, glow, tag, tagColor }) => (
            <Link key={to} to={to}
              onMouseEnter={() => setHoveredModule(to)}
              onMouseLeave={() => setHoveredModule(null)}
              className="group relative bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-all overflow-hidden"
              style={{ boxShadow: hoveredModule === to ? `0 0 20px ${glow}` : 'none' }}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <Icon className="text-white" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">{label}</span>
                    {tag && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tagColor}`}>{tag}</span>
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

      {/* Bottom row */}
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

        {/* Getting started / War Room CTA */}
        <div className="bg-gradient-to-br from-violet-900/30 to-blue-900/20 border border-violet-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-violet-400" />
            <h3 className="text-white font-semibold text-sm">Recommended Workflow</h3>
          </div>
          <div className="space-y-2.5 mb-4">
            {[
              { step: '1', text: 'Open the War Room and load a case — or use the demo', to: '/war-room', color: 'text-violet-400 bg-violet-600/30 border-violet-500/40' },
              { step: '2', text: 'Click "Run Full Pipeline" — all 9 agents analyze in sequence', to: '/war-room', color: 'text-blue-400 bg-blue-600/30 border-blue-500/40' },
              { step: '3', text: 'Review each agent\'s output — ask follow-up questions', to: '/war-room', color: 'text-cyan-400 bg-cyan-600/30 border-cyan-500/40' },
              { step: '4', text: 'Export the full War Room report for your case file', to: '/war-room', color: 'text-emerald-400 bg-emerald-600/30 border-emerald-500/40' },
            ].map(({ step, text, to, color }) => (
              <Link key={step} to={to} className="flex items-start gap-2.5 group">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
                  <span className="text-[10px] font-bold">{step}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed group-hover:text-slate-300 transition-colors">{text}</p>
                <ChevronRight size={12} className="text-slate-600 group-hover:text-violet-400 flex-shrink-0 mt-0.5 transition-colors" />
              </Link>
            ))}
          </div>
          <Link to="/war-room"
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors w-full">
            <Users size={14} /> Launch War Room
          </Link>
        </div>
      </div>
    </div>
  );
}
