import React, { useState, useMemo } from 'react';
import {
  Store, Search, Star, Download, Eye, TrendingUp,
  Heart, Tag, ChevronRight, Sparkles, X, BookOpen,
  FileText, Scale, Users, Briefcase, Gavel
} from 'lucide-react';

interface Template {
  id: string; title: string; author: string; category: string;
  price: number; rating: number; reviews: number; downloads: number;
  description: string; preview: string; tags: string[]; featured: boolean;
}

const TEMPLATES: Template[] = [
  { id: '1', title: 'Motion to Dismiss — §1983 (Qualified Immunity)', author: 'Civil Rights Law Group', category: 'Motions', price: 29, rating: 4.9, reviews: 47, downloads: 312, description: 'Comprehensive MTD template with qualified immunity arguments, Pearson v. Callahan framework, and clearly established law analysis. 5th Circuit citations.', preview: 'COMES NOW Defendant, [NAME], by and through undersigned counsel, and respectfully moves this Court to dismiss the Complaint with prejudice, pursuant to Federal Rule of Civil Procedure 12(b)(6) and the doctrine of qualified immunity...', tags: ['civil rights', '1983', 'qualified immunity', '5th circuit'], featured: true },
  { id: '2', title: 'Demand Letter — Personal Injury (Auto Accident)', author: 'PI Attorneys Network', category: 'Letters', price: 19, rating: 4.7, reviews: 89, downloads: 567, description: 'Battle-tested demand letter for auto accident PI claims. Liability, damages, medical specials, pain & suffering, and settlement demand sections.', preview: 'Dear [ADJUSTER NAME],\n\nPlease allow this correspondence to serve as a formal demand for settlement on behalf of my client...', tags: ['personal injury', 'auto accident', 'demand letter'], featured: true },
  { id: '3', title: 'Deposition Outline — Police Officer (Excessive Force)', author: 'CaseBuddy Pro', category: 'Depositions', price: 39, rating: 4.8, reviews: 23, downloads: 145, description: 'Detailed deposition outline for deposing police officers in excessive force cases. Training, policies, use-of-force continuum, body cam, internal affairs.', preview: 'I. BACKGROUND AND TRAINING\nA. Academy Training\n1. When did you attend the police academy?\n2. What was the duration of your training?...', tags: ['deposition', 'police', 'excessive force', 'civil rights'], featured: true },
  { id: '4', title: 'Motion for Summary Judgment — Employment Discrimination', author: 'Employment Law Collective', category: 'Motions', price: 34, rating: 4.6, reviews: 31, downloads: 198, description: 'MSJ template for Title VII, ADA, and ADEA claims. McDonnell Douglas burden-shifting framework and pretext analysis included.', preview: 'MEMORANDUM IN SUPPORT OF MOTION FOR SUMMARY JUDGMENT\n\nI. INTRODUCTION\nPlaintiff cannot establish a prima facie case of discrimination...', tags: ['employment', 'discrimination', 'title vii', 'summary judgment'], featured: false },
  { id: '5', title: 'FOIA Request Template — Federal Agencies', author: 'Government Accountability Project', category: 'Templates', price: 0, rating: 4.5, reviews: 156, downloads: 2341, description: 'Free FOIA template for any federal agency. Fee waiver language, expedited processing arguments, and appeal template included.', preview: 'Via Electronic Submission\n[AGENCY FOIA OFFICE]\n\nDear FOIA Officer:\n\nPursuant to the Freedom of Information Act, 5 U.S.C. § 552, I hereby request...', tags: ['foia', 'government', 'public records', 'free'], featured: true },
  { id: '6', title: 'Trial Brief — Criminal Defense (DUI/DWI)', author: 'DUI Defense Network', category: 'Briefs', price: 29, rating: 4.4, reviews: 18, downloads: 87, description: 'Comprehensive trial brief for DUI/DWI defense. Field sobriety test challenges, breathalyzer calibration, rising blood alcohol defense.', preview: 'STATEMENT OF THE CASE\n\nThe Defendant, [NAME], was stopped on [DATE] at approximately [TIME]. This prosecution fails because...', tags: ['criminal', 'dui', 'dwi', 'trial brief'], featured: false },
  { id: '7', title: 'Jury Instructions — §1983 Excessive Force', author: 'Federal Litigation Center', category: 'Jury', price: 24, rating: 4.8, reviews: 29, downloads: 176, description: 'Proposed jury instructions for §1983 excessive force claims based on 5th Circuit Pattern Jury Instructions with modifications.', preview: 'PROPOSED JURY INSTRUCTION NO. __\n\nEXCESSIVE FORCE — FOURTH AMENDMENT STANDARD\n\nThe plaintiff claims that the defendant used excessive force...', tags: ['jury instructions', 'civil rights', '1983', 'excessive force'], featured: false },
  { id: '8', title: 'Discovery Package — General Civil Litigation', author: 'Litigation Resources Inc', category: 'Discovery', price: 44, rating: 4.7, reviews: 62, downloads: 423, description: 'Complete discovery package: 25 interrogatories, 30 RFPs, 25 RFAs, and deposition notices. Customizable for any civil case.', preview: "PLAINTIFF'S FIRST SET OF INTERROGATORIES TO DEFENDANT\n\nINTERROGATORY NO. 1: State your full legal name, current address, and all addresses for the last five years...", tags: ['discovery', 'interrogatories', 'rfp', 'rfa'], featured: true },
  { id: '9', title: 'Settlement Agreement — Multi-Party Civil Rights', author: 'Mediation Professionals', category: 'Agreements', price: 49, rating: 4.9, reviews: 14, downloads: 89, description: 'Comprehensive settlement agreement for multi-defendant civil rights cases. Release language, confidentiality, and policy change requirements.', preview: 'SETTLEMENT AGREEMENT AND MUTUAL RELEASE\n\nThis Settlement Agreement and Mutual Release ("Agreement") is entered into...', tags: ['settlement', 'civil rights', 'agreement'], featured: false },
  { id: '10', title: 'Case Strategy Playbook — Police Misconduct', author: 'CaseBuddy Pro', category: 'Strategy', price: 59, rating: 5.0, reviews: 8, downloads: 45, description: 'Complete litigation strategy guide for police misconduct. Intake to trial: discovery plan, expert witness guide, damages framework, closing argument outline.', preview: 'CHAPTER 1: CASE EVALUATION\n\n1.1 Initial Assessment Checklist\n□ Client credibility assessment\n□ Physical evidence available?...', tags: ['strategy', 'police misconduct', 'civil rights', 'playbook'], featured: true },
];

const CATEGORIES = ['All', 'Motions', 'Letters', 'Depositions', 'Discovery', 'Briefs', 'Jury', 'Templates', 'Agreements', 'Strategy'];

const CAT_ICONS: Record<string, any> = {
  All: Store, Motions: Gavel, Letters: FileText, Depositions: Users,
  Discovery: Search, Briefs: BookOpen, Jury: Scale, Templates: FileText,
  Agreements: Briefcase, Strategy: Sparkles,
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11}
          className={i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />
      ))}
    </div>
  );
}

export default function Marketplace() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price'>('popular');
  const [preview, setPreview] = useState<Template | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = TEMPLATES;
    if (category !== 'All') list = list.filter(t => t.category === category);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        t.tags.some(tag => tag.includes(s))
      );
    }
    switch (sortBy) {
      case 'popular': return [...list].sort((a, b) => b.downloads - a.downloads);
      case 'rating':  return [...list].sort((a, b) => b.rating - a.rating);
      case 'price':   return [...list].sort((a, b) => a.price - b.price);
      default: return list;
    }
  }, [search, category, sortBy]);

  const toggleFav = (id: string) =>
    setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const featuredCount = TEMPLATES.filter(t => t.featured).length;
  const freeCount = TEMPLATES.filter(t => t.price === 0).length;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Hero strip */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/30 via-slate-800/60 to-slate-800/40 border border-purple-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #8b5cf6 0%, transparent 50%)' }} />
        <div className="relative flex items-center gap-4 flex-1">
          <div className="w-12 h-12 bg-purple-600/30 border border-purple-500/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <Store className="text-purple-400" size={22} />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">CaseBuddy Marketplace</h2>
            <p className="text-slate-400 text-sm">Templates, motions & strategy guides by attorneys, for attorneys</p>
          </div>
        </div>
        <div className="relative flex gap-3">
          {[
            { value: TEMPLATES.length, label: 'Templates' },
            { value: featuredCount, label: 'Featured' },
            { value: freeCount, label: 'Free' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center bg-slate-800/60 border border-slate-700/40 rounded-xl px-4 py-2.5 min-w-[60px]">
              <div className="text-white font-bold text-lg">{value}</div>
              <div className="text-slate-500 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search motions, depositions, templates..."
            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-colors" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
              <X size={15} />
            </button>
          )}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
          className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none">
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="price">Lowest Price</option>
        </select>
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(c => {
          const Icon = CAT_ICONS[c] || Store;
          const count = c === 'All' ? TEMPLATES.length : TEMPLATES.filter(t => t.category === c).length;
          return (
            <button key={c} onClick={() => setCategory(c)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                category === c
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-white hover:border-slate-600'
              }`}>
              <Icon size={11} />
              {c}
              <span className={`text-[10px] font-bold ${category === c ? 'text-purple-200' : 'text-slate-600'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-12 text-center">
          <Search size={36} className="text-slate-600 mx-auto mb-3" />
          <p className="text-white font-medium">No templates found</p>
          <p className="text-slate-500 text-sm mt-1">Try a different search or category</p>
          <button onClick={() => { setSearch(''); setCategory('All'); }}
            className="mt-4 text-xs text-purple-400 hover:text-purple-300 underline">Clear filters</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(t => (
            <div key={t.id}
              className="group bg-slate-800/60 border border-slate-700/40 hover:border-purple-500/40 rounded-2xl overflow-hidden transition-all card-hover">
              {t.featured && (
                <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-3 py-1 flex items-center gap-1.5">
                  <TrendingUp size={10} className="text-purple-200" />
                  <span className="text-[10px] font-bold text-purple-100 uppercase tracking-wide">Featured</span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wide">{t.category}</span>
                    <h3 className="text-white font-semibold text-sm mt-0.5 leading-snug line-clamp-2">{t.title}</h3>
                    <div className="text-slate-500 text-xs mt-0.5">by {t.author}</div>
                  </div>
                  <button onClick={() => toggleFav(t.id)} className="ml-2 flex-shrink-0 text-slate-600 hover:text-red-400 transition-colors">
                    <Heart size={15} className={favorites.has(t.id) ? 'fill-red-400 text-red-400' : ''} />
                  </button>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{t.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {t.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] bg-slate-700/60 border border-slate-600/40 text-slate-400 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    <StarRating rating={t.rating} />
                    <span className="text-xs text-slate-500">{t.rating} ({t.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <Download size={10} /> {t.downloads.toLocaleString()}
                  </div>
                </div>

                {/* Price + actions */}
                <div className="flex items-center justify-between">
                  <div>
                    {t.price === 0
                      ? <span className="text-emerald-400 font-bold text-sm">FREE</span>
                      : <span className="text-white font-bold text-sm">${t.price}</span>
                    }
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setPreview(t)}
                      className="flex items-center gap-1 text-xs font-medium bg-slate-700/60 hover:bg-slate-700 border border-slate-600/40 text-slate-300 px-2.5 py-1.5 rounded-lg transition-colors">
                      <Eye size={11} /> Preview
                    </button>
                    <button className="flex items-center gap-1 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1.5 rounded-lg transition-colors">
                      {t.price === 0 ? <><Download size={11} /> Free</> : <><ChevronRight size={11} /> Get</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg animate-fade-in"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wide">{preview.category}</span>
                <h3 className="text-white font-bold text-base mt-0.5">{preview.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={preview.rating} />
                  <span className="text-slate-500 text-xs">{preview.rating} · {preview.reviews} reviews · {preview.downloads.toLocaleString()} downloads</span>
                </div>
              </div>
              <button onClick={() => setPreview(null)} className="text-slate-500 hover:text-white transition-colors ml-3">
                <X size={18} />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">{preview.description}</p>
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
              {preview.preview}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setPreview(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Close
              </button>
              <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                {preview.price === 0 ? <><Download size={14} /> Download Free</> : `Get for $${preview.price}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
