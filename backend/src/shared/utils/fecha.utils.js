function limpiarNumero(valor) {
  if (!valor) return null;
  return Number(
    valor
      .toString()
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .trim()
  );
}

function limpiarFecha(valor) {
  if (!valor) return null;

  try {
    let strVal = String(valor).trim();

    if (strVal.includes("T")) {
      strVal = strVal.split("T")[0];
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

module.exports = {
  limpiarNumero,
  limpiarFecha,
  mapearEstadoPago,
};
