import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { AlertTriangle, Ban } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

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

interface SuspenderClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
  facturasVencidas: number;
  onSuspender: (kit: string, motivo: string) => void;
}

export function SuspenderClienteModal({
  open,
  onOpenChange,
  cliente,
  facturasVencidas,
  onSuspender,
}: SuspenderClienteModalProps) {
  const [motivo, setMotivo] = useState("");

  const handleSuspender = () => {
    if (cliente) {
      const motivoFinal =
        motivo.trim() ||
        `Cliente suspendido por ${facturasVencidas} facturas vencidas`;
      onSuspender(cliente.kit, motivoFinal);
      setMotivo("");
      onOpenChange(false);
    }
  };

  if (!cliente) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Ban className="h-5 w-5" />
            Suspender Cliente
          </DialogTitle>
          <DialogDescription>
            Estás a punto de suspender el servicio de este cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{cliente.nombrecliente}</strong> tiene {facturasVencidas}{" "}
              facturas vencidas. Esta acción enviará una notificación a
              Facturación.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Kit:</span>
                <div>{cliente.kit}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Cuenta:</span>
                <div>{cliente.cuenta}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <div className="truncate">{cliente.email}</div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Facturas vencidas:
                </span>
                <div className="text-red-600">{facturasVencidas}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo de suspensión (opcional)</Label>
            <Textarea
              id="motivo"
              placeholder={`Cliente suspendido por ${facturasVencidas} facturas vencidas`}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleSuspender}>
            <Ban className="h-4 w-4 mr-2" />
            Confirmar Suspensión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
