import React, { useState, useRef, useEffect } from 'react';
import { Swords, Send, Loader2, Settings } from 'lucide-react';
import { trialCoach } from '../lib/api';

interface Message { role: 'user' | 'assistant'; content: string; }

const ROLES = [
  { id: 'opposing_counsel', label: 'Opposing Counsel' },
  { id: 'judge', label: 'Federal Judge' },
  { id: 'hostile_witness', label: 'Hostile Witness' },
  { id: 'friendly_witness', label: 'Friendly Witness' },
  { id: 'expert_witness', label: 'Expert Witness' },
  { id: 'prosecutor', label: 'Prosecutor (AUSA)' },
  { id: 'juror', label: 'Skeptical Juror' },
];

const MODES = ['Cross Examination', 'Direct Examination', 'Opening Statement', 'Closing Argument', 'Voir Dire', 'Motion Argument'];
const DIFFICULTIES = ['Learn', 'Practice', 'Trial'];

export default function TrialCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({ role: 'opposing_counsel', mode: 'Cross Examination', difficulty: 'Practice', case_facts: '', witness_profile: '' });
  const [showConfig, setShowConfig] = useState(true);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const start = () => { setShowConfig(false); setStarted(true); setMessages([]); };

  const send = async () => {
    if (!input.trim() || loading) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    const res = await trialCoach({ messages: newMessages, config });
    if (res.reply) setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    setLoading(false);
  };

  const diffColor: Record<string, string> = { Learn: 'bg-green-600', Practice: 'bg-yellow-600', Trial: 'bg-red-600' };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Swords className="text-orange-400" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">Trial Coach</h1>
            <p className="text-slate-400 text-sm">Practice against AI judges, witnesses & opposing counsel</p>
          </div>
        </div>
        {started && (
          <button onClick={() => { setShowConfig(true); setStarted(false); }}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg">
            <Settings size={16} /> Configure
          </button>
        )}
      </div>

      {showConfig && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">
          <div className="text-white font-semibold">Session Configuration</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">AI Role</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => setConfig(c => ({ ...c, role: r.id }))}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors text-left
                      ${config.role === r.id ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Mode</label>
                <select value={config.mode} onChange={e => setConfig(c => ({ ...c, mode: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                  {MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map(d => (
                    <button key={d} onClick={() => setConfig(c => ({ ...c, difficulty: d }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                        ${config.difficulty === d ? diffColor[d] + ' text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Case Facts</label>
                <textarea value={config.case_facts} onChange={e => setConfig(c => ({ ...c, case_facts: e.target.value }))}
                  rows={3} placeholder="Brief case summary..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none resize-none" />
              </div>
              {(config.role.includes('witness') || config.role.includes('expert')) && (
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Witness Profile</label>
                  <input value={config.witness_profile} onChange={e => setConfig(c => ({ ...c, witness_profile: e.target.value }))}
                    placeholder="e.g. Former CFO with credibility issues..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                </div>
              )}
            </div>
          </div>
          <button onClick={start}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
            <Swords size={18} /> Begin Simulation
          </button>
        </div>
      )}

      {started && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl flex flex-col h-[600px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-300 font-medium">{ROLES.find(r => r.id === config.role)?.label} — {config.mode}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded font-medium ${diffColor[config.difficulty]} text-white`}>{config.difficulty}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 mt-8">
                <Swords className="mx-auto mb-3 opacity-30" size={40} />
                <div>Session ready. Begin your examination.</div>
                <div className="text-xs mt-1">Type your first question or statement.</div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed
                  ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-100'}`}>
                  <div className="text-xs opacity-60 mb-1">{m.role === 'user' ? 'You (Attorney)' : ROLES.find(r => r.id === config.role)?.label}</div>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 rounded-xl px-4 py-3">
                  <Loader2 className="text-orange-400 animate-spin" size={18} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="p-4 border-t border-slate-700 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Your question or statement..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500" />
            <button onClick={send} disabled={loading || !input.trim()}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white p-2.5 rounded-lg transition-colors">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
