const request = require("supertest");
const app = require("../app");

// Helper para crear header de autenticación Basic
const authHeader = () => {
  const credentials = Buffer.from("admin:admin123").toString("base64");
  return `Basic ${credentials}`;
};

describe("Health", () => {
  test("GET /api/health debe retornar status ok", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Authorization", authHeader());
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.database).toBe("PostgreSQL");
    expect(res.body.timestamp).toBeDefined();
  });
});

describe("Clientes Routes", () => {
  let kitCreado;

  test("POST /api/clientes debe crear un cliente", async () => {
    const res = await request(app)
      .post("/api/clientes")
      .set("Authorization", authHeader())
      .send({
        nombrecliente: "Cliente Jest Test",
        Cuentastarlink: "SL-JEST",
        corte: 15,
        email: "jest@test.com",
        estadoPago: "pendiente",
      });

    expect(res.status).toBe(201);
    expect(res.body.kit).toBeDefined();
    expect(res.body.nombre_cliente).toBe("Cliente Jest Test");
    kitCreado = res.body.kit;
  });

  test("GET /api/clientes debe listar clientes", async () => {
    const res = await request(app)
      .get("/api/clientes?limit=5")
      .set("Authorization", authHeader());
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeDefined();
    expect(res.body.page).toBeDefined();
  });

  test("GET /api/clientes/estadisticas debe retornar estadísticas", async () => {
    const res = await request(app)
      .get("/api/clientes/estadisticas")
      .set("Authorization", authHeader());
    expect(res.status).toBe(200);
    expect(res.body.total).toBeDefined();
    expect(res.body.ppc).toBeDefined();
    expect(res.body.danadas).toBeDefined();
    expect(res.body.suspendidas).toBeDefined();
    expect(res.body.garantias).toBeDefined();
  });

  test("GET /api/clientes/:kit debe obtener un cliente", async () => {
    const res = await request(app)
      .get(`/api/clientes/${kitCreado}`)
      .set("Authorization", authHeader());
    expect(res.status).toBe(200);
    expect(res.body.kit).toBe(kitCreado);
  });

  test("GET /api/clientes/:kit debe retornar 404 si no existe", async () => {
    const res = await request(app)
      .get("/api/clientes/KIT-INEXISTENTE-999")
      .set("Authorization", authHeader());
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Cliente no encontrado");
  });

  test("PUT /api/clientes/:kit/estado debe actualizar estado", async () => {
    const res = await request(app)
      .put(`/api/clientes/${kitCreado}/estado`)
      .set("Authorization", authHeader())
      .send({ estado_pago: "suspendido" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Estado actualizado correctamente");
  });

  test("PUT /api/clientes/:kit debe actualizar cliente", async () => {
    const res = await request(app)
      .put(`/api/clientes/${kitCreado}`)
      .set("Authorization", authHeader())
      .send({ email: "nuevo@test.com" });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("nuevo@test.com");
  });

  test("DELETE /api/clientes/:kit debe eliminar cliente", async () => {
    const res = await request(app)
      .delete(`/api/clientes/${kitCreado}`)
      .set("Authorization", authHeader());
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Cliente eliminado completamente");
  });
});

describe("Clientes Fusagasuga Routes", () => {
  let kitCreadoFusa;

  test("POST /api/clientes_fusagasuga debe crear un cliente", async () => {
    const res = await request(app)
      .post("/api/clientes_fusagasuga")
      .set("Authorization", authHeader())
      .send({
        nombrecliente: "Cliente Fusagasuga Jest",
        Cuentastarlink: "SL-FUSA",
        corte: 10,
        email: "fusagasuga@test.com",
        estadoPago: "pendiente",
      });

    expect(res.status).toBe(201);
    expect(res.body.kit).toBeDefined();
    kitCreadoFusa = res.body.kit;
  });

  test("GET /api/clientes_fusagasuga/estadisticas debe retornar estadísticas", async () => {
    const res = await request(app)
      .get("/api/clientes_fusagasuga/estadisticas")
      .set("Authorization", authHeader());
    expect(res.status).toBe(200);
    expect(res.body.total).toBeDefined();
  });

  test("DELETE /api/clientes_fusagasuga/:kit debe eliminar cliente", async () => {
    const res = await request(app)
      .delete(`/api/clientes_fusagasuga/${kitCreadoFusa}`)
      .set("Authorization", authHeader());
    expect(res.status).toBe(200);
  });
});

describe("Facturas Routes", () => {
  let kit;
  let clienteId;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/clientes")
      .set("Authorization", authHeader())
      .send({
        nombrecliente: "Cliente para Facturas",
        Cuentastarlink: "SL-FAC",
        corte: 5,
        email: "facturas@test.com",
      });
    kit = res.body.kit;
    clienteId = res.body.id;
  });

  afterAll(async () => {
    await request(app)
      .delete(`/api/clientes/${kit}`)
      .set("Authorization", authHeader());
  });

  test("POST /api/clientes/:kit/facturas debe crear factura", async () => {
    const res = await request(app)
      .post(`/api/clientes/${kit}/facturas`)
      .set("Authorization", authHeader())
      .send({
        numero: "F-JEST-001",
        fecha: "2026-04-20",
        estadoPago: "pendiente",
        periodo: "Abril 2026",
      });

    expect(res.status).toBe(201);
    expect(res.body.factura).toBeDefined();
  });

  test("GET /api/facturas debe listar facturas", async () => {
    const res = await request(app)
      .get("/api/facturas")
      .set("Authorization", authHeader());
    expect(res.status).toBe(200);
    expect(res.body.facturas).toBeDefined();
    expect(Array.isArray(res.body.facturas)).toBe(true);
  });

  test.skip("PUT /api/clientes/:kit/facturas/:numeroFactura/pago debe registrar pago", async () => {
    const res = await request(app)
      .put(`/api/clientes/${kit}/facturas/F-JEST-001/pago`)
      .set("Authorization", authHeader())
      .send({ fechaPago: "2026-04-20" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Pago registrado correctamente");
  });

  test.skip("PUT /api/clientes/:kit/facturas/:numeroFactura/pago debe fallar si ya está pagada", async () => {
    const res = await request(app)
      .put(`/api/clientes/${kit}/facturas/F-JEST-001/pago`)
      .set("Authorization", authHeader())
      .send({ fechaPago: "2026-04-21" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("La factura ya está pagada");
  });
});

describe("Pagos Routes", () => {
  let kit;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/clientes")
      .set("Authorization", authHeader())
      .send({
        nombrecliente: "Cliente para Pagos",
        Cuentastarlink: "SL-PAGOS",
        corte: 20,
        email: "pagos@test.com",
      });
    kit = res.body.kit;

    await request(app)
      .post(`/api/clientes/${kit}/facturas`)
      .set("Authorization", authHeader())
      .send({ numero: "F-PAGO-001", fecha: "2026-04-01", estadoPago: "pendiente" });
  });

  afterAll(async () => {
    await request(app)
      .delete(`/api/clientes/${kit}`)
      .set("Authorization", authHeader());
  });

  test.skip("GET /api/pagos debe listar pagos", async () => {
    const res = await request(app)
      .get("/api/pagos")
      .set("Authorization", authHeader());
    expect(res.status).toBe(200);
    expect(res.body.pagos).toBeDefined();
    expect(Array.isArray(res.body.pagos)).toBe(true);
  });
});

describe("Alertas Routes", () => {
  test("GET /api/alertas_facturacion debe retornar alertas", async () => {
    const res = await request(app)
      .get("/api/alertas_facturacion")
      .set("Authorization", authHeader());
    expect(res.status).toBe(200);
    expect(res.body.alertas_facturacion).toBeDefined();
    expect(Array.isArray(res.body.alertas_facturacion)).toBe(true);
  });

  test("GET /api/alertas_suspension debe retornar alertas", async () => {
    const res = await request(app)
      .get("/api/alertas_suspension")
      .set("Authorization", authHeader());
    expect(res.status).toBe(200);
    expect(res.body.alertas_suspension).toBeDefined();
  });

  test("GET /api/alertas_reactivacion debe retornar alertas", async () => {
    const res = await request(app)
      .get("/api/alertas_reactivacion")
      .set("Authorization", authHeader());
    expect(res.status).toBe(200);
    expect(res.body.alertas_reactivacion).toBeDefined();
  });
});

describe("Validaciones", () => {
  test("POST /api/clientes sin nombre debe retornar error", async () => {
    const res = await request(app)
      .post("/api/clientes")
      .set("Authorization", authHeader())
      .send({ nombrecliente: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("El nombre del cliente es obligatorio");
  });

  test("POST /api/clientes sin body debe retornar error", async () => {
    const res = await request(app)
      .post("/api/clientes")
      .set("Authorization", authHeader())
      .send({});
    expect(res.status).toBe(400);
  });

  test("PUT /api/clientes/:kit/facturas/:n/pago sin fechaPago debe fallar", async () => {
    const res = await request(app)
      .put("/api/clientes/KIT-INEXistente/facturas/F001/pago")
      .set("Authorization", authHeader())
      .send({});
    expect(res.status).toBe(400);
  });

  test("POST /api/clientes/importar sin array debe fallar", async () => {
    const res = await request(app)
      .post("/api/clientes/importar")
      .set("Authorization", authHeader())
      .send({ clientes: "no-es-array" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Se requiere un array de clientes para importar");
  });
});
