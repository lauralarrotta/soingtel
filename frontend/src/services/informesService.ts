import { API_CONFIG } from "@/config";
import { fetchWithRetry } from "@/utils/fetchWithRetry";

export interface InformesStats {
  facturado: number;
  pagados: number;
  pendientes: number;
  vencidos: number;
  ppc: number;
  roc: number;
  suspendido: number;
  enMora: number;
  pendientesFacturar: number;
  sinFacturas?: boolean;
}

export const informesService = {
  obtenerEstadisticas: async (periodo: string, anio: string): Promise<InformesStats> => {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const url = `${API_CONFIG.BASE_URL}/clientes/estadisticas-informes?periodo=${periodo}&anio=${anio}`;
    const res = await fetchWithRetry(url, { headers });
    if (!res.ok) throw new Error("Error cargando estadísticas de informes");
    return res.json();
  },
};
