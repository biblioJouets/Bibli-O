
const requests = new Map();

const WINDOW_MS = 60 * 1000; 
const CLEANUP_INTERVAL = 5 * 60 * 1000; 


if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requests.entries()) {
      if (now - data.windowStart > WINDOW_MS * 2) {
        requests.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

/**
 * @param {string} identifier - IP ou identifiant unique
 * @param {number} maxRequests - Nombre max de requêtes par fenêtre
 * @returns {{ allowed: boolean, remaining: number, resetIn: number }}
 */
export function checkRateLimit(identifier, maxRequests = 5) {
  const now = Date.now();
  const data = requests.get(identifier);

  if (!data || now - data.windowStart > WINDOW_MS) {
    requests.set(identifier, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, resetIn: WINDOW_MS };
  }

  if (data.count >= maxRequests) {
    const resetIn = WINDOW_MS - (now - data.windowStart);
    return { allowed: false, remaining: 0, resetIn };
  }

  data.count++;
  return { 
    allowed: true, 
    remaining: maxRequests - data.count, 
    resetIn: WINDOW_MS - (now - data.windowStart) 
  };
}


export function getRateLimitKey(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}