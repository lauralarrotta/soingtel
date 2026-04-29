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

interface ClienteDetalle {
  kit: string;
  nombre_cliente: string;
}

export const informesService = {
  obtenerEstadisticas: async (periodo: string, anio: string, sede: string = "principal"): Promise<InformesStats> => {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    // Usar la ruta correcta según la sede
    const basePath = sede === "fusagasuga" ? "/clientes_fusagasuga" : "/clientes";
    const url = `${API_CONFIG.BASE_URL}${basePath}/estadisticas-informes?periodo=${periodo}&anio=${anio}`;
    const res = await fetchWithRetry(url, { headers });
    if (!res.ok) throw new Error("Error cargando estadísticas de informes");
    return res.json();
  },

  obtenerDetalle: async (periodo: string, anio: string, sede: string, tipo: string): Promise<ClienteDetalle[]> => {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const basePath = sede === "fusagasuga" ? "/clientes_fusagasuga" : "/clientes";
    const url = `${API_CONFIG.BASE_URL}${basePath}/detalle-informe?periodo=${periodo}&anio=${anio}&tipo=${tipo}`;
    const res = await fetchWithRetry(url, { headers });
    if (!res.ok) throw new Error("Error cargando detalle");
    return res.json();
  },
};
