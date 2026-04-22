// API Configuration - single source of truth
export const API_CONFIG = {
  BASE_URL: (import.meta.env.VITE_API_URL as string) || 'https://soingtel.onrender.com/api',
  TIMEOUT: 5000,
  RETRY_ATTEMPTS: 3,
} as const;

// Build full endpoint URLs
export const api = {
  clientes: () => `${API_CONFIG.BASE_URL}/clientes`,
  clientesFusagasuga: () => `${API_CONFIG.BASE_URL}/clientes_fusagasuga`,
  facturas: (kit: string) => `${API_CONFIG.BASE_URL}/clientes/${kit}/facturas`,
  alertasFacturacion: () => `${API_CONFIG.BASE_URL}/alertas_facturacion`,
  alertasSuspension: () => `${API_CONFIG.BASE_URL}/alertas_suspension`,
  alertasReactivacion: () => `${API_CONFIG.BASE_URL}/alertas_reactivacion`,
  health: () => `${API_CONFIG.BASE_URL}/health`,
  exportarSheets: () => `${API_CONFIG.BASE_URL}/exportar-sheets`,
} as const;

export type ApiEndpoint = keyof typeof api;
