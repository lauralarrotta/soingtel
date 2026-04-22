import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Receipt, Info } from "lucide-react";

interface AgregarFacturaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any;
  onSave: (kit: string, factura: any) => void;
  userType: string;
}

export function AgregarFacturaModal({
  open,
  onOpenChange,
  cliente,
  onSave,
  userType,
}: AgregarFacturaModalProps) {
  const [nuevaFactura, setNuevaFactura] = useState({
    numero: "",
    fecha: new Date().toISOString().split("T")[0],
    estadoPago: "pendiente" as "pendiente" | "pagado" | "roc" | "ppc",
    metodoPago: "Transferencia",
    periodo: "",
  });

  useEffect(() => {
    if (open && cliente) {
      // Generar sugerencia de número de factura basado en facturas anteriores
      const numeroSugerido = generarNumeroFacturaSugerido(cliente);
      // Obtener el periodo bimestral actual
      const periodosBimestrales = [
        "Ene-Feb",
        "Ene-Feb",
        "Mar-Abr",
        "Mar-Abr",
        "May-Jun",
        "May-Jun",
        "Jul-Ago",
        "Jul-Ago",
        "Sep-Oct",
        "Sep-Oct",
        "Oct-Nov",
        "Nov-Dic",
      ];
      const periodoActual = periodosBimestrales[new Date().getMonth()];

      setNuevaFactura({
        numero: numeroSugerido,
        fecha: new Date().toISOString().split("T")[0],
        estadoPago: "pendiente",
        metodoPago: "Transferencia",
        periodo: periodoActual,
      });
    }
  }, [open, cliente]);

  const generarNumeroFacturaSugerido = (cliente: any) => {
    const facturas = cliente?.facturas || [];
    if (facturas.length === 0) {
      const year = new Date().getFullYear();
      return `SOG-${year}-001`;
    }

    // Obtener el último número
    const ultimaFactura = facturas[facturas.length - 1];
    const match = ultimaFactura.numero.match(/SOG-(\d{4})-(\d{3})/);

    if (match) {
      const year = parseInt(match[1]);
      const num = parseInt(match[2]);
      const currentYear = new Date().getFullYear();

      if (year === currentYear) {
        return `SOG-${year}-${String(num + 1).padStart(3, "0")}`;
      } else {
        return `SOG-${currentYear}-001`;
      }
    }

    return `SOG-${new Date().getFullYear()}-001`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const factura = {
      numero: nuevaFactura.numero,
      fecha: nuevaFactura.fecha,
      estadoPago: nuevaFactura.estadoPago,
      periodo: nuevaFactura.periodo,
      fechaPago:
        nuevaFactura.estadoPago === "pagado" ? nuevaFactura.fecha : undefined,
      metodoPago:
        nuevaFactura.estadoPago === "pagado"
          ? nuevaFactura.metodoPago
          : undefined,
    };

    onSave(cliente?.kit, factura);
    onOpenChange(false);
  };

  const puedeModificar = userType === "facturacion" || userType === "admin";

  if (!puedeModificar) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Agregar Nueva Factura
          </DialogTitle>
          <DialogDescription>
            Cliente: {cliente?.nombre} | Kit: {cliente?.kit} | Cuenta:{" "}
            {cliente?.cuenta}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800 flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="mb-1">
                  El número de factura se ha generado automáticamente basándose
                  en el historial del cliente.
                </p>
                <p className="text-xs">
                  Última factura:{" "}
                  {cliente?.facturas?.length > 0
                    ? cliente.facturas[cliente.facturas.length - 1].numero
                    : "Sin facturas previas"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="numero">Número de Factura SOG *</Label>
                <Input
                  id="numero"
                  placeholder="Ej: SOG-2024-010"
                  value={nuevaFactura.numero}
                  onChange={(e) =>
                    setNuevaFactura({ ...nuevaFactura, numero: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="periodo">Periodo *</Label>
                <Select
                  value={nuevaFactura.periodo}
                  onValueChange={(value) =>
                    setNuevaFactura({ ...nuevaFactura, periodo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ene-Feb">Ene-Feb</SelectItem>
                    <SelectItem value="Mar-Abr">Mar-Abr</SelectItem>
                    <SelectItem value="May-Jun">May-Jun</SelectItem>
                    <SelectItem value="Jul-Ago">Jul-Ago</SelectItem>
                    <SelectItem value="Sep-Oct">Sep-Oct</SelectItem>
                    <SelectItem value="Oct-Nov">Oct-Nov</SelectItem>
                    <SelectItem value="Nov-Dic">Nov-Dic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fecha">Fecha de Emisión *</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={nuevaFactura.fecha}
                  onChange={(e) =>
                    setNuevaFactura({ ...nuevaFactura, fecha: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estado">Estado Inicial *</Label>
              <Select
                value={nuevaFactura.estadoPago}
                onValueChange={(value: "pendiente" | "pagado" | "roc" | "ppc") =>
                  setNuevaFactura({ ...nuevaFactura, estadoPago: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      Pendiente
                    </div>
                  </SelectItem>
                  <SelectItem value="pagado">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Pagado
                    </div>
                  </SelectItem>
                  <SelectItem value="roc">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      ROC
                    </div>
                  </SelectItem>
                  <SelectItem value="ppc">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      PPC
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                {nuevaFactura.estadoPago === "pendiente" && <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Pendiente</Badge>}
                {nuevaFactura.estadoPago === "pagado" && <Badge className="bg-green-500 hover:bg-green-600 text-white">Pagado</Badge>}
                {nuevaFactura.estadoPago === "roc" && <Badge className="bg-purple-500 hover:bg-purple-600 text-white">ROC</Badge>}
                {nuevaFactura.estadoPago === "ppc" && <Badge className="bg-orange-500 hover:bg-orange-600 text-white">PPC</Badge>}
              </div>
            </div>

            {nuevaFactura.estadoPago === "pagado" && (
              <div className="grid gap-2">
                <Label htmlFor="metodoPago">Método de Pago</Label>
                <Select
                  value={nuevaFactura.metodoPago}
                  onValueChange={(value) =>
                    setNuevaFactura({ ...nuevaFactura, metodoPago: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transferencia">
                      Transferencia bancaria
                    </SelectItem>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Tarjeta">
                      Tarjeta de crédito/débito
                    </SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Agregar Factura</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
