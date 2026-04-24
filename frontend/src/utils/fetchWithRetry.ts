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

  try {
    const res = await fetch(url, { ...options, headers });
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
  // Ya no es necesario
};