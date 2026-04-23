const pool = require("../../config/database");

class FacturasRepository {
  async findAll() {
    const result = await pool.query(`
      SELECT f.*, c.nombre_cliente as cliente_nombre
      FROM facturas f
      LEFT JOIN clientes c ON f.cliente_id = c.id
      ORDER BY f.id DESC
    `);
    return result.rows;
  }

  async findByClienteId(clienteId) {
    const result = await pool.query(
      `SELECT * FROM facturas WHERE cliente_id = $1 ORDER BY id DESC`,
      [clienteId]
    );
    return result.rows;
  }

  async findByKitAndNumero(kit, numero) {
    const clienteRes = await pool.query(
      `SELECT id FROM clientes WHERE kit = $1`,
      [kit]
    );
    if (!clienteRes.rows.length) return null;

    const result = await pool.query(
      `SELECT * FROM facturas WHERE cliente_id = $1 AND numero = $2`,
      [clienteRes.rows[0].id, numero]
    );
    return result.rows[0] || null;
  }

  async findByKitAndNumeroFusa(kit, numero) {
    const clienteRes = await pool.query(
      `SELECT id FROM fusagasuga WHERE kit = $1`,
      [kit]
    );
    if (!clienteRes.rows.length) return null;

    const result = await pool.query(
      `SELECT * FROM facturas_fusagasuga WHERE cliente_id = $1 AND numero = $2`,
      [clienteRes.rows[0].id, numero]
    );
    return result.rows[0] || null;
  }

  async create(data, table = "facturas") {
    const { cliente_id, numero, periodo, anio, fecha, estado_pago } = data;
    const result = await pool.query(
      `INSERT INTO ${table} (cliente_id, numero, periodo, anio, fecha, estado_pago)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [cliente_id, numero, periodo || null, anio || new Date().getFullYear(), fecha, estado_pago || "pendiente"]
    );
    return result.rows[0];
  }

  async update(id, data, table = "facturas") {
    const keys = Object.keys(data);
    if (!keys.length) return null;

    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const result = await pool.query(
      `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
      [...Object.values(data), id]
    );
    return result.rows[0];
  }

  async updateByKitAndNumero(kit, numeroFactura, data, table = "facturas") {
    const clienteRes = await pool.query(
      `SELECT id FROM clientes WHERE kit = $1`,
      [kit]
    );
    if (!clienteRes.rows.length) return null;

    const clienteId = clienteRes.rows[0].id;
    const keys = Object.keys(data);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");

    const result = await pool.query(
      `UPDATE ${table} SET ${setClause} WHERE cliente_id = $${keys.length + 1} AND numero = $${keys.length + 2} RETURNING *`,
      [...Object.values(data), clienteId, numeroFactura]
    );
    return result.rows[0] || null;
  }

  async deleteByKitAndNumero(kit, numeroFactura, table = "facturas") {
    const clienteRes = await pool.query(
      `SELECT id FROM clientes WHERE kit = $1`,
      [kit]
    );
    if (!clienteRes.rows.length) return null;

    const result = await pool.query(
      `DELETE FROM ${table} WHERE cliente_id = $1 AND numero = $2 RETURNING *`,
      [clienteRes.rows[0].id, numeroFactura]
    );
    return result.rows[0] || null;
  }

  async existePorClienteYMes(cliente_id, fecha) {
    const fechaStr = fecha instanceof Date ? fecha.toISOString().split("T")[0] : fecha;
    const result = await pool.query(
      `SELECT id FROM facturas WHERE cliente_id=$1 AND DATE_TRUNC('month',fecha::date)=DATE_TRUNC('month',$2::date)`,
      [cliente_id, fechaStr]
    );
    return result.rows.length > 0;
  }

  async marcarPagado(id, fechaPago, table = "facturas") {
    const result = await pool.query(
      `UPDATE ${table} SET estado_pago = 'pagado', fecha_pago = $1 WHERE id = $2 RETURNING *`,
      [fechaPago, id]
    );
    return result.rows[0];
  }
}

module.exports = new FacturasRepository();
