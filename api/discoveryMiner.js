import { callGemini, cors } from './_gemini.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { documents = [], query, caseType = 'Civil Rights', caseContext = '' } = req.body;

    const system = `You are Doc, CaseBuddy's Discovery Mining Specialist. You find smoking guns, contradictions, and hidden connections across multiple documents.`;

    const docsText = documents.map((d, i) => `--- Document ${i + 1}: ${d.name || 'Untitled'} ---\n${d.content}`).join('\n\n');

    const prompt = `Case Type: ${caseType}
${caseContext ? `Case Context: ${caseContext}\n` : ''}
${query ? `Specific Query: ${query}\n` : ''}

DOCUMENTS TO MINE:
${docsText || 'No documents provided — analyze the case context and provide general discovery strategy.'}

Perform deep cross-document analysis. Return JSON:
{
  "smoking_guns": [{"finding": "", "source_doc": "", "significance": "critical|high|medium", "quote": ""}],
  "contradictions": [{"item": "", "doc_a": "", "doc_b": "", "explanation": ""}],
  "key_witnesses": [{"name": "", "role": "", "significance": "", "deposition_priority": "high|medium|low"}],
  "evidence_gaps": [""],
  "strongest_arguments": [""],
  "weakest_points": [""],
  "discovery_requests": [{"type": "RFP|Interrogatory|Deposition|Subpoena", "target": "", "request": ""}],
  "timeline": [{"date": "", "event": "", "source": "", "significance": ""}],
  "overall_assessment": "",
  "recommended_next_steps": [""]
}

Return ONLY valid JSON.`;

    const raw = await callGemini(prompt, system);
    let result;
    try {
      result = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      result = { overall_assessment: raw, raw_response: true };
    }

    return res.status(200).json({ result, success: true });
  } catch (err) {
    console.error('[discoveryMiner]', err);
    return res.status(500).json({ error: true, message: err.message });
  }
}
