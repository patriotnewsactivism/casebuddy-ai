import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Send, Loader2, ChevronRight, CheckCircle, Clock,
  AlertTriangle, FileText, Scale, Swords, BookOpen, Users,
  Shield, Gavel, Brain, Bot, ArrowRight, Play, RefreshCw,
  Download, Copy, Lock, Unlock, MoreHorizontal, Circle
} from 'lucide-react';
import { aiParalegal } from '../lib/api';

// ── Agent Definitions ────────────────────────────────────────────────────────
interface Agent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  promptContext: string;
}

const AGENTS: Agent[] = [
  {
    id: 'sierra',
    name: 'Sierra',
    role: 'Intake & Client Liaison',
    specialty: 'Qualifies leads, captures case facts, identifies urgency',
    avatar: '👋',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    description: 'I conduct smart client intake — asking the right questions to qualify the case, identify the SOL, and hand off a complete brief to Maya.',
    promptContext: 'You are Sierra, CaseBuddy\'s AI Intake Specialist. Your job is to conduct a warm but precise intake interview. Ask about the incident, parties involved, timeline, evidence available, and any urgency (SOL, upcoming hearings). Be conversational, empathetic, and efficient. At the end, produce a structured case brief.',
  },
  {
    id: 'maya',
    name: 'Maya',
    role: 'Case Strategist',
    specialty: 'Builds litigation roadmap, identifies claims & weaknesses',
    avatar: '⚖️',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'I analyze the case intake and build a complete litigation strategy — key claims, legal theories, evidence gaps, and a step-by-step timeline.',
    promptContext: 'You are Maya, CaseBuddy\'s Case Strategist. Given a case brief or description, produce a comprehensive litigation roadmap including: primary legal claims with elements, viable legal theories, strongest arguments, weakest points, evidence needed, discovery priorities, and a strategic timeline from filing to trial. Be specific and actionable.',
  },
  {
    id: 'lex',
    name: 'Lex',
    role: 'Legal Researcher',
    specialty: 'Case law, statutes, precedent analysis',
    avatar: '📚',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    description: 'I research case law, statutes, and binding precedent. I flag citation confidence and never fabricate a case.',
    promptContext: 'You are Lex, CaseBuddy\'s Legal Research Specialist. Your job is to find real, applicable case law and statutes. Always cite court, year, and holding. Distinguish between binding and persuasive authority. For each case cited, note what it actually held and why it applies. Flag any citation you cannot verify with a [VERIFY] tag. Focus on 5th Circuit and Mississippi federal courts when applicable.',
  },
  {
    id: 'doc',
    name: 'Doc',
    role: 'Discovery & Documents',
    specialty: 'Extracts facts, flags risks, builds evidence timeline',
    avatar: '🔬',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'I analyze uploaded documents, extract parties/dates/claims, flag contradictions, and build a searchable evidence timeline.',
    promptContext: 'You are Doc, CaseBuddy\'s Discovery and Document Specialist. When given document content or descriptions, extract: all parties mentioned, key dates and timeline, critical facts, admissions by the opposing party, contradictions with known case facts, and evidence gaps. Flag potential hearsay, privilege issues, and authentication concerns. Build a clean evidence timeline.',
  },
  {
    id: 'max',
    name: 'Max',
    role: 'Motion & Drafting',
    specialty: 'Generates motions, complaints, FOIA, demand letters',
    avatar: '✍️',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    description: 'I draft motions, complaints, discovery requests, and demand letters formatted for your jurisdiction.',
    promptContext: 'You are Max, CaseBuddy\'s Drafting Specialist. Generate precise, jurisdiction-appropriate legal documents. Use proper caption format, numbered paragraphs for pleadings, and cite controlling authority. For motions, include: introduction, factual background, legal standard, argument with subheadings, and conclusion with requested relief. Always include "AI-GENERATED — ATTORNEY REVIEW REQUIRED" at the top.',
  },
  {
    id: 'sol',
    name: 'Sol',
    role: 'Deadline Engine',
    specialty: 'Calculates deadlines, SOL, filing windows',
    avatar: '⏰',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    description: 'I calculate every deadline based on actual court rules — SOL, response windows, discovery cutoffs, and appeal deadlines.',
    promptContext: 'You are Sol, CaseBuddy\'s Deadline Specialist. Calculate all relevant deadlines with precision. Always: cite the specific rule (FRCP, state code, local rule), account for weekends and federal holidays, flag the statute of limitations prominently, note when the event was triggered, and provide a complete deadline calendar. Warn if any deadline is within 30 days.',
  },
  {
    id: 'rex',
    name: 'Rex',
    role: 'Trial Advocate',
    specialty: 'Courtroom narrative, opening/closing, witness prep',
    avatar: '🦁',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    description: 'I build courtroom narratives, opening statements, cross-examination outlines, and calibrate arguments to judicial preferences.',
    promptContext: 'You are Rex, CaseBuddy\'s Trial Advocate. Your job is to translate case facts and law into compelling courtroom narrative. Build persuasive opening statements, anticipate opposing arguments, develop cross-examination sequences, and identify the emotional core of the case. Calibrate your tone for the specified tribunal (jury vs. bench). Be direct, vivid, and strategically precise.',
  },
  {
    id: 'jules',
    name: 'Jules',
    role: 'Jury Simulator',
    specialty: '8 AI jurors, persuasion meters, verdict prediction',
    avatar: '👥',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    description: 'I simulate 8 AI jurors with different backgrounds and biases, run persuasion meters, and predict verdict probability.',
    promptContext: 'You are Jules, CaseBuddy\'s Jury Simulation Specialist. Simulate 8 diverse jurors (vary age, background, profession, life experience) evaluating a case. For each juror, describe their initial bias, what arguments move them, and their final verdict leaning. Calculate a plaintiff/defense split. Identify the 2-3 most persuasive arguments for each side. Provide an overall verdict prediction with confidence level.',
  },
  {
    id: 'claude',
    name: 'Claude',
    role: 'Compliance & Ethics',
    specialty: 'Privilege check, coherence audit, bar compliance',
    avatar: '🛡️',
    color: 'text-slate-300',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    description: 'I red-team every document for privilege waiver, contradictions with prior filings, confidential information, and bar ethics compliance.',
    promptContext: 'You are Claude, CaseBuddy\'s Compliance and Ethics Specialist. Review documents for: (1) attorney-client privilege — flag anything that could constitute a waiver; (2) work product protection issues; (3) confidential client information that should not be disclosed; (4) contradictions with earlier filings or statements in the case; (5) statements that violate Model Rules of Professional Conduct; (6) citations to check for accuracy. Produce a structured compliance report. Every output should include an "AI-GENERATED — ATTORNEY REVIEW REQUIRED" notation.',
  },
];

interface CaseFile {
  id: string;
  title: string;
  client: string;
  type: string;
  facts: string;
  createdAt: string;
}

interface AgentOutput {
  agentId: string;
  content: string;
  timestamp: string;
  isComplete: boolean;
}

interface Message {
  role: 'user' | 'agent';
  agentId?: string;
  content: string;
  timestamp: string;
}

// Demo case — pre-loaded Shumpert
const DEMO_CASE: CaseFile = {
  id: 'demo',
  title: 'Shumpert v. City of Oxford',
  client: 'Marcus Shumpert',
  type: 'Civil Rights — §1983 Excessive Force',
  facts: `Client Marcus Shumpert, 34, no prior criminal history. On March 15, 2026 at approximately 10:30 PM, Oxford PD officers conducted a traffic stop on Highway 7 for alleged failure to signal. Body camera footage shows Shumpert complied with all orders. After requesting the reason for the stop, Officer Davis (Badge #1142) reached through the open window without warning and grabbed Shumpert's arm. Shumpert was extracted from the vehicle. Officer Carter (Badge #1198) arrived and both officers forced Shumpert to the ground. Shumpert sustained a broken left forearm requiring surgery ($42,000 in medical bills), 3 days hospitalization, and 6 weeks missed work ($18,000 lost wages). No contraband found. Shumpert has 3 witnesses and full body camera footage. Both officers have prior complaints in their personnel files. Incident occurred in Lafayette County, MS. Filing in N.D. Mississippi.`,
  createdAt: new Date().toISOString(),
};

const PIPELINE_STEPS = [
  { agentId: 'sierra', label: 'Intake', shortLabel: 'Intake' },
  { agentId: 'maya',   label: 'Strategy', shortLabel: 'Strategy' },
  { agentId: 'lex',    label: 'Research', shortLabel: 'Research' },
  { agentId: 'doc',    label: 'Discovery', shortLabel: 'Discovery' },
  { agentId: 'max',    label: 'Drafting', shortLabel: 'Drafting' },
  { agentId: 'sol',    label: 'Deadlines', shortLabel: 'Deadlines' },
  { agentId: 'rex',    label: 'Trial Prep', shortLabel: 'Trial' },
  { agentId: 'jules',  label: 'Jury Sim', shortLabel: 'Jury' },
  { agentId: 'claude', label: 'Compliance', shortLabel: 'Ethics' },
];

export default function WarRoom() {
  const [activeAgent, setActiveAgent] = useState<Agent>(AGENTS[0]);
  const [caseFile, setCaseFile] = useState<CaseFile>(DEMO_CASE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentOutputs, setAgentOutputs] = useState<Record<string, AgentOutput>>({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pipelineMode, setPipelineMode] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineComplete, setPipelineComplete] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key); setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentOutputs = Object.values(agentOutputs).filter(o => o.isComplete);
  const previousContext = currentOutputs.map(o => {
    const agent = AGENTS.find(a => a.id === o.agentId);
    return `[${agent?.name} — ${agent?.role}]:\n${o.content}`;
  }).join('\n\n---\n\n');

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = {
      role: 'user', content: input, timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const contextualInput = `CASE FILE:
Title: ${caseFile.title}
Client: ${caseFile.client}
Type: ${caseFile.type}
Facts: ${caseFile.facts}

${previousContext ? 'PRIOR AGENT OUTPUTS:\n' + previousContext + '\n\n' : ''}USER REQUEST: ${input}`;

    const res = await aiParalegal({
      message: contextualInput,
      context: activeAgent.promptContext,
    });

    const content = res.response || res.message || res.reply || 'I encountered an error. Please try again.';
    const agentMsg: Message = {
      role: 'agent',
      agentId: activeAgent.id,
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, agentMsg]);
    setAgentOutputs(prev => ({
      ...prev,
      [activeAgent.id]: { agentId: activeAgent.id, content, timestamp: new Date().toISOString(), isComplete: true },
    }));
    setLoading(false);
  };

  const runFullPipeline = async () => {
    setPipelineMode(true);
    setPipelineRunning(true);
    setPipelineStep(0);
    setPipelineComplete(false);
    setMessages([]);
    setAgentOutputs({});

    const outputs: Record<string, string> = {};

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setPipelineStep(i);
      const step = PIPELINE_STEPS[i];
      const agent = AGENTS.find(a => a.id === step.agentId)!;

      const priorContext = Object.entries(outputs).map(([id, text]) => {
        const a = AGENTS.find(x => x.id === id);
        return `[${a?.name} — ${a?.role}]:\n${text}`;
      }).join('\n\n---\n\n');

      const taskByAgent: Record<string, string> = {
        sierra: 'Conduct a thorough intake summary for this case. Identify the client, case type, key facts, urgency, SOL concerns, and immediate next steps.',
        maya:   'Build a comprehensive litigation strategy and roadmap for this case based on the intake.',
        lex:    'Research the most relevant case law and statutes for this case. Focus on binding 5th Circuit and Mississippi precedent.',
        doc:    'Analyze the evidence described in this case. Build an evidence timeline, identify smoking guns, and flag evidence gaps.',
        max:    'Draft a professional demand letter and outline the key motions that will need to be filed, with the legal standard for each.',
        sol:    'Calculate all critical deadlines for this case — SOL, response windows, discovery cutoffs, and trial prep milestones.',
        rex:    'Build a compelling courtroom narrative and opening statement outline. Identify the emotional core and the 3 strongest arguments.',
        jules:  'Simulate a jury evaluation. Run 8 diverse AI jurors and predict the verdict probability with persuasion analysis.',
        claude: 'Perform a full compliance and ethics review of all prior agent outputs. Flag privilege issues, contradictions, and ethics concerns. Confirm the case is trial-ready.',
      };

      const prompt = `CASE FILE:
Title: ${caseFile.title}
Client: ${caseFile.client}
Type: ${caseFile.type}
Facts: ${caseFile.facts}

${priorContext ? 'PRIOR AGENT WORK:\n' + priorContext + '\n\n' : ''}YOUR TASK: ${taskByAgent[agent.id]}`;

      const res = await aiParalegal({ message: prompt, context: agent.promptContext });
      const content = res.response || res.message || res.reply || '[No response]';
      outputs[agent.id] = content;

      setAgentOutputs(prev => ({
        ...prev,
        [agent.id]: { agentId: agent.id, content, timestamp: new Date().toISOString(), isComplete: true },
      }));

      // Small pause between agents for UX
      if (i < PIPELINE_STEPS.length - 1) await new Promise(r => setTimeout(r, 400));
    }

    setPipelineRunning(false);
    setPipelineComplete(true);
  };

  const downloadWarRoom = () => {
    const lines = [`WAR ROOM REPORT — ${caseFile.title}`, `Generated: ${new Date().toLocaleDateString()}`, `Client: ${caseFile.client}`, `Type: ${caseFile.type}`, '', '═'.repeat(60), ''];
    AGENTS.forEach(agent => {
      const out = agentOutputs[agent.id];
      if (out) {
        lines.push(`${agent.name.toUpperCase()} — ${agent.role.toUpperCase()}`);
        lines.push('─'.repeat(40));
        lines.push(out.content);
        lines.push('');
      }
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `warroom-${caseFile.title.replace(/\s+/g, '-')}.txt`;
    a.click();
  };

  const agentMessages = messages.filter(m => m.agentId === activeAgent.id || m.role === 'user');

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border border-slate-700/50 rounded-2xl p-5">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 50%, #f59e0b 0%, transparent 50%)' }} />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">AI War Room — Active</span>
            </div>
            <h1 className="text-2xl font-bold text-white">9-Agent Legal War Room</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {caseFile.title} · {caseFile.client} · {caseFile.type}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {pipelineComplete && (
              <button onClick={downloadWarRoom}
                className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl font-semibold transition-colors">
                <Download size={13} /> Export Report
              </button>
            )}
            <button onClick={runFullPipeline} disabled={pipelineRunning}
              className="flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-3 py-2 rounded-xl font-semibold transition-colors">
              {pipelineRunning
                ? <><Loader2 className="animate-spin" size={13} /> Running Pipeline...</>
                : <><Play size={13} /> {pipelineComplete ? 'Re-Run Pipeline' : 'Run Full Pipeline'}</>}
            </button>
          </div>
        </div>

        {/* Pipeline progress */}
        <div className="relative mt-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 min-w-max">
            {PIPELINE_STEPS.map((step, i) => {
              const agent = AGENTS.find(a => a.id === step.agentId)!;
              const isDone = agentOutputs[step.agentId]?.isComplete;
              const isActive = pipelineRunning && pipelineStep === i;
              return (
                <React.Fragment key={step.agentId}>
                  <button
                    onClick={() => { setActiveAgent(agent); setPipelineMode(false); }}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[68px] ${
                      activeAgent.id === step.agentId && !pipelineMode
                        ? `${agent.bgColor} border ${agent.borderColor}`
                        : isDone
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : 'bg-slate-800/60 border border-slate-700/30 hover:border-slate-600'
                    }`}>
                    <span className="text-base">{agent.avatar}</span>
                    <span className={`text-[10px] font-semibold ${
                      isActive ? 'text-white animate-pulse' : isDone ? 'text-emerald-400' : 'text-slate-500'
                    }`}>
                      {isActive ? '⟳' : isDone ? '✓' : ''} {step.shortLabel}
                    </span>
                  </button>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className={`w-4 h-px flex-shrink-0 transition-colors ${
                      agentOutputs[PIPELINE_STEPS[i + 1]?.agentId]?.isComplete ? 'bg-emerald-500/40' : 'bg-slate-700'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-4 gap-4">
        {/* Agent roster */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1 mb-3">Your Legal Team</div>
          {AGENTS.map(agent => {
            const hasOutput = agentOutputs[agent.id]?.isComplete;
            return (
              <button key={agent.id}
                onClick={() => { setActiveAgent(agent); setPipelineMode(false); }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  activeAgent.id === agent.id && !pipelineMode
                    ? `${agent.bgColor} ${agent.borderColor}`
                    : 'bg-slate-800/40 border-slate-700/30 hover:border-slate-600/60'
                }`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{agent.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold text-sm ${activeAgent.id === agent.id && !pipelineMode ? agent.color : 'text-white'}`}>
                        {agent.name}
                      </span>
                      {hasOutput && <CheckCircle size={10} className="text-emerald-400 flex-shrink-0" />}
                    </div>
                    <div className="text-slate-500 text-[10px] truncate">{agent.role}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Chat / Pipeline view */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Pipeline results view */}
          {pipelineMode && (
            <div className="space-y-3">
              {pipelineRunning && (
                <div className="bg-slate-800/60 border border-violet-500/30 rounded-2xl p-6 text-center">
                  <Loader2 className="text-violet-400 animate-spin mx-auto mb-3" size={32} />
                  <div className="text-white font-semibold">
                    Running: {AGENTS.find(a => a.id === PIPELINE_STEPS[pipelineStep]?.agentId)?.name}
                  </div>
                  <div className="text-slate-400 text-sm mt-1">
                    Step {pipelineStep + 1} of {PIPELINE_STEPS.length}
                  </div>
                  <div className="flex justify-center gap-1.5 mt-3">
                    {PIPELINE_STEPS.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all ${
                        i < pipelineStep ? 'w-4 bg-emerald-500' :
                        i === pipelineStep ? 'w-6 bg-violet-400 animate-pulse' :
                        'w-1.5 bg-slate-700'
                      }`} />
                    ))}
                  </div>
                </div>
              )}
              {PIPELINE_STEPS.map(step => {
                const agent = AGENTS.find(a => a.id === step.agentId)!;
                const out = agentOutputs[step.agentId];
                if (!out) return null;
                return (
                  <div key={step.agentId} className={`bg-slate-800/60 border ${agent.borderColor} rounded-2xl overflow-hidden animate-fade-in`}>
                    <div className={`flex items-center justify-between px-4 py-3 border-b border-slate-700/40 ${agent.bgColor}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{agent.avatar}</span>
                        <div>
                          <span className={`font-bold text-sm ${agent.color}`}>{agent.name}</span>
                          <span className="text-slate-500 text-xs ml-2">{agent.role}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-400" />
                        <button onClick={() => copy(out.content, step.agentId)}
                          className="text-slate-500 hover:text-white transition-colors">
                          {copiedKey === step.agentId ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                        <button onClick={() => { setActiveAgent(agent); setPipelineMode(false); }}
                          className="text-slate-500 hover:text-white transition-colors">
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 max-h-64 overflow-y-auto">
                      <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{out.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Individual agent chat */}
          {!pipelineMode && (
            <div className={`flex flex-col bg-slate-800/60 border ${activeAgent.borderColor} rounded-2xl overflow-hidden`} style={{ height: '600px' }}>
              {/* Agent header */}
              <div className={`flex items-center gap-3 px-4 py-3 border-b border-slate-700/40 ${activeAgent.bgColor}`}>
                <span className="text-2xl">{activeAgent.avatar}</span>
                <div className="flex-1">
                  <div className={`font-bold ${activeAgent.color}`}>{activeAgent.name}</div>
                  <div className="text-slate-400 text-xs">{activeAgent.role} · {activeAgent.specialty}</div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-400 text-xs font-medium">Online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Welcome message if no messages yet */}
                {agentMessages.length === 0 && (
                  <div className="text-center py-8">
                    <span className="text-4xl block mb-3">{activeAgent.avatar}</span>
                    <div className="text-white font-semibold text-base">{activeAgent.name}</div>
                    <div className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">{activeAgent.description}</div>
                    <div className="mt-4 text-xs text-slate-600">Working on: {caseFile.title}</div>

                    {/* Quick action prompts */}
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {({
                        sierra: ['Start intake for this case', 'What info do you still need?'],
                        maya:   ['Build a litigation strategy', 'What are the strongest claims?'],
                        lex:    ['Research §1983 qualified immunity', 'Find precedent for excessive force traffic stops'],
                        doc:    ['Analyze the evidence in this case', 'What evidence gaps do we have?'],
                        max:    ['Draft a demand letter', 'Outline a motion to deny qualified immunity'],
                        sol:    ['Calculate all deadlines', 'When does the SOL expire?'],
                        rex:    ['Write an opening statement', 'Build a cross-examination of Officer Davis'],
                        jules:  ['Run a jury simulation', 'Predict verdict probability'],
                        claude: ['Run a compliance check', 'Check for privilege issues'],
                      } as Record<string, string[]>)[activeAgent.id]?.map(prompt => (
                        <button key={prompt} onClick={() => setInput(prompt)}
                          className={`text-xs px-3 py-1.5 rounded-xl border ${activeAgent.borderColor} ${activeAgent.bgColor} ${activeAgent.color} hover:opacity-80 transition-opacity`}>
                          {prompt}
                        </button>
                      ))}
                    </div>

                    {agentOutputs[activeAgent.id] && (
                      <div className="mt-4 text-xs text-emerald-400 flex items-center justify-center gap-1">
                        <CheckCircle size={11} /> Previous output available — scroll down or ask follow-up questions
                      </div>
                    )}
                  </div>
                )}

                {/* Prior pipeline output for this agent */}
                {agentOutputs[activeAgent.id] && agentMessages.length === 0 && (
                  <div className={`${activeAgent.bgColor} border ${activeAgent.borderColor} rounded-2xl rounded-tl-sm p-4`}>
                    <div className={`text-xs font-bold ${activeAgent.color} mb-2 flex items-center gap-1.5`}>
                      <CheckCircle size={11} /> {activeAgent.name} (Pipeline Output)
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                      {agentOutputs[activeAgent.id].content}
                    </p>
                  </div>
                )}

                {/* Chat messages */}
                {agentMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'agent' && (
                      <span className="text-xl mr-2 flex-shrink-0 mt-1">{activeAgent.avatar}</span>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-slate-700 text-white rounded-br-sm'
                        : `${activeAgent.bgColor} border ${activeAgent.borderColor} text-slate-100 rounded-bl-sm`
                    }`}>
                      <div className={`text-[10px] font-bold mb-1 ${msg.role === 'user' ? 'text-slate-400' : activeAgent.color}`}>
                        {msg.role === 'user' ? 'You (Attorney)' : activeAgent.name}
                      </div>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <span className="text-xl mr-2">{activeAgent.avatar}</span>
                    <div className={`${activeAgent.bgColor} border ${activeAgent.borderColor} rounded-2xl rounded-bl-sm px-4 py-3`}>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[0,1,2].map(i => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${activeAgent.color.replace('text-','bg-')} animate-bounce`}
                              style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                        <span className={`text-xs ${activeAgent.color}`}>{activeAgent.name} is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-slate-700/40">
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={`Ask ${activeAgent.name} about ${caseFile.title}...`}
                    rows={2}
                    className="flex-1 bg-slate-700/60 border border-slate-600/40 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-slate-500 resize-none"
                  />
                  <button onClick={sendMessage} disabled={loading || !input.trim()}
                    className={`px-4 rounded-xl font-semibold text-white transition-colors disabled:opacity-40 ${
                      activeAgent.bgColor.replace('/10', '/30')} border ${activeAgent.borderColor} hover:opacity-80`}>
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  </button>
                </div>
                <div className="text-slate-600 text-[10px] mt-1.5 text-center">
                  Press Enter to send · Shift+Enter for new line · Working on: <span className="text-slate-500">{caseFile.title}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
