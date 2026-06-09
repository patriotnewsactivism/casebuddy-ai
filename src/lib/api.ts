// API base — set REACT_APP_API_URL in Vercel env vars to point to your Railway backend
const BASE_URL = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');

// Simple in-memory request deduplication
const pendingRequests = new Map<string, Promise<any>>();

async function callFunction(name: string, payload: any, retries = 1): Promise<any> {
  const token = localStorage.getItem('cb_token') || '';
  const cacheKey = `${name}:${JSON.stringify(payload)}`;

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const request = (async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const endpoint = BASE_URL
          ? `${BASE_URL}/api/${name}`
          : `/api/${name}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          if (res.status === 429 && attempt < retries) {
            await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
            continue;
          }
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        return data;
      } catch (err) {
        if (attempt === retries) {
          console.error(`[CaseBuddy] ${name} failed after ${retries + 1} attempts:`, err);
          return { error: true, message: 'Request failed. Please try again.' };
        }
        await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
      }
    }
  })();

  pendingRequests.set(cacheKey, request);
  try {
    return await request;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

export const analyzeDocument = (payload: any) => callFunction('analyzeDocument', payload);
export const aiParalegal    = (payload: any) => callFunction('aiParalegal', payload, 0);
export const discoveryMiner = (payload: any) => callFunction('discoveryMiner', payload);
export const trialCoach     = (payload: any) => callFunction('trialCoach', payload, 0);
export const legalResearch  = (payload: any) => callFunction('legalResearch', payload, 0);
export const conflictCheck  = (payload: any) => callFunction('conflictCheck', payload, 0);
export const foiaRequest    = (payload: any) => callFunction('foiaRequest', payload, 0);
