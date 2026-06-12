import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
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
import PwaInstall from './components/PwaInstall';
import OnboardingFlow from './components/OnboardingFlow';
import {
  Scale, FolderOpen, UserPlus, FileSearch, Microscope, Swords,
  BookOpen, Clock, Menu, Shield, Gavel, MessageSquare, Store,
  PlayCircle, Globe2, ChevronDown, ChevronRight, X, Sparkles,
  Bell, Search, Calculator, Film, Users
} from 'lucide-react';

interface NavSection {
  title: string;
  items: { to: string; label: string; icon: any; badge?: string }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Core',
    items: [
      { to: '/', label: 'Dashboard', icon: Scale },
      { to: '/cases', label: 'Cases', icon: FolderOpen },
      { to: '/war-room', label: '⚔️ War Room', icon: Users, badge: 'NEW' },
      { to: '/intake', label: 'AI Intake', icon: UserPlus, badge: 'AI' },
      { to: '/deadlines', label: 'Deadlines & SOL', icon: Clock },
    ],
  },
  {
    title: 'Documents',
    items: [
      { to: '/documents', label: 'Document Lab', icon: FileSearch, badge: 'AI' },
      { to: '/discovery', label: 'Discovery Miner', icon: Microscope, badge: 'AI' },
    ],
  },
  {
    title: 'Research',
    items: [
      { to: '/research', label: 'Legal Research', icon: BookOpen, badge: 'AI' },
      { to: '/conflict-checker', label: 'Conflict Checker', icon: Shield },
      { to: '/e-filing', label: 'E-Filing & Records', icon: Gavel },
    ],
  },
  {
    title: 'Trial Prep',
    items: [
      { to: '/trial', label: 'Trial Command Center', icon: Swords, badge: 'AI' },
    ],
  },
  {
    title: 'Game Changers',
    items: [
      { to: '/settlement', label: 'Settlement Calculator', icon: Calculator, badge: 'NEW' },
      { to: '/foia', label: 'FOIA Engine', icon: Search, badge: 'AI' },
      { to: '/docket-monitor', label: 'Docket Monitor', icon: Bell },
      { to: '/youtube-evidence', label: 'YouTube Evidence', icon: Film, badge: 'AI' },
    ],
  },
  {
    title: 'Growth',
    items: [
      { to: '/legal-secretary', label: 'AI Legal Secretary', icon: MessageSquare, badge: 'AI' },
      { to: '/marketplace', label: 'Marketplace', icon: Store },
      { to: '/seo-pages', label: 'SEO Generator', icon: Globe2, badge: 'AI' },
      { to: '/video-tour', label: 'Product Tour', icon: PlayCircle },
    ],
  },
];

// Page title map for header
const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Your legal intelligence overview' },
  '/war-room': { title: '⚔️ AI War Room', subtitle: '9-agent orchestration — from intake to verdict' },
  '/cases': { title: 'Case Manager', subtitle: 'Track all active cases' },
  '/intake': { title: 'AI Intake', subtitle: 'Smart client intake with Alex, your AI paralegal' },
  '/deadlines': { title: 'Deadlines & SOL', subtitle: 'Never miss a critical date' },
  '/documents': { title: 'Document Lab', subtitle: 'AI-powered document analysis' },
  '/discovery': { title: 'Discovery Miner', subtitle: 'Uncover smoking guns across documents' },
  '/research': { title: 'Legal Research Hub', subtitle: 'Case law, statutes & strategy' },
  '/conflict-checker': { title: 'Conflict Checker', subtitle: 'ABA Rules compliant conflict analysis' },
  '/e-filing': { title: 'E-Filing & Records', subtitle: 'Court access & PACER integration' },
  '/trial': { title: 'Trial Command Center', subtitle: 'AI judge, witnesses & jury simulation' },
  '/legal-secretary': { title: 'AI Legal Secretary', subtitle: 'Embeddable AI intake chatbot' },
  '/marketplace': { title: 'Marketplace', subtitle: 'Templates, motions & strategy guides' },
  '/seo-pages': { title: 'SEO Page Generator', subtitle: 'AI-generated practice area pages' },
  '/video-tour': { title: 'Product Tour', subtitle: 'See everything CaseBuddy can do' },
  '/settlement': { title: 'Settlement Calculator', subtitle: '§1983 case valuation with real comparable verdicts' },
  '/foia': { title: 'FOIA Engine', subtitle: 'Generate, track & appeal public records requests' },
  '/docket-monitor': { title: 'Docket Monitor', subtitle: 'Watch your cases and similar rulings' },
  '/youtube-evidence': { title: 'YouTube Evidence', subtitle: 'Index video evidence with AI analysis' },

};

function Sidebar({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const toggleSection = (title: string) => setCollapsed(prev => ({ ...prev, [title]: !prev[title] }));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col transform transition-transform duration-200 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ background: 'linear-gradient(180deg, #0d1526 0%, #0a0f1e 100%)', borderRight: '1px solid rgba(51,65,85,0.5)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
            <Scale className="text-white" size={18} />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">CaseBuddy AI</div>
            <div className="text-xs text-slate-500">Legal Intelligence</div>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto text-slate-500 hover:text-white md:hidden">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_SECTIONS.map(section => (
            <div key={section.title} className="mb-1">
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-400 transition-colors"
              >
                {section.title}
                {collapsed[section.title]
                  ? <ChevronRight size={11} />
                  : <ChevronDown size={11} />}
              </button>
              {!collapsed[section.title] && (
                <div className="space-y-0.5">
                  {section.items.map(({ to, label, icon: Icon, badge }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/'}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all group
                        ${isActive
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                        }`
                      }
                    >
                      <Icon size={15} className="flex-shrink-0" />
                      <span className="flex-1 truncate">{label}</span>
                      {badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(51,65,85,0.4)' }}>
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2.5 border border-slate-700/50">
            <Sparkles size={13} className="text-blue-400 flex-shrink-0" />
            <div className="text-xs text-slate-400">
              Powered by <span className="text-blue-400 font-medium">Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'CaseBuddy AI', subtitle: '' };

  return (
    <header className="sticky top-0 z-10 glass border-b border-slate-700/40 px-4 md:px-6 py-3 flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="md:hidden text-slate-400 hover:text-white transition-colors"
      >
        <Menu size={22} />
      </button>
      {/* Desktop page title */}
      <div className="hidden md:block">
        <h2 className="text-white font-semibold text-sm leading-tight">{pageInfo.title}</h2>
        {pageInfo.subtitle && (
          <p className="text-slate-500 text-xs">{pageInfo.subtitle}</p>
        )}
      </div>
      {/* Mobile logo */}
      <div className="md:hidden flex items-center gap-2">
        <Scale className="text-blue-400" size={18} />
        <span className="font-bold text-white text-sm">CaseBuddy AI</span>
      </div>
    </header>
  );
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = React.useState(() => !localStorage.getItem('cb_onboarded'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <div className="animate-fade-in">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/war-room" element={<WarRoom />} />
                <Route path="/cases" element={<Cases />} />
                <Route path="/intake" element={<IntakePage />} />
                <Route path="/deadlines" element={<DeadlinesAndSol />} />
                <Route path="/documents" element={<DocumentLab />} />
                <Route path="/discovery" element={<DiscoveryMiner />} />
                <Route path="/research" element={<LegalResearchHub />} />
                <Route path="/conflict-checker" element={<ConflictChecker />} />
                <Route path="/e-filing" element={<EFiling />} />
                <Route path="/trial" element={<TrialCenter />} />
                <Route path="/legal-secretary" element={<LegalSecretary />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/seo-pages" element={<SeoPages />} />
                <Route path="/video-tour" element={<ProductTour />} />
                <Route path="/settlement" element={<SettlementCalculator />} />
                <Route path="/foia" element={<FoiaEngine />} />
                <Route path="/docket-monitor" element={<DocketMonitor />} />
                <Route path="/youtube-evidence" element={<VideoEvidencePipeline />} />
              </Routes>
            </div>
          </main>
        </div>
        {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}
        <PwaInstall />
      </div>
    </BrowserRouter>
  );
}
