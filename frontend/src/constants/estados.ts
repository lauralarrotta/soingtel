// Estado pago values
export const ESTADO_PAGO = {
  CONFIRMADO: 'confirmado',
  PENDIENTE: 'pendiente',
  MORA: 'mora',
  SUSPENDIDO: 'suspendido',
  EN_DANO: 'en_dano',
  GARANTIA: 'garantia',
  TRANSFERIDA: 'transferida',
  SIN_FACTURA: 'sin_factura',
} as const;

export type EstadoPago = (typeof ESTADO_PAGO)[keyof typeof ESTADO_PAGO];

// Estado facturacion values
export const ESTADO_FACTURACION = {
  PENDIENTE: 'pendiente',
  FACTURADO: 'facturado',
  ROC: 'ROC',
  PPC: 'PPC',
} as const;

export type EstadoFacturacion = (typeof ESTADO_FACTURACION)[keyof typeof ESTADO_FACTURACION];

// Corte date ranges
export const CORTE_RANGES = {
  TODOS: 'todos',
  DIAS_1_10: '1-10',
  DIAS_11_20: '11-20',
  DIAS_21_31: '21-31',
} as const;

export type CorteRange = (typeof CORTE_RANGES)[keyof typeof CORTE_RANGES];

// Label mappings for display
export const ESTADO_PAGO_LABELS: Record<EstadoPago, string> = {
  [ESTADO_PAGO.CONFIRMADO]: 'Confirmado',
  [ESTADO_PAGO.PENDIENTE]: 'Pendiente',
  [ESTADO_PAGO.MORA]: 'Mora',
  [ESTADO_PAGO.SUSPENDIDO]: 'Suspendido',
  [ESTADO_PAGO.EN_DANO]: 'En Daño',
  [ESTADO_PAGO.GARANTIA]: 'En Garantía',
  [ESTADO_PAGO.TRANSFERIDA]: 'Transferida',
  [ESTADO_PAGO.SIN_FACTURA]: 'Sin Facturas',
};

export const CORTE_RANGE_LABELS: Record<CorteRange, string> = {
  [CORTE_RANGES.TODOS]: 'Todas las fechas',
  [CORTE_RANGES.DIAS_1_10]: 'Días 1-10',
  [CORTE_RANGES.DIAS_11_20]: 'Días 11-20',
  [CORTE_RANGES.DIAS_21_31]: 'Días 21-31',
};
