import React, { useState } from 'react';
import { Users, Loader2, ChevronDown, ChevronUp, Brain, AlertTriangle, MessageSquare } from 'lucide-react';
import { trialCoach } from '../lib/api';

interface WitnessForm {
  name: string;
  witness_type: 'fact' | 'expert' | 'character';
  side: 'ours' | 'theirs';
  occupation: string;
  expected_testimony: string;
  prior_statements: string;
  vulnerabilities: string;
}

export default function WitnessPrep() {
  const [form, setForm] = useState<WitnessForm>({
    name: '', witness_type: 'fact', side: 'theirs', occupation: '',
    expected_testimony: '', prior_statements: '', vulnerabilities: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [expanded, setExpanded] = useState<string[]>(['direct', 'cross']);

  const toggle = (k: string) => setExpanded(e => e.includes(k) ? e.filter(x => x !== k) : [...e, k]);

  const generate = async () => {
    if (!form.name || !form.expected_testimony) return;
    setLoading(true);
    setResult(null);

    const prompt = `You are a senior trial attorney preparing witness examination questions.

WITNESS: ${form.name}
TYPE: ${form.witness_type} witness
SIDE: ${form.side === 'ours' ? 'Our witness' : 'Opposing witness'}
OCCUPATION: ${form.occupation}
EXPECTED TESTIMONY: ${form.expected_testimony}
PRIOR STATEMENTS: ${form.prior_statements || 'None provided'}
KNOWN VULNERABILITIES: ${form.vulnerabilities || 'None provided'}

Generate a comprehensive witness prep package in this JSON format:
{
  "ai_prep_notes": "2-3 paragraph strategic overview of this witness",
  "direct_questions": ["Q1", "Q2", "Q3", "up to 15 direct exam questions if our witness"],
  "cross_questions": ["Q1", "Q2", "Q3", "up to 20 cross examination questions if their witness"],
  "anticipated_answers": ["anticipated answer for each question above"],
  "credibility_assessment": "honest assessment of credibility 1-10 with reasoning",
  "vulnerabilities": ["specific vulnerability to exploit on cross"],
  "rehabilitation_strategy": "if our witness gets damaged on cross, how to rehabilitate",
  "key_themes": ["theme to emphasize with this witness"],
  "danger_zones": ["topics to absolutely avoid"],
  "opening_gambit": "first question to ask - most impactful opener",
  "closing_question": "last question to ask - leave jury with this"
}`;

    const res = await trialCoach({
      messages: [{ role: 'user', content: prompt }],
      config: { role: 'opposing_counsel', mode: 'Witness Prep', difficulty: 'Practice', case_facts: form.expected_testimony }
    });

    if (res.reply) {
      try {
        const match = res.reply.match(/\{[\s\S]*\}/);
        if (match) setResult(JSON.parse(match[0]));
        else setResult({ ai_prep_notes: res.reply });
      } catch { setResult({ ai_prep_notes: res.reply }); }
    }
    setLoading(false);
  };

  const Section = ({ id, title, color, children }: any) => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-750">
        <div className={`font-semibold text-sm ${color}`}>{title}</div>
        {expanded.includes(id) ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {expanded.includes(id) && <div className="px-5 pb-4">{children}</div>}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Users className="text-cyan-400" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white">Witness Prep</h1>
          <p className="text-slate-400 text-sm">AI-generated direct & cross examination questions with strategy</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Witness Name</label>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="Full name"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Occupation</label>
              <input value={form.occupation} onChange={e => setForm(f => ({...f, occupation: e.target.value}))}
                placeholder="Job title"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Witness Type</label>
              <select value={form.witness_type} onChange={e => setForm(f => ({...f, witness_type: e.target.value as any}))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                <option value="fact">Fact Witness</option>
                <option value="expert">Expert Witness</option>
                <option value="character">Character Witness</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Side</label>
              <select value={form.side} onChange={e => setForm(f => ({...f, side: e.target.value as any}))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                <option value="ours">Our Witness (Direct)</option>
                <option value="theirs">Their Witness (Cross)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Expected Testimony</label>
            <textarea value={form.expected_testimony} onChange={e => setForm(f => ({...f, expected_testimony: e.target.value}))}
              rows={4} placeholder="What will this witness say? What do they know?"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Prior Statements / Deposition</label>
            <textarea value={form.prior_statements} onChange={e => setForm(f => ({...f, prior_statements: e.target.value}))}
              rows={3} placeholder="Any prior statements, deposition excerpts, inconsistencies..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Known Vulnerabilities</label>
            <textarea value={form.vulnerabilities} onChange={e => setForm(f => ({...f, vulnerabilities: e.target.value}))}
              rows={2} placeholder="Bias, prior convictions, inconsistent statements, financial interest..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none" />
          </div>
          <button onClick={generate} disabled={loading || !form.name || !form.expected_testimony}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={18} />Generating...</> : <><Brain size={18} />Generate Witness Prep</>}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {!result && !loading && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center text-slate-500">
              <Users className="mx-auto mb-3 opacity-30" size={40} />
              <div>Fill in witness details and generate prep notes</div>
            </div>
          )}
          {result && (
            <>
              {result.ai_prep_notes && (
                <div className="bg-slate-800 border border-cyan-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm mb-2"><Brain size={16} />Strategic Overview</div>
                  <div className="text-slate-300 text-sm leading-relaxed">{result.ai_prep_notes}</div>
                </div>
              )}
              {result.opening_gambit && (
                <div className="bg-slate-800 border border-yellow-500/30 rounded-xl p-4">
                  <div className="text-yellow-400 font-semibold text-sm mb-1">⚡ Opening Gambit</div>
                  <div className="text-white text-sm">"{result.opening_gambit}"</div>
                </div>
              )}
              <Section id="cross" title={`Cross Examination Questions (${result.cross_questions?.length || 0})`} color="text-red-400">
                {result.cross_questions?.map((q: string, i: number) => (
                  <div key={i} className="py-2 border-b border-slate-700 last:border-0">
                    <div className="text-white text-sm">{i+1}. {q}</div>
                    {result.anticipated_answers?.[i] && <div className="text-slate-400 text-xs mt-1 italic">↳ {result.anticipated_answers[i]}</div>}
                  </div>
                ))}
              </Section>
              <Section id="direct" title={`Direct Examination Questions (${result.direct_questions?.length || 0})`} color="text-green-400">
                {result.direct_questions?.map((q: string, i: number) => (
                  <div key={i} className="py-2 border-b border-slate-700 last:border-0">
                    <div className="text-white text-sm">{i+1}. {q}</div>
                  </div>
                ))}
              </Section>
              {result.vulnerabilities?.length > 0 && (
                <Section id="vuln" title="Vulnerabilities to Exploit" color="text-orange-400">
                  {result.vulnerabilities.map((v: string, i: number) => <div key={i} className="text-slate-300 text-sm py-1">• {v}</div>)}
                </Section>
              )}
              {result.danger_zones?.length > 0 && (
                <Section id="danger" title="⚠️ Danger Zones — Avoid These" color="text-red-400">
                  {result.danger_zones.map((d: string, i: number) => <div key={i} className="text-red-300 text-sm py-1">• {d}</div>)}
                </Section>
              )}
              {result.closing_question && (
                <div className="bg-slate-800 border border-purple-500/30 rounded-xl p-4">
                  <div className="text-purple-400 font-semibold text-sm mb-1">🎯 Closing Question</div>
                  <div className="text-white text-sm">"{result.closing_question}"</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
