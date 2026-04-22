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
import { Power, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";

interface Cliente {
  kit: string;
  nombrecliente: string;
  cuenta: string;
  email: string;
  corte: number;
  estado_pago: "confirmado" | "pendiente" | "suspendido" | "en_dano" | string;
  observaciones: string;
  costo: string;
  facturas?: any[];
}

interface ReactivarClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
  onReactivar: (kit: string) => void;
}

export function ReactivarClienteModal({
  open,
  onOpenChange,
  cliente,
  onReactivar,
}: ReactivarClienteModalProps) {
  const handleReactivar = () => {
    if (cliente) {
      onReactivar(cliente.kit);
      onOpenChange(false);
    }
  };

  if (!cliente) return null;

  // Verificar si el cliente está al día
  const facturasPendientes =
    cliente.facturas?.filter((f) => f.estadoPago === "pendiente").length || 0;

  const facturasVencidas =
    cliente.facturas?.filter((f) => f.estadoPago === "vencido").length || 0;

  const estaAlDia = facturasPendientes === 0 && facturasVencidas === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Power className="h-5 w-5" />
            Solicitar Reactivación
          </DialogTitle>
          <DialogDescription>
            Enviar solicitud de reactivación a Soporte
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {estaAlDia ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✓ El cliente <strong>{cliente.nombrecliente}</strong> está al
                día con sus pagos. Se notificará a Soporte para reactivar el
                servicio.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                El cliente aún tiene {facturasPendientes + facturasVencidas}{" "}
                factura(s) pendiente(s). Se recomienda esperar a que esté
                completamente al día.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 bg-muted p-4 rounded-md">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Label className="text-muted-foreground">Kit</Label>
                <div>{cliente.kit}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Cuenta</Label>
                <div>{cliente.cuenta}</div>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Empresa</Label>
                <div>{cliente.nombrecliente}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <div className="truncate text-sm">{cliente.email}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Estado Actual</Label>
                <div>
                  {cliente.estado_pago === "suspendido" ? (
                    <Badge className="bg-red-500">Suspendido</Badge>
                  ) : cliente.estado_pago === "confirmado" ? (
                    <Badge className="bg-green-500">Confirmado</Badge>
                  ) : (
                    <Badge className="bg-yellow-500">Pendiente</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <Label className="text-muted-foreground">
                Estado de Facturas
              </Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">
                    Pagadas:{" "}
                    {cliente.facturas?.filter((f) => f.estadoPago === "pagado")
                      .length || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">
                    Pendientes: {facturasPendientes}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">Vencidas: {facturasVencidas}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleReactivar}
            className="bg-green-600 hover:bg-green-700"
          >
            <Power className="h-4 w-4 mr-2" />
            Solicitar Reactivación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
