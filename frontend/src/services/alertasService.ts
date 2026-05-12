import { API_CONFIG, api } from "@/config";
import { fetchWithRetry } from "@/utils/fetchWithRetry";
import { Cliente } from "@/types/cliente";

const getHeaders = () => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Basic ${token}`;
  return headers;
};

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

export interface AlertaClienteIncompletoPayload extends AlertaFacturacionPayload {
  camposFaltantes: string;
}

export interface AlertaNuevoClientePayload extends AlertaFacturacionPayload {
  creadoPor: string;
}

export const alertasService = {
  obtenerSuspension: async () => {
    const res = await fetchWithRetry(api.alertasSuspension(), { headers: getHeaders() });
    if (!res.ok && res.status !== 401) throw new Error("Error cargando alertas de suspensión");
    return res.json();
  },

  crearFacturacion: async (payload: AlertaFacturacionPayload) => {
    const res = await fetchWithRetry(api.alertasFacturacion(), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error creando alerta de facturación");
    return res.json();
  },

  crearSuspension: async (payload: AlertaSuspensionPayload) => {
    const res = await fetchWithRetry(api.alertasSuspensionCrear(), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error creando alerta de suspensión");
    return res.json();
  },

  crearReactivacion: async (payload: AlertaReactivacionPayload) => {
    const res = await fetchWithRetry(api.alertasReactivacionCrear(), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error creando alerta de reactivación");
    return res.json();
  },

  obtenerFacturacion: async () => {
    const res = await fetchWithRetry(api.alertasFacturacion(), { headers: getHeaders() });
    if (!res.ok && res.status !== 401) throw new Error("Error cargando alertas");
    return res.json();
  },

  obtenerReactivacion: async () => {
    const res = await fetchWithRetry(api.alertasReactivacion(), { headers: getHeaders() });
    if (!res.ok && res.status !== 401) throw new Error("Error cargando alertas de reactivación");
    return res.json();
  },

  marcarCompletada: async (id: string) => {
    const res = await fetchWithRetry(`${api.alertasFacturacion()}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ completada: true }),
    });
    if (!res.ok) throw new Error("Error marcando alerta");
    return res.json();
  },

  crearAlertaNuevoCliente: async (cliente: Cliente, sede?: "principal" | "fusagasuga") => {
    const res = await fetchWithRetry(api.alertasFacturacion(), {
      method: "POST",
      headers: getHeaders(),
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

  // Cliente incompleto
  obtenerClienteIncompleto: async () => {
    const res = await fetchWithRetry(api.alertasClienteIncompleto(), { headers: getHeaders() });
    if (!res.ok && res.status !== 401) throw new Error("Error cargando alertas de cliente incompleto");
    return res.json();
  },

  actualizarClienteIncompleto: async (alertas: any[]) => {
    const res = await fetchWithRetry(api.alertasClienteIncompleto(), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ alertas_cliente_incompleto: alertas }),
    });
    if (!res.ok) throw new Error("Error actualizando alertas");
    return res.json();
  },

  crearClienteIncompleto: async (payload: AlertaClienteIncompletoPayload) => {
    const res = await fetchWithRetry(`${api.alertasClienteIncompleto()}/crear`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error creando alerta");
    return res.json();
  },

  // Nuevo cliente
  obtenerNuevoCliente: async () => {
    const res = await fetchWithRetry(api.alertasNuevoCliente(), { headers: getHeaders() });
    if (!res.ok && res.status !== 401) throw new Error("Error cargando alertas de nuevo cliente");
    return res.json();
  },

  actualizarNuevoCliente: async (alertas: any[]) => {
    const res = await fetchWithRetry(api.alertasNuevoCliente(), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ alertas_nuevo_cliente: alertas }),
    });
    if (!res.ok) throw new Error("Error actualizando alertas");
    return res.json();
  },

  crearNuevoCliente: async (payload: AlertaNuevoClientePayload) => {
    const res = await fetchWithRetry(`${api.alertasNuevoCliente()}/crear`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error creando alerta");
    return res.json();
  },

  eliminarNuevoCliente: async (id: string) => {
    const res = await fetchWithRetry(`${api.alertasNuevoCliente()}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error eliminando alerta");
    return res.json();
  },
};
