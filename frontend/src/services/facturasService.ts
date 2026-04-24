import { Factura } from "@/types/cliente";
import { API_CONFIG } from "@/config";

export const facturasService = {
  crear: async (kit: string, factura: Factura) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const res = await fetch(`${API_CONFIG.BASE_URL}/clientes/${kit}/facturas`, {
      method: "POST",
      headers,
      body: JSON.stringify(factura),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error creando factura");
    }

    return res.json();
  },

  actualizar: async (
    kit: string,
    numero: string,
    factura: Factura
  ) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const res = await fetch(
      `${API_CONFIG.BASE_URL}/clientes/${kit}/facturas/${encodeURIComponent(numero)}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(factura),
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error actualizando factura");
    }

    return res.json();
  },

  eliminar: async (kit: string, numero: string) => {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Basic ${token}`;

    const res = await fetch(
      `${API_CONFIG.BASE_URL}/clientes/${kit}/facturas/${encodeURIComponent(numero)}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error eliminando factura");
    }

    return true;
  },
};
