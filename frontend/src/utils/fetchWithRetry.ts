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
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 2000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
};