export const fetchWithRetry = async (
  url: string,
  options?: RequestInit,
  retries = 3
): Promise<Response> => {
  try {
    const res = await fetch(url, options);
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