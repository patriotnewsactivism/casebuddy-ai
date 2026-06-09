import React, { useState } from 'react';
import { FileCheck, Upload, Loader2, AlertTriangle, CheckCircle, Shield, X, ArrowRight, Clock, DollarSign, Scale, Eye } from 'lucide-react';
import { analyzeDocument } from '../lib/api';

interface ClauseIssue {
  clause: string; risk: 'high' | 'medium' | 'low' | 'info';
  title: string; explanation: string; suggestion: string;
}

interface ReviewResult {
  summary: string; overallRisk: 'high' | 'medium' | 'low';
  score: number; clauses: ClauseIssue[]; keyTerms: string[];
  recommendations: string[];
}

export default function ContractReview() {
  const [text, setText] = useState('');
  const [contractType, setContractType] = useState('Employment Agreement');
  const [partyRole, setPartyRole] = useState('Employee');
  const [reviewing, setReviewing] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [selectedClause, setSelectedClause] = useState<ClauseIssue | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setText(ev.target?.result as string || '');
    reader.readAsText(file);
  };

  const reviewContract = async () => {
    if (!text.trim()) return;
    setReviewing(true);
    setResult(null);

    try {
      const res = await analyzeDocument({
        text: `REVIEW THIS CONTRACT:\n\n${text}`,
        document_type: 'Contract',
        case_summary: `Contract type: ${contractType}. Reviewing on behalf of the ${partyRole}. Analyze for: unfavorable terms, hidden obligations, liability risks, non-compete/non-solicitation issues, termination clauses, indemnification traps, limitation of liability, arbitration clauses, intellectual property assignment, and any terms that deviate from market standard.`,
      });

      // Build structured result from AI analysis
      const analysis = res.analysis || {};
      const clauses: ClauseIssue[] = [];

      if (analysis.risks?.length > 0) {
        analysis.risks.forEach((r: string, i: number) => {
          clauses.push({ clause: `Section ${i + 1}`, risk: i === 0 ? 'high' : 'medium', title: `Risk: ${r.substring(0, 60)}`, explanation: r, suggestion: 'Consider negotiating this term or seeking legal counsel.' });
        });
      }
      if (analysis.gems?.length > 0) {
        analysis.gems.forEach((g: string, i: number) => {
          clauses.push({ clause: `Favorable Term ${i + 1}`, risk: 'info', title: `Favorable: ${g.substring(0, 60)}`, explanation: g, suggestion: 'This term is favorable — ensure it remains in the final version.' });
        });
      }

      // Add standard contract review items if AI didn't find specific issues
      if (clauses.length < 3) {
        const standardChecks: ClauseIssue[] = [
          { clause: 'Termination', risk: 'medium', title: 'Termination provisions', explanation: 'Review the termination clause for notice periods, for-cause vs without-cause provisions, and post-termination obligations.', suggestion: 'Ensure mutual termination rights and reasonable notice periods (30-60 days standard).' },
          { clause: 'Non-Compete', risk: 'high', title: 'Non-compete / Non-solicitation', explanation: 'Non-compete clauses can significantly limit future employment. Check scope (geographic area, duration, industry).', suggestion: 'Negotiate narrower scope: 6-12 months maximum, limited geographic area, specific competitors only.' },
          { clause: 'Indemnification', risk: 'medium', title: 'Indemnification clause', explanation: 'Check whether indemnification is mutual or one-sided. One-sided indemnification can expose you to significant liability.', suggestion: 'Push for mutual indemnification with reasonable caps tied to contract value.' },
          { clause: 'Arbitration', risk: 'low', title: 'Dispute resolution / Arbitration', explanation: 'Mandatory arbitration clauses waive your right to a jury trial and may limit discovery.', suggestion: 'Consider whether you prefer court litigation vs arbitration. Ensure neutral arbitrator selection process.' },
          { clause: 'IP Assignment', risk: 'high', title: 'Intellectual property assignment', explanation: 'Broad IP assignment clauses may capture work product created outside of employment or pre-existing IP.', suggestion: 'Carve out pre-existing IP, personal projects, and work done outside business hours with non-company resources.' },
          { clause: 'Liability', risk: 'low', title: 'Limitation of liability', explanation: 'Check for caps on liability and exclusion of consequential damages.', suggestion: 'Ensure the liability cap is reasonable relative to the contract value.' },
        ];
        clauses.push(...standardChecks.slice(0, 6 - clauses.length));
      }

      const highCount = clauses.filter(c => c.risk === 'high').length;
      const medCount = clauses.filter(c => c.risk === 'medium').length;
      const score = Math.max(30, 100 - (highCount * 20) - (medCount * 10));

      setResult({
        summary: analysis.summary || `Contract reviewed. Found ${highCount} high-risk and ${medCount} medium-risk issues.`,
        overallRisk: highCount > 1 ? 'high' : medCount > 2 ? 'medium' : 'low',
        score,
        clauses,
        keyTerms: analysis.key_facts?.slice(0, 5) || [`${contractType}`, `${partyRole} role`, 'Review complete'],
        recommendations: analysis.motions_suggested || [
          'Have an attorney review all high-risk clauses before signing',
          'Request redline markup of suggested changes',
          'Document all verbal promises in writing',
        ],
      });
    } catch {
      setResult({
        summary: 'Unable to complete AI review. Please try again or paste the contract text directly.',
        overallRisk: 'medium', score: 50, clauses: [], keyTerms: [], recommendations: ['Try pasting the contract text directly for better results.'],
      });
    }
    setReviewing(false);
  };

  const riskColor = (r: string) => {
    switch (r) {
      case 'high': return 'border-red-500/40 bg-red-500/10';
      case 'medium': return 'border-yellow-500/40 bg-yellow-500/10';
      case 'low': return 'border-blue-500/40 bg-blue-500/10';
      default: return 'border-emerald-500/40 bg-emerald-500/10';
    }
  };

  const riskBadge = (r: string) => {
    switch (r) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-emerald-500/20 text-emerald-400';
    }
  };

  const CONTRACT_TYPES = ['Employment Agreement', 'Service Agreement', 'NDA / Confidentiality', 'Lease / Rental', 'Settlement Agreement', 'Vendor Contract', 'Partnership Agreement', 'Independent Contractor', 'License Agreement', 'Other'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FileCheck className="text-teal-400" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white">Contract Review AI</h1>
          <p className="text-slate-400 text-sm">Upload any contract — AI flags risks, hidden terms, and negotiation opportunities</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Upload Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Contract Type</label>
              <select value={contractType} onChange={e => setContractType(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                {CONTRACT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Your Role</label>
              <select value={partyRole} onChange={e => setPartyRole(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                {['Employee', 'Employer', 'Service Provider', 'Client', 'Tenant', 'Landlord', 'Licensee', 'Licensor', 'Partner', 'Contractor'].map(r =>
                  <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Upload Contract</label>
              <label className="flex items-center gap-2 border-2 border-dashed border-slate-600 rounded-lg p-4 cursor-pointer hover:border-teal-500 transition-colors">
                <Upload className="text-slate-400" size={20} />
                <span className="text-slate-400 text-sm">Click to upload (.txt, .md)</span>
                <input type="file" accept=".txt,.md,.doc" className="hidden" onChange={handleFile} />
              </label>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Or paste contract text</label>
              <textarea value={text} onChange={e => setText(e.target.value)}
                rows={10} placeholder="Paste the full contract text here..."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500 resize-none" />
            </div>
            <button onClick={reviewContract} disabled={reviewing || !text.trim()}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
              {reviewing ? <><Loader2 className="animate-spin" size={18} /> Reviewing...</> : <><Scale size={18} /> Review Contract</>}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {!result && !reviewing && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
              <FileCheck className="mx-auto text-slate-600 mb-3" size={48} />
              <p className="text-slate-500">Upload a contract to see AI analysis</p>
            </div>
          )}

          {result && (
            <>
              {/* Score Card */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`rounded-xl p-4 border ${
                  result.overallRisk === 'high' ? 'border-red-500/30 bg-red-500/5' :
                  result.overallRisk === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5' :
                  'border-emerald-500/30 bg-emerald-500/5'
                }`}>
                  <div className="text-slate-400 text-xs mb-1">Risk Score</div>
                  <div className={`text-3xl font-bold ${
                    result.score >= 70 ? 'text-emerald-400' : result.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>{result.score}/100</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="text-slate-400 text-xs mb-1">Issues Found</div>
                  <div className="text-2xl font-bold text-white">{result.clauses.length}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="text-slate-400 text-xs mb-1">High Risk</div>
                  <div className="text-2xl font-bold text-red-400">{result.clauses.filter(c => c.risk === 'high').length}</div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="text-teal-400 font-semibold text-sm mb-2">Summary</div>
                <div className="text-slate-300 text-sm">{result.summary}</div>
              </div>

              {/* Clause Issues */}
              <div className="space-y-3">
                <h3 className="text-white font-semibold text-sm">Clause Analysis</h3>
                {result.clauses.map((c, i) => (
                  <div key={i}
                    className={`rounded-xl p-4 border cursor-pointer transition-all ${riskColor(c.risk)} ${
                      selectedClause === c ? 'ring-1 ring-white/20' : ''
                    }`}
                    onClick={() => setSelectedClause(selectedClause === c ? null : c)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">
                          {c.risk === 'high' ? <AlertTriangle size={16} className="text-red-400" /> :
                           c.risk === 'medium' ? <AlertTriangle size={16} className="text-yellow-400" /> :
                           c.risk === 'info' ? <CheckCircle size={16} className="text-emerald-400" /> :
                           <Shield size={16} className="text-blue-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium text-sm">{c.title}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded uppercase font-bold ${riskBadge(c.risk)}`}>{c.risk}</span>
                          </div>
                          <div className="text-slate-500 text-xs">{c.clause}</div>
                        </div>
                      </div>
                      <Eye size={14} className="text-slate-500 shrink-0 mt-1" />
                    </div>
                    {selectedClause === c && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2">
                        <div className="text-slate-300 text-sm">{c.explanation}</div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className="text-teal-400 text-xs font-semibold mb-1">💡 Recommendation</div>
                          <div className="text-slate-300 text-sm">{c.suggestion}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="text-teal-400 font-semibold text-sm mb-3">Next Steps</div>
                  {result.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 py-1.5">
                      <ArrowRight size={14} className="text-teal-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
