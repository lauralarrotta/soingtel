const { google } = require("googleapis");
const config = require("../../config/env");

const limpiar = (valor) => (valor || "").toString().replace(/,/g, "");

async function exportarAGoogleSheets(clientes) {
  if (!config.googleSheets.privateKey) {
    throw new Error("Falta GOOGLE_PRIVATE_KEY");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: config.googleSheets.clientEmail,
      private_key: config.googleSheets.privateKey.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = config.googleSheets.spreadsheetId;

  const periodosSet = new Set();
  clientes.forEach((c) =>
    (c.facturas || []).forEach((f) => {
      if (f.periodo) periodosSet.add(f.periodo);
    })
  );
  const periodos = Array.from(periodosSet);

  const headers = [
    "KIT", "CLIENTE", "CUENTA_STARLINK", "COORDENADAS", "CORTE", "EMAIL",
    "ESTADO PAGO", "CONTRASEÑA", "OBSERVACION", "CUENTA", "COSTO PLAN",
    "VALOR FACTURA", "VALOR SOPORTE", "TIPO SOPORTE", "CORTE FACTURACION",
    "FECHA DE ACTIVACION", ...periodos,
  ];

  const rows = [headers];

  clientes.forEach((cliente) => {
    const fila = [
      limpiar(cliente.kit), limpiar(cliente.nombre_cliente),
      limpiar(cliente.cuenta_starlink), limpiar(cliente.coordenadas),
      limpiar(cliente.corte), limpiar(cliente.email),
      limpiar(cliente.estado_pago), limpiar(cliente.contrasena),
      limpiar(cliente.observacion), limpiar(cliente.cuenta),
      limpiar(cliente.costo_plan), limpiar(cliente.valor_factura),
      limpiar(cliente.valor_soporte), limpiar(cliente.tipo_soporte),
      limpiar(cliente.corte_facturacion), limpiar(cliente.fecha_activacion),
    ];

    periodos.forEach((periodo) => {
      const factura = (cliente.facturas || []).find((f) => f.periodo === periodo);
      fila.push(
        factura
          ? `${limpiar(factura.numero)} (${limpiar(cliente.estado_pago)})`
          : ""
      );
    });

    rows.push(fila);
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Hoja 1!A1",
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });
}

module.exports = { exportarAGoogleSheets };
