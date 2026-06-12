import React, { useState } from 'react';
import {
  Scale, FolderOpen, UserPlus, FileSearch, Microscope, Swords,
  BookOpen, Clock, BarChart2, AlertTriangle, Shield,
  Gavel, MessageSquare, Store, Globe2, ArrowRight,
  ChevronRight, Activity, CheckCircle2, Users, Calculator,
  Bell, Search, Film, PlayCircle, Sparkles, Home, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mirrors the department structure in App.tsx
const DEPARTMENTS_OVERVIEW = [
  {
    id: 'civil-rights',
    name: 'Civil Rights Division',
    emoji: '✊',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    glow: 'rgba(239,68,68,0.15)',
    persona: 'Rex',
    personaRole: 'Lead Civil Rights Attorney',
    desc: '§1983 · Police Misconduct · FOIA · First Amendment',
    tools: ['Settlement Calculator', 'FOIA Engine', 'Docket Monitor', 'Video Evidence', 'Legal Research', 'Trial Center'],
    links: [
      { to: '/settlement', label: 'Settlement Calc', icon: Calculator },
      { to: '/foia',       label: 'FOIA Engine',     icon: Search },
      { to: '/trial',      label: 'Trial Center',    icon: Swords },
    ],
    cases: 4,
    alerts: 2,
  },
  {
    id: 'litigation',
    name: 'Litigation Department',
    emoji: '⚖️',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    glow: 'rgba(139,92,246,0.15)',
    persona: 'Max',
    personaRole: 'Lead Litigator',
    desc: 'Motions · Pleadings · Discovery · E-Filing · Courtroom',
    tools: ['Document Lab', 'Discovery Miner', 'Trial Center', 'E-Filing', 'Legal Research'],
    links: [
      { to: '/documents',  label: 'Document Lab',  icon: FileSearch },
      { to: '/discovery',  label: 'Discovery',     icon: Microscope },
      { to: '/e-filing',   label: 'E-Filing',      icon: Gavel },
    ],
    cases: 6,
    alerts: 1,
  },
  {
    id: 'client-services',
    name: 'Client Services',
    emoji: '🤝',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'rgba(16,185,129,0.15)',
    persona: 'Sierra',
    personaRole: 'Client Relations Director',
    desc: 'Intake · Client Portal · AI Secretary · Lead Gen',
    tools: ['AI Intake', 'Client Portal', 'Public Intake', 'AI Legal Secretary'],
    links: [
      { to: '/intake',          label: 'AI Intake',     icon: UserPlus },
      { to: '/client-portal',   label: 'Client Portal', icon: Home },
      { to: '/legal-secretary', label: 'AI Secretary',  icon: MessageSquare },
    ],
    cases: 3,
    alerts: 5,
  },
  {
    id: 'research',
    name: 'Research & Intelligence',
    emoji: '🔬',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    glow: 'rgba(6,182,212,0.15)',
    persona: 'Lex',
    personaRole: 'Senior Research Counsel',
    desc: 'Case Law · Statutes · Precedent · Docket Intelligence',
    tools: ['Legal Research Hub', 'Docket Monitor', 'FOIA Engine', 'Discovery Miner'],
    links: [
      { to: '/research',       label: 'Research Hub',   icon: BookOpen },
      { to: '/docket-monitor', label: 'Docket Monitor', icon: Bell },
      { to: '/foia',           label: 'FOIA Engine',    icon: Search },
    ],
    cases: 2,
    alerts: 3,
  },
  {
    id: 'evidence-tech',
    name: 'Evidence & Technology',
    emoji: '🎥',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    glow: 'rgba(249,115,22,0.15)',
    persona: 'Doc',
    personaRole: 'Chief Evidence Officer',
    desc: 'Video Evidence · Document Analysis · Digital Forensics',
    tools: ['Video Evidence Pipeline', 'Document Lab', 'Discovery Miner', 'E-Filing'],
    links: [
      { to: '/youtube-evidence', label: 'Video Evidence', icon: Film },
      { to: '/documents',        label: 'Document Lab',   icon: FileSearch },
      { to: '/discovery',        label: 'Discovery',      icon: Microscope },
    ],
    cases: 3,
    alerts: 0,
  },
  {
    id: 'biz-dev',
    name: 'Business Development',
    emoji: '📈',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    glow: 'rgba(236,72,153,0.15)',
    persona: 'Sierra',
    personaRole: 'Business Development Director',
    desc: 'Marketing · SEO · Marketplace · Lead Generation',
    tools: ['Marketplace', 'SEO Generator', 'AI Legal Secretary', 'Product Tour'],
    links: [
      { to: '/marketplace', label: 'Marketplace', icon: Store },
      { to: '/seo-pages',   label: 'SEO Gen',     icon: Globe2 },
      { to: '/video-tour',  label: 'Product Tour', icon: PlayCircle },
    ],
    cases: 0,
    alerts: 0,
  },
];

const AGENTS_MINI = [
  { name: 'Sierra', avatar: '👋', color: 'text-violet-400' },
  { name: 'Maya',   avatar: '⚖️', color: 'text-blue-400' },
  { name: 'Lex',    avatar: '📚', color: 'text-cyan-400' },
  { name: 'Doc',    avatar: '🔬', color: 'text-emerald-400' },
  { name: 'Max',    avatar: '✍️', color: 'text-indigo-400' },
  { name: 'Sol',    avatar: '⏰', color: 'text-yellow-400' },
  { name: 'Rex',    avatar: '🦁', color: 'text-orange-400' },
  { name: 'Jules',  avatar: '👥', color: 'text-pink-400' },
  { name: 'Claude', avatar: '🛡️', color: 'text-slate-300' },
];

const FIRM_STATS = [
  { label: 'Active Cases',  value: '18', icon: FolderOpen,  color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  { label: 'AI Agents',     value: '9',  icon: Users,       color: 'text-violet-400',  bg: 'bg-violet-500/10' },
  { label: 'Departments',   value: '6',  icon: BarChart2,   color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Open Alerts',   value: '11', icon: Bell,        color: 'text-red-400',     bg: 'bg-red-500/10' },
];

const RECENT_ACTIVITY = [
  { action: 'War Room pipeline complete', detail: 'Shumpert v. Oxford — all 9 agents', time: '5m ago', icon: Users, color: 'text-violet-400' },
  { action: 'FOIA deadline approaching', detail: 'OPD — 3 days to respond or appeal', time: '1h ago', icon: AlertTriangle, color: 'text-yellow-400' },
  { action: 'New case opened', detail: 'Smith v. ABC Corp — Civil Rights', time: '2h ago', icon: FolderOpen, color: 'text-blue-400' },
  { action: 'Settlement calculated', detail: 'Shumpert — range $580K–$1.2M', time: '1d ago', icon: Calculator, color: 'text-emerald-400' },
];

export default function Dashboard() {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);

  const totalAlerts = DEPARTMENTS_OVERVIEW.reduce((s, d) => s + d.alerts, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Firm header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 p-5 md:p-7"
        style={{ background: 'linear-gradient(135deg, #0d1526 0%, #130d26 50%, #0d1526 100%)' }}>
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 55%), radial-gradient(circle at 80% 40%, #8b5cf6 0%, transparent 55%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
                <Scale className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">CaseBuddy AI</h1>
                <p className="text-slate-400 text-sm">Your Autonomous AI Law Firm · 6 Departments · 9 Agents · 23+ Tools</p>
              </div>
            </div>
            {/* Agent pills */}
            <div className="flex gap-1.5 flex-wrap mt-3">
              {AGENTS_MINI.map(a => (
                <div key={a.name} className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/40 rounded-lg px-2 py-1">
                  <span className="text-xs">{a.avatar}</span>
                  <span className={`text-[10px] font-semibold ${a.color}`}>{a.name}</span>
                </div>
              ))}
            </div>
          </div>
          {/* War Room CTA */}
          <Link to="/war-room"
            className="flex items-center gap-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-5 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-violet-500/20 whitespace-nowrap group flex-shrink-0">
            <Users size={16} className="group-hover:scale-110 transition-transform" />
            Open War Room
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── Firm stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {FIRM_STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
              <Icon size={15} className={color} />
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-slate-400 text-xs font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Department cards ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-base">Firm Departments</h2>
          <span className="text-xs text-slate-500">Click any department to open its tools</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEPARTMENTS_OVERVIEW.map(dept => (
            <div
              key={dept.id}
              onMouseEnter={() => setHoveredDept(dept.id)}
              onMouseLeave={() => setHoveredDept(null)}
              className={`relative bg-slate-800/60 border rounded-2xl overflow-hidden transition-all duration-200 ${dept.border}`}
              style={{ boxShadow: hoveredDept === dept.id ? `0 0 24px ${dept.glow}` : 'none' }}>

              {/* Dept header */}
              <div className={`px-4 py-3.5 ${dept.bg}`}
                style={{ borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-lg">{dept.emoji}</span>
                      <span className={`font-bold text-sm ${dept.color}`}>{dept.name}</span>
                    </div>
                    <p className="text-slate-500 text-[10px] leading-relaxed">{dept.desc}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                    {dept.alerts > 0 && (
                      <span className="text-[10px] font-bold bg-red-500/20 border border-red-500/30 text-red-400 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        {dept.alerts} alert{dept.alerts > 1 ? 's' : ''}
                      </span>
                    )}
                    {dept.cases > 0 && (
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">{dept.cases} cases</span>
                    )}
                  </div>
                </div>
                {/* AI persona */}
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-slate-400">{dept.persona} · {dept.personaRole}</span>
                </div>
              </div>

              {/* Quick links */}
              <div className="p-3 space-y-1">
                {dept.links.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl hover:${dept.bg} group transition-all`}>
                    <Icon size={13} className={`${dept.color} flex-shrink-0`} />
                    <span className="text-slate-300 text-xs group-hover:text-white transition-colors flex-1">{label}</span>
                    <ChevronRight size={11} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Activity size={13} className="text-blue-400" /> Recent Firm Activity
          </h3>
          <div className="space-y-2">
            {RECENT_ACTIVITY.map(({ action, detail, time, icon: Icon, color }, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-700/40 last:border-0">
                <div className="w-7 h-7 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={12} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-200 text-xs font-medium">{action}</div>
                  <div className="text-slate-500 text-xs truncate">{detail}</div>
                </div>
                <div className="text-slate-600 text-xs whitespace-nowrap">{time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* War Room + quick start */}
        <div className="bg-gradient-to-br from-violet-900/25 to-blue-900/15 border border-violet-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-violet-400" />
            <h3 className="text-white font-semibold text-sm">Quick Start — War Room Pipeline</h3>
          </div>
          <div className="space-y-2 mb-4">
            {[
              { n: '1', text: 'Load a case → click Run Full Pipeline', color: 'text-violet-400 bg-violet-600/25 border-violet-500/40' },
              { n: '2', text: 'All 9 agents analyze in sequence automatically', color: 'text-blue-400 bg-blue-600/25 border-blue-500/40' },
              { n: '3', text: 'Review each agent — ask follow-up questions', color: 'text-cyan-400 bg-cyan-600/25 border-cyan-500/40' },
              { n: '4', text: 'Export the full report for your case file', color: 'text-emerald-400 bg-emerald-600/25 border-emerald-500/40' },
            ].map(({ n, text, color }) => (
              <div key={n} className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${color}`}>{n}</div>
                <span className="text-slate-400 text-xs">{text}</span>
              </div>
            ))}
          </div>
          <Link to="/war-room"
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white py-2.5 rounded-xl text-sm font-bold transition-colors w-full">
            <Users size={14} /> Launch War Room
          </Link>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { to: '/intake',   label: 'Intake',    icon: UserPlus },
              { to: '/deadlines',label: 'Deadlines', icon: Clock },
              { to: '/research', label: 'Research',  icon: BookOpen },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className="flex flex-col items-center gap-1 bg-slate-800/60 border border-slate-700/40 hover:border-slate-600 rounded-xl p-2.5 transition-all group">
                <Icon size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-slate-500 text-[10px] group-hover:text-slate-300 transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
