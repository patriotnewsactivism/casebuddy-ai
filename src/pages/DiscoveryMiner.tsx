import React, { useState, useCallback } from 'react';
import {
  Microscope, Plus, Trash2, Loader2, Flame, Clock,
  GitCompare, AlertTriangle, ChevronDown, ChevronUp,
  FileText, Upload, Zap, CheckCircle
} from 'lucide-react';
import { discoveryMiner } from '../lib/api';

interface Doc { title: string; document_type: string; content_text: string; }

const DOC_TYPES = [
  'Contract', 'Deposition', 'Police Report', 'Medical Record', 'Email',
  'Text Messages', 'Financial Record', 'Expert Report', 'Court Filing', 'Other',
];

function Section({ title, icon: Icon, color, border, count, children }: {
  title: string; icon: any; color: string; border: string; count?: number; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`border rounded-xl overflow-hidden bg-slate-800/60 ${border}`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-700/20 transition-colors">
        <div className={`flex items-center gap-2 font-semibold text-sm ${color}`}>
          <Icon size={16} />
          {title}
          {count !== undefined && (
            <span className="text-xs font-bold bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full">{count}</span>
          )}
        </div>
        {open
          ? <ChevronUp size={14} className="text-slate-500" />
          : <ChevronDown size={14} className="text-slate-500" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

export default function DiscoveryMiner() {
  const [docs, setDocs] = useState<Doc[]>([
    { title: '', document_type: 'Contract', content_text: '' },
  ]);
  const [caseTheory, setCaseTheory] = useState('');
  const [side, setSide] = useState('Plaintiff');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const addDoc = () => setDocs(d => [...d, { title: '', document_type: 'Contract', content_text: '' }]);
  const removeDoc = (i: number) => setDocs(d => d.filter((_, idx) => idx !== i));
  const updateDoc = (i: number, field: keyof Doc, val: string) =>
    setDocs(d => d.map((doc, idx) => idx === i ? { ...doc, [field]: val } : doc));

  const readFile = (file: File): Promise<string> =>
    new Promise(res => {
      const r = new FileReader();
      r.onload = e => res(e.target?.result as string || '');
      r.readAsText(file);
    });

  const handleFileDrop = useCallback(async (e: React.DragEvent, idx: number) => {
    e.preventDefault(); setDragOverIdx(null);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const text = await readFile(file);
    updateDoc(idx, 'content_text', text);
    if (!docs[idx].title) updateDoc(idx, 'title', file.name.replace(/\.[^.]+$/, ''));
  }, [docs]);

  const mine = async () => {
    const valid = docs.filter(d => d.content_text.trim() && d.title.trim());
    if (!valid.length) return;
    setLoading(true); setResults(null);
    const res = await discoveryMiner({ documents: valid, case_theory: caseTheory, side });
    if (res.mining_results) setResults(res.mining_results);
    setLoading(false);
  };

  const validCount = docs.filter(d => d.content_text.trim() && d.title.trim()).length;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Config panel */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wide">Case Theory</label>
            <input value={caseTheory} onChange={e => setCaseTheory(e.target.value)}
              placeholder="e.g. Officer used excessive force after plaintiff was complying..."
              className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wide">Representing</label>
            <select value={side} onChange={e => setSide(e.target.value)}
              className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none transition-colors">
              <option>Plaintiff</option>
              <option>Defendant</option>
              <option>Prosecution</option>
              <option>Defense</option>
            </select>
          </div>
        </div>

        {/* Documents */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              Documents
              <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                {validCount}/{docs.length} ready
              </span>
            </div>
            <button onClick={addDoc}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 px-3 py-1.5 rounded-lg transition-all">
              <Plus size={13} /> Add Document
            </button>
          </div>

          <div className="space-y-3">
            {docs.map((doc, i) => (
              <div key={i}
                onDragOver={e => { e.preventDefault(); setDragOverIdx(i); }}
                onDragLeave={() => setDragOverIdx(null)}
                onDrop={e => handleFileDrop(e, i)}
                className={`bg-slate-700/40 border rounded-xl p-4 space-y-3 transition-all ${
                  dragOverIdx === i
                    ? 'border-emerald-500/60 bg-emerald-500/5'
                    : doc.content_text
                    ? 'border-emerald-500/20'
                    : 'border-slate-600/40'
                }`}>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <div className="w-5 h-5 rounded bg-slate-600/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-slate-400">{i + 1}</span>
                    </div>
                    <input value={doc.title} onChange={e => updateDoc(i, 'title', e.target.value)}
                      placeholder="Document title"
                      className="flex-1 bg-transparent border-b border-slate-600/40 focus:border-emerald-500/60 pb-0.5 text-white text-sm placeholder-slate-500 focus:outline-none transition-colors" />
                  </div>
                  <select value={doc.document_type} onChange={e => updateDoc(i, 'document_type', e.target.value)}
                    className="bg-slate-700 border border-slate-600/50 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none flex-shrink-0">
                    {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  {docs.length > 1 && (
                    <button onClick={() => removeDoc(i)} className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {!doc.content_text ? (
                  <label className="flex items-center gap-2 border border-dashed border-slate-600/40 rounded-lg px-3 py-2 cursor-pointer hover:border-slate-500 transition-colors">
                    <Upload size={13} className="text-slate-500" />
                    <span className="text-slate-500 text-xs">Drop file or click to upload / paste below</span>
                    <input type="file" accept=".txt,.md,.csv" className="hidden"
                      onChange={async e => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const t = await readFile(f);
                        updateDoc(i, 'content_text', t);
                        if (!doc.title) updateDoc(i, 'title', f.name.replace(/\.[^.]+$/, ''));
                      }} />
                  </label>
                ) : (
                  <div className="flex items-center justify-between text-xs text-emerald-400">
                    <span className="flex items-center gap-1"><CheckCircle size={11} /> {doc.content_text.length.toLocaleString()} chars loaded</span>
                    <button onClick={() => updateDoc(i, 'content_text', '')}
                      className="text-slate-500 hover:text-red-400 transition-colors">Clear</button>
                  </div>
                )}

                <textarea value={doc.content_text} onChange={e => updateDoc(i, 'content_text', e.target.value)}
                  rows={doc.content_text ? 3 : 4}
                  placeholder="Paste document text here..."
                  className="w-full bg-slate-700/40 border border-slate-600/30 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 resize-none transition-colors" />
              </div>
            ))}
          </div>
        </div>

        <button onClick={mine} disabled={loading || validCount === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
          {loading
            ? <><Loader2 className="animate-spin" size={17} /> Mining documents...</>
            : <><Zap size={17} /> Run Discovery Mining ({validCount} doc{validCount !== 1 ? 's' : ''})</>}
        </button>
      </div>

      {/* Results */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      )}

      {results && !loading && (
        <div className="space-y-4 animate-fade-in">
          {results.overall_assessment && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                <Microscope size={16} /> Overall Assessment
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{results.overall_assessment}</p>
            </div>
          )}

          {results.smoking_guns?.length > 0 && (
            <Section title="Smoking Guns" icon={Flame} color="text-red-400"
              border="border-red-500/20" count={results.smoking_guns.length}>
              <div className="space-y-4">
                {results.smoking_guns.map((g: any, i: number) => (
                  <div key={i} className="border-b border-slate-700/40 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-2 mb-1">
                      <Flame size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-white font-medium text-sm">{g.document || `Document ${i + 1}`}</div>
                    </div>
                    {g.quote && (
                      <blockquote className="text-slate-400 text-sm italic border-l-2 border-red-500/40 pl-3 my-2">
                        "{g.quote}"
                      </blockquote>
                    )}
                    <p className="text-red-300 text-sm">{g.significance}</p>
                    {g.action && (
                      <p className="text-blue-400 text-xs mt-1.5 flex items-center gap-1">
                        <span className="text-slate-500">→</span> {g.action}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {results.contradictions?.length > 0 && (
            <Section title="Contradictions" icon={GitCompare} color="text-yellow-400"
              border="border-yellow-500/20" count={results.contradictions.length}>
              <div className="space-y-4">
                {results.contradictions.map((c: any, i: number) => (
                  <div key={i} className="border-b border-slate-700/40 pb-4 last:border-0 last:pb-0">
                    <p className="text-slate-200 text-sm mb-1.5">{c.contradiction}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="bg-slate-700 px-2 py-0.5 rounded">{c.doc1}</span>
                      <GitCompare size={11} />
                      <span className="bg-slate-700 px-2 py-0.5 rounded">{c.doc2}</span>
                    </div>
                    {c.exploit && (
                      <p className="text-yellow-300 text-xs mt-1.5">→ {c.exploit}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {results.timeline?.length > 0 && (
            <Section title="Timeline" icon={Clock} color="text-blue-400"
              border="border-blue-500/20" count={results.timeline.length}>
              <div className="relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-700" />
                <div className="space-y-3">
                  {results.timeline.map((t: any, i: number) => (
                    <div key={i} className="flex gap-4 pl-6 relative">
                      <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600/30 border-2 border-blue-500/60" />
                      <div className="min-w-[80px] text-blue-400 text-xs font-mono pt-0.5">{t.date}</div>
                      <div>
                        <div className="text-white text-sm">{t.event}</div>
                        {t.document_source && (
                          <div className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                            <FileText size={10} /> {t.document_source}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {results.key_admissions?.length > 0 && (
            <Section title="Key Admissions" icon={AlertTriangle} color="text-orange-400"
              border="border-orange-500/20" count={results.key_admissions.length}>
              <ul className="space-y-2">
                {results.key_admissions.map((a: any, i: number) => (
                  <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-orange-400 flex-shrink-0">•</span>
                    {typeof a === 'string' ? a : `${a.document}: ${a.admission}`}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {results.missing_documents?.length > 0 && (
            <Section title="Missing Documents" icon={FileText} color="text-slate-400"
              border="border-slate-600/40" count={results.missing_documents.length}>
              <ul className="space-y-1.5">
                {results.missing_documents.map((m: string, i: number) => (
                  <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-slate-500 flex-shrink-0">□</span> {m}
                  </li>
                ))}
              </ul>
              <p className="text-slate-500 text-xs mt-3">Request these in follow-up discovery demands.</p>
            </Section>
          )}

          {results.recommended_strategy && (
            <Section title="Recommended Strategy" icon={Zap} color="text-violet-400"
              border="border-violet-500/20">
              <p className="text-slate-300 text-sm leading-relaxed">{results.recommended_strategy}</p>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
