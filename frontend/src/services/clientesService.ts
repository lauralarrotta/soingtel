import { Cliente } from "@/types/cliente";
import { API_CONFIG } from "@/config";
import { fetchWithRetry } from "@/utils/fetchWithRetry";

export const clientesService = {
  crear: async (cliente: Cliente) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes`, {
      method: "POST",
      headers,
      body: JSON.stringify(cliente),
    });

    if (!res.ok) throw new Error("Error creando cliente");
    return res.json();
  },

  eliminar: async (kit: string) => {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes/${kit}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) throw new Error("Error eliminando cliente");
    return true;
  },

  actualizarEstado: async (kit: string, estado: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes/${kit}/estado`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ estado_pago: estado }),
    });

    if (!res.ok) throw new Error("Error actualizando estado");
    return res.json();
  },

  estadisticas: async () => {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const res = await fetchWithRetry(`${API_CONFIG.BASE_URL}/clientes/estadisticas`, {
      headers,
    });
    if (!res.ok) throw new Error("Error cargando estadísticas");
    return res.json();
  },

  exportar: async (clientes: any[]) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const res = await fetch(`${API_CONFIG.BASE_URL}/exportar-sheets`, {
      method: "POST",
      headers,
      body: JSON.stringify({ clientes }),
    });

    if (!res.ok) throw new Error("Error exportando clientes");
    return res.json();
  },

  importar: async (clientes: any[], userType: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes/importar`, {
      method: "POST",
      headers,
      body: JSON.stringify({ clientes, userType }),
    });

    if (!res.ok) throw new Error("Error importando clientes");
    return res.json();
  },

  actualizarCliente: async (kit: string, data: any) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes/${kit}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error actualizando cliente");
    return res.json();
  },

  recalcularEstados: async () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes/recalcular-estados`, {
      method: "POST",
      headers,
    });

    if (!res.ok) throw new Error("Error recalculando estados");
    return res.json();
  },

  actualizarObservacion: async (kit: string, observacion: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes/${kit}/observacion`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ observacion }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error actualizando observación");
    }

    return res.json();
  },

  actualizarEstadoFacturacion: async (kit: string, estado: string | null) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes/${kit}/facturacion`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        estado_facturacion: estado,
        rol: "facturacion",
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error actualizando estado");
    }

    return res.json();
  },
};