import React, { useState, useRef, useEffect } from 'react';
import { Users, Send, Loader2, BarChart2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { trialCoach } from '../lib/api';

interface Message { role: 'user' | 'assistant'; content: string; juror?: number; }

const JUROR_PROFILES = [
  { id: 1, name: 'Patricia M.', bg: 'Retired school teacher, age 62', lean: 'neutral', avatar: '👩‍🏫' },
  { id: 2, name: 'Marcus T.', bg: 'Small business owner, age 45', lean: 'defense', avatar: '👨‍💼' },
  { id: 3, name: 'Keisha R.', bg: 'Nurse, age 34, community activist', lean: 'plaintiff', avatar: '👩‍⚕️' },
  { id: 4, name: 'Dave L.', bg: 'Ex-military, age 55, strict law & order', lean: 'defense', avatar: '👨‍✈️' },
  { id: 5, name: 'Sofia G.', bg: 'Single mom, age 29, marketing analyst', lean: 'plaintiff', avatar: '👩‍💻' },
  { id: 6, name: 'Robert K.', bg: 'Accountant, age 50, skeptic', lean: 'neutral', avatar: '🧑‍💼' },
];

export default function JurySim() {
  const [caseFacts, setCaseFacts] = useState('');
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<Record<number, number>>({ 1: 50, 2: 50, 3: 50, 4: 50, 5: 50, 6: 50 });
  const [activeJuror, setActiveJuror] = useState(1);
  const [phase, setPhase] = useState<'opening' | 'questions' | 'closing' | 'verdict'>('opening');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const start = () => { setStarted(true); setMessages([]); setScores({ 1: 50, 2: 50, 3: 50, 4: 50, 5: 50, 6: 50 }); };

  const sendToJuror = async (jurorId: number) => {
    if (!input.trim() || loading) return;
    const juror = JUROR_PROFILES.find(j => j.id === jurorId)!;
    const newMessages: Message[] = [...messages, { role: 'user', content: `[To ${juror.name}]: ${input}` }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const leanNote = juror.lean === 'plaintiff' ? 'You lean toward believing plaintiffs/prosecution.' : juror.lean === 'defense' ? 'You lean toward believing defendants.' : 'You are genuinely undecided.';

    const res = await trialCoach({
      messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      config: {
        role: 'juror',
        mode: phase === 'opening' ? 'Opening Statement' : phase === 'closing' ? 'Closing Argument' : 'Voir Dire',
        difficulty: 'Practice',
        case_facts: caseFacts,
        witness_profile: `You are juror ${juror.name}. Background: ${juror.bg}. ${leanNote} Respond as this specific person with their personality. After your response, on a new line write exactly: PERSUASION_DELTA:+5 or PERSUASION_DELTA:-3 (a number from -10 to +10 indicating how much this argument moved you toward the plaintiff/prosecution)`
      }
    });

    if (res.reply) {
      const deltaMatch = res.reply.match(/PERSUASION_DELTA:([+-]?\d+)/);
      const cleanReply = res.reply.replace(/PERSUASION_DELTA:[+-]?\d+/, '').trim();
      if (deltaMatch) {
        const delta = parseInt(deltaMatch[1]);
        setScores(s => ({ ...s, [jurorId]: Math.max(0, Math.min(100, s[jurorId] + delta)) }));
      }
      setMessages(prev => [...prev, { role: 'assistant', content: cleanReply, juror: jurorId }]);
    }
    setLoading(false);
  };

  const getVerdict = async () => {
    setLoading(true);
    setPhase('verdict');
    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / 6;
    const forPlaintiff = Object.values(scores).filter(s => s >= 55).length;
    const forDefense = Object.values(scores).filter(s => s < 45).length;

    const verdictMsg = `JURY DELIBERATION COMPLETE

Individual Juror Positions:
${JUROR_PROFILES.map(j => `${j.avatar} ${j.name} (${j.bg}): ${scores[j.id]}% favor plaintiff — ${scores[j.id] >= 55 ? 'FOR PLAINTIFF' : scores[j.id] < 45 ? 'FOR DEFENSE' : 'UNDECIDED'}`).join('\n')}

FINAL COUNT: ${forPlaintiff} for Plaintiff | ${forDefense} for Defense | ${6 - forPlaintiff - forDefense} Undecided
VERDICT: ${forPlaintiff >= 4 ? '✅ PLAINTIFF WINS' : forDefense >= 4 ? '❌ DEFENSE WINS' : '⚠️ HUNG JURY'}

Average persuasion score: ${avgScore.toFixed(0)}%`;

    setMessages(prev => [...prev, { role: 'assistant', content: verdictMsg }]);
    setLoading(false);
  };

  const scoreColor = (s: number) => s >= 60 ? 'bg-green-500' : s >= 45 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Users className="text-pink-400" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white">Jury Simulator</h1>
          <p className="text-slate-400 text-sm">Test your arguments against 6 AI jurors with distinct personalities</p>
        </div>
      </div>

      {!started ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          <div>
            <label className="text-sm text-slate-400 block mb-2">Case Facts & Theory</label>
            <textarea value={caseFacts} onChange={e => setCaseFacts(e.target.value)}
              rows={5} placeholder="Describe your case — what happened, who the parties are, what you need the jury to believe..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-500 resize-none" />
          </div>
          <div className="text-sm text-slate-400 font-medium mb-2">Your Jury Panel</div>
          <div className="grid md:grid-cols-3 gap-3">
            {JUROR_PROFILES.map(j => (
              <div key={j.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{j.avatar}</span>
                  <div className="font-medium text-white text-sm">{j.name}</div>
                </div>
                <div className="text-xs text-slate-400">{j.bg}</div>
                <div className={`text-xs mt-1 font-medium ${j.lean === 'plaintiff' ? 'text-green-400' : j.lean === 'defense' ? 'text-red-400' : 'text-yellow-400'}`}>
                  Leans {j.lean}
                </div>
              </div>
            ))}
          </div>
          <button onClick={start} disabled={!caseFacts.trim()}
            className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors">
            Begin Jury Simulation
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Juror Panel */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-300 mb-1">Juror Persuasion Meters</div>
            {JUROR_PROFILES.map(j => (
              <button key={j.id} onClick={() => setActiveJuror(j.id)}
                className={`w-full bg-slate-800 border rounded-xl p-3 text-left transition-colors ${activeJuror === j.id ? 'border-pink-500' : 'border-slate-700 hover:border-slate-500'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{j.avatar}</span>
                  <div className="text-white text-sm font-medium">{j.name}</div>
                  <div className="ml-auto text-xs text-slate-400">{scores[j.id]}%</div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${scoreColor(scores[j.id])}`} style={{ width: `${scores[j.id]}%` }} />
                </div>
                <div className="text-xs text-slate-500 mt-1">{j.bg}</div>
              </button>
            ))}
            {phase !== 'verdict' && (
              <div className="space-y-2">
                <select value={phase} onChange={e => setPhase(e.target.value as any)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                  <option value="opening">Opening Statement</option>
                  <option value="questions">Juror Questions</option>
                  <option value="closing">Closing Argument</option>
                </select>
                <button onClick={getVerdict}
                  className="w-full bg-pink-700 hover:bg-pink-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  Get Final Verdict
                </button>
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl flex flex-col h-[600px]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
              <span className="text-xl">{JUROR_PROFILES.find(j => j.id === activeJuror)?.avatar}</span>
              <div>
                <div className="text-white text-sm font-medium">{JUROR_PROFILES.find(j => j.id === activeJuror)?.name}</div>
                <div className="text-xs text-slate-400">{JUROR_PROFILES.find(j => j.id === activeJuror)?.bg}</div>
              </div>
              <div className="ml-auto flex gap-1">
                {JUROR_PROFILES.map(j => (
                  <button key={j.id} onClick={() => setActiveJuror(j.id)}
                    className={`text-sm px-1.5 py-0.5 rounded transition-colors ${activeJuror === j.id ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    {j.avatar}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-slate-500 mt-12">
                  <span className="text-4xl block mb-3">{JUROR_PROFILES.find(j => j.id === activeJuror)?.avatar}</span>
                  <div>Address {JUROR_PROFILES.find(j => j.id === activeJuror)?.name} directly.</div>
                  <div className="text-xs mt-1">Start with your opening, then take questions.</div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
                    ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-100'}`}>
                    {m.juror && <div className="text-xs opacity-60 mb-1">{JUROR_PROFILES.find(j => j.id === m.juror)?.name}</div>}
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && <div className="flex justify-start"><div className="bg-slate-700 rounded-xl px-4 py-3"><Loader2 className="text-pink-400 animate-spin" size={18} /></div></div>}
              <div ref={bottomRef} />
            </div>
            <div className="p-4 border-t border-slate-700 flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendToJuror(activeJuror)}
                placeholder={`Address ${JUROR_PROFILES.find(j => j.id === activeJuror)?.name}...`}
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-pink-500" />
              <button onClick={() => sendToJuror(activeJuror)} disabled={loading || !input.trim()}
                className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white p-2.5 rounded-lg transition-colors">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
