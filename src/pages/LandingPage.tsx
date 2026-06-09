import React from 'react';
import { Scale, Shield, Brain, Clock, FileSearch, Swords, ArrowRight, CheckCircle, Users, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Scale className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-white">CaseBuddy AI</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/intake" className="text-slate-400 hover:text-white text-sm font-medium">Free Case Evaluation</a>
            <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Sign In</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 px-4 py-1.5 rounded-full text-sm mb-6">
            <Zap size={14} /> AI-Powered Legal Intelligence
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Your Autonomous<br />
            <span className="text-blue-400">AI Law Firm</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            24/7 case evaluation, automated deadlines, AI-powered trial prep, and intelligent document analysis. Justice never sleeps.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/intake" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-lg font-medium flex items-center gap-2">
              Free Case Evaluation <ArrowRight size={18} />
            </a>
            <a href="/login" className="text-slate-400 hover:text-white px-8 py-3.5 rounded-xl text-lg font-medium border border-slate-700 hover:border-slate-500">
              Client Portal →
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Everything a Law Firm Needs. Powered by AI.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: 'AI Case Evaluator', desc: 'Instant case strength analysis, suggested claims, and strategy recommendations.', color: 'blue' },
              { icon: FileSearch, title: 'Document Intelligence', desc: 'Upload 500 pages — AI auto-sorts, extracts key facts, builds timelines.', color: 'purple' },
              { icon: Clock, title: 'Auto Deadlines', desc: 'Never miss a filing date. AI calculates every deadline the moment a case opens.', color: 'amber' },
              { icon: Swords, title: 'Trial Prep & Simulation', desc: 'AI trial coach, witness prep, jury analysis, and verdict prediction.', color: 'red' },
              { icon: Shield, title: 'Conflict Checker', desc: 'Automated conflict of interest screening against your full client database.', color: 'green' },
              { icon: Users, title: 'Client Portal', desc: 'Clients check case status, upload documents, and message you 24/7.', color: 'cyan' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 hover:border-slate-600 transition-colors">
                <div className={`w-12 h-12 bg-${color}-600/20 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`text-${color}-400`} size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Think You Have a Case?</h2>
          <p className="text-slate-300 mb-6">Get a free, confidential AI case evaluation in under 60 seconds.</p>
          <a href="/intake" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-lg font-medium">
            Start Free Evaluation <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-slate-500 text-sm">
        <p>© 2026 CaseBuddy AI · casebuddy.live</p>
        <p className="mt-1">AI-assisted legal tools. This platform does not provide legal advice and does not create an attorney-client relationship.</p>
      </footer>
    </div>
  );
}
