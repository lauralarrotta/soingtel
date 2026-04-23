// ========================================
// BACKEND API - Sistema Soingtel
// Node.js + Express + PostgreSQL
// Listo para Render + Supabase
// ========================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { google } = require("googleapis");

const app = express();
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://soingtel.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
const PORT = process.env.PORT || 3001;

// ========================================
// CONFIGURACIÃ“N DE POSTGRESQL
// Usando DATABASE_URL y SSL para Supabase
// ========================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // âš ï¸ Necesario para Supabase
});

// Verificar conexiÃ³n y auto-migrar esquema si es necesario
pool.connect(async (err, client, release) => {
  if (err) {
    console.error("âŒ Error conectando a PostgreSQL:", err.stack);
    console.error("\nâš ï¸  Verifica tu DATABASE_URL en Render o .env\n");
  } else {
    console.log("âœ… Conectado exitosamente a PostgreSQL");

    // Auto-migraciÃ³n pequeÃ±a: agregar columna sede si no existe
    try {
      await client.query(`
        ALTER TABLE clientes 
        ADD COLUMN IF NOT EXISTS sede VARCHAR(50) DEFAULT 'principal';
      `);
      await client.query(`
        ALTER TABLE facturas 
        ADD COLUMN IF NOT EXISTS anio INTEGER;
      `);
      console.log("âœ… MigraciÃ³n automÃ¡tica revisada (Columnas: sede, anio)");
    } catch (migErr) {
      console.error("Error auto-migrando la base de datos:", migErr);
    }

    release();
  }
});

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========================================
// GOOGLE SHEETS EXPORT
// ========================================
const limpiar = (valor) => (valor || "").toString().replace(/,/g, "");

async function exportarAGoogleSheets(clientes) {
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Falta GOOGLE_PRIVATE_KEY en variables de entorno");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  // ===============================
  // PROCESAR DATA
  // ===============================
  const periodosSet = new Set();

  clientes.forEach((c) => {
    (c.facturas || []).forEach((f) => {
      if (f.periodo) periodosSet.add(f.periodo);
    });
  });

  const periodos = Array.from(periodosSet);

  const headers = [
    "KIT",
    "CLIENTE",
    "CUENTA_STARLINK",
    "COORDENADAS",
    "CORTE",
    "EMAIL",
    "ESTADO PAGO", // ðŸ‘ˆ ESTE FALTABA
    "CONTRASEÃ‘A",
    "OBSERVACION",
    "CUENTA",
    "COSTO PLAN",
    "VALOR FACTURA",
    "VALOR SOPORTE",
    "TIPO SOPORTE",
    "CORTE FACTURACION",
    "FECHA DE ACTIVACION",
    ...periodos,
  ];

  const rows = [headers];

  clientes.forEach((cliente) => {
    const fila = [
      limpiar(cliente.kit),
      limpiar(cliente.nombre_cliente),
      limpiar(cliente.cuenta_starlink),
      limpiar(cliente.coordenadas),
      limpiar(cliente.corte),
      limpiar(cliente.email),
      limpiar(cliente.estado_pago), // ðŸ‘ˆ MISMA POSICIÃ“N QUE HEADER
      limpiar(cliente.contrasena),
      limpiar(cliente.observacion),
      limpiar(cliente.cuenta),
      limpiar(cliente.costo_plan),
      limpiar(cliente.valor_factura),
      limpiar(cliente.valor_soporte),
      limpiar(cliente.tipo_soporte),
      limpiar(cliente.corte_facturacion),
      limpiar(cliente.fecha_activacion),
    ];
    periodos.forEach((periodo) => {
      const factura = (cliente.facturas || []).find(
        (f) => f.periodo === periodo,
      );

      if (factura) {
        fila.push(
          `${limpiar(factura.numero)} (${limpiar(cliente.estado_pago)})`,
        );
      } else {
        fila.push("");
      }
    });

    rows.push(fila);
  });

  // ===============================
  // ENVIAR A GOOGLE SHEETS
  // ===============================
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Hoja 1!A1",
    valueInputOption: "RAW",
    requestBody: {
      values: rows,
    },
  });
}

// ========================================
// EXPORTAR A GOOGLE SHEETS
// ========================================
app.post("/api/exportar-sheets", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        COALESCE(
          json_agg(
            CASE 
              WHEN f.id IS NOT NULL THEN
                json_build_object(
                  'numero', f.numero,
                  'periodo', f.periodo
                )
            END
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'
        ) as facturas
      FROM clientes c
      LEFT JOIN facturas f ON f.cliente_id = c.id
      WHERE c.activo = true
      GROUP BY c.id
      ORDER BY c.id DESC
    `);

    await exportarAGoogleSheets(result.rows);

    res.json({
      success: true,
      message: "Exportado a Google Sheets ðŸš€",
    });
  } catch (error) {
    console.error("Error exportando:", error);
    res.status(500).json({
      error: "Error exportando a Google Sheets",
    });
  }
});

// ========================================
// RUTAS - HEALTH CHECK
// ========================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "PostgreSQL Supabase",
  });
});
// ========================================
// RUTAS - CLIENTES
// ========================================

// Obtener todos los clientes
app.get("/api/clientes", async (req, res) => {
  try {
    // ðŸ”¹ 1. Params
    let { page = 1, limit = 10, search = "", estado = "", corte = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const offset = (page - 1) * limit;

    // ðŸ”¹ 2. Construir WHERE dinÃ¡mico
    let where = ["c.activo = true"];
    let values = [];
    let idx = 1;

    // ðŸ” SEARCH (nombre, cuenta, email, cuenta_starlink, kit)
    if (search) {
      where.push(`(
        c.nombre_cliente ILIKE $${idx} OR 
        c.cuenta ILIKE $${idx} OR 
        c.cuenta_starlink ILIKE $${idx} OR 
        c.kit ILIKE $${idx} OR 
        c.email ILIKE $${idx}
      )`);
      values.push(`%${search}%`);
      idx++;
    }

    // ðŸ§¾ ESTADO FACTURACIÃ“N (PPC)
    let { sede, estado_facturacion, exclude_ppc } = req.query;
    if (sede && sede !== "todos") {
      where.push(`COALESCE(c.sede, 'principal') = $${idx}`);
      values.push(sede);
      idx++;
    }

    if (estado_facturacion) {
      if (estado_facturacion === 'PPC') {
        where.push(`(c.estado_facturacion = $${idx} OR c.estado_pago = 'ppc')`);
      } else {
        where.push(`c.estado_facturacion = $${idx}`);
      }
      values.push(estado_facturacion);
      idx++;
    } else if (exclude_ppc === "true") {
      // Por solicitud, no se excluye ningÃºn estado por ahora en la vista principal
      // where.push(`(c.estado_facturacion IS NULL OR c.estado_facturacion != 'PPC')`);
      // where.push(`(c.estado_pago IS NULL OR c.estado_pago NOT IN ('ppc', 'roc'))`);
    }

    // ðŸ“Š ESTADO
    if (estado && estado !== "todos") {
      if (estado === "mora") {
        where.push(`(
          c.estado_pago NOT IN ('suspendido', 'en_dano', 'ppc', 'roc', 'garantia') AND 
          (SELECT COUNT(*) FROM facturas WHERE cliente_id = c.id AND (estado_pago = 'pendiente' OR estado_pago = 'vencido')) >= 2
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
            (SELECT COUNT(*) FROM facturas WHERE cliente_id = c.id AND (estado_pago = 'pendiente' OR estado_pago = 'vencido')) = 1
            OR 
            (SELECT COUNT(*) FROM facturas WHERE cliente_id = c.id) = 0
          )
        )`);
      } else if (estado === "confirmado") {
        where.push(`(
          c.estado_pago NOT IN ('suspendido', 'en_dano', 'ppc', 'roc', 'garantia') AND
          (SELECT COUNT(*) FROM facturas WHERE cliente_id = c.id AND (estado_pago = 'pendiente' OR estado_pago = 'vencido')) = 0 AND
          (SELECT COUNT(*) FROM facturas WHERE cliente_id = c.id) > 0
        )`);
      } else if (estado === "sin_factura") {
        // No additional condition needed, handled separately below
      } else {
        where.push(`c.estado_pago = $${idx}`);
        values.push(estado);
        idx++;
      }
    }

    // CORTE
    if (corte && corte !== "todos") {
      if (corte === "1-10") {
        where.push(`c.corte BETWEEN 1 AND 10`);
      } else if (corte === "11-20") {
        where.push(`c.corte BETWEEN 11 AND 20`);
      } else if (corte === "21-31") {
        where.push(`c.corte BETWEEN 21 AND 31`);
      }
    }

    // SIN FACTURAS
    if (estado === "sin_factura") {
      where.push(`(
        NOT EXISTS (SELECT 1 FROM facturas WHERE cliente_id = c.id)
      )`);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // 3. QUERY PRINCIPAL
    const result = await pool.query(
      `
      SELECT
        c.*,
        COALESCE(
          json_agg(
            CASE
              WHEN f.id IS NOT NULL THEN
                json_build_object(
                  'id', f.id,
                  'numero', f.numero,
                  'fecha', f.fecha,
                  'estadoPago', f.estado_pago,
                  'periodo', f.periodo
                )
            END ORDER BY f.fecha DESC
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'
        ) as facturas
      FROM clientes c
      LEFT JOIN facturas f ON f.cliente_id = c.id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.corte ASC NULLS LAST, c.id DESC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...values, limit, offset]
    );

    // 4. TOTAL (MISMO WHERE importante)
    const totalResult = await pool.query(
      `
      SELECT COUNT(*)
      FROM clientes c
      ${whereClause}
      `,
      values
    );

    const total = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // ðŸ”¹ 5. RESPONSE
    res.json({
      data: result.rows,
      total,
      page,
      totalPages,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo clientes" });
  }
});

// Obtener estadÃ­sticas de clientes (Para Tarjetas / Cards)
app.get("/api/clientes/estadisticas", async (req, res) => {
  try {
    // Total Activos -> no suspendidos, no daÃ±o, no ppc (y activos=true)
    const totalResult = await pool.query(`
      SELECT COUNT(*) FROM clientes 
      WHERE activo = true 
        AND (estado_pago IS NULL OR estado_pago NOT IN ('en_dano', 'garantia'))
    `);

    // PPC
    const ppcResult = await pool.query(`
      SELECT COUNT(*) FROM clientes 
      WHERE activo = true AND (estado_facturacion = 'PPC' OR estado_pago = 'ppc')
    `);

    // DaÃ±adas
    const danadasResult = await pool.query(`SELECT COUNT(*) FROM clientes WHERE activo = true AND estado_pago = 'en_dano'`);

    // Suspendidos
    const suspResult = await pool.query(`SELECT COUNT(*) FROM clientes WHERE activo = true AND estado_pago = 'suspendido'`);

    // GarantÃ­as
    const garantiasResult = await pool.query(`SELECT COUNT(*) FROM clientes WHERE activo = true AND estado_pago = 'garantia'`);

    res.json({
      total: parseInt(totalResult.rows[0].count),
      ppc: parseInt(ppcResult.rows[0].count),
      danadas: parseInt(danadasResult.rows[0].count),
      suspendidas: parseInt(suspResult.rows[0].count),
      garantias: parseInt(garantiasResult.rows[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo estadÃ­sticas" });
  }
});


app.get("/api/clientes/:kit", async (req, res) => {
  try {
    const { kit } = req.params;

    const result = await pool.query(`SELECT * FROM clientes WHERE kit = $1`, [
      kit,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error obteniendo cliente",
    });
  }
});

// Crear cliente
app.post("/api/clientes", async (req, res) => {
  try {
    const {
      kit,
      nombrecliente,
      cuentastarlink,
      coordenadas,
      corte,
      email,
      contrasena,
      observacion,
      cuenta,
      costoplan,
      valorFactura,
      valorSoporte,
      tipoSoporte,
      corteFacturacion,
      fechaActivacion,
      estadoPago,
      observaciones,
      creadoPor,
      activo,
    } = req.body;

    // ValidaciÃ³n bÃ¡sica
    if (!nombrecliente || nombrecliente.trim() === "") {
      return res
        .status(400)
        .json({ error: "El nombre del cliente es obligatorio" });
    }

    // Generar KIT automÃ¡tico si no viene
    const kitFinal = kit && kit.trim() !== "" ? kit : `KIT-${Date.now()}`;

    const values = [
      kitFinal,
      nombrecliente,
      cuentastarlink || "",
      coordenadas || "",
      corte || null,
      email || "",
      contrasena || "",
      observacion || "",
      cuenta || "",
      costoplan ? parseFloat(costoplan) : null,
      valorFactura ? parseFloat(valorFactura) : null,
      valorSoporte ? parseFloat(valorSoporte) : null,
      tipoSoporte || "",
      corteFacturacion || null,
      fechaActivacion || null,
      estadoPago || "pendiente",
      observaciones || "",
      creadoPor || "sistema",
      activo !== undefined ? activo : true
    ];

    const query = `
      INSERT INTO clientes (
        kit, nombre_cliente, cuenta_starlink, coordenadas, corte, email, contrasena,
        observacion, cuenta, costo_plan, valor_factura, valor_soporte, tipo_soporte,
        corte_facturacion, fecha_activacion, estado_pago, observaciones, creado_por, activo
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19
      )
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Manejo de KIT duplicado
    if (err.code === "23505") {
      return res.status(400).json({
        error: "El KIT ya existe",
      });
    }

    console.error(err);

    res.status(500).json({
      error: "Error creando cliente",
    });
  }
});

// ImportaciÃ³n masiva de clientes

function limpiarNumero(valor) {
  if (!valor) return null;

  return Number(valor.toString().replace(/\$/g, "").replace(/,/g, "").trim());
}

function limpiarFecha(valor) {
  if (!valor) return null;

  try {
    let strVal = String(valor).trim();

    // Si viene en formato ISO o incluye 'T'
    if (strVal.includes("T")) {
      strVal = strVal.split("T")[0]; // Nos quedamos con 'YYYY-MM-DD'
    }

    const unificado = strVal.replace(/[-.]/g, "/");
    const partes = unificado.split("/");

    if (partes.length === 3) {
      let p1 = parseInt(partes[0], 10);
      let p2 = parseInt(partes[1], 10);
      let p3 = parseInt(partes[2], 10);

      let dia, mes, anio;

      if (p1 > 1000) {
        anio = p1;
        if (p2 > 12 && p3 <= 12) {
          mes = p3;
          dia = p2;
        } else {
          mes = p2;
          dia = p3;
        }
      } else {
        anio = partes[2].length === 2 ? 2000 + p3 : p3;
        if (p2 > 12 && p1 <= 12) {
          mes = p1;
          dia = p2;
        } else {
          dia = p1;
          mes = p2;
        }
      }

      const d = String(dia).padStart(2, "0");
      const m = String(mes).padStart(2, "0");
      return `${anio}-${m}-${d}`;
    }

    const fallBackDate = new Date(valor);
    if (!isNaN(fallBackDate.getTime())) {
      return fallBackDate.toISOString().split("T")[0];
    }
    return null;
  } catch {
    return null;
  }
}

function mapearEstadoPago(est) {
  const e = String(est || "pendiente").toLowerCase().trim();
  if (e.includes("dañ") || e.includes("dan")) return "en_dano";
  if (e.includes("garantía") || e.includes("garantia")) return "garantia";
  if (e.includes("suspendid")) return "suspendido";
  return e;
}

app.post("/api/clientes/importar", async (req, res) => {
  try {
    const { clientes, usuario } = req.body;

    if (!Array.isArray(clientes) || clientes.length === 0) {
      return res.status(400).json({
        error: "Se requiere un array de clientes para importar",
      });
    }

    const clientesInsertados = [];
    const errores = [];

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (let i = 0; i < clientes.length; i++) {
        const cliente = clientes[i];

        await client.query(`SAVEPOINT cliente_${i}`);
        try {
          // ðŸ” Verificar duplicado
          const existente = await client.query(
            "SELECT id FROM clientes WHERE kit = $1",
            [cliente.kit]
          );

          let clienteId;

          if (existente.rows.length > 0) {
            clienteId = existente.rows[0].id;

            // Hacer UPDATE del cliente manteniendo base si vienen nulos
            await client.query(
              `UPDATE clientes SET
                nombre_cliente = COALESCE($2, nombre_cliente),
                cuenta_starlink = COALESCE($3, cuenta_starlink),
                coordenadas = COALESCE($4, coordenadas),
                email = COALESCE($5, email),
                contrasena = COALESCE($6, contrasena),
                observacion = COALESCE($7, observacion),
                cuenta = COALESCE($8, cuenta),
                costo_plan = COALESCE($9, costo_plan),
                corte = COALESCE($10, corte),
                valor_factura = COALESCE($11, valor_factura),
                valor_soporte = COALESCE($12, valor_soporte),
                tipo_soporte = COALESCE($13, tipo_soporte),
                corte_facturacion = COALESCE($14, corte_facturacion),
                estado_pago = $15
              WHERE id = $1`,
              [
                clienteId,
                cliente.nombre_cliente,
                cliente.cuenta_starlink,
                cliente.coordenadas || null,
                cliente.email || null,
                cliente.contrasena || null,
                cliente.observacion || null,
                cliente.cuenta || null,
                limpiarNumero(cliente.costo_plan),
                cliente.corte ? Number(cliente.corte) : null,
                limpiarNumero(cliente.valor_factura),
                limpiarNumero(cliente.valor_soporte),
                cliente.tipo_soporte || null,
                cliente.corte_facturacion || cliente.corte || null,
                mapearEstadoPago(cliente.estado_pago)
              ]
            );

            const resultActualizado = await client.query("SELECT * FROM clientes WHERE id = $1", [clienteId]);
            clientesInsertados.push(resultActualizado.rows[0]);
          } else {
            // ðŸ§  Insertar cliente (NUEVO)
            const resultado = await client.query(
              `INSERT INTO clientes 
              (kit, nombre_cliente, cuenta_starlink, coordenadas, email, contrasena,
               observacion, cuenta, costo_plan, corte, valor_factura, valor_soporte,
               tipo_soporte, corte_facturacion, fecha_activacion, estado_pago, creado_por, activo, sede)
              VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,true,$18)
              RETURNING *`,
              [
                cliente.kit,
                cliente.nombre_cliente,
                cliente.cuenta_starlink,
                cliente.coordenadas || null,
                cliente.email || null,
                cliente.contrasena || null,
                cliente.observacion || null,
                cliente.cuenta || null,
                limpiarNumero(cliente.costo_plan),
                cliente.corte ? Number(cliente.corte) : null,
                limpiarNumero(cliente.valor_factura),
                limpiarNumero(cliente.valor_soporte),
                cliente.tipo_soporte || null,
                cliente.corte_facturacion || cliente.corte || null,
                limpiarFecha(cliente.fecha_activacion) || new Date().toISOString().split("T")[0],
                mapearEstadoPago(cliente.estado_pago),
                usuario || "importacion",
                cliente.sede || req.body.sede || "principal"
              ],
            );

            const clienteInsertado = resultado.rows[0];
            clientesInsertados.push(clienteInsertado);
            clienteId = clienteInsertado.id;
          }

          // ========================================
          // ðŸ“„ INSERTAR FACTURAS (ROBUSTO)
          // ========================================
          if (Array.isArray(cliente.facturas)) {
            for (const factura of cliente.facturas) {
              if (!factura?.numero) continue;

              const savepointF = `factura_${i}_${Math.random().toString(36).substring(7)}`;
              let estadoFinal = "pendiente";
              let fechaFinal = new Date().toISOString().split("T")[0];

              try {
                console.log("ðŸ“„ Procesando factura:", factura);

                // ðŸ”¥ NORMALIZAR ESTADO
                const estadoRaw = (factura.estadoPago || "")
                  .toString()
                  .toLowerCase()
                  .trim();

                if (estadoRaw === "pagado") {
                  estadoFinal = "pagado";
                } else if (estadoRaw === "roc") {
                  estadoFinal = "roc";
                } else if (estadoRaw === "ppc") {
                  estadoFinal = "ppc";
                }

                // ðŸ”¥ FECHA SEGURA
                fechaFinal =
                  limpiarFecha(factura.fecha) || fechaFinal;

                await client.query(`SAVEPOINT ${savepointF}`);

                const invExist = await client.query(
                  "SELECT id FROM facturas WHERE cliente_id = $1 AND periodo IS NOT DISTINCT FROM $2 AND anio IS NOT DISTINCT FROM $3",
                  [clienteId, factura.periodo || null, factura.anio || new Date().getFullYear()]
                );

                if (invExist.rows.length > 0) {
                  await client.query(
                    `UPDATE facturas SET 
                      numero = COALESCE($1, numero), 
                      fecha = COALESCE($2, fecha), 
                      estado_pago = $3 
                     WHERE id = $4`,
                    [
                      factura.numero,
                      fechaFinal,
                      estadoFinal,
                      invExist.rows[0].id
                    ]
                  );
                } else {
                  await client.query(
                    `INSERT INTO facturas
     (cliente_id, numero, periodo, anio, fecha, estado_pago)
     VALUES ($1,$2,$3,$4,$5,$6)`,
                    [
                      clienteId,
                      factura.numero,
                      factura.periodo || null,
                      factura.anio || new Date().getFullYear(),
                      fechaFinal,
                      estadoFinal,
                    ],
                  );
                }

                if (estadoFinal === "roc" || estadoFinal === "ppc") {
                  await client.query("UPDATE clientes SET estado_facturacion = $1 WHERE id = $2", [estadoFinal.toUpperCase(), clienteId]);
                }

                await client.query(`RELEASE SAVEPOINT ${savepointF}`);
                console.log(`âœ… Factura ${factura.numero} â†’ ${estadoFinal}`);
              } catch (errFactura) {
                await client.query(`ROLLBACK TO SAVEPOINT ${savepointF}`);

                if (errFactura.code === '23505') {
                  const savepointRetry = `retry_${i}_${Math.random().toString(36).substring(7)}`;
                  await client.query(`SAVEPOINT ${savepointRetry}`);
                  try {
                    await client.query(
                      `UPDATE facturas SET 
                        numero = $1, fecha = $2, estado_pago = $3
                       WHERE cliente_id = $4 AND periodo IS NOT DISTINCT FROM $5 AND anio IS NOT DISTINCT FROM $6`,
                      [factura.numero, fechaFinal, estadoFinal, clienteId, factura.periodo, factura.anio || new Date().getFullYear()]
                    );

                    if (estadoFinal === "roc" || estadoFinal === "ppc") {
                      await client.query("UPDATE clientes SET estado_facturacion = $1 WHERE id = $2", [estadoFinal.toUpperCase(), clienteId]);
                    }

                    await client.query(`RELEASE SAVEPOINT ${savepointRetry}`);
                    console.log(`âœ… Factura ${factura.numero} re-sobreescrita por periodo â†’ ${estadoFinal}`);
                  } catch (retryErr) {
                    await client.query(`ROLLBACK TO SAVEPOINT ${savepointRetry}`);
                    errores.push({
                      tipo: "factura",
                      fila: i + 1,
                      kit: cliente.kit,
                      factura: factura?.numero || null,
                      mensaje: retryErr.message,
                      detalle: retryErr.detail,
                      codigo: retryErr.code,
                    });
                  }
                } else {
                  console.error("âŒ Error insertando factura:", errFactura);
                  errores.push({
                    tipo: "factura",
                    fila: i + 1,
                    kit: cliente.kit,
                    factura: factura?.numero || null,
                    mensaje: errFactura.message,
                    detalle: errFactura.detail,
                    codigo: errFactura.code,
                  });
                }
              }
            }
          }

          await client.query(`RELEASE SAVEPOINT cliente_${i}`);
        } catch (error) {
          await client.query(`ROLLBACK TO SAVEPOINT cliente_${i}`);
          console.error("âŒ Error cliente:", error);

          errores.push({
            tipo: "cliente",
            fila: i + 1,
            kit: cliente.kit,
            mensaje: error.message,
            detalle: error.detail,
            codigo: error.code,
          });
        }
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        clientesInsertados: clientesInsertados.length,
        errores,
        clientes: clientesInsertados,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("âŒ ROLLBACK:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("âŒ Error en importaciÃ³n masiva:", err);

    res.status(500).json({
      error: "Error procesando la importaciÃ³n",
      detalle: err.message,
    });
  }
});

app.delete("/api/clientes/:kit", async (req, res) => {
  const client = await pool.connect();

  try {
    const { kit } = req.params;

    await client.query("BEGIN");

    // 1. Obtener ID del cliente
    const clienteRes = await client.query(
      "SELECT id FROM clientes WHERE kit = $1",
      [kit],
    );

    if (clienteRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    const clienteId = clienteRes.rows[0].id;

    // 2. Eliminar facturas primero (IMPORTANTE)
    await client.query("DELETE FROM facturas WHERE cliente_id = $1", [
      clienteId,
    ]);

    // 3. Eliminar cliente
    await client.query("DELETE FROM clientes WHERE id = $1", [clienteId]);

    await client.query("COMMIT");

    res.json({
      message: "Cliente eliminado completamente ðŸ’£",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error eliminando cliente:", error);
    res.status(500).json({
      error: "Error eliminando cliente",
    });
  } finally {
    client.release();
  }
});

app.put("/api/clientes/:kit", async (req, res) => {
  try {
    const { kit } = req.params;
    const campos = req.body;

    const keys = Object.keys(campos);

    if (keys.length === 0) {
      return res.status(400).json({
        error: "No se enviaron campos para actualizar",
      });
    }

    const setClause = keys
      .map((campo, index) => `${campo} = $${index + 1}`)
      .join(", ");

    const values = Object.values(campos);

    const query = `
      UPDATE clientes
      SET ${setClause}
      WHERE kit = $${keys.length + 1}
      RETURNING *
    `;

    const result = await pool.query(query, [...values, kit]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error actualizando cliente:", err);

    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

// ========================================


// RUTAS - CLIENTES FUSAGASUGA
// ========================================

// Obtener todos los clientes
app.get("/api/clientes_fusagasuga", async (req, res) => {
  try {
    // ðŸ”¹ 1. Params
    let { page = 1, limit = 10, search = "", estado = "", corte = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const offset = (page - 1) * limit;

    // ðŸ”¹ 2. Construir WHERE dinÃ¡mico
    let where = ["c.activo = true"];
    let values = [];
    let idx = 1;

    // ðŸ” SEARCH (nombre, cuenta, email, cuenta_starlink, kit)
    if (search) {
      where.push(`(
        c.nombre_cliente ILIKE $${idx} OR 
        c.cuenta ILIKE $${idx} OR 
        c.cuenta_starlink ILIKE $${idx} OR 
        c.kit ILIKE $${idx} OR 
        c.email ILIKE $${idx}
      )`);
      values.push(`%${search}%`);
      idx++;
    }

    // ðŸ§¾ ESTADO FACTURACIÃ“N (PPC)
    let { sede, estado_facturacion, exclude_ppc } = req.query;
    if (sede && sede !== "todos") {
      where.push(`COALESCE(c.sede, 'principal') = $${idx}`);
      values.push(sede);
      idx++;
    }

    if (estado_facturacion) {
      if (estado_facturacion === 'PPC') {
        where.push(`(c.estado_facturacion = $${idx} OR c.estado_pago = 'ppc')`);
      } else {
        where.push(`c.estado_facturacion = $${idx}`);
      }
      values.push(estado_facturacion);
      idx++;
    } else if (exclude_ppc === "true") {
      // Por solicitud, no se excluye ningÃºn estado por ahora en la vista principal
      // where.push(`(c.estado_facturacion IS NULL OR c.estado_facturacion != 'PPC')`);
      // where.push(`(c.estado_pago IS NULL OR c.estado_pago NOT IN ('ppc', 'roc'))`);
    }

    // ðŸ“Š ESTADO
    if (estado && estado !== "todos") {
      if (estado === "mora") {
        where.push(`(
          c.estado_pago NOT IN ('suspendido', 'en_dano', 'ppc', 'roc', 'garantia') AND 
          (SELECT COUNT(*) FROM facturas_fusagasuga WHERE cliente_id = c.id AND (estado_pago = 'pendiente' OR estado_pago = 'vencido')) >= 2
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
            (SELECT COUNT(*) FROM facturas_fusagasuga WHERE cliente_id = c.id AND (estado_pago = 'pendiente' OR estado_pago = 'vencido')) = 1
            OR 
            (SELECT COUNT(*) FROM facturas_fusagasuga WHERE cliente_id = c.id) = 0
          )
        )`);
      } else if (estado === "confirmado") {
        where.push(`(
          c.estado_pago NOT IN ('suspendido', 'en_dano', 'ppc', 'roc', 'garantia') AND
          (SELECT COUNT(*) FROM facturas_fusagasuga WHERE cliente_id = c.id AND (estado_pago = 'pendiente' OR estado_pago = 'vencido')) = 0 AND
          (SELECT COUNT(*) FROM facturas_fusagasuga WHERE cliente_id = c.id) > 0
        )`);
      } else if (estado === "sin_factura") {
        // No additional condition needed, handled separately below
      } else {
        where.push(`c.estado_pago = $${idx}`);
        values.push(estado);
        idx++;
      }
    }

    // CORTE
    if (corte && corte !== "todos") {
      if (corte === "1-10") {
        where.push(`c.corte BETWEEN 1 AND 10`);
      } else if (corte === "11-20") {
        where.push(`c.corte BETWEEN 11 AND 20`);
      } else if (corte === "21-31") {
        where.push(`c.corte BETWEEN 21 AND 31`);
      }
    }

    // SIN FACTURAS
    if (estado === "sin_factura") {
      where.push(`(
        NOT EXISTS (SELECT 1 FROM facturas_fusagasuga WHERE cliente_id = c.id)
      )`);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // 3. QUERY PRINCIPAL
    const result = await pool.query(
      `
      SELECT
        c.*,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', f.id,
                'numero', f.numero,
                'fecha', f.fecha,
                'estadoPago', f.estado_pago,
                'periodo', f.periodo
              ) ORDER BY f.fecha DESC
            )
            FROM facturas_fusagasuga f
            WHERE f.cliente_id = c.id
          ),
          '[]'
        ) as facturas
      FROM fusagasuga c
      ${whereClause}
      ORDER BY c.corte ASC NULLS LAST, c.id DESC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...values, limit, offset]
    );

    // ðŸ”¹ 4. TOTAL (MISMO WHERE ðŸ‘ˆ importante)
    const totalResult = await pool.query(
      `
      SELECT COUNT(*) 
      FROM fusagasuga c
      ${whereClause}
      `,
      values
    );

    const total = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // ðŸ”¹ 5. RESPONSE
    res.json({
      data: result.rows,
      total,
      page,
      totalPages,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo clientes" });
  }
});

// Obtener estadÃ­sticas de clientes (Para Tarjetas / Cards)
app.get("/api/clientes_fusagasuga/estadisticas", async (req, res) => {
  try {
    // Total Activos -> no suspendidos, no daÃ±o, no ppc (y activos=true)
    const totalResult = await pool.query(`
      SELECT COUNT(*) FROM fusagasuga 
      WHERE activo = true 
        AND (estado_pago IS NULL OR estado_pago NOT IN ('en_dano', 'garantia'))
    `);

    // PPC
    const ppcResult = await pool.query(`
      SELECT COUNT(*) FROM fusagasuga 
      WHERE activo = true AND (estado_facturacion = 'PPC' OR estado_pago = 'ppc')
    `);

    // DaÃ±adas
    const danadasResult = await pool.query(`SELECT COUNT(*) FROM fusagasuga WHERE activo = true AND estado_pago = 'en_dano'`);

    // Suspendidos
    const suspResult = await pool.query(`SELECT COUNT(*) FROM fusagasuga WHERE activo = true AND estado_pago = 'suspendido'`);

    // GarantÃ­as
    const garantiasResult = await pool.query(`SELECT COUNT(*) FROM fusagasuga WHERE activo = true AND estado_pago = 'garantia'`);

    res.json({
      total: parseInt(totalResult.rows[0].count),
      ppc: parseInt(ppcResult.rows[0].count),
      danadas: parseInt(danadasResult.rows[0].count),
      suspendidas: parseInt(suspResult.rows[0].count),
      garantias: parseInt(garantiasResult.rows[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo estadÃ­sticas" });
  }
});


app.get("/api/clientes_fusagasuga/:kit", async (req, res) => {
  try {
    const { kit } = req.params;

    const result = await pool.query(`SELECT * FROM fusagasuga WHERE kit = $1`, [
      kit,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error obteniendo cliente",
    });
  }
});

// Crear cliente
app.post("/api/clientes_fusagasuga", async (req, res) => {
  try {
    const {
      kit,
      nombrecliente,
      cuentastarlink,
      coordenadas,
      corte,
      email,
      contrasena,
      observacion,
      cuenta,
      costoplan,
      valorFactura,
      valorSoporte,
      tipoSoporte,
      corteFacturacion,
      fechaActivacion,
      estadoPago,
      observaciones,
      creadoPor,
      activo,
    } = req.body;

    // ValidaciÃ³n bÃ¡sica
    if (!nombrecliente || nombrecliente.trim() === "") {
      return res
        .status(400)
        .json({ error: "El nombre del cliente es obligatorio" });
    }

    // Generar KIT automÃ¡tico si no viene
    const kitFinal = kit && kit.trim() !== "" ? kit : `KIT-${Date.now()}`;

    const values = [
      kitFinal,
      nombrecliente,
      cuentastarlink || "",
      coordenadas || "",
      corte || null,
      email || "",
      contrasena || "",
      observacion || "",
      cuenta || "",
      costoplan ? parseFloat(costoplan) : null,
      valorFactura ? parseFloat(valorFactura) : null,
      valorSoporte ? parseFloat(valorSoporte) : null,
      tipoSoporte || "",
      corteFacturacion || null,
      fechaActivacion || null,
      estadoPago || "pendiente",
      observaciones || "",
      creadoPor || "sistema",
      activo !== undefined ? activo : true
    ];

    const query = `
      INSERT INTO fusagasuga (
        kit, nombre_cliente, cuenta_starlink, coordenadas, corte, email, contrasena,
        observacion, cuenta, costo_plan, valor_factura, valor_soporte, tipo_soporte,
        corte_facturacion, fecha_activacion, estado_pago, observaciones, creado_por, activo
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19
      )
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Manejo de KIT duplicado
    if (err.code === "23505") {
      return res.status(400).json({
        error: "El KIT ya existe",
      });
    }

    console.error(err);

    res.status(500).json({
      error: "Error creando cliente",
    });
  }
});

// ImportaciÃ³n masiva de clientes

function limpiarNumero(valor) {
  if (!valor) return null;

  return Number(valor.toString().replace(/\$/g, "").replace(/,/g, "").trim());
}

function limpiarFecha(valor) {
  if (!valor) return null;

  try {
    let strVal = String(valor).trim();

    // Si viene en formato ISO o incluye 'T'
    if (strVal.includes("T")) {
      strVal = strVal.split("T")[0]; // Nos quedamos con 'YYYY-MM-DD'
    }

    const unificado = strVal.replace(/[-.]/g, "/");
    const partes = unificado.split("/");

    if (partes.length === 3) {
      let p1 = parseInt(partes[0], 10);
      let p2 = parseInt(partes[1], 10);
      let p3 = parseInt(partes[2], 10);

      let dia, mes, anio;

      if (p1 > 1000) {
        anio = p1;
        if (p2 > 12 && p3 <= 12) {
          mes = p3;
          dia = p2;
        } else {
          mes = p2;
          dia = p3;
        }
      } else {
        anio = partes[2].length === 2 ? 2000 + p3 : p3;
        if (p2 > 12 && p1 <= 12) {
          mes = p1;
          dia = p2;
        } else {
          dia = p1;
          mes = p2;
        }
      }

      const d = String(dia).padStart(2, "0");
      const m = String(mes).padStart(2, "0");
      return `${anio}-${m}-${d}`;
    }

    const fallBackDate = new Date(valor);
    if (!isNaN(fallBackDate.getTime())) {
      return fallBackDate.toISOString().split("T")[0];
    }
    return null;
  } catch {
    return null;
  }
}

app.post("/api/clientes_fusagasuga/importar", async (req, res) => {
  try {
    const { clientes, usuario } = req.body;

    if (!Array.isArray(clientes) || clientes.length === 0) {
      return res.status(400).json({
        error: "Se requiere un array de clientes para importar",
      });
    }

    const clientesInsertados = [];
    const errores = [];

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (let i = 0; i < clientes.length; i++) {
        const cliente = clientes[i];

        await client.query(`SAVEPOINT cliente_${i}`);
        try {
          // ðŸ” Verificar duplicado
          const existente = await client.query(
            "SELECT id FROM fusagasuga WHERE kit = $1",
            [cliente.kit]
          );

          let clienteId;

          if (existente.rows.length > 0) {
            clienteId = existente.rows[0].id;

            // Hacer UPDATE del cliente manteniendo base si vienen nulos
            await client.query(
              `UPDATE fusagasuga SET
                nombre_cliente = COALESCE($2, nombre_cliente),
                cuenta_starlink = COALESCE($3, cuenta_starlink),
                coordenadas = COALESCE($4, coordenadas),
                email = COALESCE($5, email),
                contrasena = COALESCE($6, contrasena),
                observacion = COALESCE($7, observacion),
                cuenta = COALESCE($8, cuenta),
                costo_plan = COALESCE($9, costo_plan),
                corte = COALESCE($10, corte),
                valor_factura = COALESCE($11, valor_factura),
                valor_soporte = COALESCE($12, valor_soporte),
                tipo_soporte = COALESCE($13, tipo_soporte),
                corte_facturacion = COALESCE($14, corte_facturacion),
                estado_pago = $15
              WHERE id = $1`,
              [
                clienteId,
                cliente.nombre_cliente ? cliente.nombre_cliente.toUpperCase() : null,
                cliente.cuenta_starlink,
                cliente.coordenadas || null,
                cliente.email || null,
                cliente.contrasena || null,
                cliente.observacion || null,
                cliente.cuenta || null,
                limpiarNumero(cliente.costo_plan),
                cliente.corte ? Number(cliente.corte) : null,
                limpiarNumero(cliente.valor_factura),
                limpiarNumero(cliente.valor_soporte),
                cliente.tipo_soporte || null,
                cliente.corte_facturacion || cliente.corte || null,
                mapearEstadoPago(cliente.estado_pago)
              ]
            );

            const resultActualizado = await client.query("SELECT * FROM fusagasuga WHERE id = $1", [clienteId]);
            clientesInsertados.push(resultActualizado.rows[0]);
          } else {
            // ðŸ§  Insertar cliente (NUEVO)
            const resultado = await client.query(
              `INSERT INTO fusagasuga 
              (kit, nombre_cliente, cuenta_starlink, coordenadas, email, contrasena,
               observacion, cuenta, costo_plan, corte, valor_factura, valor_soporte,
               tipo_soporte, corte_facturacion, fecha_activacion, estado_pago, creado_por, activo, sede)
              VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,true,$18)
              RETURNING *`,
              [
                cliente.kit,
                cliente.nombre_cliente ? cliente.nombre_cliente.toUpperCase() : null,
                cliente.cuenta_starlink,
                cliente.coordenadas || null,
                cliente.email || null,
                cliente.contrasena || null,
                cliente.observacion || null,
                cliente.cuenta || null,
                limpiarNumero(cliente.costo_plan),
                cliente.corte ? Number(cliente.corte) : null,
                limpiarNumero(cliente.valor_factura),
                limpiarNumero(cliente.valor_soporte),
                cliente.tipo_soporte || null,
                cliente.corte_facturacion || cliente.corte || null,
                limpiarFecha(cliente.fecha_activacion) || new Date().toISOString().split("T")[0],
                mapearEstadoPago(cliente.estado_pago),
                usuario || "importacion",
                cliente.sede || req.body.sede || "principal"
              ],
            );

            const clienteInsertado = resultado.rows[0];
            clientesInsertados.push(clienteInsertado);
            clienteId = clienteInsertado.id;
          }

          // ========================================
          // ðŸ“„ INSERTAR FACTURAS (ROBUSTO)
          // ========================================
          if (Array.isArray(cliente.facturas)) {
            for (const factura of cliente.facturas) {
              if (!factura?.numero) continue;

              const savepointF = `factura_${i}_${Math.random().toString(36).substring(7)}`;
              let estadoFinal = "pendiente";
              let fechaFinal = new Date().toISOString().split("T")[0];

              try {
                console.log("ðŸ“„ Procesando factura:", factura);

                // ðŸ”¥ NORMALIZAR ESTADO
                const estadoRaw = (factura.estadoPago || "")
                  .toString()
                  .toLowerCase()
                  .trim();

                if (estadoRaw === "pagado") {
                  estadoFinal = "pagado";
                } else if (estadoRaw === "roc") {
                  estadoFinal = "roc";
                } else if (estadoRaw === "ppc") {
                  estadoFinal = "ppc";
                }

                // ðŸ”¥ FECHA SEGURA
                fechaFinal =
                  limpiarFecha(factura.fecha) || fechaFinal;

                await client.query(`SAVEPOINT ${savepointF}`);

                const invExist = await client.query(
                  "SELECT id FROM facturas_fusagasuga WHERE cliente_id = $1 AND numero = $2",
                  [clienteId, factura.numero]
                );

                if (invExist.rows.length > 0) {
                  await client.query(
                    `UPDATE facturas_fusagasuga SET 
                      periodo = COALESCE($1, periodo), 
                      anio = COALESCE($2, anio), 
                      fecha = COALESCE($3, fecha), 
                      estado_pago = $4 
                     WHERE id = $5`,
                    [
                      factura.periodo || null,
                      factura.anio || new Date().getFullYear(),
                      fechaFinal,
                      estadoFinal,
                      invExist.rows[0].id
                    ]
                  );
                } else {
                  await client.query(
                    `INSERT INTO facturas_fusagasuga
     (cliente_id, numero, periodo, anio, fecha, estado_pago)
     VALUES ($1,$2,$3,$4,$5,$6)`,
                    [
                      clienteId,
                      factura.numero,
                      factura.periodo || null,
                      factura.anio || new Date().getFullYear(),
                      fechaFinal,
                      estadoFinal,
                    ],
                  );
                }

                if (estadoFinal === "roc" || estadoFinal === "ppc") {
                  await client.query("UPDATE fusagasuga SET estado_facturacion = $1 WHERE id = $2", [estadoFinal.toUpperCase(), clienteId]);
                }

                await client.query(`RELEASE SAVEPOINT ${savepointF}`);
                console.log(`âœ… Factura ${factura.numero} â†’ ${estadoFinal}`);
              } catch (errFactura) {
                await client.query(`ROLLBACK TO SAVEPOINT ${savepointF}`);

                if (errFactura.code === '23505') {
                  const savepointRetry = `retry_${i}_${Math.random().toString(36).substring(7)}`;
                  await client.query(`SAVEPOINT ${savepointRetry}`);
                  try {
                    await client.query(
                      `UPDATE facturas_fusagasuga SET 
                        numero = $1, fecha = $2, estado_pago = $3
                       WHERE cliente_id = $4 AND periodo = $5 AND anio = $6`,
                      [factura.numero, fechaFinal, estadoFinal, clienteId, factura.periodo, factura.anio || new Date().getFullYear()]
                    );

                    if (estadoFinal === "roc" || estadoFinal === "ppc") {
                      await client.query("UPDATE fusagasuga SET estado_facturacion = $1 WHERE id = $2", [estadoFinal.toUpperCase(), clienteId]);
                    }

                    await client.query(`RELEASE SAVEPOINT ${savepointRetry}`);
                    console.log(`âœ… Factura ${factura.numero} re-sobreescrita por periodo â†’ ${estadoFinal}`);
                  } catch (retryErr) {
                    await client.query(`ROLLBACK TO SAVEPOINT ${savepointRetry}`);
                    errores.push({
                      tipo: "factura",
                      fila: i + 1,
                      kit: cliente.kit,
                      factura: factura?.numero || null,
                      mensaje: retryErr.message,
                      detalle: retryErr.detail,
                      codigo: retryErr.code,
                    });
                  }
                } else {
                  console.error("âŒ Error insertando factura:", errFactura);
                  errores.push({
                    tipo: "factura",
                    fila: i + 1,
                    kit: cliente.kit,
                    factura: factura?.numero || null,
                    mensaje: errFactura.message,
                    detalle: errFactura.detail,
                    codigo: errFactura.code,
                  });
                }
              }
            }
          }

          await client.query(`RELEASE SAVEPOINT cliente_${i}`);
        } catch (error) {
          await client.query(`ROLLBACK TO SAVEPOINT cliente_${i}`);
          console.error("âŒ Error cliente:", error);

          errores.push({
            tipo: "cliente",
            fila: i + 1,
            kit: cliente.kit,
            mensaje: error.message,
            detalle: error.detail,
            codigo: error.code,
          });
        }
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        clientesInsertados: clientesInsertados.length,
        errores,
        clientes: clientesInsertados,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("âŒ ROLLBACK:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("âŒ Error en importaciÃ³n masiva:", err);

    res.status(500).json({
      error: "Error procesando la importaciÃ³n",
      detalle: err.message,
    });
  }
});

app.delete("/api/clientes_fusagasuga/:kit", async (req, res) => {
  const client = await pool.connect();

  try {
    const { kit } = req.params;

    await client.query("BEGIN");

    // 1. Obtener ID del cliente
    const clienteRes = await client.query(
      "SELECT id FROM fusagasuga WHERE kit = $1",
      [kit],
    );

    if (clienteRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    const clienteId = clienteRes.rows[0].id;

    // 2. Eliminar facturas primero (IMPORTANTE)
    await client.query("DELETE FROM facturas_fusagasuga WHERE cliente_id = $1", [
      clienteId,
    ]);

    // 3. Eliminar cliente
    await client.query("DELETE FROM fusagasuga WHERE id = $1", [clienteId]);

    await client.query("COMMIT");

    res.json({
      message: "Cliente eliminado completamente ðŸ’£",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error eliminando cliente:", error);
    res.status(500).json({
      error: "Error eliminando cliente",
    });
  } finally {
    client.release();
  }
});

app.put("/api/clientes_fusagasuga/:kit", async (req, res) => {
  try {
    const { kit } = req.params;
    const campos = req.body;

    const keys = Object.keys(campos);

    if (keys.length === 0) {
      return res.status(400).json({
        error: "No se enviaron campos para actualizar",
      });
    }

    const setClause = keys
      .map((campo, index) => `${campo} = $${index + 1}`)
      .join(", ");

    const values = Object.values(campos);

    const query = `
      UPDATE fusagasuga
      SET ${setClause}
      WHERE kit = $${keys.length + 1}
      RETURNING *
    `;

    const result = await pool.query(query, [...values, kit]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error actualizando cliente:", err);

    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

app.put("/api/clientes_fusagasuga/:kit/estado", async (req, res) => {
  try {
    const { kit } = req.params;
    const estado_pago = req.body.estado_pago || req.body.estadoPago;

    const result = await pool.query(
      `UPDATE fusagasuga
       SET estado_pago = $1
       WHERE kit = $2
       RETURNING *`,
      [estado_pago, kit]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ message: "Estado actualizado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando estado" });
  }
});

// ========================================
// RUTAS - FACTURAS
// ========================================

// Obtener todas las facturas
app.get("/api/facturas", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, c.nombre as cliente_nombre 
       FROM facturas f 
       LEFT JOIN clientes c ON f.cliente_id = c.id 
       ORDER BY f.id DESC`,
    );
    res.json({ facturas: result.rows });
  } catch (err) {
    console.error("Error obteniendo facturas:", err);
    res.status(500).json({ error: "Error obteniendo facturas" });
  }
});

app.put("/api/clientes/:kit/estado", async (req, res) => {
  try {
    const { kit } = req.params;
    const estado_pago = req.body.estado_pago || req.body.estadoPago;

    const result = await pool.query(
      `UPDATE clientes
       SET estado_pago = $1
       WHERE kit = $2
       RETURNING *`,
      [estado_pago, kit],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ message: "Estado actualizado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando estado" });
  }
});

// ========================================
// ESTADO DE FACTURACIÃ“N (ROC / PPC)
// ========================================
app.put("/api/clientes/:kit/facturacion", async (req, res) => {
  try {
    const { kit } = req.params;
    const { estado_facturacion } = req.body;

    const result = await pool.query(
      `UPDATE clientes
       SET estado_facturacion = $1
       WHERE kit = $2
       RETURNING *`,
      [estado_facturacion, kit],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Cliente no encontrado",
      });
    }

    res.json({
      message: "Estado de facturaciÃ³n actualizado",
      cliente: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando facturaciÃ³n:", error);

    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

// Crear factura para un cliente especÃ­fico por KIT
app.post("/api/clientes/:kit/facturas", async (req, res) => {
  const client = await pool.connect();

  try {
    const { kit } = req.params;
    // El frontend envÃ­a camelCase (estadoPago), mapeamos a snake_case para DB
    const { numero, fecha, estadoPago, periodo } = req.body;

    await client.query("BEGIN");

    // 1. Obtener ID del cliente por KIT
    const clienteRes = await client.query(
      "SELECT id FROM clientes WHERE kit = $1",
      [kit],
    );

    if (clienteRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const clienteId = clienteRes.rows[0].id;

    // Validar y formatear fechas
    const fechaFactura = fecha ? new Date(fecha) : new Date();
    // Asegurar que fechaPago sea null si no viene o si el estado no es pagado

    // 2. Verificar duplicados
    const existe = await client.query(
      `SELECT id FROM facturas WHERE cliente_id=$1 AND numero=$2`,
      [clienteId, numero],
    );

    if (existe.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Ya existe una factura con este nÃºmero para este cliente",
      });
    }

    // 3. Insertar factura
    const result = await client.query(
      `INSERT INTO facturas 
       (cliente_id, numero, fecha, estado_pago, periodo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        clienteId,
        numero,
        fechaFactura,
        estadoPago || "pendiente",
        periodo || null,
      ],
    );

    const factura = result.rows[0];

    // 4. Actualizar estado de facturaciÃ³n si es mes actual
    const mismoMesResult = await client.query(
      `SELECT DATE_TRUNC('month', $1::timestamp) = DATE_TRUNC('month', CURRENT_DATE) AS mismo_mes`,
      [fechaFactura],
    );

    let estadoFacturacion = null;
    if (mismoMesResult.rows[0].mismo_mes) {
      const update = await client.query(
        `UPDATE clientes SET estado_facturacion = 'facturado' WHERE id = $1 RETURNING estado_facturacion`,
        [clienteId],
      );
      if (update.rows.length > 0)
        estadoFacturacion = update.rows[0].estado_facturacion;
    }

    await client.query("COMMIT");
    res.json({ factura, estado_facturacion: estadoFacturacion });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creando factura:", err);
    res.status(500).json({ error: "Error interno creando factura" });
  } finally {
    client.release();
  }
});

// Guardar facturas
app.post("/api/facturas", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { cliente_id, numero, fecha, estado_pago, periodo } = req.body;
    const fechaFactura = fecha ? new Date(fecha) : new Date();

    const existe = await client.query(
      `SELECT id FROM facturas
       WHERE cliente_id=$1
       AND DATE_TRUNC('month',fecha)=DATE_TRUNC('month',$2)`,
      [cliente_id, fechaFactura],
    );

    if (existe.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Este cliente ya tiene factura este mes",
      });
    }

    const result = await client.query(
      `INSERT INTO facturas 
       (cliente_id, numero, fecha, estado_pago, periodo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        cliente_id,
        numero,
        fechaFactura,
        estado_pago || "pendiente",
        periodo || null,
      ],
    );

    const factura = result.rows[0];

    const mismoMesResult = await client.query(
      `SELECT DATE_TRUNC('month',$1::date) = DATE_TRUNC('month',CURRENT_DATE) AS mismo_mes`,
      [fechaFactura],
    );

    let estadoFacturacion = null;

    if (mismoMesResult.rows[0].mismo_mes) {
      let nuevoEstadoFacturacion = 'facturado';
      if (estado_pago === 'roc') nuevoEstadoFacturacion = 'ROC';
      if (estado_pago === 'ppc') nuevoEstadoFacturacion = 'PPC';

      const update = await client.query(
        `UPDATE clientes
         SET estado_facturacion = $2
         WHERE id = $1
         RETURNING estado_facturacion`,
        [cliente_id, nuevoEstadoFacturacion],
      );

      estadoFacturacion = update.rows[0].estado_facturacion;
    }

    await client.query("COMMIT");

    res.json({
      factura,
      estado_facturacion: estadoFacturacion,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error creando factura" });
  } finally {
    client.release();
  }
});

app.put("/api/clientes/:kit/observacion", async (req, res) => {
  try {
    const { kit } = req.params;
    const { observacion } = req.body;

    const result = await pool.query(
      `UPDATE clientes
       SET observaciones = $1
       WHERE kit = $2
       RETURNING *`,
      [observacion, kit],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ message: "ObservaciÃ³n actualizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando observaciÃ³n" });
  }
});

// ========================================
// RUTAS - PAGOS
// ========================================
app.put("/api/clientes/:kit/facturas/:numeroFactura", async (req, res) => {
  const client = await pool.connect();

  try {
    const { kit, numeroFactura } = req.params;
    const { numero, fecha, estadoPago, periodo } = req.body;

    console.log("BODY RECIBIDO:", req.body);

    await client.query("BEGIN");

    const clienteResult = await client.query(
      "SELECT id FROM clientes WHERE kit = $1",
      [kit],
    );

    if (clienteResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const clienteId = clienteResult.rows[0].id;

    const fechaFormateada = fecha ? new Date(fecha) : null;

    const updateResult = await client.query(
      `UPDATE facturas
       SET numero = $1,
           fecha = $2,
           estado_pago = $3,
           periodo = $4
       WHERE cliente_id = $5
       AND numero = $6
       RETURNING *`,
      [
        numero,
        fechaFormateada,
        estadoPago,
        periodo || null,
        clienteId,
        numeroFactura,
      ],
    );

    if (updateResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Factura no encontrada para actualizar",
      });
    }

    await client.query("COMMIT");

    res.json({
      message: "Factura actualizada correctamente",
      factura: updateResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("ERROR BACKEND:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    client.release();
  }
});

app.delete("/api/clientes/:kit/facturas/:numeroFactura", async (req, res) => {
  const client = await pool.connect();

  try {
    const { kit, numeroFactura } = req.params;

    await client.query("BEGIN");

    const clienteResult = await client.query(
      "SELECT id FROM clientes WHERE kit = $1",
      [kit],
    );

    if (clienteResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const clienteId = clienteResult.rows[0].id;

    const deleteResult = await client.query(
      "DELETE FROM facturas WHERE cliente_id = $1 AND numero = $2 RETURNING *",
      [clienteId, numeroFactura]
    );

    if (deleteResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Factura no encontrada para eliminar",
      });
    }

    await client.query("COMMIT");

    res.json({
      message: "Factura eliminada correctamente",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("ERROR BACKEND:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    client.release();
  }
});
app.put("/api/clientes/:kit/facturas/:numeroFactura/pago", async (req, res) => {
  const client = await pool.connect();

  try {
    const { kit, numeroFactura } = req.params;
    const { fechaPago, periodo } = req.body;

    if (!fechaPago) {
      return res.status(400).json({
        error: "fechaPago  son obligatorios",
      });
    }

    await client.query("BEGIN");

    // 1ï¸âƒ£ Buscar cliente por KIT
    const clienteResult = await client.query(
      "SELECT id FROM clientes WHERE kit = $1",
      [kit],
    );

    if (clienteResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const clienteId = clienteResult.rows[0].id;

    // 2ï¸âƒ£ Buscar factura por numero y cliente_id
    const facturaResult = await client.query(
      `SELECT * FROM facturas
       WHERE cliente_id = $1
       AND numero = $2`,
      [clienteId, numeroFactura],
    );

    if (facturaResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Factura no encontrada" });
    }

    const factura = facturaResult.rows[0];

    // 3ï¸âƒ£ Evitar doble pago
    if (factura.estado_pago === "confirmado") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "La factura ya estÃ¡ pagada",
      });
    }

    // 4ï¸âƒ£ Actualizar factura
    const updateResult = await client.query(
      `UPDATE facturas
       SET estado_pago = 'pagado',
           fecha_pago = $1,
           periodo = COALESCE($3, periodo)
       WHERE id = $4
       RETURNING *`,
      [fechaPago, periodo || null, factura.id],
    );

    await client.query("COMMIT");

    res.json({
      message: "Pago registrado correctamente",
      factura: updateResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error registrando pago:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    client.release();
  }
});

app.get("/api/pagos", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.nombre as cliente_nombre, f.numero as numero_factura
       FROM pagos p
       LEFT JOIN clientes c ON p.cliente_id = c.id
       LEFT JOIN facturas f ON p.factura_id = f.id
       ORDER BY p.fecha_pago DESC`,
    );
    res.json({ pagos: result.rows });
  } catch (err) {
    console.error("Error obteniendo pagos:", err);
    res.status(500).json({ error: "Error obteniendo pagos" });
  }
});

app.post("/api/pagos", async (req, res) => {
  const client = await pool.connect();

  try {
    const { pagos } = req.body;

    if (!Array.isArray(pagos) || pagos.length === 0) {
      return res.status(400).json({ error: "No hay pagos para registrar" });
    }

    await client.query("BEGIN");

    for (const pago of pagos) {
      if (!pago.factura_id || !pago.cliente_id) {
        throw new Error("Pago incompleto: falta factura_id o cliente_id");
      }

      // 1ï¸âƒ£ Insertar pago
      await client.query(
        `INSERT INTO pagos (
          factura_id,
          cliente_id,
          fecha_pago,
          registrado_por
        ) 
        VALUES ($1, $2, $3, $4)`,
        [
          pago.factura_id,
          pago.cliente_id,
          pago.fecha_pago,
          pago.registrado_por || "sistema",
        ],
      );

      // 2ï¸âƒ£ Actualizar factura automÃ¡ticamente
      await client.query(
        `UPDATE facturas
         SET estado_pago = 'pagado',
             fecha_pago = $1
         WHERE id = $3`,
        [pago.fecha_pago, pago.factura_id],
      );
    }

    await client.query("COMMIT");

    // 3ï¸âƒ£ Devolver pagos actualizados
    const result = await pool.query(
      `SELECT 
         p.*, 
         c.nombre as cliente_nombre, 
         f.numero as numero_factura
       FROM pagos p
       LEFT JOIN clientes c ON p.cliente_id = c.id
       LEFT JOIN facturas f ON p.factura_id = f.id
       ORDER BY p.fecha_pago DESC`,
    );

    res.json({ pagos: result.rows });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error guardando pagos:", err);
    res.status(500).json({ error: "Error guardando pagos" });
  } finally {
    client.release();
  }
});

// ========================================
// RUTAS - ALERTAS
// ========================================

// Alertas de facturaciÃ³n
app.get("/api/alertas_facturacion", async (req, res) => {
  try {
    const { sede } = req.query;
    let query = "SELECT * FROM alertas_facturacion";
    let values = [];

    if (sede) {
      query += " WHERE sede = $1";
      values = [sede];
    }

    query += " ORDER BY fecha_creacion DESC";

    const result = await pool.query(query, values);
    res.json({ alertas_facturacion: result.rows });
  } catch (err) {
    console.error("Error obteniendo alertas:", err);
    res.status(500).json({ error: "Error obteniendo alertas" });
  }
});

// Crear alerta de facturaciÃ³n
app.post("/api/alertas_facturacion/crear", async (req, res) => {
  try {
    const { kit, nombre, cuenta, email, sede = 'principal' } = req.body;

    // Intentar obtener cliente_id si existe
    let clienteId = null;
    let tableName = sede === 'fusagasuga' ? 'fusagasuga' : 'clientes';

    try {
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

    const result = await pool.query(
      `INSERT INTO alertas_facturacion (cliente_id, sede, cliente_kit, cliente_nombre, mensaje)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [clienteId, sede, kit, nombre, `Nueva empresa agregada: ${nombre} (Kit: ${kit})`]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creando alerta:", err);
    res.status(500).json({ error: "Error creando alerta" });
  }
});

app.post("/api/alertas_facturacion", async (req, res) => {
  try {
    const { alertas_facturacion } = req.body;

    // Limpiar tabla y reinsertar (o hacer merge inteligente)
    if (Array.isArray(alertas_facturacion)) {
      // Por ahora, actualizar estado de completadas
      for (const alerta of alertas_facturacion) {
        if (alerta.id) {
          await pool.query(
            "UPDATE alertas_facturacion SET completada = $1 WHERE id = $2",
            [alerta.completada, alerta.id],
          );
        }
      }
    }

    const result = await pool.query(
      "SELECT * FROM alertas_facturacion ORDER BY fecha_creacion DESC",
    );
    res.json({ alertas_facturacion: result.rows });
  } catch (err) {
    console.error("Error guardando alertas:", err);
    res.status(500).json({ error: "Error guardando alertas" });
  }
});

// Alertas de suspensión
app.get("/api/alertas_suspension", async (req, res) => {
  try {
    const { sede } = req.query;
    let query = "SELECT * FROM alertas_suspension";
    let values = [];

    if (sede) {
      query += " WHERE sede = $1";
      values = [sede];
    }

    query += " ORDER BY fecha_creacion DESC";

    const result = await pool.query(query, values);
    res.json({ alertas_suspension: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo alertas" });
  }
});

// Crear alerta de suspensión
app.post("/api/alertas_suspension/crear", async (req, res) => {
  console.log("=== DEBUG:POST /api/alertas_suspension/crear ===");
  console.log("Body:", req.body);
  try {
    const { kit, nombre, cuenta, email, motivo, facturasVencidas, sede = 'principal' } = req.body;

    console.log("Kit:", kit, "Sede:", sede);

    // Intentar obtener cliente_id si existe
    let clienteId = null;
    let tableName = sede === 'fusagasuga' ? 'fusagasuga' : 'clientes';

    try {
      const clienteResult = await pool.query(
        `SELECT id FROM ${tableName} WHERE kit = $1`,
        [kit]
      );
      console.log("Cliente result:", clienteResult.rows);
      if (clienteResult.rows.length > 0) {
        clienteId = clienteResult.rows[0].id;
      }
    } catch (e) {
      console.error("Error buscando cliente:", e);
      // Si no encuentra, continuamos con clienteId = null
    }

    const result = await pool.query(
      `INSERT INTO alertas_suspension (cliente_id, sede, cliente_kit, cliente_nombre, numero_factura, mensaje)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [clienteId, sede, kit, nombre, facturasVencidas, `Solicitud de suspensión: ${nombre} - ${motivo}`]
    );

    console.log("Alerta creada:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creando alerta de suspensión:", err);
    res.status(500).json({ error: "Error creando alerta" });
  }
});

app.delete("/api/alertas_suspension/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM alertas_suspension WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error eliminando alerta" });
  }
});

app.post("/api/alertas_suspension", async (req, res) => {
  try {
    const { alertas_suspension } = req.body;

    if (Array.isArray(alertas_suspension)) {
      for (const alerta of alertas_suspension) {
        if (alerta.id) {
          await pool.query(
            "UPDATE alertas_suspension SET vista = $1 WHERE id = $2",
            [alerta.vista, alerta.id],
          );
        }
      }
    }

    const result = await pool.query(
      "SELECT * FROM alertas_suspension ORDER BY fecha_creacion DESC",
    );
    res.json({ alertas_suspension: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Error guardando alertas" });
  }
});

// Alertas de reactivaciónón
app.get("/api/alertas_reactivacion", async (req, res) => {
  try {
    const { sede } = req.query;
    let query = "SELECT * FROM alertas_reactivacion";
    let values = [];

    if (sede) {
      query += " WHERE sede = $1";
      values = [sede];
    }

    query += " ORDER BY fecha_creacion DESC";

    const result = await pool.query(query, values);
    res.json({ alertas_reactivacion: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo alertas" });
  }
});

// Crear alerta de reactivación
app.post("/api/alertas_reactivacion/crear", async (req, res) => {
  try {
    const { kit, nombre, cuenta, email, ultimoPago, metodoPago, sede = 'principal' } = req.body;

    // Intentar obtener cliente_id si existe
    let clienteId = null;
    let tableName = sede === 'fusagasuga' ? 'fusagasuga' : 'clientes';

    try {
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

    const result = await pool.query(
      `INSERT INTO alertas_reactivacion (cliente_id, sede, cliente_kit, cliente_nombre, numero_factura, mensaje)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [clienteId, sede, kit, nombre, ultimoPago, `Solicitud de reactivación: ${nombre} - Último pago: ${ultimoPago} (${metodoPago})`]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creando alerta de reactivación:", err);
    res.status(500).json({ error: "Error creando alerta" });
  }
});

app.delete("/api/alertas_reactivacion/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM alertas_reactivacion WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error eliminando alerta" });
  }
});

app.post("/api/alertas_reactivacion", async (req, res) => {
  try {
    const { alertas_reactivacion } = req.body;

    if (Array.isArray(alertas_reactivacion)) {
      for (const alerta of alertas_reactivacion) {
        if (alerta.id) {
          await pool.query(
            "UPDATE alertas_reactivacion SET vista = $1 WHERE id = $2",
            [alerta.vista, alerta.id],
          );
        }
      }
    }

    const result = await pool.query(
      "SELECT * FROM alertas_reactivacion ORDER BY fecha_creacion DESC",
    );
    res.json({ alertas_reactivacion: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Error guardando alertas" });
  }
});

// Manejo de cierre limpio
process.on("SIGTERM", () => {
  console.log("ðŸ‘‹ Cerrando servidor...");
  pool.end(() => {
    console.log("âœ… Pool de PostgreSQL cerrado");
    process.exit(0);
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
app.listen(PORT, () => {
  console.log(`
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘   ðŸš€ SERVIDOR API SOINGTEL                  â•‘
â•‘                                              â•‘
â•‘   Puerto: ${PORT}                              â•‘
â•‘   Database: PostgreSQL Local                 â•‘
â•‘   Status: âœ… ONLINE                          â•‘
â•‘                                              â•‘
â•‘   Endpoints disponibles:                     â•‘
â•‘   - GET/POST /api/clientes                   â•‘
â•‘   - GET/POST /api/facturas                   â•‘
â•‘   - GET/POST /api/pagos                      â•‘
â•‘   - GET/POST /api/alertas_*                  â•‘
â•‘   - GET /api/health                          â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  `);
});

// Manejo de cierre limpio
process.on("SIGTERM", () => {
  console.log("ðŸ‘‹ Cerrando servidor...");
  pool.end(() => {
    console.log("âœ… Pool de PostgreSQL cerrado");
    process.exit(0);
  });
});

