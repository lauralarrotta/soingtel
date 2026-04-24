const AppError = require("../errors/AppError");

const ESTADOS_PAGO_VALIDOS = ["pendiente", "pagado", "roc", "ppc", "en_dano", "garantia", "suspendido"];
const ESTADOS_FACTURACION_VALIDOS = ["facturado", "ROC", "PPC", null];

/**
 * Validaciones para crear cliente
 */
function validarCrearCliente(data) {
  const errores = [];

  if (!data.nombrecliente || data.nombrecliente.trim() === "") {
    errores.push("El nombre del cliente es obligatorio");
  }

  if (data.kit) {
    const kitRegex = /^KIT-?\d+$/;
    if (!kitRegex.test(data.kit)) {
      errores.push("El kit debe tener formato KIT-números o KITnúmeros (ejemplo: KIT-12345 o KIT12345)");
    }
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errores.push("El formato del email es inválido");
  }

  if (data.costo_plan !== undefined && data.costo_plan !== null && isNaN(Number(data.costo_plan))) {
    errores.push("El costo del plan debe ser un número válido");
  }

  if (data.valorFactura !== undefined && data.valorFactura !== null && isNaN(Number(data.valorFactura))) {
    errores.push("El valor de la factura debe ser un número válido");
  }

  if (errores.length > 0) {
    throw new AppError(errores.join("; "), 400);
  }
}

/**
 * Validaciones para crear factura
 */
function validarCrearFactura(data) {
  const errores = [];

  if (!data.cliente_id && !data.kit) {
    errores.push("Se requiere cliente_id o kit para crear la factura");
  }

  if (!data.numero || data.numero.toString().trim() === "") {
    errores.push("El número de factura es obligatorio");
  }

  if (data.fecha) {
    const fecha = new Date(data.fecha);
    if (isNaN(fecha.getTime())) {
      errores.push("La fecha de la factura es inválida");
    }
    if (fecha > new Date()) {
      errores.push("La fecha de la factura no puede ser futura");
    }
  }

  if (data.estado_pago && !ESTADOS_PAGO_VALIDOS.includes(data.estado_pago)) {
    errores.push(`Estado de pago inválido. Estados válidos: ${ESTADOS_PAGO_VALIDOS.join(", ")}`);
  }

  if (errores.length > 0) {
    throw new AppError(errores.join("; "), 400);
  }
}

/**
 * Validaciones para actualizar factura
 */
function validarActualizarFactura(data) {
  const errores = [];

  if (data.numero !== undefined && (isNaN(Number(data.numero)) || Number(data.numero) <= 0)) {
    errores.push("El número de factura debe ser un número positivo");
  }

  if (data.fecha) {
    const fecha = new Date(data.fecha);
    if (isNaN(fecha.getTime())) {
      errores.push("La fecha de la factura es inválida");
    }
  }

  // Aceptar tanto estado_pago (snake_case) como estadoPago (camelCase)
  const estadoPago = data.estado_pago || data.estadoPago;
  if (estadoPago && !ESTADOS_PAGO_VALIDOS.includes(estadoPago)) {
    errores.push(`Estado de pago inválido. Estados válidos: ${ESTADOS_PAGO_VALIDOS.join(", ")}`);
  }

  if (errores.length > 0) {
    throw new AppError(errores.join("; "), 400);
  }
}

/**
 * Validaciones para registrar pago
 */
function validarRegistrarPago(data) {
  const errores = [];

  if (!data.fechaPago) {
    errores.push("La fecha de pago es obligatoria");
  } else {
    const fechaPago = new Date(data.fechaPago);
    if (isNaN(fechaPago.getTime())) {
      errores.push("La fecha de pago es inválida");
    }
  }

  if (errores.length > 0) {
    throw new AppError(errores.join("; "), 400);
  }
}

/**
 * Validaciones para actualizar cliente
 */
function validarActualizarCliente(data) {
  const errores = [];

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errores.push("El formato del email es inválido");
  }

  if (data.costo_plan !== undefined && data.costo_plan !== null && isNaN(Number(data.costo_plan))) {
    errores.push("El costo del plan debe ser un número válido");
  }

  if (data.estado_pago && !ESTADOS_PAGO_VALIDOS.includes(data.estado_pago)) {
    errores.push(`Estado de pago inválido. Estados válidos: ${ESTADOS_PAGO_VALIDOS.join(", ")}`);
  }

  if (errores.length > 0) {
    throw new AppError(errores.join("; "), 400);
  }
}

/**
 * Validar que kit tenga formato correcto
 */
function validarFormatoKit(kit) {
  if (!kit) return;
  const kitRegex = /^KIT-?\d+$/;
  if (!kitRegex.test(kit)) {
    throw new AppError("El kit debe tener formato KIT-números o KITnúmeros (ejemplo: KIT-12345 o KIT12345)", 400);
  }
}

module.exports = {
  validarCrearCliente,
  validarCrearFactura,
  validarActualizarFactura,
  validarRegistrarPago,
  validarActualizarCliente,
  validarFormatoKit,
  ESTADOS_PAGO_VALIDOS,
  ESTADOS_FACTURACION_VALIDOS,
};
