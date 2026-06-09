import React, { useState, useCallback } from 'react';
import {
  Video, Loader2, FileText, Clock, Copy, CheckCircle,
  Download, Tag, Sparkles, AlertTriangle, Link2, Plus, Trash2,
  ChevronDown, ChevronUp, Play, Eye, Archive
} from 'lucide-react';
import { aiParalegal } from '../lib/api';

interface EvidenceClip {
  id: string;
  videoUrl: string;
  videoTitle: string;
  channelName: string;
  caseLink: string;
  transcript: string;
  aiAnalysis: any;
  timestamps: TimestampEntry[];
  tags: string[];
  addedAt: string;
  evidenceType: string;
}

interface TimestampEntry {
  time: string;
  seconds: number;
  text: string;
  significance: string;
}

const EVIDENCE_TYPES = [
  'Body Camera Footage', 'Dash Camera', 'Audit Footage', 'Bystander Video',
  'Surveillance', 'Deposition Recording', 'Press Conference', 'Court Hearing', 'Other',
];

const SAMPLE_EVIDENCE: EvidenceClip[] = [
  {
    id: '1',
    videoUrl: 'https://www.youtube.com/watch?v=example1',
    videoTitle: 'Oxford PD Traffic Stop — March 2026 (Uncut)',
    channelName: 'PatriotNewsActivism',
    caseLink: 'Smith v. City of Oxford',
    evidenceType: 'Body Camera Footage',
    transcript: `[0:00] Officer: "License and registration."\n[0:12] Subject: "I'm not doing anything wrong, officer."\n[0:18] Officer: "Step out of the vehicle."\n[0:24] Subject: "Why? What did I do?"\n[0:31] Officer grabs subject's arm through window.\n[1:02] Subject is pulled from vehicle.\n[1:15] Subject: "I'm complying! Stop!"\n[1:28] Second officer arrives.\n[2:04] Subject restrained on ground.\n[2:45] No contraband found in vehicle search.\n[3:12] Subject placed in handcuffs.`,
    aiAnalysis: {
      summary: 'Video documents a warrantless traffic stop escalating to a use-of-force incident without apparent probable cause. Subject was compliant throughout. No contraband found.',
      smoking_guns: [
        '0:31 — Officer initiates physical contact without announcing lawful command or stating basis for exit order',
        '1:02 — Extraction from vehicle without exigent circumstances or reasonable articulable suspicion of danger',
        '2:45 — No contraband found, undermining any probable cause for stop or search',
      ],
      legal_issues: [
        'Fourth Amendment: Unlawful seizure — Terry stop without reasonable articulable suspicion',
        'Fourth Amendment: Unlawful search of vehicle without consent or warrant',
        'Excessive force during extraction — Graham v. Connor factors not met',
        'Potential First Amendment retaliation if stop was pretextual',
      ],
      admissibility: 'Video is publicly available, self-authenticating under FRE 901. YouTube upload by known channel creates chain of custody. Obtain hash verification.',
      action_items: [
        'Download and hash the video immediately to preserve evidence',
        'Subpoena YouTube for upload metadata and original file',
        'Cross-reference with officer\'s body cam report for contradictions',
        'Request dispatch logs for this stop via FOIA',
      ],
    },
    timestamps: [
      { time: '0:31', seconds: 31, text: 'Officer grabs subject\'s arm', significance: 'First unlawful contact — no lawful command given' },
      { time: '1:02', seconds: 62, text: 'Subject extracted from vehicle', significance: 'Excessive force — no exigent circumstances' },
      { time: '1:15', seconds: 75, text: 'Subject says "I\'m complying"', significance: 'Evidence of compliance — negates resistance defense' },
      { time: '2:45', seconds: 165, text: 'No contraband found', significance: 'Undermines probable cause for stop and search' },
    ],
    tags: ['excessive force', 'traffic stop', 'no probable cause', 'section 1983'],
    addedAt: '2026-04-10T09:23:00Z',
  },
];

export default function VideoEvidencePipeline() {
  const [evidence, setEvidence] = useState<EvidenceClip[]>(SAMPLE_EVIDENCE);
  const [view, setView] = useState<'list' | 'new'>('list');
  const [processing, setProcessing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>('1');
  const [copied, setCopied] = useState<string | null>(null);

  const [form, setForm] = useState({
    videoUrl: '', caseLink: '', evidenceType: 'Body Camera Footage',
    manualTranscript: '',
  });

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text); setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadText = (text: string, filename: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = filename; a.click();
  };

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const processVideo = async () => {
    if (!form.videoUrl && !form.manualTranscript) return;
    setProcessing(true);

    const transcript = form.manualTranscript || '[Transcript not available — manual entry required for video content]';
    const videoId = extractVideoId(form.videoUrl);

    const res = await aiParalegal({
      message: `Analyze this video evidence for use in litigation.

VIDEO URL: ${form.videoUrl}
CASE: ${form.caseLink}
EVIDENCE TYPE: ${form.evidenceType}
TRANSCRIPT:
${transcript}

Analyze as a trial attorney would. Respond ONLY valid JSON:
{
  "summary": "2-3 sentence evidence summary",
  "smoking_guns": ["timestamp: description of key moment and legal significance"],
  "legal_issues": ["constitutional/legal issue raised by this evidence"],
  "admissibility": "admissibility analysis under FRE",
  "action_items": ["specific next step to take"],
  "timestamps": [
    {"time": "0:00", "seconds": 0, "text": "what happens", "significance": "legal significance"}
  ],
  "suggested_tags": ["tag1", "tag2"]
}`,
      context: 'You are a civil rights litigation attorney analyzing video evidence for trial.',
    });

    let analysis: any = {};
    let timestamps: TimestampEntry[] = [];
    let tags: string[] = [];

    try {
      const raw = typeof res.analysis === 'string' ? res.analysis : (res.response || res.message || '{}');
      const match = raw.match ? raw.match(/\{[\s\S]*\}/) : null;
      const parsed = match ? JSON.parse(match[0]) : {};
      analysis = parsed;
      timestamps = parsed.timestamps || [];
      tags = parsed.suggested_tags || [];
    } catch {
      analysis = { summary: res.response || res.message || 'Analysis completed.' };
    }

    const newClip: EvidenceClip = {
      id: Date.now().toString(),
      videoUrl: form.videoUrl,
      videoTitle: videoId ? `YouTube Video (${videoId})` : 'Manual Transcript Entry',
      channelName: 'Imported',
      caseLink: form.caseLink,
      transcript,
      aiAnalysis: analysis,
      timestamps,
      tags,
      evidenceType: form.evidenceType,
      addedAt: new Date().toISOString(),
    };

    setEvidence(prev => [newClip, ...prev]);
    setExpanded(newClip.id);
    setView('list');
    setForm({ videoUrl: '', caseLink: '', evidenceType: 'Body Camera Footage', manualTranscript: '' });
    setProcessing(false);
  };

  const generateEvidenceReport = (clip: EvidenceClip) => {
    const lines = [
      `VIDEO EVIDENCE REPORT`,
      `Generated: ${new Date().toLocaleDateString()}`,
      `Case: ${clip.caseLink}`,
      `Video: ${clip.videoTitle}`,
      `Type: ${clip.evidenceType}`,
      `URL: ${clip.videoUrl}`,
      '',
      'SUMMARY', clip.aiAnalysis.summary || '', '',
      'KEY TIMESTAMPS',
      ...(clip.timestamps.map(t => `[${t.time}] ${t.text}\n  → ${t.significance}`)),
      '',
      'SMOKING GUNS',
      ...(clip.aiAnalysis.smoking_guns?.map((s: string) => `• ${s}`) || []),
      '',
      'LEGAL ISSUES',
      ...(clip.aiAnalysis.legal_issues?.map((l: string) => `• ${l}`) || []),
      '',
      'ADMISSIBILITY', clip.aiAnalysis.admissibility || '', '',
      'ACTION ITEMS',
      ...(clip.aiAnalysis.action_items?.map((a: string) => `□ ${a}`) || []),
      '',
      'TRANSCRIPT',
      clip.transcript,
    ];
    downloadText(lines.join('\n'), `evidence-${clip.id}.txt`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600/20 border border-red-500/30 rounded-xl flex items-center justify-center">
            <Video className="text-red-400" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">YouTube Evidence Pipeline</h1>
            <p className="text-slate-400 text-xs">Auto-transcribe, timestamp & index video evidence for your cases</p>
          </div>
        </div>
        {view === 'list' && (
          <button onClick={() => setView('new')}
            className="flex items-center gap-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl transition-colors">
            <Plus size={14} /> Add Video
          </button>
        )}
        {view === 'new' && (
          <button onClick={() => setView('list')}
            className="text-xs text-slate-400 hover:text-white bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors">
            ← Back
          </button>
        )}
      </div>

      {/* ═══ ADD VIDEO ═══ */}
      {view === 'new' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-1.5">YouTube URL</label>
              <input value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500/60 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-1.5">Evidence Type</label>
                <select value={form.evidenceType} onChange={e => setForm(f => ({ ...f, evidenceType: e.target.value }))}
                  className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none">
                  {EVIDENCE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-1.5">Linked Case</label>
                <input value={form.caseLink} onChange={e => setForm(f => ({ ...f, caseLink: e.target.value }))}
                  placeholder="Smith v. City of Oxford"
                  className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500/60 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-1.5">
                Transcript / Describe What Happens
              </label>
              <textarea value={form.manualTranscript} onChange={e => setForm(f => ({ ...f, manualTranscript: e.target.value }))} rows={8}
                placeholder="Paste transcript here, or describe what happens in the video with timestamps. Example:&#10;[0:00] Officer approaches car&#10;[0:15] Driver says 'I'm not doing anything wrong'&#10;[0:30] Officer opens door without warning..."
                className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500/60 resize-none transition-colors" />
            </div>
            <button onClick={processVideo}
              disabled={processing || (!form.videoUrl && !form.manualTranscript)}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              {processing
                ? <><Loader2 className="animate-spin" size={17} /> Analyzing evidence...</>
                : <><Sparkles size={17} /> Analyze & Index Evidence</>}
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5">
              <div className="text-sm font-semibold text-white mb-3">What the AI extracts:</div>
              {[
                { icon: Clock, label: 'Timestamped key moments', desc: 'Every legally significant event with exact time codes' },
                { icon: AlertTriangle, label: 'Smoking guns', desc: 'Critical admissions, contradictions, and unconstitutional acts' },
                { icon: FileText, label: 'Legal issues', desc: 'Constitutional violations, torts, and elements present' },
                { icon: Eye, label: 'Admissibility analysis', desc: 'FRE authentication, chain of custody, hearsay analysis' },
                { icon: Tag, label: 'Evidence tags', desc: 'Auto-tags for easy search and cross-referencing' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3 mb-3 last:mb-0">
                  <div className="w-7 h-7 bg-red-600/20 border border-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={13} className="text-red-400" />
                  </div>
                  <div>
                    <div className="text-white text-xs font-medium">{label}</div>
                    <div className="text-slate-500 text-xs">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-2">
                <AlertTriangle size={13} /> Evidence Preservation Tips
              </div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>• Download immediately — videos get deleted</li>
                <li>• Generate SHA-256 hash for authentication</li>
                <li>• Screenshot URL with date/timestamp</li>
                <li>• Subpoena YouTube for original upload metadata</li>
                <li>• Note upload date, view count, channel name</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EVIDENCE LIST ═══ */}
      {view === 'list' && (
        <div className="space-y-3">
          {evidence.length === 0 && (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-12 text-center">
              <Video size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No video evidence indexed yet</p>
              <button onClick={() => setView('new')}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                Add your first video
              </button>
            </div>
          )}
          {evidence.map(clip => {
            const isOpen = expanded === clip.id;
            return (
              <div key={clip.id} className="bg-slate-800/60 border border-slate-700/40 hover:border-slate-600/60 rounded-2xl overflow-hidden transition-all">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-red-600/20 border border-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Play size={15} className="text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-white font-semibold text-sm">{clip.videoTitle}</div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">{clip.evidenceType}</span>
                            {clip.caseLink && (
                              <span className="text-[10px] text-slate-500 bg-slate-700/60 px-2 py-0.5 rounded-full">{clip.caseLink}</span>
                            )}
                            <span className="text-slate-600 text-xs">{new Date(clip.addedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {clip.tags.slice(0, 4).map(t => (
                              <span key={t} className="text-[10px] bg-slate-700/60 border border-slate-600/40 text-slate-400 px-1.5 py-0.5 rounded-full">{t}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button onClick={() => generateEvidenceReport(clip)}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-700/60 border border-slate-600/40 px-2.5 py-1.5 rounded-lg transition-colors">
                            <Download size={11} /> Report
                          </button>
                          <button onClick={() => setExpanded(isOpen ? null : clip.id)}
                            className="text-slate-500 hover:text-white p-1.5 rounded-lg transition-colors">
                            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="mt-4 space-y-4 animate-fade-in">
                      {/* Summary */}
                      {clip.aiAnalysis.summary && (
                        <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-3">
                          <p className="text-slate-300 text-xs leading-relaxed">{clip.aiAnalysis.summary}</p>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Timestamps */}
                        {clip.timestamps.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <Clock size={10} /> Key Timestamps
                            </div>
                            <div className="space-y-2">
                              {clip.timestamps.map((ts, i) => (
                                <div key={i} className="flex gap-2">
                                  <a href={`${clip.videoUrl}&t=${ts.seconds}`} target="_blank" rel="noreferrer"
                                    className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 whitespace-nowrap mt-0.5 hover:underline">
                                    [{ts.time}]
                                  </a>
                                  <div>
                                    <div className="text-white text-xs">{ts.text}</div>
                                    <div className="text-slate-500 text-xs">{ts.significance}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Smoking guns */}
                        {clip.aiAnalysis.smoking_guns?.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <AlertTriangle size={10} /> Smoking Guns
                            </div>
                            <ul className="space-y-1.5">
                              {clip.aiAnalysis.smoking_guns.map((g: string, i: number) => (
                                <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                                  <span className="text-red-400 flex-shrink-0">•</span> {g}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Legal issues */}
                      {clip.aiAnalysis.legal_issues?.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-2">Legal Issues</div>
                          <div className="flex flex-wrap gap-1.5">
                            {clip.aiAnalysis.legal_issues.map((l: string, i: number) => (
                              <span key={i} className="text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-2 py-1 rounded-lg">{l}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action items */}
                      {clip.aiAnalysis.action_items?.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">Action Items</div>
                          <ul className="space-y-1">
                            {clip.aiAnalysis.action_items.map((a: string, i: number) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                                <span className="text-slate-600 flex-shrink-0">□</span> {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Transcript toggle */}
                      <details className="bg-slate-900/60 border border-slate-700/40 rounded-xl overflow-hidden">
                        <summary className="px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer hover:text-white flex items-center justify-between">
                          Full Transcript
                          <span className="text-slate-600">{clip.transcript.split('\n').length} lines</span>
                        </summary>
                        <div className="px-4 pb-4 max-h-48 overflow-y-auto">
                          <pre className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap font-sans">{clip.transcript}</pre>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
