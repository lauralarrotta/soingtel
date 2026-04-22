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
import { Edit, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface Factura {
  numero: string;
  fecha: string;
  valor: number;
  estadoPago: "pagado" | "pendiente" | "vencido" | "roc" | "ppc";
  metodoPago?: string;
  fechaPago?: string;
  periodo?: string;
}

interface EditarFacturaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any;
  factura: Factura | null;
  onSave: (kit: string, numeroOriginal: string, facturaEditada: any) => void;
  userType: string;
}

export function EditarFacturaModal({
  open,
  onOpenChange,
  cliente,
  factura,
  onSave,
  userType,
}: EditarFacturaModalProps) {
  const [facturaEditada, setFacturaEditada] = useState<Factura>({
    numero: "",
    fecha: "",
    valor: 0,
    estadoPago: "pendiente",
    metodoPago: "",
    fechaPago: "",
    periodo: "",
  });

  useEffect(() => {
    if (open && factura) {
      setFacturaEditada({
        numero: factura.numero,
        fecha: factura.fecha,
        valor: factura.valor,
        estadoPago: factura.estadoPago,
        metodoPago: factura.metodoPago || "",
        fechaPago: factura.fechaPago || "",
        periodo: factura.periodo || "",
      });
    }
  }, [open, factura]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!factura) return;

    const facturaActualizada = {
      numero: facturaEditada.numero,
      fecha: facturaEditada.fecha,
      valor: facturaEditada.valor,
      estadoPago: facturaEditada.estadoPago,
      periodo: facturaEditada.periodo,
      fechaPago:
        facturaEditada.estadoPago === "pagado"
          ? facturaEditada.fechaPago
          : undefined,
      metodoPago:
        facturaEditada.estadoPago === "pagado"
          ? facturaEditada.metodoPago
          : undefined,
    };

    onSave(cliente?.kit, factura.numero, facturaActualizada);
    onOpenChange(false);
  };

  const puedeModificar = userType === "facturacion" || userType === "admin";

  if (!puedeModificar) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Factura
          </DialogTitle>
          <DialogDescription>
            Cliente: {cliente?.nombre} | Kit: {cliente?.kit}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Atención:</strong> Estás editando una factura existente.
                Los cambios se aplicarán inmediatamente.
              </AlertDescription>
            </Alert>

            <div className="grid gap-2">
              <Label htmlFor="numero">Número de Factura SOG *</Label>
              <Input
                id="numero"
                placeholder="Ej: SOG-2024-010"
                value={facturaEditada.numero}
                onChange={(e) =>
                  setFacturaEditada({
                    ...facturaEditada,
                    numero: e.target.value,
                  })
                }
                required
                className="font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="periodo">Periodo *</Label>
                <Select
                  value={facturaEditada.periodo}
                  onValueChange={(value) =>
                    setFacturaEditada({ ...facturaEditada, periodo: value })
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
                  value={facturaEditada.fecha}
                  onChange={(e) =>
                    setFacturaEditada({
                      ...facturaEditada,
                      fecha: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estado">Estado de la Factura *</Label>
              <Select
                value={facturaEditada.estadoPago}
                onValueChange={(value: "pendiente" | "pagado" | "vencido" | "roc" | "ppc") =>
                  setFacturaEditada({ ...facturaEditada, estadoPago: value })
                }
              >
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          facturaEditada.estadoPago === "pagado"
                            ? "bg-green-500"
                            : facturaEditada.estadoPago === "pendiente"
                              ? "bg-yellow-500"
                              : facturaEditada.estadoPago === "roc"
                                ? "bg-purple-500"
                                : facturaEditada.estadoPago === "ppc"
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                        }`}
                      ></div>
                      {facturaEditada.estadoPago === "pagado"
                        ? "Pagado"
                        : facturaEditada.estadoPago === "pendiente"
                          ? "Pendiente"
                          : facturaEditada.estadoPago === "roc"
                            ? "ROC"
                            : facturaEditada.estadoPago === "ppc"
                              ? "PPC"
                              : "Vencido"}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                      Pendiente
                    </div>
                  </SelectItem>
                  <SelectItem value="vencido">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                      Vencido
                    </div>
                  </SelectItem>
                  <SelectItem value="pagado">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      Pagado
                    </div>
                  </SelectItem>
                  <SelectItem value="roc">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                      ROC
                    </div>
                  </SelectItem>
                  <SelectItem value="ppc">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                      PPC
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
