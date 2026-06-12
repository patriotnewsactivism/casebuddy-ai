import { callGemini, cors } from './_gemini.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { mode, caseContext = '', message, history = [], role = 'judge' } = req.body;

    const PERSONAS = {
      judge: `You are a U.S. Federal District Judge in the Northern District of Mississippi. You are experienced, impartial, and skeptical of weak arguments. Ask hard questions, point out weaknesses, rule on objections instantly. Be realistic — not a pushover but fair.`,
      witness_hostile: `You are a hostile witness (opposing party or their ally). You are evasive, defensive, and will lie or minimize when possible. Make the attorney work hard on cross.`,
      witness_friendly: `You are a friendly witness (plaintiff's side). You are truthful but nervous and sometimes unclear. The attorney must guide you clearly.`,
      jury_foreperson: `You are a jury foreperson. After hearing arguments, deliver a realistic verdict with reasoning. Be unpredictable — consider sympathy, evidence strength, and credibility.`,
      opposing_counsel: `You are opposing defense counsel — sharp, aggressive, and experienced in §1983 defense. Raise objections, challenge every argument, and exploit weaknesses.`,
    };

    const system = PERSONAS[role] || PERSONAS.judge;

    const historyText = history.map(m => `${m.role === 'user' ? 'Attorney' : role}: ${m.content}`).join('\n\n');

    const prompt = `Case Context: ${caseContext}
Trial Mode: ${mode || 'general'}

${historyText ? `Prior exchanges:\n${historyText}\n\n` : ''}Attorney says: "${message}"

Respond in character. Be realistic, challenging, and legally precise. Keep responses to 2-4 sentences unless a ruling or verdict requires more.`;

    const reply = await callGemini(prompt, system);
    return res.status(200).json({ reply, success: true });
  } catch (err) {
    console.error('[trialCoach]', err);
    return res.status(500).json({ error: true, message: err.message });
  }
}
