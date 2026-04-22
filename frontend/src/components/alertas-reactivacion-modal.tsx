import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { CheckCircle, Power, X } from "lucide-react";

interface AlertaReactivacion {
  id: string;
  kit: string;
  nombre: string;
  cuenta: string;
  email: string;
  fechaReactivacion: string;
  ultimoPago: string;
  metodoPago: string;
  vista: boolean;
}

interface AlertasReactivacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: string;
}

export function AlertasReactivacionModal({
  open,
  onOpenChange,
  userType,
}: AlertasReactivacionModalProps) {
  const [alertas, setAlertas] = useState<AlertaReactivacion[]>([]);

  useEffect(() => {
    if (open) {
      cargarAlertas();
    }
  }, [open]);

  const cargarAlertas = () => {
    const alertasGuardadas = localStorage.getItem("alertas_reactivacion");
    if (alertasGuardadas) {
      setAlertas(JSON.parse(alertasGuardadas));
    }
  };

  const marcarComoVista = (id: string) => {
    const alertasActualizadas = alertas.map((a) =>
      a.id === id ? { ...a, vista: true } : a
    );
    setAlertas(alertasActualizadas);
    localStorage.setItem("alertas_reactivacion", JSON.stringify(alertasActualizadas));
  };

  const eliminarAlerta = (id: string) => {
    const alertasActualizadas = alertas.filter((a) => a.id !== id);
    setAlertas(alertasActualizadas);
    localStorage.setItem("alertas_reactivacion", JSON.stringify(alertasActualizadas));
  };

  const alertasNuevas = alertas.filter((a) => !a.vista);
  const alertasVistas = alertas.filter((a) => a.vista);

  if (userType !== "soporte" && userType !== "admin") {
    return null;
  }

  const ejecutarReactivacion = async (alerta: AlertaReactivacion) => {
    try {
      const response = await fetch(
        `https://soingtel.onrender.com/api/clientes/${alerta.kit}/estado`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estadoPago: "confirmado" }),
        }
      );

      if (!response.ok) {
        throw new Error("Error reactivando en el servidor");
      }

      toast.success("Cliente reactivado con estado confirmado", { description: "Kit: " + alerta.kit });
      marcarComoVista(alerta.id);
      window.dispatchEvent(new CustomEvent('soingtel_reload_clientes'));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1100px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Power className="h-5 w-5 text-green-600" />
            Alertas de Reactivación
          </DialogTitle>
          <DialogDescription>
            Clientes listos para reactivar - Pagos registrados por Facturación
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {alertasNuevas.length === 0 && alertasVistas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Power className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay alertas de reactivación</p>
            </div>
          ) : (
            <div className="space-y-6">
              {alertasNuevas.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg">Pendientes de Reactivación</h3>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      {alertasNuevas.length}
                    </Badge>
                  </div>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kit</TableHead>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Cuenta</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Último Pago</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Fecha Solicitud</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alertasNuevas.map((alerta) => (
                          <TableRow key={alerta.id} className="bg-green-50">
                            <TableCell>{alerta.kit}</TableCell>
                            <TableCell>{alerta.nombre}</TableCell>
                            <TableCell>{alerta.cuenta}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {alerta.email}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{alerta.ultimoPago}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{alerta.metodoPago}</Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(alerta.fechaReactivacion).toLocaleString()}
                            </TableCell>
                            <TableCell className="space-x-2">
                              <Button
                                size="sm"
                                onClick={() => ejecutarReactivacion(alerta)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Power className="h-4 w-4 mr-2" />
                                Ejecutar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => marcarComoVista(alerta.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Vista
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {alertasVistas.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg">Reactivadas</h3>
                    <Badge className="bg-muted hover:bg-muted/80">
                      {alertasVistas.length}
                    </Badge>
                  </div>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kit</TableHead>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Cuenta</TableHead>
                          <TableHead>Último Pago</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alertasVistas.map((alerta) => (
                          <TableRow key={alerta.id}>
                            <TableCell>{alerta.kit}</TableCell>
                            <TableCell>{alerta.nombre}</TableCell>
                            <TableCell>{alerta.cuenta}</TableCell>
                            <TableCell>
                              <span className="text-sm">{alerta.ultimoPago}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{alerta.metodoPago}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => eliminarAlerta(alerta.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Eliminar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}