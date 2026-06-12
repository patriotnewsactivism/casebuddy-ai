import { callGemini, cors } from './_gemini.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { newParties = [], existingCases = [], caseType = '', jurisdiction = 'Federal' } = req.body;

    const system = `You are Claude, CaseBuddy's Compliance and Ethics Specialist. You analyze conflicts of interest under the ABA Model Rules of Professional Conduct, specifically Rules 1.7, 1.8, 1.9, and 1.10.`;

    const prompt = `Conflict of Interest Analysis

New Case Parties: ${JSON.stringify(newParties)}
Existing Cases: ${JSON.stringify(existingCases)}
New Case Type: ${caseType}
Jurisdiction: ${jurisdiction}

Analyze for conflicts under ABA Rules 1.7, 1.8, 1.9, and 1.10. Return JSON:
{
  "conflict_found": true/false,
  "severity": "none|minor|moderate|severe|disqualifying",
  "conflicts": [{"party": "", "existing_case": "", "conflict_type": "", "rule_violated": "", "explanation": "", "waivable": true/false}],
  "analysis": "",
  "recommendation": "proceed|proceed_with_waiver|do_not_proceed",
  "waiver_language": "",
  "required_actions": [],
  "ethics_notes": ""
}

Return ONLY valid JSON.`;

    const raw = await callGemini(prompt, system);
    let result;
    try {
      result = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      result = { analysis: raw, raw_response: true };
    }

    return res.status(200).json({ result, success: true });
  } catch (err) {
    console.error('[conflictCheck]', err);
    return res.status(500).json({ error: true, message: err.message });
  }
}
