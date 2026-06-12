import { callGemini, cors } from './_gemini.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { agency, recordsRequested, purpose, state = 'Mississippi', caseContext = '', requestType = 'draft' } = req.body;

    const system = `You are Max, CaseBuddy's Drafting Specialist, with deep expertise in FOIA, state sunshine laws, and public records litigation. You draft precise, legally effective public records requests.`;

    const prompts = {
      draft: `Draft a formal public records request for:
Agency: ${agency}
Records Requested: ${recordsRequested}
Purpose: ${purpose}
State: ${state}
${caseContext ? `Case Context: ${caseContext}` : ''}

Include: proper statutory citations (Mississippi Public Records Act § 25-61-1 et seq. for MS, or federal FOIA 5 U.S.C. § 552), specific records description, fee waiver request, expedited processing request if applicable, 5-business-day response demand, and statement of consequences for non-compliance.

Return JSON:
{
  "letter": "",
  "statutory_basis": "",
  "response_deadline": "",
  "fee_waiver_basis": "",
  "expedited_basis": "",
  "follow_up_date": "",
  "appeal_deadline": "",
  "tips": []
}`,
      appeal: `Draft a FOIA appeal/denial response for:
Agency: ${agency}
Original Request: ${recordsRequested}
State: ${state}
${caseContext ? `Context: ${caseContext}` : ''}

Write a firm appeal letter citing specific exemption challenges, Vaughn index demand, and litigation threat.

Return JSON: {"letter": "", "arguments": [], "next_steps": [], "litigation_threshold": ""}`,
    };

    const raw = await callGemini(prompts[requestType] || prompts.draft, system);
    let result;
    try {
      result = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      result = { letter: raw, raw_response: true };
    }

    return res.status(200).json({ result, success: true });
  } catch (err) {
    console.error('[foiaRequest]', err);
    return res.status(500).json({ error: true, message: err.message });
  }
}
