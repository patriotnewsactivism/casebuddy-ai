import { callGemini, cors } from './_gemini.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { query, caseType = '', jurisdiction = 'Federal - 5th Circuit', caseContext = '' } = req.body;

    if (!query) return res.status(400).json({ error: 'query required' });

    const system = `You are Lex, CaseBuddy's Legal Research Specialist. You cite only real, verifiable case law. Always include court, year, and precise holding. Mark any citation you cannot fully verify with [VERIFY]. Focus on 5th Circuit and Mississippi federal courts when relevant.`;

    const prompt = `Research Query: ${query}
Case Type: ${caseType}
Jurisdiction: ${jurisdiction}
${caseContext ? `Case Context: ${caseContext}` : ''}

Provide comprehensive legal research. Return JSON:
{
  "query_analysis": "",
  "controlling_authority": [{"case": "", "citation": "", "court": "", "year": 0, "holding": "", "relevance": "", "verified": true}],
  "persuasive_authority": [{"case": "", "citation": "", "court": "", "year": 0, "holding": "", "relevance": ""}],
  "key_statutes": [{"statute": "", "citation": "", "relevant_section": "", "application": ""}],
  "legal_standards": [{"doctrine": "", "elements": [], "application": ""}],
  "winning_arguments": [""],
  "counterarguments": [""],
  "circuit_split": "",
  "recent_developments": "",
  "practical_strategy": "",
  "win_probability": "high|medium|low",
  "win_probability_explanation": "",
  "recommended_motions": [""]
}

Return ONLY valid JSON. Mark uncertain citations with [VERIFY].`;

    const raw = await callGemini(prompt, system);
    let result;
    try {
      result = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      result = { practical_strategy: raw, raw_response: true };
    }

    return res.status(200).json({ result, success: true });
  } catch (err) {
    console.error('[legalResearch]', err);
    return res.status(500).json({ error: true, message: err.message });
  }
}
