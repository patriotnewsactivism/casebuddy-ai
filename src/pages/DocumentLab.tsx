import React, { useState, useCallback, useRef } from 'react';
import {
  FileSearch, Upload, Loader2, Gem, AlertTriangle, CheckCircle,
  ScanLine, FileCheck, Eye, X, FileText, Download, Copy,
  ChevronDown, ChevronUp, Sparkles, FolderOpen
} from 'lucide-react';
import { analyzeDocument } from '../lib/api';

type Tab = 'analyze' | 'scan' | 'contract';

interface ScannedDoc {
  id: string; fileName: string; text: string; analysis: any; scannedAt: string;
}

const DOC_TYPES = [
  'Contract', 'Deposition', 'Police Report', 'Medical Record',
  'Email', 'Text Messages', 'Financial Record', 'Expert Report', 'Court Filing', 'Other',
];

const RISK_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  LOW: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  HIGH: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

function ResultCard({ title, color, border, icon: Icon, children }: {
  title: string; color: string; border: string; icon: any; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`border rounded-xl overflow-hidden bg-slate-800/60 ${border}`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/30 transition-colors">
        <div className={`flex items-center gap-2 font-semibold text-sm ${color}`}>
          <Icon size={15} /> {title}
        </div>
        {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default function DocumentLab() {
  const [tab, setTab] = useState<Tab>('analyze');

  // Analyze state
  const [text, setText] = useState('');
  const [docType, setDocType] = useState('Contract');
  const [caseSummary, setCaseSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);

  // Scan state
  const [files, setFiles] = useState<File[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedDocs, setScannedDocs] = useState<ScannedDoc[]>([]);
  const [scanDragOver, setScanDragOver] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ScannedDoc | null>(null);
  const [caseContext, setCaseContext] = useState('');

  // Contract state
  const [contractText, setContractText] = useState('');
  const [contractLoading, setContractLoading] = useState(false);
  const [contractResult, setContractResult] = useState<any>(null);
  const [contractParty, setContractParty] = useState('');
  const [contractDragOver, setContractDragOver] = useState(false);

  const readFile = (file: File): Promise<string> =>
    new Promise(res => {
      const r = new FileReader();
      r.onload = e => res(e.target?.result as string || '');
      r.readAsText(file);
    });

  // ── ANALYZE ──
  const handleAnalyzeDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file).then(setText);
  }, []);

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true); setAnalysis(null);
    const res = await analyzeDocument({ text, document_type: docType, case_summary: caseSummary });
    if (res.analysis) setAnalysis(res.analysis);
    setLoading(false);
  };

  const downloadAnalysis = () => {
    if (!analysis) return;
    const lines: string[] = [`DOCUMENT ANALYSIS — ${new Date().toLocaleDateString()}`, `Type: ${docType}`, ''];
    if (analysis.summary) lines.push('SUMMARY', analysis.summary, '');
    if (analysis.key_facts?.length) lines.push('KEY FACTS', ...analysis.key_facts.map((f: string) => `• ${f}`), '');
    if (analysis.gems?.length) lines.push('HIDDEN GEMS', ...analysis.gems.map((g: string) => `• ${g}`), '');
    if (analysis.risks?.length) lines.push('RISKS', ...analysis.risks.map((r: string) => `• ${r}`), '');
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'analysis.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── BATCH SCAN ──
  const onScanDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setScanDragOver(false);
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  }, []);

  const scanAll = async () => {
    if (!files.length) return;
    setScanning(true); setScanProgress(0);
    for (let i = 0; i < files.length; i++) {
      const fileText = await readFile(files[i]);
      const res = await analyzeDocument({ text: fileText, document_type: 'Other', case_summary: caseContext });
      setScannedDocs(prev => [...prev, {
        id: `${Date.now()}-${i}`,
        fileName: files[i].name,
        text: fileText,
        analysis: res.analysis || { summary: 'Analysis completed' },
        scannedAt: new Date().toLocaleString(),
      }]);
      setScanProgress(Math.round(((i + 1) / files.length) * 100));
    }
    setFiles([]); setScanning(false);
  };

  // ── CONTRACT ──
  const onContractDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setContractDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file).then(setContractText);
  }, []);

  const reviewContract = async () => {
    if (!contractText.trim()) return;
    setContractLoading(true); setContractResult(null);
    const prompt = `You are a senior contract attorney reviewing this contract. Analyze every clause thoroughly.
CONTRACT TEXT:
${contractText.substring(0, 8000)}
${contractParty ? `\nREVIEWING FOR: ${contractParty}` : ''}

Respond ONLY with valid JSON — no markdown, no explanation:
{
  "overall_risk": "LOW|MEDIUM|HIGH|CRITICAL",
  "risk_score": 0,
  "summary": "executive summary paragraph",
  "clauses": [{"clause":"clause name","risk":"LOW|MEDIUM|HIGH","issue":"what the issue is","recommendation":"how to fix it"}],
  "missing_clauses": ["clause name that should be present"],
  "favorable_terms": ["term that benefits client"],
  "negotiation_points": ["what to push back on"]
}`;
    const res = await analyzeDocument({ text: prompt, document_type: 'Contract', case_summary: contractParty });
    if (res.analysis) {
      try {
        const raw = typeof res.analysis === 'string' ? res.analysis : JSON.stringify(res.analysis);
        const match = raw.match(/\{[\s\S]*\}/);
        setContractResult(match ? JSON.parse(match[0]) : res.analysis);
      } catch {
        setContractResult(res.analysis);
      }
    }
    setContractLoading(false);
  };

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'analyze', label: 'Analyze Document', icon: FileSearch },
    { id: 'scan', label: 'Batch Scanner', icon: ScanLine },
    { id: 'contract', label: 'Contract Review', icon: FileCheck },
  ];

  const riskCfg = (r: string) => RISK_CONFIG[r] || RISK_CONFIG.LOW;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Tab Bar */}
      <div className="flex gap-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
            }`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* ═══ ANALYZE TAB ═══ */}
      {tab === 'analyze' && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Input */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wide">Doc Type</label>
                <select value={docType} onChange={e => setDocType(e.target.value)}
                  className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/60 transition-colors">
                  {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wide">Case Context</label>
                <input value={caseSummary} onChange={e => setCaseSummary(e.target.value)}
                  placeholder="Optional context..."
                  className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors" />
              </div>
            </div>

            {/* Drop zone */}
            <label
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleAnalyzeDrop}
              className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all ${
                dragOver
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'border-slate-600/50 hover:border-slate-500 hover:bg-slate-700/20'
              }`}>
              <Upload className="text-slate-500" size={22} />
              <div className="text-center">
                <div className="text-slate-300 text-sm font-medium">Drop file here or click to upload</div>
                <div className="text-slate-500 text-xs mt-0.5">.txt, .md, .csv supported</div>
              </div>
              <input type="file" accept=".txt,.md,.csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f).then(setText); }} />
            </label>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wide">Or paste text</label>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={9}
                placeholder="Paste document text here..."
                className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 resize-none transition-colors" />
              {text && (
                <div className="text-xs text-slate-500 mt-1">{text.length.toLocaleString()} characters</div>
              )}
            </div>

            <button onClick={analyze} disabled={loading || !text.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              {loading
                ? <><Loader2 className="animate-spin" size={17} /> Analyzing document...</>
                : <><Sparkles size={17} /> Analyze Document</>}
            </button>
          </div>

          {/* Results */}
          <div className="space-y-3">
            {!analysis && !loading && (
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-10 text-center">
                <FileSearch size={36} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Upload or paste a document to get AI analysis</p>
                <div className="mt-4 space-y-1.5">
                  {['Key facts extraction', 'Hidden gems & admissions', 'Risk identification', 'Admissibility analysis'].map(f => (
                    <div key={f} className="flex items-center justify-center gap-2 text-xs text-slate-600">
                      <Sparkles size={10} className="text-blue-500" /> {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {loading && (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton h-20 rounded-xl" />
                ))}
              </div>
            )}
            {analysis && (
              <>
                <div className="flex justify-end">
                  <button onClick={downloadAnalysis}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg transition-colors">
                    <Download size={12} /> Export
                  </button>
                </div>

                {analysis.summary && (
                  <ResultCard title="Summary" color="text-blue-400" border="border-blue-500/20" icon={FileText}>
                    <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary}</p>
                  </ResultCard>
                )}
                {analysis.key_facts?.length > 0 && (
                  <ResultCard title={`Key Facts (${analysis.key_facts.length})`} color="text-emerald-400" border="border-emerald-500/20" icon={CheckCircle}>
                    <ul className="space-y-1.5">
                      {analysis.key_facts.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </ResultCard>
                )}
                {analysis.gems?.length > 0 && (
                  <ResultCard title={`Hidden Gems (${analysis.gems.length})`} color="text-yellow-400" border="border-yellow-500/20" icon={Gem}>
                    <ul className="space-y-1.5">
                      {analysis.gems.map((g: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <Gem size={12} className="text-yellow-400 mt-0.5 flex-shrink-0" /> {g}
                        </li>
                      ))}
                    </ul>
                  </ResultCard>
                )}
                {analysis.risks?.length > 0 && (
                  <ResultCard title={`Risks (${analysis.risks.length})`} color="text-red-400" border="border-red-500/20" icon={AlertTriangle}>
                    <ul className="space-y-1.5">
                      {analysis.risks.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <AlertTriangle size={12} className="text-red-400 mt-0.5 flex-shrink-0" /> {r}
                        </li>
                      ))}
                    </ul>
                  </ResultCard>
                )}
                {analysis.admissibility && (
                  <ResultCard title="Admissibility" color="text-violet-400" border="border-violet-500/20" icon={Eye}>
                    <p className="text-slate-300 text-sm leading-relaxed">{
                      typeof analysis.admissibility === 'string'
                        ? analysis.admissibility
                        : JSON.stringify(analysis.admissibility)
                    }</p>
                  </ResultCard>
                )}
                {analysis.timeline?.length > 0 && (
                  <ResultCard title="Timeline" color="text-cyan-400" border="border-cyan-500/20" icon={ScanLine}>
                    <div className="space-y-2">
                      {analysis.timeline.map((t: any, i: number) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <span className="text-cyan-400 font-mono text-xs whitespace-nowrap mt-0.5">{t.date || t}</span>
                          {t.event && <span className="text-slate-300">{t.event}</span>}
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ BATCH SCAN TAB ═══ */}
      {tab === 'scan' && (
        <div className="space-y-5">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wide">Case Context</label>
              <input value={caseContext} onChange={e => setCaseContext(e.target.value)}
                placeholder="Optional: case theory or context to improve all analyses..."
                className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors" />
            </div>

            <label
              onDragOver={e => { e.preventDefault(); setScanDragOver(true); }}
              onDragLeave={() => setScanDragOver(false)}
              onDrop={onScanDrop}
              className={`flex flex-col items-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
                scanDragOver
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-slate-600/50 hover:border-slate-500 hover:bg-slate-700/20'
              }`}>
              <FolderOpen className="text-slate-500" size={28} />
              <div className="text-center">
                <div className="text-slate-300 font-medium">Drop multiple files here</div>
                <div className="text-slate-500 text-sm mt-1">or click to select</div>
              </div>
              <input type="file" multiple accept=".txt,.md,.csv" className="hidden"
                onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])} />
            </label>

            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300 font-medium">{files.length} file{files.length > 1 ? 's' : ''} ready</span>
                  <button onClick={() => setFiles([])} className="text-xs text-red-400 hover:text-red-300">Clear all</button>
                </div>
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-700/40 border border-slate-600/40 rounded-xl px-3 py-2">
                    <FileText size={13} className="text-blue-400 flex-shrink-0" />
                    <span className="text-slate-300 text-sm flex-1 truncate">{f.name}</span>
                    <span className="text-slate-500 text-xs">{(f.size / 1024).toFixed(1)} KB</span>
                    <button onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))}
                      className="text-slate-600 hover:text-red-400 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {scanning && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Scanning documents...</span>
                  <span>{scanProgress}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${scanProgress}%` }} />
                </div>
              </div>
            )}

            <button onClick={scanAll} disabled={scanning || files.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              {scanning
                ? <><Loader2 className="animate-spin" size={17} /> Scanning {scanProgress}%...</>
                : <><ScanLine size={17} /> Scan All {files.length > 0 ? `(${files.length})` : ''} Documents</>}
            </button>
          </div>

          {scannedDocs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">{scannedDocs.length} Documents Scanned</h3>
                <button onClick={() => setScannedDocs([])}
                  className="text-xs text-red-400 hover:text-red-300">Clear all</button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {scannedDocs.map(doc => (
                  <div key={doc.id}
                    onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                    className={`bg-slate-800/60 border rounded-xl p-4 cursor-pointer transition-all card-hover ${
                      selectedDoc?.id === doc.id
                        ? 'border-blue-500/50 bg-blue-500/5'
                        : 'border-slate-700/40 hover:border-slate-600'
                    }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <FileText size={15} className="text-blue-400 flex-shrink-0" />
                      <span className="text-white font-medium text-sm truncate">{doc.fileName}</span>
                    </div>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                      {doc.analysis?.summary || 'Analysis complete'}
                    </p>
                    <div className="text-slate-600 text-xs mt-2">{doc.scannedAt}</div>
                  </div>
                ))}
              </div>

              {selectedDoc && (
                <div className="mt-4 bg-slate-800/60 border border-blue-500/30 rounded-2xl p-5 animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">{selectedDoc.fileName}</h4>
                    <button onClick={() => setSelectedDoc(null)} className="text-slate-500 hover:text-white">
                      <X size={16} />
                    </button>
                  </div>
                  {selectedDoc.analysis.summary && (
                    <p className="text-slate-300 text-sm mb-3 leading-relaxed">{selectedDoc.analysis.summary}</p>
                  )}
                  {selectedDoc.analysis.key_facts?.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">Key Facts</div>
                      {selectedDoc.analysis.key_facts.map((f: string, i: number) => (
                        <div key={i} className="text-slate-300 text-sm">• {f}</div>
                      ))}
                    </div>
                  )}
                  {selectedDoc.analysis.risks?.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">Risks</div>
                      {selectedDoc.analysis.risks.map((r: string, i: number) => (
                        <div key={i} className="text-slate-300 text-sm">• {r}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ CONTRACT REVIEW TAB ═══ */}
      {tab === 'contract' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wide">Reviewing For</label>
              <input value={contractParty} onChange={e => setContractParty(e.target.value)}
                placeholder="e.g. ABC Corp (buyer), or leave blank"
                className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors" />
            </div>

            <label
              onDragOver={e => { e.preventDefault(); setContractDragOver(true); }}
              onDragLeave={() => setContractDragOver(false)}
              onDrop={onContractDrop}
              className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all ${
                contractDragOver
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'border-slate-600/50 hover:border-slate-500 hover:bg-slate-700/20'
              }`}>
              <Upload className="text-slate-500" size={20} />
              <div className="text-center">
                <div className="text-slate-300 text-sm font-medium">Drop contract here or click to upload</div>
              </div>
              <input type="file" accept=".txt,.md" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f).then(setContractText); }} />
            </label>

            <textarea value={contractText} onChange={e => setContractText(e.target.value)} rows={12}
              placeholder="Or paste contract text here..."
              className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 resize-none transition-colors" />

            <button onClick={reviewContract} disabled={contractLoading || !contractText.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              {contractLoading
                ? <><Loader2 className="animate-spin" size={17} /> Reviewing contract...</>
                : <><FileCheck size={17} /> Review Contract</>}
            </button>
          </div>

          <div className="space-y-4">
            {contractLoading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            )}
            {contractResult && !contractLoading && (
              <>
                {/* Risk score header */}
                <div className={`rounded-2xl p-4 border ${riskCfg(contractResult.overall_risk).border} ${riskCfg(contractResult.overall_risk).bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-lg font-bold ${riskCfg(contractResult.overall_risk).color}`}>
                      {contractResult.overall_risk} RISK
                    </div>
                    <div className="text-2xl font-bold text-white">{contractResult.risk_score}/100</div>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${contractResult.risk_score}%`,
                        background: contractResult.risk_score >= 70 ? '#ef4444' : contractResult.risk_score >= 40 ? '#f59e0b' : '#10b981'
                      }} />
                  </div>
                  {contractResult.summary && (
                    <p className="text-slate-300 text-sm mt-3 leading-relaxed">{contractResult.summary}</p>
                  )}
                </div>

                {contractResult.clauses?.length > 0 && (
                  <ResultCard title={`Clause Analysis (${contractResult.clauses.length})`}
                    color="text-white" border="border-slate-600/40" icon={FileSearch}>
                    <div className="space-y-3">
                      {contractResult.clauses.map((c: any, i: number) => (
                        <div key={i} className={`p-3 rounded-xl border ${riskCfg(c.risk).border} ${riskCfg(c.risk).bg}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium text-sm">{c.clause}</span>
                            <span className={`text-xs font-bold ${riskCfg(c.risk).color}`}>{c.risk}</span>
                          </div>
                          <p className="text-slate-400 text-xs">{c.issue}</p>
                          {c.recommendation && (
                            <p className="text-blue-400 text-xs mt-1">→ {c.recommendation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}

                {contractResult.negotiation_points?.length > 0 && (
                  <ResultCard title="Negotiation Points" color="text-orange-400" border="border-orange-500/20" icon={AlertTriangle}>
                    <ul className="space-y-1.5">
                      {contractResult.negotiation_points.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-orange-400 flex-shrink-0">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </ResultCard>
                )}

                {contractResult.missing_clauses?.length > 0 && (
                  <ResultCard title="Missing Clauses" color="text-red-400" border="border-red-500/20" icon={AlertTriangle}>
                    <ul className="space-y-1.5">
                      {contractResult.missing_clauses.map((c: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <X size={11} className="text-red-400 flex-shrink-0 mt-0.5" /> {c}
                        </li>
                      ))}
                    </ul>
                  </ResultCard>
                )}

                {contractResult.favorable_terms?.length > 0 && (
                  <ResultCard title="Favorable Terms" color="text-emerald-400" border="border-emerald-500/20" icon={CheckCircle}>
                    <ul className="space-y-1.5">
                      {contractResult.favorable_terms.map((t: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle size={11} className="text-emerald-400 flex-shrink-0 mt-0.5" /> {t}
                        </li>
                      ))}
                    </ul>
                  </ResultCard>
                )}
              </>
            )}
            {!contractResult && !contractLoading && (
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-10 text-center">
                <FileCheck size={36} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Paste a contract to get risk scoring, clause analysis, and negotiation points</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
