import { useState, useEffect } from "react";
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
import { Bell, Receipt, CheckCircle, Trash2, AlertCircle, UserPlus } from "lucide-react";
import { alertasService } from "@/services/alertasService";

interface AlertaCliente {
  id: string;
  kit: string;
  nombre: string;
  cuenta: string;
  email: string;
  fechaCreacion: string;
  completada: boolean;
  mensaje?: string;
  numero_factura?: string;
  vista?: boolean;
}

interface AlertasFacturacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgregarFactura: (alerta: AlertaCliente) => void;
  userType: string;
}

export function AlertasFacturacionModal({
  open,
  onOpenChange,
  onAgregarFactura,
  userType,
}: AlertasFacturacionModalProps) {
  const [alertas, setAlertas] = useState<AlertaCliente[]>([]);
  const [alertasNuevoCliente, setAlertasNuevoCliente] = useState<AlertaCliente[]>([]);
  const [alertasClienteIncompleto, setAlertasClienteIncompleto] = useState<AlertaCliente[]>([]);

  useEffect(() => {
    if (open) {
      cargarAlertas();
      if (userType === "facturacion" || userType === "admin") {
        cargarAlertasBackend();
      }
    }
  }, [open, userType]);

  const cargarAlertas = () => {
    const alertasGuardadas = localStorage.getItem("alertas_facturacion");
    if (alertasGuardadas) {
      setAlertas(JSON.parse(alertasGuardadas));
    }
  };

  const cargarAlertasBackend = async () => {
    try {
      // Cargar nuevo cliente alertas
      const nuevoClienteRes = await alertasService.obtenerNuevoCliente();
      if (nuevoClienteRes.alertas_nuevo_cliente) {
        setAlertasNuevoCliente(nuevoClienteRes.alertas_nuevo_cliente);
      }

      // Cargar cliente incompleto alertas
      const incompletoRes = await alertasService.obtenerClienteIncompleto();
      if (incompletoRes.alertas_cliente_incompleto) {
        setAlertasClienteIncompleto(incompletoRes.alertas_cliente_incompleto);
      }
    } catch (err) {
      console.warn("Error cargando alertas del backend:", err);
    }
  };

  const marcarComoCompletada = (id: string) => {
    const alertasActualizadas = alertas.map((a) =>
      a.id === id ? { ...a, completada: true } : a,
    );
    setAlertas(alertasActualizadas);
    localStorage.setItem(
      "alertas_facturacion",
      JSON.stringify(alertasActualizadas),
    );
  };

  const marcarVistaNuevoCliente = async (id: string) => {
    try {
      const alertasActualizadas = alertasNuevoCliente.map((a) =>
        a.id === id ? { ...a, vista: true } : a,
      );
      setAlertasNuevoCliente(alertasActualizadas);
      await alertasService.actualizarNuevoCliente(
        alertasActualizadas.map((a) => ({ id: a.id, vista: a.vista })),
      );
    } catch (err) {
      console.warn("Error marcando alerta como vista:", err);
    }
  };

  const marcarVistaClienteIncompleto = async (id: string) => {
    try {
      const alertasActualizadas = alertasClienteIncompleto.map((a) =>
        a.id === id ? { ...a, vista: true } : a,
      );
      setAlertasClienteIncompleto(alertasActualizadas);
      await alertasService.actualizarClienteIncompleto(
        alertasActualizadas.map((a) => ({ id: a.id, vista: a.vista })),
      );
    } catch (err) {
      console.warn("Error marcando alerta como vista:", err);
    }
  };

  const eliminarAlerta = (id: string) => {
    const alertasActualizadas = alertas.filter((a) => a.id !== id);
    setAlertas(alertasActualizadas);
    localStorage.setItem(
      "alertas_facturacion",
      JSON.stringify(alertasActualizadas),
    );
  };

  const limpiarTodo = () => {
    setAlertas([]);
    localStorage.removeItem("alertas_facturacion");
  };

  const alertasPendientes = alertas.filter((a) => !a.completada);
  const alertasCompletadas = alertas.filter((a) => a.completada);

  const nuevoClientePendientes = alertasNuevoCliente.filter((a) => !a.vista);
  const clienteIncompletoPendientes = alertasClienteIncompleto.filter((a) => !a.vista);

  if (userType !== "facturacion" && userType !== "admin") {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas de Clientes
            </DialogTitle>
            {alertas.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={limpiarTodo}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Historial
              </Button>
            )}
          </div>
          <DialogDescription>
            Gestión de alertas de nuevos clientes y clientes con datos incompletos
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {alertasPendientes.length === 0 && alertasCompletadas.length === 0 &&
           nuevoClientePendientes.length === 0 && clienteIncompletoPendientes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay alertas pendientes</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Nuevos Clientes */}
              {nuevoClientePendientes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <UserPlus className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg text-green-600">Nuevos Clientes</h3>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      {nuevoClientePendientes.length}
                    </Badge>
                  </div>
                  <div className="rounded-md border overflow-x-auto mb-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kit</TableHead>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Creado Por</TableHead>
                          <TableHead>Mensaje</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nuevoClientePendientes.map((alerta) => (
                          <TableRow key={`nuevo-${alerta.id}`}>
                            <TableCell className="font-mono whitespace-nowrap">
                              {alerta.kit}
                            </TableCell>
                            <TableCell className="font-medium max-w-[200px] truncate">
                              {alerta.nombre}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {alerta.numero_factura || "soporte"}
                            </TableCell>
                            <TableCell className="max-w-[250px] truncate text-sm">
                              {alerta.mensaje}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    onAgregarFactura(alerta);
                                    marcarVistaNuevoCliente(alerta.id);
                                    onOpenChange(false);
                                  }}
                                >
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Facturar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => marcarVistaNuevoCliente(alerta.id)}
                                >
                                  Descartar
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

              {/* Clientes Incompletos */}
              {clienteIncompletoPendientes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <h3 className="text-lg text-orange-600">Clientes con Datos Incompletos</h3>
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      {clienteIncompletoPendientes.length}
                    </Badge>
                  </div>
                  <div className="rounded-md border overflow-x-auto mb-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kit</TableHead>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Campos Faltantes</TableHead>
                          <TableHead>Mensaje</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clienteIncompletoPendientes.map((alerta) => (
                          <TableRow key={`incompleto-${alerta.id}`}>
                            <TableCell className="font-mono whitespace-nowrap">
                              {alerta.kit}
                            </TableCell>
                            <TableCell className="font-medium max-w-[200px] truncate">
                              {alerta.nombre}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {alerta.numero_factura}
                            </TableCell>
                            <TableCell className="max-w-[250px] truncate text-sm">
                              {alerta.mensaje}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => marcarVistaClienteIncompleto(alerta.id)}
                              >
                                Descartar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Empresas pendientes (legacy) */}
              {alertasPendientes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg">Empresas Pendientes</h3>
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      {alertasPendientes.length}
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
                          <TableHead>Fecha Creación</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alertasPendientes.map((alerta) => (
                          <TableRow key={`local-${alerta.id}`}>
                            <TableCell className="font-mono whitespace-nowrap">
                              {alerta.kit}
                            </TableCell>
                            <TableCell
                              className="font-medium max-w-[200px] truncate"
                              title={alerta.nombre}
                            >
                              {alerta.nombre}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {alerta.cuenta}
                            </TableCell>
                            <TableCell
                              className="max-w-[200px] truncate"
                              title={alerta.email}
                            >
                              {alerta.email}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                              {new Date(alerta.fechaCreacion).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    onAgregarFactura(alerta);
                                    marcarComoCompletada(alerta.id);
                                    onOpenChange(false);
                                  }}
                                >
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Agregar Factura
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

              {alertasCompletadas.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg">Completadas</h3>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      {alertasCompletadas.length}
                    </Badge>
                  </div>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kit</TableHead>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Cuenta</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alertasCompletadas.map((alerta) => (
                          <TableRow
                            key={`local-completo-${alerta.id}`}
                            className="opacity-60 bg-muted/30"
                          >
                            <TableCell className="font-mono whitespace-nowrap">
                              {alerta.kit}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {alerta.nombre}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {alerta.cuenta}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-500 hover:bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completada
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => eliminarAlerta(alerta.id)}
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
