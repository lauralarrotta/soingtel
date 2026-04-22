const pagosRepository = require("./pagos.repository");
const AppError = require("../../shared/errors/AppError");
const pool = require("../../config/database");

class PagosService {
  async listar() {
    return pagosRepository.findAll();
  }

  async crear({ pagos }) {
    if (!Array.isArray(pagos) || !pagos.length) {
      throw new AppError("No hay pagos para registrar", 400);
    }

    for (const pago of pagos) {
      if (!pago.factura_id) {
        throw new AppError("Pago incompleto: falta factura_id", 400);
      }
      if (!pago.cliente_id) {
        throw new AppError("Pago incompleto: falta cliente_id", 400);
      }
      if (!pago.fecha_pago) {
        throw new AppError("Pago incompleto: falta fecha_pago", 400);
      }

      const fechaPago = new Date(pago.fecha_pago);
      if (isNaN(fechaPago.getTime())) {
        throw new AppError(`Fecha de pago inválida para factura ${pago.factura_id}`, 400);
      }
      if (fechaPago > new Date()) {
        throw new AppError(`La fecha de pago no puede ser futura para factura ${pago.factura_id}`, 400);
      }
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (const pago of pagos) {
        if (!pago.factura_id || !pago.cliente_id) {
          throw new AppError("Pago incompleto: falta factura_id o cliente_id", 400);
        }

        await pagosRepository.crear({
          factura_id: pago.factura_id,
          cliente_id: pago.cliente_id,
          fecha_pago: pago.fecha_pago,
          registrado_por: pago.registrado_por,
        });

        await pagosRepository.marcarFacturaPagada(pago.factura_id, pago.fecha_pago);
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    return this.listar();
  }
}

module.exports = new PagosService();
