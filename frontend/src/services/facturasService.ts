import { Factura } from "@/types/cliente";

const API = import.meta.env.VITE_API_URL;

export const facturasService = {
  crear: async (kit: string, factura: Factura) => {
    const res = await fetch(`${API}/clientes/${kit}/facturas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const res = await fetch(
      `${API}/clientes/${kit}/facturas/${encodeURIComponent(numero)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
    const res = await fetch(
      `${API}/clientes/${kit}/facturas/${encodeURIComponent(numero)}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error eliminando factura");
    }

    return true;
  },
 
};