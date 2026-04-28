import { API_CONFIG } from "@/config";
import { fetchWithRetry } from "@/utils/fetchWithRetry";

export interface InformesStats {
  total: number;
  ppc: number;
  danadas: number;
  suspendidas: number;
  garantias: number;
  transferidas: number;
  pendientesFacturar: number;
  enMora: number;
  rocPorPeriodo: number;
}

export const informesService = {
  obtenerEstadisticas: async (mes?: string, anio?: string): Promise<InformesStats> => {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const params = new URLSearchParams();
    if (mes) params.append("mes", mes);
    if (anio) params.append("anio", anio);

    const url = `${API_CONFIG.BASE_URL}/clientes/estadisticas-informes${params.toString() ? `?${params}` : ""}`;
    const res = await fetchWithRetry(url, { headers });
    if (!res.ok) throw new Error("Error cargando estadísticas de informes");
    return res.json();
  },
};
