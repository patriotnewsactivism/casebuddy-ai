import { callGemini, cors } from './_gemini.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { documentText, documentType = 'Legal Document', caseContext = '' } = req.body;

    if (!documentText) return res.status(400).json({ error: 'documentText required' });

    const system = `You are Doc, CaseBuddy's Document Analysis Specialist. You extract facts with surgical precision and flag legal risks immediately.`;

    const prompt = `Analyze this ${documentType} thoroughly.
${caseContext ? `Case Context: ${caseContext}\n` : ''}

DOCUMENT:
${documentText}

Provide a comprehensive analysis in this exact JSON structure:
{
  "document_type": "",
  "summary": "",
  "parties": [{"name": "", "role": ""}],
  "key_dates": [{"date": "", "event": "", "significance": ""}],
  "key_facts": [""],
  "admissions": [""],
  "evidence_items": [{"item": "", "type": "", "admissibility": "strong|questionable|weak", "notes": ""}],
  "red_flags": [{"issue": "", "severity": "high|medium|low", "explanation": ""}],
  "missing_elements": [""],
  "privilege_concerns": [""],
  "contradictions": [""],
  "evidence_timeline": [{"date": "", "event": "", "source": ""}],
  "strategic_notes": "",
  "overall_strength": "strong|moderate|weak",
  "recommendation": ""
}

Return ONLY valid JSON, no markdown fences.`;

    const raw = await callGemini(prompt, system);

    let analysis;
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch {
      analysis = { summary: raw, raw_response: true };
    }

    return res.status(200).json({ analysis, success: true });
  } catch (err) {
    console.error('[analyzeDocument]', err);
    return res.status(500).json({ error: true, message: err.message });
  }
}
