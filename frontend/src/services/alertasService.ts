import { API_CONFIG, api } from "@/config";
import { fetchWithRetry } from "@/utils/fetchWithRetry";
import { Cliente } from "@/types/cliente";

export interface AlertaFacturacionPayload {
  kit: string;
  nombre: string;
  cuenta: string;
  email: string;
  sede?: "principal" | "fusagasuga";
}

export interface AlertaSuspensionPayload extends AlertaFacturacionPayload {
  motivo: string;
  facturasVencidas: number;
}

export interface AlertaReactivacionPayload extends AlertaFacturacionPayload {
  ultimoPago: string;
  metodoPago: string;
}

export const alertasService = {
  crearFacturacion: async (payload: AlertaFacturacionPayload) => {
    const res = await fetchWithRetry(api.alertasFacturacion(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error creando alerta de facturación");
    return res.json();
  },

  crearSuspension: async (payload: AlertaSuspensionPayload) => {
    const res = await fetchWithRetry(api.alertasSuspension(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error creando alerta de suspensión");
    return res.json();
  },

  crearReactivacion: async (payload: AlertaReactivacionPayload) => {
    const res = await fetchWithRetry(api.alertasReactivacion(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error creando alerta de reactivación");
    return res.json();
  },

  obtenerFacturacion: async () => {
    const res = await fetchWithRetry(api.alertasFacturacion());
    if (!res.ok) throw new Error("Error cargando alertas");
    return res.json();
  },

  marcarCompletada: async (id: string) => {
    const res = await fetchWithRetry(`${api.alertasFacturacion()}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completada: true }),
    });
    if (!res.ok) throw new Error("Error marcando alerta");
    return res.json();
  },

  crearAlertaNuevoCliente: async (cliente: Cliente, sede?: "principal" | "fusagasuga") => {
    const res = await fetchWithRetry(api.alertasFacturacion(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kit: cliente.kit,
        nombre: cliente.nombrecliente,
        cuenta: cliente.cuenta,
        email: cliente.email,
        sede: sede || "principal",
      }),
    });
    if (!res.ok) throw new Error("Error creando alerta");
    return res.json();
  },
};
