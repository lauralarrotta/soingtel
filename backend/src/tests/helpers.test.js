const { limpiarNumero, limpiarFecha, mapearEstadoPago } = require("../shared/utils/fecha.utils");

describe("fechaHelpers", () => {
  describe("limpiarNumero", () => {
    test("debe limpiar número con formato moneda", () => {
      expect(limpiarNumero("$80,000")).toBe(80000);
    });

    test("debe limpiar número con comas", () => {
      expect(limpiarNumero("120,500")).toBe(120500);
    });

    test("debe retornar null para valor nulo", () => {
      expect(limpiarNumero(null)).toBeNull();
    });

    test("debe retornar null para valor indefinido", () => {
      expect(limpiarNumero(undefined)).toBeNull();
    });

    test("debe retornar número directo si no tiene formato", () => {
      expect(limpiarNumero(50000)).toBe(50000);
    });
  });

  describe("limpiarFecha", () => {
    test("debe convertir fecha ISO a YYYY-MM-DD", () => {
      expect(limpiarFecha("2026-04-20T10:00:00Z")).toBe("2026-04-20");
    });

    test("debe convertir fecha con formato DD/MM/YYYY", () => {
      expect(limpiarFecha("20/04/2026")).toBe("2026-04-20");
    });

    test("debe convertir fecha con formato MM/DD/YYYY", () => {
      expect(limpiarFecha("04/20/2026")).toBe("2026-04-20");
    });

    test("debe convertir fecha con guiones", () => {
      expect(limpiarFecha("2026-04-20")).toBe("2026-04-20");
    });

    test("debe retornar null para fecha inválida", () => {
      expect(limpiarFecha("fecha-invalida")).toBeNull();
    });

    test("debe retornar null para valor nulo", () => {
      expect(limpiarFecha(null)).toBeNull();
    });
  });

  describe("mapearEstadoPago", () => {
    test("debe mapear 'dañado' a en_dano", () => {
      expect(mapearEstadoPago("dañado")).toBe("en_dano");
    });

    test("debe mapear 'dañado' minúscula a en_dano", () => {
      expect(mapearEstadoPago("dañado")).toBe("en_dano");
    });

    test("debe mapear 'garantía' a garantia", () => {
      expect(mapearEstadoPago("garantía")).toBe("garantia");
    });

    test("debe mapear 'suspendido' correctamente", () => {
      expect(mapearEstadoPago("suspendido")).toBe("suspendido");
    });

    test("debe retornar pendiente por defecto", () => {
      expect(mapearEstadoPago(null)).toBe("pendiente");
    });

    test("debe retornar el estado tal cual si no matchea", () => {
      expect(mapearEstadoPago("confirmado")).toBe("confirmado");
    });
  });
});
