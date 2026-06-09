import React, { useState } from 'react';
import { FileSearch, Upload, Loader2, Gem, AlertTriangle, CheckCircle, Scale } from 'lucide-react';
import { analyzeDocument } from '../lib/api';

export default function DocumentAnalysis() {
  const [text, setText] = useState('');
  const [docType, setDocType] = useState('Contract');
  const [caseSummary, setCaseSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setText(ev.target?.result as string || '');
    reader.readAsText(file);
  };

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setAnalysis(null);
    const res = await analyzeDocument({ text, document_type: docType, case_summary: caseSummary });
    if (res.analysis) setAnalysis(res.analysis);
    setLoading(false);
  };

  const DOC_TYPES = ['Contract', 'Deposition', 'Police Report', 'Medical Record', 'Email', 'Text Messages', 'Financial Record', 'Expert Report', 'Court Filing', 'Other'];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FileSearch className="text-blue-400" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white">Document Analysis</h1>
          <p className="text-slate-400 text-sm">AI-powered litigation analysis — facts, gems, risks, admissibility</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-2">Document Type</label>
            <select value={docType} onChange={e => setDocType(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-2">Case Context (optional)</label>
            <input value={caseSummary} onChange={e => setCaseSummary(e.target.value)}
              placeholder="Brief case summary to improve analysis..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-2">Upload File (txt, md)</label>
            <label className="flex items-center gap-2 border-2 border-dashed border-slate-600 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors">
              <Upload className="text-slate-400" size={20} />
              <span className="text-slate-400 text-sm">Click to upload text file</span>
              <input type="file" accept=".txt,.md,.csv" className="hidden" onChange={handleFile} />
            </label>
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-2">Or paste document text</label>
            <textarea value={text} onChange={e => setText(e.target.value)}
              rows={8} placeholder="Paste document text here..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <button onClick={analyze} disabled={loading || !text.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={18} /> Analyzing...</> : <><Scale size={18} /> Analyze Document</>}
          </button>
        </div>

        <div className="space-y-4">
          {!analysis && !loading && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center text-slate-500">
              Analysis results will appear here
            </div>
          )}
          {analysis && (
            <>
              {analysis.summary && (
                <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-4">
                  <div className="text-blue-400 font-semibold text-sm mb-2">Summary</div>
                  <div className="text-slate-300 text-sm">{analysis.summary}</div>
                </div>
              )}
              {analysis.gems?.length > 0 && (
                <div className="bg-slate-800 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm mb-2"><Gem size={16} /> Gems</div>
                  {analysis.gems.map((g: string, i: number) => <div key={i} className="text-slate-300 text-sm">• {g}</div>)}
                </div>
              )}
              {analysis.risks?.length > 0 && (
                <div className="bg-slate-800 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-400 font-semibold text-sm mb-2"><AlertTriangle size={16} /> Risks</div>
                  {analysis.risks.map((r: string, i: number) => <div key={i} className="text-slate-300 text-sm">• {r}</div>)}
                </div>
              )}
              {analysis.key_facts?.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-400 font-semibold text-sm mb-2"><CheckCircle size={16} /> Key Facts</div>
                  {analysis.key_facts.map((f: string, i: number) => <div key={i} className="text-slate-300 text-sm">• {f}</div>)}
                </div>
              )}
              {analysis.admissibility && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="text-purple-400 font-semibold text-sm mb-2">Admissibility</div>
                  <div className="text-slate-300 text-sm">{analysis.admissibility}</div>
                </div>
              )}
              {analysis.motions_suggested?.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="text-orange-400 font-semibold text-sm mb-2">Suggested Motions</div>
                  {analysis.motions_suggested.map((m: string, i: number) => <div key={i} className="text-slate-300 text-sm">• {m}</div>)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
