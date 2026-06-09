import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/AuthProvider';
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
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import PublicIntake from './pages/PublicIntake';
import ClientPortal from './pages/ClientPortal';
import PwaInstall from './components/PwaInstall';
import { Scale, FolderOpen, UserPlus, FileSearch, Microscope, Swords, BookOpen, Clock, Menu, Shield, Gavel, MessageSquare, Store, PlayCircle, Globe2, ChevronDown, ChevronRight, LogOut, Users } from 'lucide-react';

interface NavSection {
  title: string;
  items: { to: string; label: string; icon: any }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Core',
    items: [
      { to: '/app', label: 'Dashboard', icon: Scale },
      { to: '/app/cases', label: 'Cases', icon: FolderOpen },
      { to: '/app/intake', label: 'AI Intake', icon: UserPlus },
      { to: '/app/deadlines', label: 'Deadlines & SOL', icon: Clock },
    ],
  },
  {
    title: 'Documents',
    items: [
      { to: '/app/documents', label: 'Document Lab', icon: FileSearch },
      { to: '/app/discovery', label: 'Discovery Miner', icon: Microscope },
    ],
  },
  {
    title: 'Research',
    items: [
      { to: '/app/research', label: 'Legal Research Hub', icon: BookOpen },
      { to: '/app/conflict-checker', label: 'Conflict Checker', icon: Shield },
      { to: '/app/e-filing', label: 'E-Filing & Records', icon: Gavel },
    ],
  },
  {
    title: 'Trial Prep',
    items: [
      { to: '/app/trial', label: 'Trial Command Center', icon: Swords },
    ],
  },
  {
    title: 'Growth & Sales',
    items: [
      { to: '/app/legal-secretary', label: 'AI Legal Secretary', icon: MessageSquare },
      { to: '/app/marketplace', label: 'Marketplace', icon: Store },
      { to: '/app/seo-pages', label: 'SEO Page Generator', icon: Globe2 },
      { to: '/app/video-tour', label: 'Product Tour', icon: PlayCircle },
    ],
  },
  {
    title: 'Clients',
    items: [
      { to: '/app/client-portal', label: 'Client Portal', icon: Users },
    ],
  },
];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="text-center">
        <Scale className="mx-auto text-blue-400 animate-pulse mb-2" size={32} />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Sidebar({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { signOut, user } = useAuth();
  const toggleSection = (title: string) => setCollapsed(prev => ({ ...prev, [title]: !prev[title] }));

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-700/60 z-30 flex flex-col transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/60">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Scale className="text-white" size={20} />
          </div>
          <div>
            <div className="font-bold text-white text-base leading-tight">CaseBuddy AI</div>
            <div className="text-xs text-slate-400">AI Law Firm</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {NAV_SECTIONS.map(section => (
            <div key={section.title}>
              <button onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300">
                {section.title}
                {collapsed[section.title] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>
              {!collapsed[section.title] && (
                <div className="space-y-0.5 mb-2">
                  {section.items.map(({ to, label, icon: Icon }) => (
                    <NavLink key={to} to={to} end={to === '/app'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
                      }
                      onClick={() => setOpen(false)}>
                      <Icon size={16} />
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-700/60 space-y-2">
          <div className="text-xs text-slate-500 px-2 truncate">{user?.email}</div>
          <button onClick={signOut}
            className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
          <div className="bg-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 text-center">
            Powered by <span className="text-blue-400 font-medium">Gemini 2.5 Flash</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="md:hidden flex items-center gap-3 px-4 py-4 bg-slate-900 border-b border-slate-700/60 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu size={24} />
          </button>
          <Scale className="text-blue-400" size={20} />
          <span className="font-bold text-white">CaseBuddy AI</span>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
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
            <Route path="/client-portal" element={<ClientPortal />} />
          </Routes>
        </main>
      </div>
      <PwaInstall />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/intake" element={<PublicIntake />} />
          <Route path="/login" element={<LoginRedirect />} />
          {/* Protected app routes */}
          <Route path="/app/*" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          } />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

function LoginRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/app" replace />;
  return <Login />;
}
