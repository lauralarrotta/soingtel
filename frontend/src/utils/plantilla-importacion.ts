/**
 * Utilidad para generar y descargar la plantilla de importación de clientes
 * en formato CSV compatible con Excel
 */

export interface CampoPlantilla {
  nombre: string;
  ejemplo: string;
  requerido: boolean;
  descripcion?: string;
}

/**
 * Definición de la estructura de campos para importación de clientes
 */
export const ESTRUCTURA_IMPORTACION: CampoPlantilla[] = [
  {
    nombre: "KIT",
    ejemplo: "CAR-001",
    requerido: true,
    descripcion: "Identificador único del kit/equipo (ej: CAR-001, BOG-123)"
  },
  {
    nombre: "NOMBRE",
    ejemplo: "EMPRESA ABC S.A.S",
    requerido: true,
    descripcion: "Nombre completo de la empresa cliente"
  },
  {
    nombre: "CUENTA",
    ejemplo: "STARLINKACCOUNT001",
    requerido: true,
    descripcion: "Número de cuenta de Starlink"
  },
  {
    nombre: "EMAIL",
    ejemplo: "empresa@ejemplo.com",
    requerido: true,
    descripcion: "Email de contacto de la empresa"
  },
  {
    nombre: "COSTO",
    ejemplo: "150000",
    requerido: true,
    descripcion: "Costo mensual del servicio (solo números)"
  },
  {
    nombre: "CORTE",
    ejemplo: "10",
    requerido: true,
    descripcion: "Día del mes para el corte (1-31)"
  },
  {
    nombre: "COORDENADAS",
    ejemplo: "4.6097, -74.0817",
    requerido: false,
    descripcion: "Coordenadas GPS de la instalación (Latitud, Longitud)"
  },
  {
    nombre: "CONTRASEÑA",
    ejemplo: "password123",
    requerido: false,
    descripcion: "Contraseña de acceso al servicio"
  },
  {
    nombre: "FECHA_ACTIVACION",
    ejemplo: "2025-01-15",
    requerido: false,
    descripcion: "Fecha de activación del servicio (formato: YYYY-MM-DD)"
  },
  {
    nombre: "CORTE_FACTURACION",
    ejemplo: "10",
    requerido: false,
    descripcion: "Día del corte para facturación (1-31). Si no se especifica, usa el valor de CORTE"
  },
  {
    nombre: "OBSERVACIONES",
    ejemplo: "Cliente nuevo - Antena instalada en el techo",
    requerido: false,
    descripcion: "Notas o comentarios adicionales sobre el cliente"
  },
  {
    nombre: "VALOR_FACTURAR",
    ejemplo: "150000",
    requerido: false,
    descripcion: "Valor a facturar al cliente. Si no se especifica, usa el valor de COSTO"
  },
  {
    nombre: "VALOR_SOPORTE",
    ejemplo: "50000",
    requerido: false,
    descripcion: "Valor del soporte técnico"
  },
  {
    nombre: "CUENTA_BANCARIA",
    ejemplo: "1234567890",
    requerido: false,
    descripcion: "Número de cuenta bancaria del cliente"
  },
  {
    nombre: "TIPO_SOPORTE",
    ejemplo: "Básico",
    requerido: false,
    descripcion: "Tipo de soporte contratado (Básico, Premium, etc.)"
  }
];

/**
 * Genera y descarga un archivo CSV con la plantilla de importación
 * Incluye encabezados, ejemplos y una fila vacía para empezar a completar
 */
export function descargarPlantillaImportacion() {
  // Obtener solo los nombres de los campos
  const encabezados = ESTRUCTURA_IMPORTACION.map(campo => campo.nombre);
  
  // Crear fila con ejemplos
  const ejemplos = ESTRUCTURA_IMPORTACION.map(campo => campo.ejemplo);
  
  // Crear fila vacía para que empiecen a llenar
  const filaVacia = ESTRUCTURA_IMPORTACION.map(() => "");

  // Crear comentarios con instrucciones (como primera fila)
  const instrucciones = "# INSTRUCCIONES: Completa las filas debajo con los datos de tus clientes. Los campos marcados con * son OBLIGATORIOS.";
  const camposRequeridos = "# CAMPOS REQUERIDOS (*): " + 
    ESTRUCTURA_IMPORTACION
      .filter(c => c.requerido)
      .map(c => c.nombre)
      .join(", ");
  
  // Construir el contenido CSV
  const csvContenido = [
    instrucciones,
    camposRequeridos,
    "# Puedes eliminar estas líneas de comentarios antes de importar",
    "",
    encabezados.join(","),
    ejemplos.join(","),
    filaVacia.join(","),
    // Agregar 5 filas vacías adicionales para facilitar el llenado
    ...Array(5).fill(filaVacia.join(","))
  ].join("\n");

  // Crear y descargar el archivo
  const BOM = "\uFEFF"; // Byte Order Mark para que Excel detecte UTF-8
  const blob = new Blob([BOM + csvContenido], { 
    type: "text/csv;charset=utf-8;" 
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  // Nombre del archivo con fecha actual
  const fecha = new Date().toISOString().split('T')[0];
  link.download = `Soingtel_Plantilla_Importacion_Clientes_${fecha}.csv`;
  
  // Trigger de descarga
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpiar URL
  window.URL.revokeObjectURL(url);
  
  return true;
}

/**
 * Genera un archivo CSV documentado con información detallada sobre cada campo
 * Útil como guía de referencia
 */
export function descargarGuiaImportacion() {
  const lineas = [
    "# =========================================",
    "# GUÍA DE IMPORTACIÓN DE CLIENTES - SOINGTEL",
    "# Sistema de Gestión de Servicios Starlink",
    "# =========================================",
    "",
    "# ESTRUCTURA DEL ARCHIVO",
    "# ----------------------",
    "# El archivo debe ser un CSV con las siguientes columnas:",
    "",
  ];

  // Agregar información de cada campo
  ESTRUCTURA_IMPORTACION.forEach((campo, index) => {
    const requerido = campo.requerido ? "OBLIGATORIO *" : "Opcional";
    lineas.push(`# ${index + 1}. ${campo.nombre} (${requerido})`);
    lineas.push(`#    Ejemplo: ${campo.ejemplo}`);
    if (campo.descripcion) {
      lineas.push(`#    ${campo.descripcion}`);
    }
    lineas.push("");
  });

  // Agregar notas importantes
  lineas.push("# NOTAS IMPORTANTES:");
  lineas.push("# ------------------");
  lineas.push("# 1. Los campos marcados con (*) son OBLIGATORIOS");
  lineas.push("# 2. El formato de fecha debe ser: YYYY-MM-DD (Año-Mes-Día)");
  lineas.push("# 3. Los valores numéricos (COSTO, CORTE, etc.) solo deben contener números");
  lineas.push("# 4. El campo EMAIL debe tener un formato válido (ej: usuario@dominio.com)");
  lineas.push("# 5. El campo CORTE debe estar entre 1 y 31");
  lineas.push("# 6. Las coordenadas deben estar en formato: Latitud, Longitud");
  lineas.push("# 7. No uses comas dentro de los valores, solo como separadores de campos");
  lineas.push("# 8. Si un valor contiene comas, enciérralo entre comillas");
  lineas.push("");
  lineas.push("# PROCESO DE IMPORTACIÓN:");
  lineas.push("# -----------------------");
  lineas.push("# 1. Descarga la plantilla de importación desde el botón 'Descargar Plantilla'");
  lineas.push("# 2. Completa los datos de tus clientes en el archivo CSV");
  lineas.push("# 3. Guarda el archivo");
  lineas.push("# 4. Usa el botón 'Importar Clientes' en el sistema");
  lineas.push("# 5. Selecciona el archivo CSV completado");
  lineas.push("# 6. El sistema validará los datos y te mostrará los errores si los hay");
  lineas.push("# 7. Revisa y confirma la importación");
  lineas.push("");
  lineas.push("# EJEMPLO DE REGISTRO COMPLETO:");
  lineas.push("# ------------------------------");
  
  const ejemplo = ESTRUCTURA_IMPORTACION.map(c => c.nombre).join(",");
  const valores = ESTRUCTURA_IMPORTACION.map(c => c.ejemplo).join(",");
  
  lineas.push(ejemplo);
  lineas.push(valores);
  lineas.push("");
  lineas.push("# Para más información, contacta al administrador del sistema.");
  lineas.push("# =========================================");

  const contenido = lineas.join("\n");
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + contenido], { 
    type: "text/plain;charset=utf-8;" 
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  const fecha = new Date().toISOString().split('T')[0];
  link.download = `Soingtel_Guia_Importacion_${fecha}.txt`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  
  return true;
}

/**
 * Valida un objeto cliente contra la estructura esperada
 * Retorna un array de errores encontrados
 */
export function validarCliente(cliente: any, numeroFila: number): { campo: string; mensaje: string; fila: number }[] {
  const errores: { campo: string; mensaje: string; fila: number }[] = [];

  // Validar campos requeridos
  const camposRequeridos = ESTRUCTURA_IMPORTACION.filter(c => c.requerido);
  
  camposRequeridos.forEach(campo => {
    const valor = cliente[campo.nombre];
    if (!valor || valor.toString().trim() === "") {
      errores.push({
        campo: campo.nombre,
        mensaje: "Campo requerido vacío",
        fila: numeroFila
      });
    }
  });

  // Validaciones específicas
  if (cliente.EMAIL && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.EMAIL)) {
    errores.push({
      campo: "EMAIL",
      mensaje: "Formato de email inválido",
      fila: numeroFila
    });
  }

  if (cliente.COSTO && isNaN(Number(cliente.COSTO))) {
    errores.push({
      campo: "COSTO",
      mensaje: "Debe ser un valor numérico",
      fila: numeroFila
    });
  }

  if (cliente.CORTE) {
    const corte = Number(cliente.CORTE);
    if (isNaN(corte) || corte < 1 || corte > 31) {
      errores.push({
        campo: "CORTE",
        mensaje: "Debe ser un número entre 1 y 31",
        fila: numeroFila
      });
    }
  }

  if (cliente.FECHA_ACTIVACION && cliente.FECHA_ACTIVACION.trim()) {
    const fechaPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaPattern.test(cliente.FECHA_ACTIVACION)) {
      errores.push({
        campo: "FECHA_ACTIVACION",
        mensaje: "Formato debe ser YYYY-MM-DD",
        fila: numeroFila
      });
    }
  }

  return errores;
}
