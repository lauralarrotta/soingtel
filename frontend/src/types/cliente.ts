

export type EstadoFacturacion =
  | "pendiente"
  | "facturado"
  | "ROC"
  | "PPC"
  | null;
  
export interface Factura {
  numero: string;
  fecha: string;
  valor: number;
  estadoPago: "pagado" | "pendiente" | "vencido" | "roc" | "ppc";
  metodoPago?: string;
  fechaPago?: string;
  periodo?: string;
}

export interface Cliente {
  kit: string;
  nombrecliente: string;
  cuenta: string;
  cuentastarlink?: string;
  cuenta_starlink?: string;
  coordenadas?: string;
  email: string;
  contrasena?: string;
  fechaActivacion?: string;
  corte: number;
  corteFacturacion?: number;
  estado_pago: "confirmado" | "pendiente" | "suspendido" | "en_dano" | "garantia" | string;
  estado_facturacion?: EstadoFacturacion;
  observaciones: string;
  costo: string;
  valorFacturar?: string;
  valorSoporte?: string;
  tipoSoporte?: string;
  facturas?: Factura[];
}
