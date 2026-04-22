const pool = require("../../config/database");

class AlertasRepository {
  async findAll(tabla) {
    const result = await pool.query(
      `SELECT * FROM ${tabla} ORDER BY fecha_creacion DESC`
    );
    return result.rows;
  }

  async update(tabla, id, data) {
    const keys = Object.keys(data);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const result = await pool.query(
      `UPDATE ${tabla} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
      [...Object.values(data), id]
    );
    return result.rows[0];
  }

  async create(tabla, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((k, i) => `$${i + 1}`).join(", ");
    const cols = keys.join(", ");
    const result = await pool.query(
      `INSERT INTO ${tabla} (${cols}) VALUES (${setClause}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async delete(tabla, id) {
    await pool.query(`DELETE FROM ${tabla} WHERE id = $1`, [id]);
  }
}

module.exports = new AlertasRepository();
