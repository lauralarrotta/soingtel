const alertasRepository = require("./alertas.repository");
const AppError = require("../../shared/errors/AppError");

const TABLAS = {
  FACTURACION: "alertas_facturacion",
  SUSPENSION: "alertas_suspension",
  REACTIVACION: "alertas_reactivacion",
};

class AlertasService {
  async listarFacturacion() {
    return alertasRepository.findAll(TABLAS.FACTURACION);
  }

  async actualizarFacturacion({ alertas_facturacion }) {
    if (!Array.isArray(alertas_facturacion)) {
      throw new AppError("alertas_facturacion debe ser un array", 400);
    }

    for (const alerta of alertas_facturacion) {
      if (alerta.id && typeof alerta.completada !== "boolean") {
        throw new AppError(`El campo 'completada' debe ser booleano para alerta ${alerta.id}`, 400);
      }
    }

    if (Array.isArray(alertas_facturacion)) {
      for (const alerta of alertas_facturacion) {
        if (alerta.id) {
          await alertasRepository.update(TABLAS.FACTURACION, alerta.id, {
            completada: alerta.completada,
          });
        }
      }
    }
    return this.listarFacturacion();
  }

  async listarSuspension() {
    return alertasRepository.findAll(TABLAS.SUSPENSION);
  }

  async actualizarSuspension({ alertas_suspension }) {
    if (!Array.isArray(alertas_suspension)) {
      throw new AppError("alertas_suspension debe ser un array", 400);
    }

    for (const alerta of alertas_suspension) {
      if (alerta.id && typeof alerta.vista !== "boolean") {
        throw new AppError(`El campo 'vista' debe ser booleano para alerta ${alerta.id}`, 400);
      }
    }

    if (Array.isArray(alertas_suspension)) {
      for (const alerta of alertas_suspension) {
        if (alerta.id) {
          await alertasRepository.update(TABLAS.SUSPENSION, alerta.id, {
            vista: alerta.vista,
          });
        }
      }
    }
    return this.listarSuspension();
  }

  async listarReactivacion() {
    return alertasRepository.findAll(TABLAS.REACTIVACION);
  }

  async actualizarReactivacion({ alertas_reactivacion }) {
    if (!Array.isArray(alertas_reactivacion)) {
      throw new AppError("alertas_reactivacion debe ser un array", 400);
    }

    for (const alerta of alertas_reactivacion) {
      if (alerta.id && typeof alerta.vista !== "boolean") {
        throw new AppError(`El campo 'vista' debe ser booleano para alerta ${alerta.id}`, 400);
      }
    }

    if (Array.isArray(alertas_reactivacion)) {
      for (const alerta of alertas_reactivacion) {
        if (alerta.id) {
          await alertasRepository.update(TABLAS.REACTIVACION, alerta.id, {
            vista: alerta.vista,
          });
        }
      }
    }
    return this.listarReactivacion();
  }

  async crearFacturacion({ kit, nombre, cuenta, email, sede = "principal" }) {
    let clienteId = null;
    const tableName = sede === "fusagasuga" ? "fusagasuga" : "clientes";

    try {
      const pool = require("../../config/database");
      const clienteResult = await pool.query(
        `SELECT id FROM ${tableName} WHERE kit = $1`,
        [kit]
      );
      if (clienteResult.rows.length > 0) {
        clienteId = clienteResult.rows[0].id;
      }
    } catch (e) {
      // Si no encuentra, continuamos con clienteId = null
    }

    return alertasRepository.create(TABLAS.FACTURACION, {
      cliente_id: clienteId,
      cliente_kit: kit,
      cliente_nombre: nombre,
      sede,
      mensaje: `Nueva empresa agregada: ${nombre} (Kit: ${kit})`,
    });
  }

  async crearSuspension({ kit, nombre, cuenta, email, motivo, facturasVencidas, sede = "principal" }) {
    let clienteId = null;
    const tableName = sede === "fusagasuga" ? "fusagasuga" : "clientes";

    try {
      const pool = require("../../config/database");
      const clienteResult = await pool.query(
        `SELECT id FROM ${tableName} WHERE kit = $1`,
        [kit]
      );
      if (clienteResult.rows.length > 0) {
        clienteId = clienteResult.rows[0].id;
      }
    } catch (e) {
      // Si no encuentra, continuamos con clienteId = null
    }

    return alertasRepository.create(TABLAS.SUSPENSION, {
      cliente_id: clienteId,
      cliente_kit: kit,
      cliente_nombre: nombre,
      numero_factura: facturasVencidas,
      sede,
      mensaje: `Solicitud de suspensión: ${nombre} - ${motivo}`,
    });
  }

  async crearReactivacion({ kit, nombre, cuenta, email, ultimoPago, metodoPago, sede = "principal" }) {
    let clienteId = null;
    const tableName = sede === "fusagasuga" ? "fusagasuga" : "clientes";

    try {
      const pool = require("../../config/database");
      const clienteResult = await pool.query(
        `SELECT id FROM ${tableName} WHERE kit = $1`,
        [kit]
      );
      if (clienteResult.rows.length > 0) {
        clienteId = clienteResult.rows[0].id;
      }
    } catch (e) {
      // Si no encuentra, continuamos con clienteId = null
    }

    return alertasRepository.create(TABLAS.REACTIVACION, {
      cliente_id: clienteId,
      cliente_kit: kit,
      cliente_nombre: nombre,
      numero_factura: ultimoPago,
      sede,
      mensaje: `Solicitud de reactivación: ${nombre} - Último pago: ${ultimoPago} (${metodoPago})`,
    });
  }

  async eliminarSuspension(id) {
    await alertasRepository.delete(TABLAS.SUSPENSION, id);
    return { success: true };
  }

  async eliminarReactivacion(id) {
    await alertasRepository.delete(TABLAS.REACTIVACION, id);
    return { success: true };
  }
}

module.exports = new AlertasService();
