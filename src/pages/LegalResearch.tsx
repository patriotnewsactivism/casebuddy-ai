import React, { useState } from 'react';
import { BookOpen, Loader2, Scale, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { analyzeDocument } from '../lib/api';

export default function LegalResearch() {
  const [question, setQuestion] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Federal');
  const [area, setArea] = useState('Contract Law');
  const [facts, setFacts] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const jurisdictions = ['Federal', '1st Circuit', '2nd Circuit', '3rd Circuit', '4th Circuit', '5th Circuit', '6th Circuit', '7th Circuit', '8th Circuit', '9th Circuit', '10th Circuit', '11th Circuit', 'Alabama', 'Alaska', 'Arizona', 'California', 'Colorado', 'Florida', 'Georgia', 'Illinois', 'New York', 'Texas', 'Washington'];
  const areas = ['Contract Law', 'Tort Law', 'Criminal Law', 'Constitutional Law', 'Employment Law', 'Family Law', 'Real Property', 'Civil Rights', 'Personal Injury', 'Corporate Law', 'Evidence', 'Procedure', 'Immigration', 'Intellectual Property'];

  const research = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);

    const prompt = `You are a senior partner at a top law firm doing legal research.

RESEARCH QUESTION: ${question}
JURISDICTION: ${jurisdiction}
AREA OF LAW: ${area}
CASE FACTS: ${facts || 'Not provided'}

Provide comprehensive legal research in this exact JSON format:
{
  "research_summary": "2-3 paragraph executive summary of the legal landscape",
  "statutes": [{"cite": "statute citation", "text": "relevant text", "how_it_applies": "application to facts"}],
  "case_law": [{"case": "case name + citation", "holding": "what court held", "relevance": "how it helps or hurts", "side": "for_us or against_us"}],
  "argument_for": ["strongest argument in favor, with authority"],
  "argument_against": ["strongest argument against, with authority"],
  "win_probability": 65,
  "win_probability_reasoning": "honest assessment of why",
  "recommended_strategy": "specific tactical recommendation",
  "key_motions": ["motion to file with basis"],
  "jury_instructions": ["relevant jury instruction to request"],
  "damages_theory": "how to maximize/minimize damages",
  "memo_outline": ["I. Issue", "II. Brief Answer", "III. Facts", "IV. Analysis", "V. Conclusion"]
}`;

    const res = await analyzeDocument({ text: prompt, document_type: 'Legal Research Query', case_summary: facts });
    if (res.analysis) {
      if (typeof res.analysis === 'object' && res.analysis.summary) {
        try {
          const match = res.analysis.summary.match(/\{[\s\S]*\}/);
          if (match) setResult(JSON.parse(match[0]));
          else setResult({ research_summary: res.analysis.summary });
        } catch { setResult({ research_summary: res.analysis.summary }); }
      } else {
        setResult(res.analysis);
      }
    }
    setLoading(false);
  };

  const winColor = (p: number) => p >= 65 ? 'text-green-400' : p >= 45 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="text-indigo-400" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white">Legal Research</h1>
          <p className="text-slate-400 text-sm">AI-powered case law analysis, statutes, strategy & win probability</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Research Question</label>
            <textarea value={question} onChange={e => setQuestion(e.target.value)}
              rows={3} placeholder="e.g. Can plaintiff recover punitive damages for breach of employment contract in California?"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Jurisdiction</label>
              <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                {jurisdictions.map(j => <option key={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Area of Law</label>
              <select value={area} onChange={e => setArea(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                {areas.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Case Facts (optional but improves analysis)</label>
            <textarea value={facts} onChange={e => setFacts(e.target.value)}
              rows={4} placeholder="Brief summary of your case facts..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
          <button onClick={research} disabled={loading || !question.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={18} />Researching...</> : <><BookOpen size={18} />Run Legal Research</>}
          </button>
          <div className="text-xs text-slate-500 text-center">⚠️ AI research assists attorneys — always verify citations independently</div>
        </div>

        <div className="space-y-4">
          {!result && !loading && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center text-slate-500">
              <BookOpen className="mx-auto mb-3 opacity-30" size={40} />
              <div>Research results will appear here</div>
            </div>
          )}
          {result && (
            <>
              {result.win_probability !== undefined && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${winColor(result.win_probability)}`}>{result.win_probability}%</div>
                    <div className="text-xs text-slate-400 mt-1">Win Probability</div>
                  </div>
                  <div className="text-slate-300 text-sm flex-1">{result.win_probability_reasoning}</div>
                </div>
              )}
              {result.research_summary && (
                <div className="bg-slate-800 border border-indigo-500/30 rounded-xl p-4">
                  <div className="text-indigo-400 font-semibold text-sm mb-2">Research Summary</div>
                  <div className="text-slate-300 text-sm leading-relaxed">{result.research_summary}</div>
                </div>
              )}
              {result.case_law?.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="text-white font-semibold text-sm mb-3">Key Cases ({result.case_law.length})</div>
                  {result.case_law.map((c: any, i: number) => (
                    <div key={i} className="border-b border-slate-700 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                      <div className="flex items-start gap-2">
                        {c.side === 'for_us' ? <TrendingUp className="text-green-400 mt-0.5 flex-shrink-0" size={14} /> : <TrendingDown className="text-red-400 mt-0.5 flex-shrink-0" size={14} />}
                        <div>
                          <div className="text-white text-sm font-medium">{c.case}</div>
                          <div className="text-slate-400 text-xs mt-0.5">{c.holding}</div>
                          <div className={`text-xs mt-0.5 ${c.side === 'for_us' ? 'text-green-400' : 'text-red-400'}`}>{c.relevance}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {(result.argument_for?.length > 0 || result.argument_against?.length > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800 border border-green-500/30 rounded-xl p-4">
                    <div className="text-green-400 font-semibold text-sm mb-2">Arguments For</div>
                    {result.argument_for?.map((a: string, i: number) => <div key={i} className="text-slate-300 text-xs py-1">• {a}</div>)}
                  </div>
                  <div className="bg-slate-800 border border-red-500/30 rounded-xl p-4">
                    <div className="text-red-400 font-semibold text-sm mb-2">Arguments Against</div>
                    {result.argument_against?.map((a: string, i: number) => <div key={i} className="text-slate-300 text-xs py-1">• {a}</div>)}
                  </div>
                </div>
              )}
              {result.recommended_strategy && (
                <div className="bg-slate-800 border border-yellow-500/30 rounded-xl p-4">
                  <div className="text-yellow-400 font-semibold text-sm mb-2">⚡ Recommended Strategy</div>
                  <div className="text-slate-300 text-sm">{result.recommended_strategy}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
