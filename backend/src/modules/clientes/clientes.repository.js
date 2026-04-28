const pool = require("../../config/database");
const { TABLAS } = require("../../shared/constants");

class ClientesRepository {
  async findAll({ page = 1, limit = 10, search, estado, corte, sede, estado_facturacion }, table = TABLAS.PRINCIPAL) {
    const t = table;
    page = parseInt(page);
    limit = parseInt(limit);
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const offset = (page - 1) * limit;
    const values = [];
    const where = ["c.activo = true"];
    let idx = 1;

    if (search) {
      where.push(`(
        c.nombre_cliente ILIKE $${idx} OR c.cuenta ILIKE $${idx} OR
        c.cuenta_starlink ILIKE $${idx} OR c.kit ILIKE $${idx} OR c.email ILIKE $${idx}
      )`);
      values.push(`%${search}%`);
      idx++;
    }

    if (sede && sede !== "todos") {
      where.push(`COALESCE(c.sede, 'principal') = $${idx}`);
      values.push(sede);
      idx++;
    }

    if (estado_facturacion) {
      if (estado_facturacion === "PPC") {
        where.push(`(c.estado_facturacion = $${idx} OR c.estado_pago = 'ppc')`);
      } else {
        where.push(`c.estado_facturacion = $${idx}`);
      }
      values.push(estado_facturacion);
      idx++;
    }

    if (estado && estado !== "todos") {
      const facturaTable = t === TABLAS.FUSAGASUGA ? TABLAS.FUSAGASUGA.factura : TABLAS.PRINCIPAL.factura;
      if (estado === "mora") {
        where.push(`(
          c.estado_pago NOT IN ('suspendido', 'en_dano', 'ppc', 'roc', 'garantia') AND
          (SELECT COUNT(*) FROM ${facturaTable} WHERE cliente_id = c.id AND (estado_pago = 'pendiente' OR estado_pago = 'vencido')) >= 2
        )`);
      } else if (estado === "suspendido") {
        where.push(`c.estado_pago = 'suspendido'`);
      } else if (estado === "en_dano") {
        where.push(`c.estado_pago = 'en_dano'`);
      } else if (estado === "garantia") {
        where.push(`c.estado_pago = 'garantia'`);
      } else if (estado === "pendiente") {
        where.push(`(
          c.estado_pago NOT IN ('suspendido', 'en_dano', 'ppc', 'roc', 'garantia') AND (
            (SELECT COUNT(*) FROM ${facturaTable} WHERE cliente_id = c.id AND (estado_pago = 'pendiente' OR estado_pago = 'vencido')) = 1 OR
            (SELECT COUNT(*) FROM ${facturaTable} WHERE cliente_id = c.id) = 0
          )
        )`);
      } else if (estado === "confirmado") {
        where.push(`(
          c.estado_pago NOT IN ('suspendido', 'en_dano', 'ppc', 'roc', 'garantia') AND
          (SELECT COUNT(*) FROM ${facturaTable} WHERE cliente_id = c.id AND (estado_pago = 'pendiente' OR estado_pago = 'vencido')) = 0 AND
          (SELECT COUNT(*) FROM ${facturaTable} WHERE cliente_id = c.id) > 0
        )`);
      } else if (estado === "sin_factura") {
        where.push(`(SELECT COUNT(*) FROM ${facturaTable} WHERE cliente_id = c.id) = 0`);
      } else {
        where.push(`c.estado_pago = $${idx}`);
        values.push(estado);
        idx++;
      }
    }

    if (corte && corte !== "todos") {
      if (corte === "1-10") where.push(`c.corte BETWEEN 1 AND 10`);
      else if (corte === "11-20") where.push(`c.corte BETWEEN 11 AND 20`);
      else if (corte === "21-31") where.push(`c.corte BETWEEN 21 AND 31`);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const facturaSubquery = t === TABLAS.FUSAGASUGA
      ? `(SELECT json_agg(json_build_object('id', f.id, 'numero', f.numero, 'fecha', f.fecha, 'estadoPago', f.estado_pago, 'periodo', f.periodo) ORDER BY f.fecha DESC)
         FROM ${TABLAS.FUSAGASUGA.factura} f WHERE f.cliente_id = c.id)`
      : `COALESCE(json_agg(CASE WHEN f.id IS NOT NULL THEN json_build_object('id', f.id, 'numero', f.numero, 'fecha', f.fecha, 'estadoPago', f.estado_pago, 'periodo', f.periodo) END ORDER BY f.fecha DESC) FILTER (WHERE f.id IS NOT NULL), '[]')`;

    const result = await pool.query(`
      SELECT c.*, ${facturaSubquery} as facturas
      FROM ${t.cliente} c
      LEFT JOIN ${t.factura} f ON f.cliente_id = c.id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.corte ASC NULLS LAST, c.id DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `, [...values, limit, offset]);

    const totalResult = await pool.query(`SELECT COUNT(*) FROM ${t.cliente} c ${whereClause}`, values);
    const total = parseInt(totalResult.rows[0].count);

    return { data: result.rows, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findByKit(kit, table = TABLAS.PRINCIPAL) {
    const result = await pool.query(`SELECT * FROM ${table.cliente} WHERE kit = $1`, [kit]);
    return result.rows[0] || null;
  }

  async create(data, table = TABLAS.PRINCIPAL) {
    const {
      kit, nombrecliente, cuenta_starlink, coordenadas, corte, email, contrasena,
      observacion, cuenta, costo_plan, valor_factura, valor_soporte, tipo_soporte,
      corte_facturacion, fecha_activacion, estado_pago, observaciones, creado_por, activo, sede,
    } = data;

    const result = await pool.query(`
      INSERT INTO ${table.cliente}
      (kit, nombre_cliente, cuenta_starlink, coordenadas, corte, email, contrasena,
       observacion, cuenta, costo_plan, valor_factura, valor_soporte, tipo_soporte,
       corte_facturacion, fecha_activacion, estado_pago, observaciones, creado_por, activo, sede)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      RETURNING *
    `, [
      kit, nombrecliente, cuenta_starlink || "", coordenadas || "", corte || null,
      email || "", contrasena || "", observacion || "", cuenta || "",
      costo_plan || null, valor_factura || null, valor_soporte || null, tipo_soporte || "",
      corte_facturacion || null, fecha_activacion || null, estado_pago || "pendiente",
      observaciones || "", creado_por || "sistema",
      activo !== undefined ? activo : true,
      sede || (table === TABLAS.FUSAGASUGA ? "fusagasuga" : "principal"),
    ]);

    return result.rows[0];
  }

  async update(kit, campos, table = TABLAS.PRINCIPAL) {
    const keys = Object.keys(campos);
    if (keys.length === 0) return null;

    const setClause = keys.map((c, i) => `${c} = $${i + 1}`).join(", ");
    const result = await pool.query(
      `UPDATE ${table.cliente} SET ${setClause} WHERE kit = $${keys.length + 1} RETURNING *`,
      [...Object.values(campos), kit]
    );
    return result.rows[0];
  }

  async updateEstado(kit, estado_pago, table = TABLAS.PRINCIPAL) {
    const result = await pool.query(
      `UPDATE ${table.cliente} SET estado_pago = $1 WHERE kit = $2 RETURNING *`,
      [estado_pago, kit]
    );
    return result.rows[0];
  }

  async updateFacturacion(kit, estado_facturacion, table = TABLAS.PRINCIPAL) {
    const result = await pool.query(
      `UPDATE ${table.cliente} SET estado_facturacion = $1 WHERE kit = $2 RETURNING *`,
      [estado_facturacion, kit]
    );
    return result.rows[0];
  }

  async updateObservacion(kit, observacion, table = TABLAS.PRINCIPAL) {
    const result = await pool.query(
      `UPDATE ${table.cliente} SET observaciones = $1 WHERE kit = $2 RETURNING *`,
      [observacion, kit]
    );
    return result.rows[0];
  }

  async delete(kit, table = TABLAS.PRINCIPAL) {
    const clienteRes = await pool.query(`SELECT id FROM ${table.cliente} WHERE kit = $1`, [kit]);
    if (!clienteRes.rows.length) return false;

    const clienteId = clienteRes.rows[0].id;
    await pool.query(`DELETE FROM ${table.factura} WHERE cliente_id = $1`, [clienteId]);
    await pool.query(`DELETE FROM ${table.cliente} WHERE id = $1`, [clienteId]);
    return true;
  }

  async getEstadisticas(table = TABLAS.PRINCIPAL) {
    const [total, ppc, danadas, susp, gar, trans] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM ${table.cliente} WHERE activo = true AND estado_pago NOT IN ('en_dano', 'garantia', 'suspendido', 'ppc', 'transferida')`),
      pool.query(`SELECT COUNT(*) FROM ${table.cliente} WHERE activo = true AND (estado_facturacion = 'PPC' OR estado_pago = 'ppc')`),
      pool.query(`SELECT COUNT(*) FROM ${table.cliente} WHERE activo = true AND estado_pago = 'en_dano'`),
      pool.query(`SELECT COUNT(*) FROM ${table.cliente} WHERE activo = true AND estado_pago = 'suspendido'`),
      pool.query(`SELECT COUNT(*) FROM ${table.cliente} WHERE activo = true AND estado_pago = 'garantia'`),
      pool.query(`SELECT COUNT(*) FROM ${table.cliente} WHERE activo = true AND estado_pago = 'transferida'`),
    ]);

    return {
      total: parseInt(total.rows[0].count),
      ppc: parseInt(ppc.rows[0].count),
      danadas: parseInt(danadas.rows[0].count),
      suspendidas: parseInt(susp.rows[0].count),
      garantias: parseInt(gar.rows[0].count),
      transferidas: parseInt(trans.rows[0].count),
    };
  }

  async findAllForExport(table = TABLAS.PRINCIPAL) {
    const result = await pool.query(`
      SELECT c.*, COALESCE(
        json_agg(CASE WHEN f.id IS NOT NULL THEN json_build_object('numero', f.numero, 'periodo', f.periodo) END)
        FILTER (WHERE f.id IS NOT NULL), '[]'
      ) as facturas
      FROM ${table.cliente} c
      LEFT JOIN ${table.factura} f ON f.cliente_id = c.id
      WHERE c.activo = true
      GROUP BY c.id
      ORDER BY c.id DESC
    `);
    return result.rows;
  }
}

module.exports = new ClientesRepository();
