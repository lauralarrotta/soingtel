import { useState, useEffect } from "react";
import { Pencil, Check } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface CampoEditableProps {
  label: string;
  campo: string;
  valor: any;
  type?: string;
  options?: { label: string; value: any }[];
  disabled?: boolean;
  onGuardar: (campo: string, valor: any) => void;
}

export function CampoEditable({
  label,
  valor,
  campo,
  type,
  options,
  disabled = false,
  onGuardar,
}: CampoEditableProps) {
  const [editando, setEditando] = useState(false);
  const [valorLocal, setValorLocal] = useState(valor || "");

  useEffect(() => {
    setValorLocal(valor || "");
  }, [valor]);

  const camposMoneda = ["costo_plan", "valor_factura", "valor_soporte"];

  const esMoneda = camposMoneda.includes(campo);

  const formatearMoneda = (valor: any) => {
    if (valor === null || valor === undefined || valor === "") return "-";

    const numero = Number(valor);

    if (isNaN(numero)) return valor;

    return numero.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });
  };

  const formatearNumero = (valor: string) => {
    const limpio = valor.replace(/\D/g, "");
    return limpio.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const limpiarNumero = (valor: string) => {
    return valor.replace(/\D/g, "");
  };

  const guardar = () => {
    let valorFinal = valorLocal;

    if (esMoneda) {
      valorFinal = limpiarNumero(valorLocal);
    }

    onGuardar(campo, valorFinal);
    setEditando(false);
  };

  const renderInput = () => {
    if (options) {
      return (
        <select
          className="border rounded px-2 py-1 text-sm"
          value={valorLocal}
          onChange={(e) => setValorLocal(e.target.value)}
        >
          {options.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === "date") {
      return (
        <Input
          type="date"
          value={valorLocal}
          onChange={(e) => setValorLocal(e.target.value)}
        />
      );
    }

    return (
      <Input
        value={valorLocal}
        onChange={(e) => {
          let val = e.target.value;

          if (esMoneda) {
            val = formatearNumero(val);
          }

          setValorLocal(val);
        }}
      />
    );
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>

      {editando ? (
        <div className="flex items-center gap-2 mt-1">
          {renderInput()}

          <Button size="icon" variant="ghost" onClick={guardar}>
            <Check size={16} />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-1">
          <p className="font-medium">
            {esMoneda ? formatearMoneda(valor) : valor || "-"}
          </p>

          {!disabled && (
            <Button size="icon" variant="ghost" onClick={() => setEditando(true)}>
              <Pencil size={14} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
