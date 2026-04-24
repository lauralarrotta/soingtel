const RATE_LIMIT_KEY = "soingtel_rate_limit_until";
const COOLDOWN_MS = 30000; // 30 segundos de cooldown después de 429

export const fetchWithRetry = async (
  url: string,
  options?: RequestInit,
  retries = 3
): Promise<Response> => {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Basic ${token}`;

  if (options?.headers) {
    const h = options.headers as Record<string, string>;
    Object.entries(h).forEach(([k, v]) => { headers[k] = v; });
  }

  // Check si estamos en cooldown por rate limit
  const rateLimitUntil = localStorage.getItem(RATE_LIMIT_KEY);
  if (rateLimitUntil && Date.now() < parseInt(rateLimitUntil)) {
    const waitTime = Math.ceil((parseInt(rateLimitUntil) - Date.now()) / 1000);
    console.warn(`[fetchWithRetry] Rate limit activo, esperando ${waitTime}s`);
    throw new Error(`Rate limited. Wait ${waitTime}s`);
  }

  try {
    const res = await fetch(url, { ...options, headers });

    if (res.status === 429) {
      // Rate limit detectado - guardar timestamp de cooldown
      const cooldownUntil = Date.now() + COOLDOWN_MS;
      localStorage.setItem(RATE_LIMIT_KEY, cooldownUntil.toString());
      console.warn(`[fetchWithRetry] 429 Rate Limit detectado. Cooldown hasta ${new Date(cooldownUntil).toISOString()}`);
      throw new Error("Rate limited (429)");
    }

    if (!res.ok) throw new Error("Error en request");
    return res;
  } catch (err: any) {
    // Solo reintentar si no es un 429 y quedan retries
    if (err.message === "Rate limited (429)") {
      throw err; // No reintentar en 429, esperar cooldown
    }

    if (retries > 0) {
      // Exponential backoff: 2s, 4s, 8s
      const delay = (4 - retries) * 2000;
      console.log(`[fetchWithRetry] Reintentando en ${delay}ms (intentos restantes: ${retries})`);
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
};

export const clearRateLimit = () => {
  localStorage.removeItem(RATE_LIMIT_KEY);
};