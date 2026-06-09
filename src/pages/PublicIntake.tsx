import React, { useState } from 'react';
import { Scale, Send, Loader2, CheckCircle, Shield, Clock, Brain, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analyzeDocument } from '../lib/api';

interface IntakeData {
  fullName: string; email: string; phone: string;
  caseType: string; jurisdiction: string; description: string;
  urgency: string; hasEvidence: string;
}

const CASE_TYPES = [
  'Civil Rights Violation', 'Police Misconduct', 'Excessive Force',
  'First Amendment / Press Freedom', 'False Arrest / Imprisonment',
  'Employment Discrimination', 'Government Accountability',
  'Personal Injury', 'Other',
];

export default function PublicIntake() {
  const [step, setStep] = useState<'form' | 'analyzing' | 'result'>('form');
  const [data, setData] = useState<IntakeData>({
    fullName: '', email: '', phone: '', caseType: '', jurisdiction: '',
    description: '', urgency: 'standard', hasEvidence: 'no',
  });
  const [analysis, setAnalysis] = useState<any>(null);

  const update = (field: keyof IntakeData, value: string) =>
    setData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('analyzing');

    try {
      // Save to Supabase
      await supabase.from('intake_submissions').insert({
        full_name: data.fullName, email: data.email, phone: data.phone,
        case_type: data.caseType, jurisdiction: data.jurisdiction,
        description: data.description, urgency: data.urgency,
        has_evidence: data.hasEvidence === 'yes', status: 'new',
      });

      // AI Analysis
      const result = await analyzeDocument({
        prompt: `You are a legal case evaluator. Analyze this potential case and provide:
1. Case Strength Score (1-10)
2. Suggested legal claims/causes of action
3. Key statute of limitations concerns
4. Estimated case value range (if applicable)
5. Recommended immediate next steps
6. Required evidence to gather

Case Type: ${data.caseType}
Jurisdiction: ${data.jurisdiction}
Description: ${data.description}
Has Evidence: ${data.hasEvidence}
Urgency: ${data.urgency}

Respond in JSON with keys: strength_score, claims, sol_concerns, value_range, next_steps, evidence_needed`,
        type: 'case_evaluation'
      });

      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setAnalysis({ strength_score: 'N/A', claims: ['Analysis pending — our team will review your case personally.'], next_steps: ['We will contact you within 24 hours.'] });
    }
    setStep('result');
  };

  if (step === 'analyzing') return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Brain className="mx-auto text-blue-400 animate-pulse mb-4" size={48} />
        <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Case</h2>
        <p className="text-slate-400">Our AI is evaluating your situation...</p>
        <Loader2 className="mx-auto text-blue-400 animate-spin mt-4" size={24} />
      </div>
    </div>
  );

  if (step === 'result') return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white">Case Submitted Successfully</h2>
          <p className="text-slate-400 mt-2">Here's our preliminary AI assessment. An attorney will review your case within 24 hours.</p>
        </div>
        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 space-y-4">
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4">
            <h3 className="text-blue-400 font-medium mb-2">AI Case Assessment</h3>
            <pre className="text-slate-300 text-sm whitespace-pre-wrap">{typeof analysis === 'object' ? JSON.stringify(analysis, null, 2) : analysis}</pre>
          </div>
          <p className="text-xs text-slate-500 text-center">
            ⚖️ This AI assessment is for informational purposes only and does not constitute legal advice.
          </p>
        </div>
        <div className="text-center mt-6">
          <a href="/" className="text-blue-400 hover:text-blue-300 text-sm">← Return to CaseBuddy AI</a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <Scale className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">Free Case Evaluation</h1>
          <p className="text-slate-400 mt-2">Get an instant AI-powered assessment of your case. 100% confidential.</p>
        </div>

        {/* Trust badges */}
        <div className="flex justify-center gap-6 mb-8 text-sm text-slate-400">
          <div className="flex items-center gap-1"><Shield size={14} className="text-green-400" /> Confidential</div>
          <div className="flex items-center gap-1"><Clock size={14} className="text-blue-400" /> Instant Analysis</div>
          <div className="flex items-center gap-1"><Brain size={14} className="text-purple-400" /> AI-Powered</div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700/60 rounded-2xl p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Full Name *</label>
              <input type="text" required value={data.fullName} onChange={e => update('fullName', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Email *</label>
              <input type="email" required value={data.email} onChange={e => update('email', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Phone</label>
              <input type="tel" value={data.phone} onChange={e => update('phone', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">State / Jurisdiction *</label>
              <input type="text" required value={data.jurisdiction} onChange={e => update('jurisdiction', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none"
                placeholder="e.g. Mississippi" />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Type of Case *</label>
            <select required value={data.caseType} onChange={e => update('caseType', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none">
              <option value="">Select case type...</option>
              {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Describe Your Situation *</label>
            <textarea required value={data.description} onChange={e => update('description', e.target.value)} rows={5}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none resize-none"
              placeholder="Tell us what happened. Include dates, names, and any key details..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Do you have evidence?</label>
              <select value={data.hasEvidence} onChange={e => update('hasEvidence', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none">
                <option value="no">No</option>
                <option value="yes">Yes — photos, video, documents</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Urgency</label>
              <select value={data.urgency} onChange={e => update('urgency', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none">
                <option value="standard">Standard</option>
                <option value="urgent">Urgent — deadline approaching</option>
                <option value="emergency">Emergency — need help now</option>
              </select>
            </div>
          </div>

          <button type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 text-lg">
            Get Free Case Evaluation <ArrowRight size={18} />
          </button>

          <p className="text-xs text-slate-500 text-center">
            By submitting, you agree to our Terms of Service. This does not create an attorney-client relationship.
          </p>
        </form>
      </div>
    </div>
  );
}
