import { callGemini, cors } from './_gemini.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages = [], message, context } = req.body;

    const SIERRA_SYSTEM = `You are Sierra, CaseBuddy's AI Intake Specialist. You are warm, professional, and precise.

Your job: conduct a thorough client intake interview. Ask about the incident, parties, timeline, evidence, damages, and SOL concerns. Be conversational but efficient.

When you have enough information, output a structured JSON intake summary wrapped in <INTAKE_SUMMARY> tags like this:
<INTAKE_SUMMARY>
{
  "client_name": "",
  "case_type": "",
  "jurisdiction": "",
  "incident_summary": "",
  "incident_date": "",
  "potential_claims": [],
  "key_evidence": [],
  "damages_estimate": "",
  "statute_of_limitations_concern": "",
  "urgency": "low|medium|high|critical",
  "case_viability_score": 0-100,
  "next_steps": [],
  "recommended_documents": []
}
</INTAKE_SUMMARY>

Keep your reply clean — put the JSON block at the very end only when ready to summarize.`;

    let reply;

    if (message && context) {
      // War Room agent call — message + custom system context
      reply = await callGemini(message, context);
    } else {
      // Classic intake chat
      const history = messages.map(m =>
        `${m.role === 'user' ? 'Client' : 'Sierra (Intake)'}: ${m.content}`
      ).join('\n\n');

      const prompt = messages.length === 0
        ? 'Start the intake interview. Introduce yourself briefly and ask the client what brings them in today.'
        : `Conversation so far:\n${history}\n\nRespond as Sierra:`;

      reply = await callGemini(prompt, SIERRA_SYSTEM);
    }

    // Extract intake summary if present
    const summaryMatch = reply.match(/<INTAKE_SUMMARY>([\s\S]*?)<\/INTAKE_SUMMARY>/);
    let intakeSummary = null;
    if (summaryMatch) {
      try { intakeSummary = JSON.parse(summaryMatch[1].trim()); } catch {}
    }

    return res.status(200).json({ reply, response: reply, message: reply, intakeSummary });
  } catch (err) {
    console.error('[aiParalegal]', err);
    return res.status(500).json({ error: true, message: err.message });
  }
}
