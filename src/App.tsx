import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';

// Pages
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import IntakePage from './pages/IntakePage';
import DocumentLab from './pages/DocumentLab';
import DiscoveryMiner from './pages/DiscoveryMiner';
import TrialCenter from './pages/TrialCenter';
import LegalResearchHub from './pages/LegalResearchHub';
import DeadlinesAndSol from './pages/DeadlinesAndSol';
import ConflictChecker from './pages/ConflictChecker';
import EFiling from './pages/EFiling';
import LegalSecretary from './pages/LegalSecretary';
import Marketplace from './pages/Marketplace';
import ProductTour from './pages/ProductTour';
import SeoPages from './pages/SeoPages';
import WarRoom from './pages/WarRoom';
import SettlementCalculator from './pages/SettlementCalculator';
import FoiaEngine from './pages/FoiaEngine';
import DocketMonitor from './pages/DocketMonitor';
import VideoEvidencePipeline from './pages/VideoEvidencePipeline';
import ClientPortal from './pages/ClientPortal';
import Login from './pages/Login';
import PublicIntake from './pages/PublicIntake';

// Components
import PwaInstall from './components/PwaInstall';
import { useAuth } from './hooks/AuthProvider';
import OnboardingFlow from './components/OnboardingFlow';

import {
  Scale, FolderOpen, UserPlus, FileSearch, Microscope, Swords,
  BookOpen, Clock, Menu, Shield, Gavel, MessageSquare, Store,
  PlayCircle, Globe2, ChevronDown, ChevronRight, X, Sparkles,
  Bell, Search, Calculator, Film, Users, Building2, Briefcase,
  Heart, Landmark, HandshakeIcon, Home, Zap, Star, BarChart2,
  DollarSign, FlaskConical, Vote, AlertCircle
} from 'lucide-react';

// ── Department definitions ────────────────────────────────────────────────────
interface DeptItem {
  to: string;
  label: string;
  icon: any;
  badge?: string;
}

interface Department {
  id: string;
  name: string;       // Full name e.g. "Civil Rights Division"
  short: string;      // Short e.g. "Civil Rights"
  emoji: string;
  color: string;      // Tailwind text color
  activeBg: string;   // Active nav bg
  activeBorder: string;
  headerGradient: string;
  persona: string;    // Lead AI agent name
  personaRole: string;
  description: string;
  items: DeptItem[];
}

const DEPARTMENTS: Department[] = [
  // ── 0. Command Center (firm-wide) ──────────────────────────────────────────
  {
    id: 'command',
    name: 'Command Center',
    short: 'Command',
    emoji: '🏛️',
    color: 'text-blue-400',
    activeBg: 'bg-blue-500/15',
    activeBorder: 'border-blue-500/40',
    headerGradient: 'from-blue-900/40 to-slate-900',
    persona: 'Maya',
    personaRole: 'Managing Partner',
    description: 'Firm-wide pipeline, case manager, AI War Room, and client intake',
    items: [
      { to: '/',          label: 'Dashboard',        icon: BarChart2 },
      { to: '/war-room',  label: '⚔️ AI War Room',   icon: Users,    badge: 'HOT' },
      { to: '/cases',     label: 'Case Manager',      icon: FolderOpen },
      { to: '/intake',    label: 'AI Intake',         icon: UserPlus, badge: 'AI' },
      { to: '/deadlines', label: 'Deadlines & SOL',   icon: Clock },
      { to: '/conflict-checker', label: 'Conflict Checker', icon: Shield },
    ],
  },

  // ── 1. Civil Rights Division ───────────────────────────────────────────────
  {
    id: 'civil-rights',
    name: 'Civil Rights Division',
    short: 'Civil Rights',
    emoji: '✊',
    color: 'text-red-400',
    activeBg: 'bg-red-500/15',
    activeBorder: 'border-red-500/40',
    headerGradient: 'from-red-900/30 to-slate-900',
    persona: 'Rex',
    personaRole: 'Lead Civil Rights Attorney',
    description: '§1983 claims, police misconduct, First Amendment, FOIA, and government accountability',
    items: [
      { to: '/settlement',      label: 'Settlement Calculator', icon: Calculator, badge: 'AI' },
      { to: '/foia',            label: 'FOIA Engine',           icon: Search,     badge: 'AI' },
      { to: '/docket-monitor',  label: 'Docket Monitor',        icon: Bell },
      { to: '/youtube-evidence',label: 'Video Evidence',        icon: Film,       badge: 'AI' },
      { to: '/research',        label: 'Legal Research',        icon: BookOpen,   badge: 'AI' },
      { to: '/trial',           label: 'Trial Command Center',  icon: Swords,     badge: 'AI' },
    ],
  },

  // ── 2. Litigation Department ──────────────────────────────────────────────
  {
    id: 'litigation',
    name: 'Litigation Department',
    short: 'Litigation',
    emoji: '⚖️',
    color: 'text-violet-400',
    activeBg: 'bg-violet-500/15',
    activeBorder: 'border-violet-500/40',
    headerGradient: 'from-violet-900/30 to-slate-900',
    persona: 'Max',
    personaRole: 'Lead Litigator',
    description: 'Motions, pleadings, discovery, e-filing, and courtroom strategy across all practice areas',
    items: [
      { to: '/documents',  label: 'Document Lab',          icon: FileSearch,  badge: 'AI' },
      { to: '/discovery',  label: 'Discovery Miner',       icon: Microscope,  badge: 'AI' },
      { to: '/trial',      label: 'Trial Command Center',  icon: Swords,      badge: 'AI' },
      { to: '/e-filing',   label: 'E-Filing & Records',    icon: Gavel },
      { to: '/research',   label: 'Legal Research',        icon: BookOpen,    badge: 'AI' },
    ],
  },

  // ── 3. Client Services ────────────────────────────────────────────────────
  {
    id: 'client-services',
    name: 'Client Services',
    short: 'Clients',
    emoji: '🤝',
    color: 'text-emerald-400',
    activeBg: 'bg-emerald-500/15',
    activeBorder: 'border-emerald-500/40',
    headerGradient: 'from-emerald-900/30 to-slate-900',
    persona: 'Sierra',
    personaRole: 'Client Relations Director',
    description: 'Client portal, public intake, AI legal secretary, and lead generation',
    items: [
      { to: '/intake',           label: 'AI Intake',          icon: UserPlus,     badge: 'AI' },
      { to: '/client-portal',    label: 'Client Portal',      icon: Home },
      { to: '/public-intake',    label: 'Public Intake Form', icon: Globe2 },
      { to: '/legal-secretary',  label: 'AI Legal Secretary', icon: MessageSquare, badge: 'AI' },
    ],
  },

  // ── 4. Research & Intelligence ─────────────────────────────────────────────
  {
    id: 'research',
    name: 'Research & Intelligence',
    short: 'Research',
    emoji: '🔬',
    color: 'text-cyan-400',
    activeBg: 'bg-cyan-500/15',
    activeBorder: 'border-cyan-500/40',
    headerGradient: 'from-cyan-900/30 to-slate-900',
    persona: 'Lex',
    personaRole: 'Senior Research Counsel',
    description: 'Case law, statutes, precedent analysis, docket intelligence, and strategic research',
    items: [
      { to: '/research',        label: 'Legal Research Hub', icon: BookOpen,  badge: 'AI' },
      { to: '/docket-monitor',  label: 'Docket Monitor',     icon: Bell },
      { to: '/foia',            label: 'FOIA Engine',        icon: Search,    badge: 'AI' },
      { to: '/discovery',       label: 'Discovery Miner',    icon: Microscope, badge: 'AI' },
    ],
  },

  // ── 5. Evidence & Technology ───────────────────────────────────────────────
  {
    id: 'evidence-tech',
    name: 'Evidence & Technology',
    short: 'Evidence',
    emoji: '🎥',
    color: 'text-orange-400',
    activeBg: 'bg-orange-500/15',
    activeBorder: 'border-orange-500/40',
    headerGradient: 'from-orange-900/30 to-slate-900',
    persona: 'Doc',
    personaRole: 'Chief Evidence Officer',
    description: 'Video evidence pipeline, document analysis, digital forensics, and e-filing',
    items: [
      { to: '/youtube-evidence', label: 'Video Evidence Pipeline', icon: Film,       badge: 'AI' },
      { to: '/documents',        label: 'Document Lab',            icon: FileSearch, badge: 'AI' },
      { to: '/discovery',        label: 'Discovery Miner',         icon: Microscope, badge: 'AI' },
      { to: '/e-filing',         label: 'E-Filing & Records',      icon: Gavel },
    ],
  },

  // ── 6. Business Development ───────────────────────────────────────────────
  {
    id: 'biz-dev',
    name: 'Business Development',
    short: 'Biz Dev',
    emoji: '📈',
    color: 'text-pink-400',
    activeBg: 'bg-pink-500/15',
    activeBorder: 'border-pink-500/40',
    headerGradient: 'from-pink-900/30 to-slate-900',
    persona: 'Sierra',
    personaRole: 'Business Development Director',
    description: 'Marketing, SEO, marketplace, product tour, and lead generation tools',
    items: [
      { to: '/marketplace',    label: 'Marketplace',        icon: Store },
      { to: '/seo-pages',      label: 'SEO Page Generator', icon: Globe2,    badge: 'AI' },
      { to: '/legal-secretary',label: 'AI Legal Secretary', icon: MessageSquare, badge: 'AI' },
      { to: '/video-tour',     label: 'Product Tour',       icon: PlayCircle },
    ],
  },
];

// Page title lookup
const PAGE_TITLES: Record<string, { title: string; subtitle: string; dept?: string }> = {
  '/':                  { title: 'Dashboard',               subtitle: 'Firm-wide overview', dept: 'Command Center' },
  '/war-room':          { title: '⚔️ AI War Room',           subtitle: '9-agent orchestration — intake to verdict', dept: 'Command Center' },
  '/cases':             { title: 'Case Manager',             subtitle: 'All active matters', dept: 'Command Center' },
  '/intake':            { title: 'AI Intake',                subtitle: 'Smart client intake — Sierra', dept: 'Client Services' },
  '/deadlines':         { title: 'Deadlines & SOL',          subtitle: 'Never miss a critical date', dept: 'Command Center' },
  '/documents':         { title: 'Document Lab',             subtitle: 'AI-powered document analysis — Doc', dept: 'Litigation' },
  '/discovery':         { title: 'Discovery Miner',          subtitle: 'Smoking guns across documents', dept: 'Litigation' },
  '/research':          { title: 'Legal Research Hub',       subtitle: 'Case law & statutes — Lex', dept: 'Research & Intelligence' },
  '/conflict-checker':  { title: 'Conflict Checker',         subtitle: 'ABA Rules compliance', dept: 'Command Center' },
  '/e-filing':          { title: 'E-Filing & Records',       subtitle: 'Court access & PACER', dept: 'Litigation' },
  '/trial':             { title: 'Trial Command Center',     subtitle: 'AI judge, witnesses & jury — Rex', dept: 'Litigation' },
  '/legal-secretary':   { title: 'AI Legal Secretary',       subtitle: 'Embeddable intake widget', dept: 'Client Services' },
  '/marketplace':       { title: 'Marketplace',              subtitle: 'Templates & strategy guides', dept: 'Business Development' },
  '/seo-pages':         { title: 'SEO Page Generator',       subtitle: 'AI-generated practice area pages', dept: 'Business Development' },
  '/video-tour':        { title: 'Product Tour',             subtitle: 'See everything CaseBuddy can do', dept: 'Business Development' },
  '/settlement':        { title: 'Settlement Calculator',    subtitle: '§1983 valuation & comparable verdicts', dept: 'Civil Rights' },
  '/foia':              { title: 'FOIA Engine',              subtitle: 'Generate, track & appeal records requests', dept: 'Civil Rights' },
  '/docket-monitor':    { title: 'Docket Monitor',           subtitle: 'Case alerts & precedent watching', dept: 'Civil Rights' },
  '/youtube-evidence':  { title: 'Video Evidence Pipeline',  subtitle: 'Index & analyze video with AI', dept: 'Evidence & Technology' },
  '/client-portal':     { title: 'Client Portal',            subtitle: 'Secure client messaging & updates', dept: 'Client Services' },
  '/public-intake':     { title: 'Public Intake Form',       subtitle: 'Embedded intake for your website', dept: 'Client Services' },
};

// ── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [activeDept, setActiveDept] = useState('command');
  const location = useLocation();

  // Auto-highlight dept based on current route
  React.useEffect(() => {
    for (const dept of DEPARTMENTS) {
      if (dept.items.some(item => item.to === location.pathname)) {
        setActiveDept(dept.id);
        return;
      }
    }
  }, [location.pathname]);

  const dept = DEPARTMENTS.find(d => d.id === activeDept) || DEPARTMENTS[0];

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setOpen(false)} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex transform transition-transform duration-200 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ width: '260px', background: 'linear-gradient(180deg, #0d1526 0%, #080c18 100%)', borderRight: '1px solid rgba(51,65,85,0.4)' }}>

        {/* ── Logo ── */}
        <div className="absolute top-0 left-0 right-0 flex items-center gap-3 px-4 py-4 z-10"
          style={{ borderBottom: '1px solid rgba(51,65,85,0.3)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
            <Scale className="text-white" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm leading-tight">CaseBuddy AI</div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">AI Law Firm</div>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto text-slate-500 hover:text-white md:hidden">
            <X size={18} />
          </button>
        </div>

        <div className="flex h-full pt-16">
          {/* ── Department tab strip (left column) ── */}
          <div className="w-14 flex-shrink-0 flex flex-col items-center pt-2 pb-4 gap-1 overflow-y-auto scrollbar-hide"
            style={{ borderRight: '1px solid rgba(51,65,85,0.3)' }}>
            {DEPARTMENTS.map(d => (
              <button
                key={d.id}
                onClick={() => setActiveDept(d.id)}
                title={d.name}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all flex-shrink-0
                  ${activeDept === d.id
                    ? `${d.activeBg} border ${d.activeBorder}`
                    : 'hover:bg-slate-800/60 text-slate-600 hover:text-slate-300'
                  }`}>
                {d.emoji}
              </button>
            ))}
          </div>

          {/* ── Department nav panel (right column) ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Dept header */}
            <div className={`px-3 py-3 bg-gradient-to-r ${dept.headerGradient}`}
              style={{ borderBottom: '1px solid rgba(51,65,85,0.3)' }}>
              <div className={`text-xs font-bold uppercase tracking-wider ${dept.color} mb-0.5`}>
                {dept.emoji} {dept.short}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">{dept.description}</div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-slate-400 font-medium">{dept.persona} · {dept.personaRole}</span>
              </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
              {dept.items.map(({ to, label, icon: Icon, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all group
                    ${isActive
                      ? `${dept.activeBg} ${dept.color} border ${dept.activeBorder}`
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                    }`
                  }>
                  <Icon size={14} className="flex-shrink-0" />
                  <span className="flex-1 truncate text-xs">{label}</span>
                  {badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${
                      badge === 'HOT' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      badge === 'AI'  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-2 pb-3" style={{ borderTop: '1px solid rgba(51,65,85,0.3)' }}>
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-3 py-2 border border-slate-700/40">
                <Sparkles size={11} className="text-blue-400 flex-shrink-0" />
                <div className="text-[10px] text-slate-500">
                  <span className="text-blue-400 font-medium">Gemini 2.5 Flash</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const info = PAGE_TITLES[location.pathname] || { title: 'CaseBuddy AI', subtitle: '', dept: '' };
  const dept = DEPARTMENTS.find(d => d.name === info.dept || d.short === info.dept);

  return (
    <header className="sticky top-0 z-10 glass border-b border-slate-700/40 px-4 md:px-6 py-3 flex items-center gap-4">
      <button onClick={onMenuClick} className="md:hidden text-slate-400 hover:text-white transition-colors">
        <Menu size={22} />
      </button>
      <div className="hidden md:flex items-center gap-3 flex-1 min-w-0">
        {dept && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${dept.activeBg} ${dept.activeBorder} ${dept.color} whitespace-nowrap`}>
            {dept.emoji} {dept.short}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-white font-semibold text-sm leading-tight truncate">{info.title}</h2>
          {info.subtitle && <p className="text-slate-500 text-xs truncate">{info.subtitle}</p>}
        </div>
      </div>
      <div className="md:hidden flex items-center gap-2">
        <Scale className="text-blue-400" size={18} />
        <span className="font-bold text-white text-sm">CaseBuddy AI</span>
      </div>
    </header>
  );
}


// ── Auth Guard ───────────────────────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If Supabase not configured, skip auth entirely (dev mode)
  const supabaseConfigured = !!(
    process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY
  );

  if (!supabaseConfigured) return <>{children}</>;
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#0a0f1e' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center animate-pulse">
            <Scale className="text-white" size={20} />
          </div>
          <div className="text-slate-400 text-sm">Loading CaseBuddy...</div>
        </div>
      </div>
    );
  }
  if (!user) {
    return <Login />;
  }
  return <>{children}</>;
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [showOnboarding, setShowOnboarding] = React.useState(() => !localStorage.getItem('cb_onboarded'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <RequireAuth>
              <div className="animate-fade-in">
              <Routes>
                <Route path="/"                  element={<Dashboard />} />
                <Route path="/war-room"          element={<WarRoom />} />
                <Route path="/cases"             element={<Cases />} />
                <Route path="/intake"            element={<IntakePage />} />
                <Route path="/deadlines"         element={<DeadlinesAndSol />} />
                <Route path="/documents"         element={<DocumentLab />} />
                <Route path="/discovery"         element={<DiscoveryMiner />} />
                <Route path="/research"          element={<LegalResearchHub />} />
                <Route path="/conflict-checker"  element={<ConflictChecker />} />
                <Route path="/e-filing"          element={<EFiling />} />
                <Route path="/trial"             element={<TrialCenter />} />
                <Route path="/legal-secretary"   element={<LegalSecretary />} />
                <Route path="/marketplace"       element={<Marketplace />} />
                <Route path="/seo-pages"         element={<SeoPages />} />
                <Route path="/video-tour"        element={<ProductTour />} />
                <Route path="/settlement"        element={<SettlementCalculator />} />
                <Route path="/foia"              element={<FoiaEngine />} />
                <Route path="/docket-monitor"    element={<DocketMonitor />} />
                <Route path="/youtube-evidence"  element={<VideoEvidencePipeline />} />
                <Route path="/client-portal"     element={<ClientPortal />} />
                <Route path="/public-intake"     element={<PublicIntake />} />
              </Routes>
            </div>
            </RequireAuth>
          </main>
        </div>
        {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}
        <PwaInstall />
      </div>
    </BrowserRouter>
  );
}
