// Navigation sections - single source of truth
export const SECTIONS = {
  MENSUALIDADES: 'mensualidades',
  FUSAGASUGA: 'fusagasuga',
  CLIENTES_STATUS: 'clientes-status',
  CLIENTES: 'clientes',
  SEMAFORIZACION: 'semaforizacion',
  REPORTES: 'reportes',
  CONFIGURACION: 'configuracion',
} as const;

export type SectionId = (typeof SECTIONS)[keyof typeof SECTIONS];

export const SECTION_LABELS: Record<SectionId, string> = {
  [SECTIONS.MENSUALIDADES]: 'Control de Mensualidades',
  [SECTIONS.FUSAGASUGA]: 'Fusagasugá',
  [SECTIONS.CLIENTES_STATUS]: 'Estado Clientes',
  [SECTIONS.CLIENTES]: 'Clientes',
  [SECTIONS.SEMAFORIZACION]: 'Semaforización',
  [SECTIONS.REPORTES]: 'Reportes',
  [SECTIONS.CONFIGURACION]: 'Configuración',
};

export const SECTION_ICONS: Record<SectionId, string> = {
  [SECTIONS.MENSUALIDADES]: 'BarChart3',
  [SECTIONS.FUSAGASUGA]: 'MapPin',
  [SECTIONS.CLIENTES_STATUS]: 'Users',
  [SECTIONS.CLIENTES]: 'UserCircle',
  [SECTIONS.SEMAFORIZACION]: 'TrafficCone',
  [SECTIONS.REPORTES]: 'FileText',
  [SECTIONS.CONFIGURACION]: 'Settings',
};
