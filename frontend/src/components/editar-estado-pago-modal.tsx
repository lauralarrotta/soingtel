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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";

interface EditarEstadoPagoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any;
  onSave: (kit: string, nuevoEstado: "confirmado" | "pendiente" | "suspendido" | "en_dano" | "garantia" | "ROC" | "PPC") => void;
}

export function EditarEstadoPagoModal({
  open,
  onOpenChange,
  cliente,
  onSave,
}: EditarEstadoPagoModalProps) {
  const [estadoPago, setEstadoPago] = useState<"confirmado" | "pendiente" | "suspendido" | "en_dano" | "garantia" | "ROC" | "PPC">("pendiente");

  useEffect(() => {
    if (cliente) {
      setEstadoPago(cliente.estadoPago);
    }
  }, [cliente]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(cliente?.kit, estadoPago);
    onOpenChange(false);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "confirmado":
        return <Badge className="bg-green-500 hover:bg-green-600">Pago Confirmado</Badge>;
      case "pendiente":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendiente</Badge>;
      case "suspendido":
        return <Badge className="bg-red-500 hover:bg-red-600">Suspendido</Badge>;
      case "en_dano":
        return (
          <Badge 
            className="border-transparent font-medium" 
            style={{ backgroundColor: '#334155', color: '#ffffff' }}
          >
            En Daño
          </Badge>
        );
      case "garantia":
        return <Badge className="bg-cyan-700 hover:bg-cyan-800 text-white border-transparent">Garantía</Badge>;
      case "roc":
        return <Badge className="bg-purple-500 hover:bg-purple-600 text-white">ROC</Badge>;
      case "ppc":
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">PPC</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cambiar Estado de Pago</DialogTitle>
          <DialogDescription>
            Cliente: {cliente?.nombre} | Kit: {cliente?.kit}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="estado-actual">Estado Actual</Label>
              <div className="flex items-center gap-2">
                {cliente && getEstadoBadge(cliente.estadoPago)}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="nuevo-estado">Nuevo Estado de Pago</Label>
              <Select
                value={estadoPago}
                onValueChange={(value: "confirmado" | "pendiente" | "suspendido" | "en_dano" | "garantia" | "ROC" | "PPC") =>
                  setEstadoPago(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmado">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Pago Confirmado
                    </div>
                  </SelectItem>
                  <SelectItem value="pendiente">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      Pendiente
                    </div>
                  </SelectItem>
                  <SelectItem value="suspendido">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Suspendido
                    </div>
                  </SelectItem>
                  <SelectItem value="en_dano">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-900 border border-red-500"></div>
                      En Daño
                    </div>
                  </SelectItem>
                  <SelectItem value="garantia">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-700"></div>
                      En Garantía
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
                      Pausado (PPC)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="mb-2">Descripción de estados:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Confirmado:</strong> Pago recibido y verificado</li>
                <li>• <strong>Pendiente:</strong> Esperando confirmación de pago</li>
                <li>• <strong>Suspendido:</strong> Servicio suspendido por falta de pago</li>
                <li>• <strong>En Daño:</strong> Servicio inactivo por problemas técnicos o equipo dañado</li>
                <li>• <strong>Garantía:</strong> Equipo en proceso de garantía</li>
                <li>• <strong>ROC:</strong> Requiere Orden de Compra </li>
                <li>• <strong>PPC:</strong> Pausado Por Cliente </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Actualizar Estado</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
