import React, { useState } from 'react';
import {
  PlayCircle, CheckCircle, Sparkles, ArrowRight, Zap, Scale,
  UserPlus, FileSearch, Microscope, Swords, BookOpen, Clock,
  Shield, MessageSquare, Store, Globe2, Gavel, ChevronRight,
  Star, Users, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Feature {
  icon: any;
  title: string;
  desc: string;
  highlight: string;
  to: string;
  color: string;
  gradient: string;
}

const FEATURES: Feature[] = [
  {
    icon: UserPlus,
    title: 'AI Client Intake',
    desc: 'Alex, your AI paralegal, conducts a full intake interview. Identifies claims, flags SOL deadlines, scores case viability from 0–100, and builds a complete case file — all in minutes.',
    highlight: 'Saves 2–3 hours per intake',
    to: '/intake',
    color: 'text-violet-400',
    gradient: 'from-violet-600 to-purple-700',
  },
  {
    icon: FileSearch,
    title: 'Document Lab',
    desc: 'Upload any legal document. Get instant extraction of key facts, hidden gems, risks, and admissibility issues. Supports batch scanning and full contract review with risk scoring.',
    highlight: 'Analyzes 50+ doc types',
    to: '/documents',
    color: 'text-blue-400',
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    icon: Microscope,
    title: 'Discovery Miner',
    desc: 'Feed in multiple case documents and let AI cross-reference everything. Surfaces contradictions, smoking guns, timeline gaps, and damaging admissions automatically.',
    highlight: 'Finds what humans miss',
    to: '/discovery',
    color: 'text-emerald-400',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    icon: Swords,
    title: 'Trial Command Center',
    desc: 'Practice against an AI federal judge, hostile witnesses, opposing counsel, or a skeptical juror. Three difficulty modes. Plus AI witness prep and a 12-juror simulation with real personality profiles.',
    highlight: '8 AI trial roles',
    to: '/trial',
    color: 'text-orange-400',
    gradient: 'from-orange-600 to-red-600',
  },
  {
    icon: BookOpen,
    title: 'Legal Research Hub',
    desc: 'Ask any legal question. Get relevant case law, applicable statutes, strategy recommendations, and plaintiff/defense strength scores. Plus a jurisdiction comparison tool for 8 states + federal.',
    highlight: 'Win probability scoring',
    to: '/research',
    color: 'text-indigo-400',
    gradient: 'from-indigo-600 to-violet-600',
  },
  {
    icon: Clock,
    title: 'Deadlines & SOL',
    desc: 'Track all case deadlines with smart urgency alerts. Built-in SOL calculator covers 8 states with full tolling rules, discovery rules, and government notice requirements.',
    highlight: 'Never miss a deadline',
    to: '/deadlines',
    color: 'text-yellow-400',
    gradient: 'from-yellow-600 to-amber-600',
  },
  {
    icon: Shield,
    title: 'Conflict Checker',
    desc: 'Enter parties and get an ABA Rules 1.7, 1.8, 1.9, 1.10 compliant conflict analysis. Automatically generates a conflict waiver document for any flagged issues.',
    highlight: 'ABA Rules compliant',
    to: '/conflict-checker',
    color: 'text-amber-400',
    gradient: 'from-amber-600 to-orange-600',
  },
  {
    icon: MessageSquare,
    title: 'AI Legal Secretary',
    desc: 'Embeddable chatbot for your website. Conducts AI-powered client intake, captures lead info, qualifies cases, and routes prospects — 24/7, no staff required.',
    highlight: 'One line of code to embed',
    to: '/legal-secretary',
    color: 'text-pink-400',
    gradient: 'from-pink-600 to-rose-600',
  },
  {
    icon: Globe2,
    title: 'SEO Page Generator',
    desc: 'Generate complete, SEO-optimized practice area pages for any city + practice area. Includes meta tags, FAQs, structured data, and a Google Ads copy package.',
    highlight: 'Instant web presence',
    to: '/seo-pages',
    color: 'text-cyan-400',
    gradient: 'from-cyan-600 to-blue-600',
  },
];

const STATS = [
  { value: '10h+', label: 'Saved per case', icon: Clock },
  { value: '9', label: 'AI modules', icon: Sparkles },
  { value: '50+', label: 'State SOLs', icon: Scale },
  { value: '8', label: 'Trial roles', icon: Swords },
];

const TESTIMONIALS = [
  {
    quote: 'The AI intake alone saves me 3 hours per new client. The SOL calculator is better than anything I\'ve used at BigLaw.',
    author: 'Civil Rights Attorney',
    location: 'Mississippi',
    stars: 5,
  },
  {
    quote: 'Discovery Miner found a contradiction in a police report that my associate missed after 4 hours of review. Paid for itself in the first case.',
    author: 'PI Attorney',
    location: 'Texas',
    stars: 5,
  },
  {
    quote: 'I set up the AI Legal Secretary on my website over a weekend. Now it qualifies leads while I sleep.',
    author: 'Solo Practitioner',
    location: 'California',
    stars: 5,
  },
];

export default function ProductTour() {
  const [activeFeature, setActiveFeature] = useState(0);
  const feature = FEATURES[activeFeature];

  return (
    <div className="max-w-5xl mx-auto space-y-10">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 p-8 text-center"
        style={{ background: 'linear-gradient(135deg, #0d1526, #1a0f30, #0d1526)' }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 50%, #8b5cf6 0%, transparent 50%)' }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Sparkles size={12} /> Powered by Gemini 2.5 Flash
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Everything a modern law firm needs
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto mb-6">
            CaseBuddy AI is your all-in-one legal intelligence platform — from client intake to trial prep.
            Built for solo attorneys and small firms who compete at the BigLaw level.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/intake"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <Zap size={14} /> Start AI Intake
            </Link>
            <Link to="/trial"
              className="inline-flex items-center gap-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-400 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <Swords size={14} /> Try Trial Coach
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map(({ value, label, icon: Icon }) => (
          <div key={label} className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold gradient-text">{value}</div>
            <div className="text-slate-400 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Interactive feature tour */}
      <div>
        <h2 className="text-white font-bold text-xl mb-5">Every Module, Explained</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {/* Feature list */}
          <div className="space-y-1.5">
            {FEATURES.map((f, i) => (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  activeFeature === i
                    ? 'bg-slate-700/80 border border-slate-600/60'
                    : 'hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className={`w-8 h-8 bg-gradient-to-br ${f.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <f.icon size={15} className="text-white" />
                </div>
                <span className={`text-sm font-medium ${activeFeature === i ? 'text-white' : 'text-slate-400'}`}>
                  {f.title}
                </span>
                {activeFeature === i && <ChevronRight size={13} className="text-slate-400 ml-auto" />}
              </button>
            ))}
          </div>

          {/* Feature detail */}
          <div className="md:col-span-2 bg-slate-800/60 border border-slate-700/40 rounded-2xl p-6 animate-fade-in">
            <div className={`inline-flex items-center gap-2 bg-gradient-to-br ${feature.gradient} p-2 rounded-xl mb-4`}>
              <feature.icon size={22} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">{feature.desc}</p>
            <div className="flex items-center gap-3 mb-5">
              <CheckCircle size={14} className="text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">{feature.highlight}</span>
            </div>
            <Link
              to={feature.to}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              Open {feature.title} <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <h2 className="text-white font-bold text-xl mb-5">What Attorneys Are Saying</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-5">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={13} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">"{t.quote}"</p>
              <div className="text-xs text-slate-500">
                <span className="text-slate-400 font-medium">{t.author}</span> · {t.location}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/30 to-violet-900/20 border border-blue-500/20 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to work smarter?</h2>
        <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
          Start with an AI intake interview and see why attorneys call CaseBuddy their secret weapon.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { to: '/intake', label: 'Start AI Intake', icon: UserPlus, primary: true },
            { to: '/marketplace', label: 'Browse Templates', icon: Store, primary: false },
          ].map(({ to, label, icon: Icon, primary }) => (
            <Link key={to} to={to}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                primary
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'
              }`}>
              <Icon size={14} /> {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
