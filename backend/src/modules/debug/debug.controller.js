const pool = require("../../config/database");

class DebugController {
  async getSchema(req, res, next) {
    try {
      const { table = "facturas" } = req.query;

      const cols = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      const constraints = await pool.query(`
        SELECT conname, pg_get_constraintdef(c.oid) as definition
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE conrelid = $1::regclass
      `, [table]);

      res.json({
        table,
        columnas: cols.rows,
        constraints: constraints.rows,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTables(req, res, next) {
    try {
      const tables = await pool.query(`
        SELECT
          schemaname,
          tablename,
          tableowner
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);

      const counts = await pool.query(`
        SELECT 'clientes' as table_name, COUNT(*) as count FROM clientes
        UNION ALL
        SELECT 'fusagasuga', COUNT(*) FROM fusagasuga
        UNION ALL
        SELECT 'facturas', COUNT(*) FROM facturas
        UNION ALL
        SELECT 'facturas_fusagasuga', COUNT(*) FROM facturas_fusagasuga
        UNION ALL
        SELECT 'pagos', COUNT(*) FROM pagos
        UNION ALL
        SELECT 'alertas_facturacion', COUNT(*) FROM alertas_facturacion
        UNION ALL
        SELECT 'alertas_suspension', COUNT(*) FROM alertas_suspension
        UNION ALL
        SELECT 'alertas_reactivacion', COUNT(*) FROM alertas_reactivacion
      `);

      res.json({
        tablas: tables.rows,
        conteos: counts.rows,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DebugController();
