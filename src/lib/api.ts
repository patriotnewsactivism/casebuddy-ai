const BASE_URL = process.env.REACT_APP_BASE44_API_URL || 'https://superagent-344f8b2b.base44.app';

// Simple in-memory request deduplication
const pendingRequests = new Map<string, Promise<any>>();

async function callFunction(name: string, payload: any, retries = 1): Promise<any> {
  const token = localStorage.getItem('cb_token') || '';
  const cacheKey = `${name}:${JSON.stringify(payload)}`;

  // Deduplicate identical in-flight requests
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const request = (async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(`${BASE_URL}/functions/${name}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          if (res.status === 429 && attempt < retries) {
            // Rate limited — wait and retry
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
