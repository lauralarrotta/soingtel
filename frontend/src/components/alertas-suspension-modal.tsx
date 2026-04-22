import { useState, useEffect } from "react";
import { toast } from "sonner";
import { API_CONFIG } from "@/config";
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
import { Ban, CheckCircle, RefreshCw } from "lucide-react";

interface AlertaSuspension {
  id: string;
  kit: string;
  nombre: string;
  cuenta: string;
  email: string;
  motivo: string;
  facturasVencidas: number;
  fechaSuspension: string;
  vista: boolean;
}

interface AlertasSuspensionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: string;
}

export function AlertasSuspensionModal({
  open,
  onOpenChange,
  userType,
}: AlertasSuspensionModalProps) {
  const [alertas, setAlertas] = useState<AlertaSuspension[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      cargarAlertas();
    }
  }, [open]);

  const cargarAlertas = async () => {
    setLoading(true);
    try {
      // 1) Cargar alertas del servidor (compartidas entre usuarios)
      const res = await fetch(`${API_CONFIG.BASE_URL}/alertas_suspension`);
      if (res.ok) {
        const data = await res.json();
        const delServidor: AlertaSuspension[] = (data.alertas_suspension || [])
          .filter((a: any) => !a.vista)
          .map((a: any) => ({
            id: String(a.id),
            kit: a.cliente_kit,
            nombre: a.cliente_nombre,
            cuenta: "",
            email: "",
            motivo: a.mensaje || "",
            facturasVencidas: parseInt(a.numero_factura) || 0,
            fechaSuspension: a.fecha_creacion,
            vista: a.vista || false,
          }));

        // 2) Cargar alertas locales (creadas por este usuario en localStorage)
        const alertasLocales: AlertaSuspension[] = JSON.parse(
          localStorage.getItem("alertas_suspension") || "[]"
        );

        // 3) Combinar sin duplicados por id
        const todas = [...delServidor];
        alertasLocales.forEach((local) => {
          if (!todas.find((s) => s.id === String(local.id))) {
            todas.push(local);
          }
        });

        setAlertas(todas);
      }
    } catch (e) {
      // Si falla el servidor, cargar solo locales
      const locales = localStorage.getItem("alertas_suspension");
      if (locales) setAlertas(JSON.parse(locales));
    } finally {
      setLoading(false);
    }
  };

  const marcarComoVista = async (id: string) => {
    // Marcar localmente
    const alertasActualizadas = alertas.map((a) =>
      a.id === id ? { ...a, vista: true } : a
    );
    setAlertas(alertasActualizadas);
    localStorage.setItem("alertas_suspension", JSON.stringify(alertasActualizadas));

    // Marcar en el servidor
    try {
      await fetch(`${API_CONFIG.BASE_URL}/alertas_suspension`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertas_suspension: [{ id, vista: true }] }),
      });
    } catch (e) {
      // Silencioso — la marca local ya funciona
    }
  };

  const eliminarAlerta = async (id: string) => {
    const alertasActualizadas = alertas.filter((a) => a.id !== id);
    setAlertas(alertasActualizadas);
    localStorage.setItem("alertas_suspension", JSON.stringify(alertasActualizadas));
    try {
      await fetch(`${API_CONFIG.BASE_URL}/alertas_suspension`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertas_suspension: [{ id, vista: true }] }),
      });
    } catch (e) {}
  };

  const alertasNuevas = alertas.filter((a) => !a.vista);
  const alertasVistas = alertas.filter((a) => a.vista);

  if (userType !== "soporte" && userType !== "admin") {
    return null;
  }

  const ejecutarSuspension = async (alerta: AlertaSuspension) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/clientes/${alerta.kit}/estado`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado_pago: "suspendido", motivo: alerta.motivo }),
        }
      );

      if (!response.ok) {
        throw new Error("Error suspendiendo en el servidor");
      }

      toast.success("Cliente suspendido en el sistema", { description: "Kit: " + alerta.kit });

      // Remover de la lista local (el servidor se actualiza al siguiente reload)
      const restantes = alertas.filter((a) => a.id !== alerta.id);
      setAlertas(restantes);
      localStorage.setItem("alertas_suspension", JSON.stringify(restantes));

      // Intentar eliminar del servidor (si el endpoint ya existe)
      try {
        await fetch(`${API_CONFIG.BASE_URL}/alertas_suspension/${alerta.id}`, {
          method: "DELETE",
        });
      } catch {
        // Silencioso — si falla, se filtrará en la siguiente carga
      }

      window.dispatchEvent(new CustomEvent('soingtel_reload_clientes'));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-600" />
            Alertas de Suspensión
          </DialogTitle>
          <DialogDescription>
            Clientes que requieren suspensión (Solicitados por Facturación)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {loading && (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
              <p className="text-sm">Cargando alertas...</p>
            </div>
          )}
          {!loading && alertasNuevas.length === 0 && alertasVistas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Ban className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay alertas de suspensión</p>
            </div>
          ) : (
            <div className="space-y-6">
              {alertasNuevas.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg">Nuevas Suspensiones</h3>
                    <Badge className="bg-red-500 hover:bg-red-600">
                      {alertasNuevas.length}
                    </Badge>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-normal px-2">Kit</TableHead>
                          <TableHead className="whitespace-normal px-2">Empresa</TableHead>
                          <TableHead className="whitespace-normal px-2">Cuenta</TableHead>
                          <TableHead className="whitespace-normal px-2">Facturas Vencidas</TableHead>
                          <TableHead className="whitespace-normal px-2">Motivo</TableHead>
                          <TableHead className="whitespace-normal px-2">Fecha Suspensión</TableHead>
                          <TableHead className="whitespace-normal px-2">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alertasNuevas.map((alerta) => (
                          <TableRow key={alerta.id} className="bg-red-50 text-sm">
                            <TableCell className="whitespace-normal px-2 overflow-hidden text-ellipsis max-w-[80px]">{alerta.kit}</TableCell>
                            <TableCell className="whitespace-normal px-2 max-w-[120px]">{alerta.nombre}</TableCell>
                            <TableCell className="whitespace-normal px-2 break-all">{alerta.cuenta}</TableCell>
                            <TableCell className="whitespace-normal px-2 text-center">
                              <Badge className="bg-red-500">{alerta.facturasVencidas}</Badge>
                            </TableCell>
                            <TableCell className="whitespace-normal px-2 max-w-[150px]">
                              <span className="text-sm line-clamp-3">{alerta.motivo}</span>
                            </TableCell>
                            <TableCell className="whitespace-normal px-2 text-xs">
                              {new Date(alerta.fechaSuspension).toLocaleString()}
                            </TableCell>
                            <TableCell className="whitespace-normal px-2">
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => ejecutarSuspension(alerta)}
                                  className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs px-2"
                                >
                                  <Ban className="h-3 w-3 mr-1" />
                                  Suspender
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => marcarComoVista(alerta.id)}
                                  className="h-8 text-xs px-2"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Vista
                                </Button>
                              </div>
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
                    <h3 className="text-lg">Vistas</h3>
                    <Badge className="bg-muted hover:bg-muted/80">
                      {alertasVistas.length}
                    </Badge>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-normal px-2">Kit</TableHead>
                          <TableHead className="whitespace-normal px-2">Empresa</TableHead>
                          <TableHead className="whitespace-normal px-2">Cuenta</TableHead>
                          <TableHead className="whitespace-normal px-2">Facturas Vencidas</TableHead>
                          <TableHead className="whitespace-normal px-2">Motivo</TableHead>
                          <TableHead className="whitespace-normal px-2">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alertasVistas.map((alerta) => (
                          <TableRow key={alerta.id} className="text-sm">
                            <TableCell className="whitespace-normal px-2 max-w-[80px]">{alerta.kit}</TableCell>
                            <TableCell className="whitespace-normal px-2 max-w-[120px]">{alerta.nombre}</TableCell>
                            <TableCell className="whitespace-normal px-2 break-all">{alerta.cuenta}</TableCell>
                            <TableCell className="whitespace-normal px-2 text-center">
                              <Badge className="bg-red-500">{alerta.facturasVencidas}</Badge>
                            </TableCell>
                            <TableCell className="whitespace-normal px-2 max-w-[150px]">
                              <span className="text-sm line-clamp-2">{alerta.motivo}</span>
                            </TableCell>
                            <TableCell className="whitespace-normal px-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => eliminarAlerta(alerta.id)}
                                className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
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