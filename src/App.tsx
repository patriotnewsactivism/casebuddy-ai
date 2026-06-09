import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import IntakePage from './pages/IntakePage';
import DocumentAnalysis from './pages/DocumentAnalysis';
import DiscoveryMiner from './pages/DiscoveryMiner';
import TrialCoach from './pages/TrialCoach';
import WitnessPrep from './pages/WitnessPrep';
import LegalResearch from './pages/LegalResearch';
import DeadlineTracker from './pages/DeadlineTracker';
import JurySim from './pages/JurySim';
import { Scale, FolderOpen, UserPlus, FileSearch, Microscope, Swords, Users, BookOpen, Clock, Menu, BarChart2 } from 'lucide-react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: Scale },
  { to: '/cases', label: 'Cases', icon: FolderOpen },
  { to: '/intake', label: 'AI Intake', icon: UserPlus },
  { to: '/documents', label: 'Doc Analysis', icon: FileSearch },
  { to: '/discovery', label: 'Discovery Miner', icon: Microscope },
  { to: '/witnesses', label: 'Witness Prep', icon: Users },
  { to: '/research', label: 'Legal Research', icon: BookOpen },
  { to: '/trial', label: 'Trial Coach', icon: Swords },
  { to: '/jury', label: 'Jury Simulator', icon: BarChart2 },
  { to: '/deadlines', label: 'Deadlines', icon: Clock },
];

function Sidebar({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
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
            <div className="text-xs text-slate-400">Trial Prep Platform</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
              }
              onClick={() => setOpen(false)}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-700/60">
          <div className="bg-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 text-center">
            Powered by <span className="text-blue-400 font-medium">Gemini 2.5 Flash</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <BrowserRouter>
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
              <Route path="/documents" element={<DocumentAnalysis />} />
              <Route path="/discovery" element={<DiscoveryMiner />} />
              <Route path="/witnesses" element={<WitnessPrep />} />
              <Route path="/research" element={<LegalResearch />} />
              <Route path="/trial" element={<TrialCoach />} />
              <Route path="/jury" element={<JurySim />} />
              <Route path="/deadlines" element={<DeadlineTracker />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
