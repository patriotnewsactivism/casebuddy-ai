import React, { useState, useRef, useEffect } from 'react';
import {
  UserPlus, Send, Loader2, CheckCircle, AlertCircle,
  Sparkles, Copy, Download, RefreshCw, ChevronRight
} from 'lucide-react';
import { aiParalegal } from '../lib/api';

interface Message { role: 'user' | 'assistant'; content: string; }

const URGENCY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

export default function IntakePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (started && !loading) inputRef.current?.focus();
  }, [started, loading]);

  const startIntake = async () => {
    setStarted(true);
    setLoading(true);
    const res = await aiParalegal({ messages: [] });
    if (res.reply) setMessages([{ role: 'assistant', content: res.reply }]);
    setLoading(false);
  };

  const reset = () => {
    setStarted(false);
    setMessages([]);
    setSummary(null);
    setInput('');
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    const res = await aiParalegal({ messages: newMessages });
    if (res.reply) {
      const cleanReply = res.reply.replace(/<INTAKE_SUMMARY>[\s\S]*?<\/INTAKE_SUMMARY>/, '').trim();
      setMessages(prev => [...prev, { role: 'assistant', content: cleanReply }]);
    }
    if (res.intakeSummary) setSummary(res.intakeSummary);
    setLoading(false);
  };

  const copyTranscript = () => {
    const text = messages.map(m => `${m.role === 'user' ? 'Client' : 'Alex'}: ${m.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSummary = () => {
    if (!summary) return;
    const text = `INTAKE SUMMARY — ${new Date().toLocaleDateString()}
======================================
Client: ${summary.client_name || '—'}
Case Type: ${summary.case_type || '—'}
Jurisdiction: ${summary.jurisdiction || '—'}
Viability Score: ${summary.case_viability_score || '—'}/100
Urgency: ${summary.urgency || '—'}

INCIDENT SUMMARY:
${summary.incident_summary || '—'}

KEY CLAIMS:
${summary.potential_claims?.map((c: string) => `• ${c}`).join('\n') || '—'}

SOL CONCERN:
${summary.statute_of_limitations_concern || 'None identified'}

NEXT STEPS:
${summary.next_steps?.map((s: string) => `• ${s}`).join('\n') || '—'}

RECOMMENDED DOCS:
${summary.recommended_documents?.map((d: string) => `• ${d}`).join('\n') || '—'}
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intake-${(summary.client_name || 'client').toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const urgency = summary?.urgency?.toLowerCase();
  const urgencyStyle = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.medium;

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {!started ? (
        /* Landing card */
        <div className="relative overflow-hidden bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8 text-center">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #8b5cf6 0%, transparent 60%)' }} />
          <div className="relative">
            <div className="w-20 h-20 bg-violet-600/20 border border-violet-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <UserPlus className="text-violet-400" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Meet Alex, Your AI Paralegal</h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
              Alex conducts a comprehensive intake interview, identifies legal claims, flags statute of limitations concerns,
              assesses case viability, and produces a full case summary — automatically.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {[
                'Identifies legal claims',
                'Flags SOL deadlines',
                'Assesses viability (0–100)',
                'Recommends next steps',
                'Documents to collect',
              ].map(f => (
                <span key={f} className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs px-3 py-1.5 rounded-full">
                  <CheckCircle size={11} /> {f}
                </span>
              ))}
            </div>
            <button
              onClick={startIntake}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors text-sm"
            >
              <Sparkles size={16} /> Begin Intake Interview
            </button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-5">
          {/* Chat panel */}
          <div className="lg:col-span-3 flex flex-col bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden"
            style={{ height: '620px' }}>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/40 bg-slate-800/40">
              <div className="relative">
                <div className="w-9 h-9 bg-violet-600/30 border border-violet-500/40 rounded-xl flex items-center justify-center">
                  <Sparkles size={16} className="text-violet-400" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-800" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">Alex</div>
                <div className="text-slate-500 text-xs">AI Paralegal • Online</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={copyTranscript}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-slate-700">
                  {copied ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
                <button onClick={reset}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-slate-700">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 bg-violet-600/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 mr-2">
                      <Sparkles size={11} className="text-violet-400" />
                    </div>
                  )}
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed prose-chat
                    ${m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-slate-700/80 text-slate-100 rounded-bl-sm border border-slate-600/40'
                    }`}
                    dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br/>') }}
                  />
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 bg-violet-600/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 mr-2">
                    <Sparkles size={11} className="text-violet-400" />
                  </div>
                  <div className="bg-slate-700/80 border border-slate-600/40 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-700/40 bg-slate-800/30">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Type your response... (Enter to send)"
                  disabled={loading}
                  className="flex-1 bg-slate-700/60 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-colors disabled:opacity-50"
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Summary panel */}
          <div className="lg:col-span-2 space-y-4">
            {summary ? (
              <>
                {/* Viability card */}
                <div className="bg-slate-800/60 border border-emerald-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={16} className="text-emerald-400" />
                    <span className="text-emerald-400 font-semibold text-sm">Intake Complete</span>
                    <button onClick={downloadSummary}
                      className="ml-auto text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-700">
                      <Download size={13} />
                    </button>
                  </div>

                  {/* Viability meter */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">Case Viability</span>
                      <span className="text-white font-bold text-lg">{summary.case_viability_score || '—'}/100</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${summary.case_viability_score || 0}%`,
                          background: summary.case_viability_score >= 70 ? '#10b981' : summary.case_viability_score >= 40 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    {[
                      { label: 'Client', value: summary.client_name },
                      { label: 'Case Type', value: summary.case_type },
                      { label: 'Jurisdiction', value: summary.jurisdiction },
                    ].map(({ label, value }) => value ? (
                      <div key={label} className="flex justify-between">
                        <span className="text-slate-500">{label}</span>
                        <span className="text-white font-medium text-right max-w-[60%] truncate">{value}</span>
                      </div>
                    ) : null)}

                    {urgency && (
                      <div className={`flex items-center justify-between mt-1 px-2 py-1.5 rounded-lg ${urgencyStyle.bg} border ${urgencyStyle.border}`}>
                        <span className="text-slate-400 text-xs">Urgency</span>
                        <span className={`${urgencyStyle.color} font-semibold text-xs uppercase`}>{urgency}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SOL Warning */}
                {summary.statute_of_limitations_concern && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                      <span className="text-red-400 font-semibold text-xs uppercase tracking-wide">SOL Warning</span>
                    </div>
                    <p className="text-red-300 text-xs leading-relaxed">{summary.statute_of_limitations_concern}</p>
                  </div>
                )}

                {/* Claims */}
                {summary.potential_claims?.length > 0 && (
                  <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
                    <h4 className="text-white text-xs font-semibold uppercase tracking-wide mb-2">Potential Claims</h4>
                    <div className="space-y-1">
                      {summary.potential_claims.map((c: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <ChevronRight size={11} className="text-blue-400 flex-shrink-0 mt-0.5" />
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {summary.next_steps?.length > 0 && (
                  <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
                    <h4 className="text-white text-xs font-semibold uppercase tracking-wide mb-2">Next Steps</h4>
                    <div className="space-y-1.5">
                      {summary.next_steps.slice(0, 4).map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="w-4 h-4 bg-blue-600/30 border border-blue-500/30 rounded text-blue-400 text-[9px] flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5">
                <div className="text-center py-4">
                  <Sparkles size={28} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Case summary will appear here as Alex gathers information.</p>
                </div>
                <div className="space-y-2 mt-4">
                  {[
                    'Client background & contact info',
                    'Incident facts & timeline',
                    'Legal claims & theories',
                    'Case viability score',
                    'SOL & deadline warnings',
                    'Documents to collect',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1 h-1 rounded-full bg-slate-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
