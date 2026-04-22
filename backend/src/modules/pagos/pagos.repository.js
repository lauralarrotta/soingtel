const pool = require("../../config/database");

class PagosRepository {
  async findAll() {
    const result = await pool.query(`
      SELECT p.*, c.nombre_cliente as cliente_nombre, f.numero as numero_factura
      FROM pagos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN facturas f ON p.factura_id = f.id
      ORDER BY p.fecha_pago DESC
    `);
    return result.rows;
  }

  async crear(data) {
    const { factura_id, cliente_id, fecha_pago, registrado_por } = data;
    const result = await pool.query(
      `INSERT INTO pagos (factura_id, cliente_id, fecha_pago, registrado_por)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [factura_id, cliente_id, fecha_pago, registrado_por || "sistema"]
    );
    return result.rows[0];
  }

  async marcarFacturaPagada(factura_id, fecha_pago) {
    await pool.query(
      `UPDATE facturas SET estado_pago = 'pagado', fecha_pago = $1 WHERE id = $2`,
      [fecha_pago, factura_id]
    );
  }
}

module.exports = new PagosRepository();
