import { Cliente } from "@/types/cliente";
import { API_CONFIG, api } from "@/config";

export const clientesService = {
  crear: async (cliente: Cliente) => {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cliente),
    });

    if (!res.ok) throw new Error("Error creando cliente");
    return res.json();
  },

  eliminar: async (kit: string) => {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes/${kit}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Error eliminando cliente");
    return true;
  },

  actualizarEstado: async (kit: string, estado: string) => {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes/${kit}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado_pago: estado }),
    });

    if (!res.ok) throw new Error("Error actualizando estado");
    return res.json();
  },

  estadisticas: async () => {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes/estadisticas`);
    if (!res.ok) throw new Error("Error cargando estadísticas");
    return res.json();
  },

  exportar: async (clientes: any[]) => {
    const res = await fetch(`${API_CONFIG.BASE_URL}/exportar-sheets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientes }),
    });

    if (!res.ok) throw new Error("Error exportando clientes");
    return res.json();
  },

  importar: async (clientes: any[], userType: string) => {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes/importar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientes, userType }),
    });

    if (!res.ok) throw new Error("Error importando clientes");
    return res.json();
  },

  actualizarCliente: async (kit: string, data: any) => {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes/${kit}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error actualizando cliente");
    return res.json();
  },

  actualizarObservacion: async (kit: string, observacion: string) => {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes/${kit}/observacion`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ observacion }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error actualizando observación");
    }

    return res.json();
  },

  actualizarEstadoFacturacion: async (kit: string, estado: string | null) => {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes/${kit}/facturacion`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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