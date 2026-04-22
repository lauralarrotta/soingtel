import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  X,
  Receipt,
  Download,
  Trash2,
  Ban,
  Power,
  RefreshCw,
  Upload,
  AlertCircle,
  BarChart3,
  PauseCircle,
  Wrench,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { NuevoClienteModal } from "../components/nuevo-cliente-modal";
import { HistorialFacturasModal } from "../components/historial-facturas-modal";
import { EditarObservacionModal } from "../components/editar-observacion-modal";
import { EditarEstadoPagoModal } from "../components/editar-estado-pago-modal";
import { AgregarFacturaModal } from "../components/agregar-factura-modal";
import { RegistrarPagoModal } from "../components/registrar-pago-modal";
import { EliminarClienteModal } from "../components/eliminar-cliente-modal";
import { SuspenderClienteModal } from "../components/suspender-cliente-modal";
import { ReactivarClienteModal } from "../components/reactivar-cliente-modal";
import { VerDetallesClienteModal } from "../components/ver-detalles-cliente-modal";
import { EditarFacturaModal } from "../components/editar-factura-modal";
import { ImportarClientesModal } from "../components/importar-clientes-modal";
import { AlertsPanel } from "../components/alerts-panel";
import { DashboardStats } from "../components/dashboard-stats";
import { ContadorCorte } from "../components/contador-corte";
import { toast } from "sonner";
import { useDatabase } from "./../hooks/useDatabase";
import { calcularEstadoCliente } from "@/utils/clientes";
import { Cliente, Factura, EstadoFacturacion } from "@/types/cliente";
import { clientesService } from "@/services/clientesService";
import { useMemo } from "react";
import { facturasService } from "@/services/facturasService";



interface ControlMensualidadesProps {
  userType?: string;
  clienteParaFacturar?: any;
  onFacturaAgregada?: () => void;
}

export function ControlMensualidades({
  userType = "soporte",
  clienteParaFacturar,
  onFacturaAgregada,
}: ControlMensualidadesProps) {

  // ✅ MOVER TODO AQUÍ DENTRO
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterCorte, setFilterCorte] = useState("todos");

  const [nuevoClienteOpen, setNuevoClienteOpen] = useState(false);
  const [historialModalOpen, setHistorialModalOpen] = useState(false);
  const [editarObservacionOpen, setEditarObservacionOpen] = useState(false);
  const [editarEstadoPagoOpen, setEditarEstadoPagoOpen] = useState(false);
  const [agregarFacturaOpen, setAgregarFacturaOpen] = useState(false);
  const [registrarPagoOpen, setRegistrarPagoOpen] = useState(false);
  const [eliminarClienteOpen, setEliminarClienteOpen] = useState(false);
  const [suspenderClienteOpen, setSuspenderClienteOpen] = useState(false);
  const [reactivarClienteOpen, setReactivarClienteOpen] = useState(false);
  const [verDetallesOpen, setVerDetallesOpen] = useState(false);
  const [editarFacturaOpen, setEditarFacturaOpen] = useState(false);
  const [importarClientesOpen, setImportarClientesOpen] = useState(false);

  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

  const [showOnlyMora, setShowOnlyMora] = useState(false);

  // States para Tarjetas Superiores
  const [activeCardFilter, setActiveCardFilter] = useState("todos");
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    ppc: 0,
    danadas: 0,
    suspendidas: 0,
    garantias: 0
  });



const crearCliente = async (cliente: Cliente) => {
  await clientesService.crear(cliente);
  await reloadClientes();
};

 const cargarEstadisticas = async () => {
  try {
    const data = await clientesService.estadisticas();
    setEstadisticas(data);
  } catch {}
};
  const {
    data: clientes,
    setData: setClientes,
    reload: reloadClientes,
    loading: loadingClientes,
    error: errorClientes,
    serverAvailable,
    totalCount,
    page,
    setPage,
  } = useDatabase<Cliente[]>(
    "clientes",
    [],
    undefined,
    1,
    10,
    {
      search: searchTerm,
      estado: activeCardFilter === "danadas" ? "en_dano" : activeCardFilter === "suspendidas" ? "suspendido" : activeCardFilter === "garantias" ? "garantia" : filterEstado,
      corte: filterCorte,
      estado_facturacion: activeCardFilter === "ppc" ? "PPC" : undefined,
      exclude_ppc: activeCardFilter !== "ppc" ? "true" : undefined,
    }
  );

  useEffect(() => {
    cargarEstadisticas();
  }, [clientes]);

  useEffect(() => {
    const handleReload = () => {
      reloadClientes();
      cargarEstadisticas();
    };
    window.addEventListener('soingtel_reload_clientes', handleReload);
    return () => window.removeEventListener('soingtel_reload_clientes', handleReload);
  }, [reloadClientes]);

  

  const exportarExcelBackend = async () => {
  try {
    const data = await clientesService.exportar(clientes);

    if (data.url) {
      window.open(data.url, "_blank");
    }

    toast.success("Excel generado correctamente");
  } catch (error: any) {
    toast.error(error.message);
  }
};


  // Efecto para abrir modal de factura cuando se selecciona desde alertas
  useEffect(() => {
    if (clienteParaFacturar) {
      const cliente = clientes.find((c) => c.kit === clienteParaFacturar.kit);
      if (cliente) {
        setSelectedCliente(cliente);
        setAgregarFacturaOpen(true);
      }
    }
  }, [clienteParaFacturar, clientes]);

  const handleNuevoCliente = async (cliente: Cliente) => {
    try {
      await crearCliente(cliente);

      if (userType === "soporte" || userType === "admin") {
        // Guardar alerta en el backend para compartir entre usuarios
        try {
          await fetch("https://soingtel.onrender.com/api/alertas_facturacion/crear", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kit: cliente.kit,
              nombre: cliente.nombrecliente,
              cuenta: cliente.cuenta,
              email: cliente.email,
            }),
          });
        } catch (alertaErr) {
          console.warn("No se pudo crear alerta en servidor:", alertaErr);
        }
      }

      toast.success("Cliente agregado exitosamente");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleImportarClientes = async (clientesImportados: any[]) => {
  try {
    await clientesService.importar(clientesImportados, userType);
    toast.success("Clientes importados correctamente");
  } catch (error: any) {
    toast.error(error.message);
  }
};
  const handleEditarObservacion = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setEditarObservacionOpen(true);
  };

  const handleAgregarFactura = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setAgregarFacturaOpen(true);
  };

  const handleSaveFactura = async (kit: string, factura: Factura) => {
  try {
    const data = await facturasService.crear(kit, factura);

    setClientes((prev) =>
      prev.map((c) =>
        c.kit === kit
          ? {
              ...c,
              estado_facturacion:
                data.estado_facturacion ?? c.estado_facturacion,
              facturas: [...(c.facturas || []), data.factura],
            }
          : c
      )
    );

    toast.success(
      `Factura ${factura.numero} agregada como ${factura.estadoPago.toUpperCase()}`
    );

    if (onFacturaAgregada) onFacturaAgregada();
  } catch (error: any) {
    toast.error(error.message);
  }
};

  const handleEditarFactura = (factura: Factura) => {
    setSelectedFactura(factura);
    setHistorialModalOpen(false);
    setEditarFacturaOpen(true);
  };

 const handleSaveFacturaEditada = async (
  kit: string,
  numeroOriginal: string,
  facturaEditada: Factura
) => {
  try {
    await facturasService.actualizar(
      kit,
      numeroOriginal,
      facturaEditada
    );

    await reloadClientes();
    toast.success("Factura actualizada correctamente");
  } catch (error: any) {
    toast.error(error.message);
  }
};

  const handleDeleteFactura = async (factura: Factura) => {
  if (!selectedCliente) return;

  try {
    await facturasService.eliminar(
      selectedCliente.kit,
      factura.numero
    );

    await reloadClientes();
    toast.success("Factura eliminada correctamente");

    setHistorialModalOpen(false);
  } catch (error: any) {
    toast.error(error.message);
  }
};
  const handleRegistrarPago = async (
  kit: string,
  numeroFactura: string,
  datosPago: {
    fechaPago: string;
    metodoPago: string;
    periodo?: string;
  }
) => {
  try {
    await facturasService.actualizar(
      kit,
      numeroFactura,
      datosPago as any
    );

    await reloadClientes();

    toast.success(`Pago registrado para ${numeroFactura}`, {
      description: `Método: ${datosPago.metodoPago}`,
    });
  } catch (error: any) {
    toast.error(error.message);
  }
};


 const handleSaveObservacion = async (
  kit: string,
  observacion: string
) => {
  try {
    await clientesService.actualizarObservacion(kit, observacion);

    await reloadClientes();
    toast.success("Observación actualizada");
  } catch (error: any) {
    toast.error(error.message);
  }
};


const handleSaveEstadoPago = async (
  kit: string,
  nuevoEstado: "confirmado" | "pendiente" | "suspendido" | "en_dano" | string
) => {
  try {
    await clientesService.actualizarEstado(kit, nuevoEstado);

    await reloadClientes();

    toast.success(`Estado actualizado a ${nuevoEstado}`);
  } catch (error: any) {
    toast.error(error.message);
  }
};
  const handleVerHistorial = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setHistorialModalOpen(true);
  };

  const handleEliminarCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setEliminarClienteOpen(true);
  };

 

const handleConfirmarEliminar = async () => {
  if (!selectedCliente) return;

  try {
    await clientesService.eliminar(selectedCliente.kit);

    await reloadClientes();

    toast.success(
      `Cliente ${selectedCliente.nombrecliente} eliminado correctamente`
    );

    setSelectedCliente(null);
  } catch (error: any) {
    toast.error(error.message);
  }
};

const handleSaveClienteCompleto = async (
  kitOriginal: string,
  datosActualizados: any,
) => {
  try {
    const clienteActualizado =
      await clientesService.actualizarCliente(
        kitOriginal,
        datosActualizados
      );

    // actualiza cliente seleccionado
    setSelectedCliente(clienteActualizado);

    // actualiza lista
    await reloadClientes();

    toast.success("Datos del cliente actualizados exitosamente");

    return clienteActualizado;
  } catch (error: any) {
    toast.error(error.message);
  }
};

  // Función para contar facturas vencidas
  const contarFacturasVencidas = (cliente: Cliente): number => {
    return (
      cliente.facturas?.filter((f) => f.estadoPago === "vencido").length || 0
    );
  };

  // Función para suspender cliente (cambia estado a suspendido y alerta a Soporte)
  const handleSuspenderCliente = async (_kit: string, motivo: string) => {
    if (!selectedCliente) return;

    try {
      // Guardar alerta en el backend para compartir entre usuarios
      try {
        await fetch("https://soingtel.onrender.com/api/alertas_suspension/crear", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kit: selectedCliente.kit,
            nombre: selectedCliente.nombrecliente || (selectedCliente as any).nombre_cliente,
            cuenta: selectedCliente.cuenta,
            email: selectedCliente.email,
            motivo,
            facturasVencidas: contarFacturasVencidas(selectedCliente),
          }),
        });
      } catch (alertaErr) {
        console.warn("No se pudo crear alerta de suspension en servidor:", alertaErr);
      }

      await reloadClientes();
      toast.success("Cliente suspendido correctamente y notificado a Soporte");
      setSuspenderClienteOpen(false);
    } catch (error: any) {
      toast.error(error.message || "No se pudo suspender el cliente");
    }
  };

 const actualizarEstadoFacturacion = async (
  kit: string,
  estado: EstadoFacturacion,
) => {
  try {
    await clientesService.actualizarEstadoFacturacion(kit, estado);

    setClientes((prev) =>
      prev.map((c) =>
        c.kit === kit ? { ...c, estado_facturacion: estado } : c
      )
    );
  } catch (error: any) {
    console.error(error);
    toast.error("No se pudo actualizar estado");
  }
};
  const handleAbrirSuspension = () => {
    // Encontrar el primer cliente en mora (exactamente 2 facturas vencidas)
    const clienteEnMora = clientes.find((c) => {
      const vencidas = contarFacturasVencidas(c);
      return vencidas === 2 && c.estado_pago !== "suspendido";
    });

    if (clienteEnMora) {
      setSelectedCliente(clienteEnMora);
      setSuspenderClienteOpen(true);
    }
  };

  // Función para reactivar cliente
  const handleReactivarCliente = async (kit: string) => {
    const cliente = clientes.find((c) => c.kit === kit);
    if (!cliente) return;

    // Obtener información del último pago
    const ultimaFactura = cliente.facturas
      ?.filter((f) => f.estadoPago === "pagado")
      .sort(
        (a, b) =>
          new Date(b.fechaPago || b.fecha).getTime() -
          new Date(a.fechaPago || a.fecha).getTime(),
      )[0];

    // Crear alerta en el backend para compartir entre usuarios
    try {
      await fetch("https://soingtel.onrender.com/api/alertas_reactivacion/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kit: cliente.kit,
          nombre: cliente.nombrecliente,
          cuenta: cliente.cuenta,
          email: cliente.email,
          ultimoPago: ultimaFactura?.fechaPago || ultimaFactura?.fecha || "N/A",
          metodoPago: ultimaFactura?.metodoPago || "No especificado",
        }),
      });
    } catch (alertaErr) {
      console.warn("No se pudo crear alerta de reactivacion en servidor:", alertaErr);
    }

    toast.success(
      `Solicitud de reactivación enviada a Soporte para ${cliente.nombrecliente}`,
      {
        description:
          "Soporte ha sido notificado para reactivar el servicio del cliente.",
      },
    );
  };




  const totalPages = Math.ceil(totalCount / 10);

  const suspendidosCount = clientes.filter(
    (c) => c.estado_pago === "suspendido",
  ).length;
  const pendientesCount = clientes.filter(
    (c) => c.estado_pago === "pendiente",
  ).length;

  // Calcular clientes en mora (EXACTAMENTE 2 facturas vencidas y no suspendidos)
  const clientesEnMora = clientes.filter((c) => {
    const facturasVencidas = contarFacturasVencidas(c);
    return facturasVencidas === 2 && c.estado_pago !== "suspendido";
  }).length;

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "confirmado":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            Pago confirmado
          </Badge>
        );
      case "pendiente":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            Pendiente
          </Badge>
        );
      case "mora":
        return (
          <Badge className="bg-orange-600 hover:bg-orange-700 text-white">
            Mora
          </Badge>
        );
      case "suspendido":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white">
            Suspendido
          </Badge>
        );
      case "en_dano":
        return (
          <Badge
            className="border-transparent font-medium"
            style={{ backgroundColor: '#334155', color: '#ffffff' }}
          >
            En Daño
          </Badge>
        );
      case "transferida":
        return (
          <Badge
            className="border-transparent font-medium"
            style={{ backgroundColor: '#6366f1', color: '#ffffff' }}
          >
            Transferida
          </Badge>
        );
      case "garantia":
        return (
          <Badge
            className="border-transparent font-medium"
            style={{ backgroundColor: '#334155', color: '#ffffff' }}
          >
            Garantía
          </Badge>
        );
      case "roc":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
            ROC
          </Badge>
        );
      case "ppc":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
            PPC
          </Badge>
        );
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const handleFilterSuspendidos = () => {
    setFilterEstado("suspendido");
    toast.info("Mostrando solo clientes suspendidos");
  };

  const handleFilterPendientes = () => {
    setFilterEstado("pendiente");
    toast.info("Mostrando solo clientes pendientes");
  };

  const handleFilterMora = () => {
    // Filtrar clientes con exactamente 2 facturas vencidas
    setShowOnlyMora(true);
    setFilterEstado("todos");
    toast.info(
      "Mostrando clientes con exactamente 2 facturas vencidas (en mora)",
    );
  };

  const handleVerDetalles = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setVerDetallesOpen(true);
  };

  const clientesFiltrados = useMemo(() => {
  return clientes.filter((cliente) => {
    const estadoCliente = calcularEstadoCliente(cliente);

    if (showOnlyMora) {
      const vencidas =
        cliente.facturas?.filter((f) => f.estadoPago === "vencido").length || 0;

      return vencidas === 2 && cliente.estado_pago !== "suspendido";
    }

    if (filterEstado === "sin_factura") {
      return !cliente.facturas || cliente.facturas.length === 0;
    }

    return filterEstado === "todos" || estadoCliente === filterEstado;
  });
}, [clientes, filterEstado, showOnlyMora]);

  return (
    <div className="p-6">
      {userType === "admin" && (
        <div className="mb-6">
          <DashboardStats clientes={clientes} />
        </div>
      )}

      <AlertsPanel
        moraCount={suspendidosCount}
        pendientesCount={pendientesCount}
        clientesEnMora={clientesEnMora}
        onFilterSuspendidos={handleFilterSuspendidos}
        onFilterPendientes={handleFilterPendientes}
        onFilterMora={handleFilterMora}
        onAbrirSuspension={handleAbrirSuspension}
        userType={userType}
      />

      {/* Tarjetas Principales de Control */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card
          onClick={() => setActiveCardFilter("todos")}
          className={`cursor-pointer transition-all h-full overflow-hidden ${activeCardFilter === "todos" ? "ring-2 ring-blue-500" : "hover:shadow-md"}`}
        >
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">Activos</Badge>
            </div>
            <div className="text-3xl font-bold">{estadisticas.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Total Activos</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveCardFilter("ppc")}
          className={`cursor-pointer transition-all h-full overflow-hidden ${activeCardFilter === "ppc" ? "ring-2 ring-orange-500" : "hover:shadow-md"}`}
        >
          <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-400" />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <PauseCircle className="h-5 w-5 text-orange-500" />
              <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-600 border-orange-200">PPC</Badge>
            </div>
            <div className="text-3xl font-bold text-orange-600">{estadisticas.ppc}</div>
            <p className="text-xs text-muted-foreground mt-1">Pausados</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveCardFilter("danadas")}
          className={`cursor-pointer transition-all h-full overflow-hidden ${activeCardFilter === "danadas" ? "ring-2 ring-slate-500" : "hover:shadow-md"}`}
        >
          <div className="h-1 bg-gradient-to-r from-slate-500 to-slate-400" />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <Wrench className="h-5 w-5 text-slate-500" />
              <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200">Daño</Badge>
            </div>
            <div className="text-3xl font-bold text-slate-600">{estadisticas.danadas}</div>
            <p className="text-xs text-muted-foreground mt-1">Kits en Daño</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveCardFilter("garantias")}
          className={`cursor-pointer transition-all h-full overflow-hidden ${activeCardFilter === "garantias" ? "ring-2 ring-cyan-500" : "hover:shadow-md"}`}
        >
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-cyan-400" />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <ShieldCheck className="h-5 w-5 text-cyan-500" />
              <Badge variant="outline" className="text-[10px] bg-cyan-50 text-cyan-600 border-cyan-200">Garantía</Badge>
            </div>
            <div className="text-3xl font-bold text-cyan-600">{estadisticas.garantias}</div>
            <p className="text-xs text-muted-foreground mt-1">Kits en Garantía</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">
                {activeCardFilter === "ppc"
                  ? "Soporte VIP / PPC"
                  : activeCardFilter === "danadas"
                    ? "Kits en Daño"
                    : activeCardFilter === "garantias"
                      ? "Kits en Garantía"
                      : activeCardFilter === "suspendidas"
                        ? "Clientes Suspendidos"
                        : "Control de Mensualidades"}
              </h2>
              {loadingClientes && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                >
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Cargando...
                </Badge>
              )}
              {!serverAvailable && !loadingClientes && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                >
                  💾 Offline
                </Badge>
              )}
              {serverAvailable && !loadingClientes && (
                <Badge
                  variant="outline"
                  className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                >
                  ✓ Sincronizado
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  reloadClientes();
                  toast.info("Intentando sincronizar...");
                }}
                title={
                  serverAvailable
                    ? "Sincronizar con otros usuarios"
                    : "Intentar reconectar al servidor"
                }
                disabled={loadingClientes}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loadingClientes ? "animate-spin" : ""}`}
                />
              </Button>
              {userType === "facturacion" ? (
                <div className="text-sm text-muted-foreground flex items-center">
                  Selecciona un cliente para agregar facturas
                </div>
              ) : (
                <Button onClick={() => setNuevoClienteOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Empresa
                </Button>
              )}
              {(userType === "soporte" || userType === "admin") && (
                <Button onClick={() => setImportarClientesOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Clientes
                </Button>
              )}
              <Button variant="outline" onClick={exportarExcelBackend}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Clientes
              </Button>
            </div>
          </div>

          {!serverAvailable && !loadingClientes && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💾</span>
                  <div>
                    <p className="text-yellow-900 dark:text-yellow-300">
                      Trabajando en Modo Offline
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                      No se pudo conectar al servidor de sincronización. Todos
                      los cambios se están guardando localmente y se
                      sincronizarán automáticamente cuando la conexión se
                      restablezca.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    reloadClientes();
                    toast.info("Verificando conexión...");
                  }}
                  className="border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cuenta o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estado de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="mora">Mora</SelectItem>
                <SelectItem value="suspendido">Suspendido</SelectItem>
                <SelectItem value="en_dano">En Daño</SelectItem>
                <SelectItem value="garantia">En Garantía</SelectItem>
                <SelectItem value="sin_factura">Sin Facturas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCorte} onValueChange={setFilterCorte}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Fecha de corte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las fechas</SelectItem>
                <SelectItem value="1-10">Días 1-10</SelectItem>
                <SelectItem value="11-20">Días 11-20</SelectItem>
                <SelectItem value="21-31">Días 21-31</SelectItem>
              </SelectContent>
            </Select>
            {(filterEstado !== "todos" ||
              filterCorte !== "todos" ||
              showOnlyMora) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterEstado("todos");
                    setFilterCorte("todos");
                    setShowOnlyMora(false);
                    toast.info("Filtros limpiados");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
          </div>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          {errorClientes && <p className="text-red-500 p-4">{errorClientes}</p>}
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="bg-muted/50 border-b hover:bg-muted/50">
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground">Kit</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground">Cliente</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Cuenta Starlink</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground hidden xl:table-cell">Email</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground text-center">Corte</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground text-center">Estado</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground text-center">Facturas</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Observación</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-muted-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingClientes ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-12"
                  >
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3 text-primary" />
                    <span className="text-sm">Cargando datos desde la nube...</span>
                  </TableCell>
                </TableRow>
              ) : clientes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-12"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-10 w-10 text-muted-foreground/50" />
                      <span className="text-sm">
                        {clientes.length === 0
                          ? "No hay clientes registrados. ¡Agrega el primero!"
                          : "No se encontraron clientes"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                clientesFiltrados.map((cliente) => (
                    <TableRow
                      key={cliente.kit}
                      className={`group cursor-pointer transition-all duration-200 hover:bg-muted/30 ${cliente.estado_pago === "en_dano"
                          ? "bg-red-50/70 dark:bg-red-950/20"
                          : cliente.estado_pago === "garantia"
                            ? "bg-cyan-50/70 dark:bg-cyan-950/20"
                            : cliente.estado_pago === "transferida"
                              ? "bg-indigo-50/70 dark:bg-indigo-950/20"
                              : cliente.estado_pago === "suspendido"
                                ? "bg-muted/30 dark:bg-muted/20"
                                : ""
                        }`}
                      onClick={() => handleVerDetalles(cliente)}
                    >
                      <TableCell className="px-4 py-3 font-mono font-medium">{cliente.kit}</TableCell>
                      <TableCell className="px-4 py-3 font-medium max-w-[160px]">
                        <span className="truncate block">{cliente.nombrecliente}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 hidden lg:table-cell">
                        <span className="font-mono text-muted-foreground">{cliente.cuentastarlink || cliente.cuenta_starlink || "-"}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-muted-foreground truncate block max-w-[180px]">{cliente.email || "-"}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded">Día {cliente.corte}</span>
                          <ContadorCorte
                            diaCorte={cliente.corte}
                            mostrarIcono={true}
                          />
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()} className="px-4 py-3 text-center align-middle">
                        <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                          {getEstadoBadge(calcularEstadoCliente(cliente))}

                          {/* Selector de Estado de Facturación movido aquí debajo */}
                          {userType === "facturacion" || userType === "admin" || userType === "soporte" ? (
                            <select
                              value={cliente.estado_facturacion ?? ""}
                             onChange={(e) =>
                               actualizarEstadoFacturacion(
                                    cliente.kit,
                                    e.target.value as EstadoFacturacion
                                  )
                                }
                              className={`px-2 py-1 cursor-pointer w-[85px] text-center rounded text-[10px] font-semibold border shadow-sm outline-none transition-colors
                                ${cliente.estado_facturacion === "ROC" ? "bg-purple-500 text-white border-purple-600" : ""}
                                ${cliente.estado_facturacion === "PPC" ? "bg-orange-500 text-white border-orange-600" : ""}
                                ${cliente.estado_facturacion === "facturado" ? "bg-green-500 text-white border-green-600" : ""}
                                ${!cliente.estado_facturacion ? "bg-gray-100 text-gray-500 border-gray-200" : ""}
                              `}
                            >
                              <option value="">--</option>
                              {userType === "admin" || userType === "facturacion" ? (
                                <>
                                  <option value="facturado">Facturado</option>
                                  <option value="ROC">ROC</option>
                                </>
                              ) : (
                                <>
                                  {cliente.estado_facturacion === "facturado" && <option value="facturado">Facturado</option>}
                                  {cliente.estado_facturacion === "ROC" && <option value="ROC">ROC</option>}
                                </>
                              )}
                              <option value="PPC">PPC</option>
                            </select>
                          ) : (
                            <div className="mt-1">
                              {cliente.estado_facturacion === "ROC" && (
                                <span className="px-2 py-1 rounded text-[10px] font-semibold bg-purple-500 text-white border border-purple-600">ROC</span>
                              )}
                              {cliente.estado_facturacion === "PPC" && (
                                <span className="px-2 py-1 rounded text-[10px] font-semibold bg-orange-500 text-white border border-orange-600">PPC</span>
                              )}
                              {cliente.estado_facturacion === "facturado" && (
                                <span className="px-2 py-1 rounded text-[10px] font-semibold bg-green-500 text-white border border-green-600">Facturado</span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()} className="px-4 py-3">
                        {(() => {
                          const totalFacturas = cliente.facturas?.length || 0;
                          const pagadas =
                            cliente.facturas?.filter(
                              (f) => f.estadoPago === "pagado",
                            ).length || 0;
                          const pendientes =
                            cliente.facturas?.filter(
                              (f) => f.estadoPago === "pendiente",
                            ).length || 0;
                          const vencidas =
                            cliente.facturas?.filter(
                              (f) => f.estadoPago === "vencido",
                            ).length || 0;
                          const roc =
                            cliente.facturas?.filter(
                              (f) => f.estadoPago === "roc",
                            ).length || 0;
                          const ppc =
                            cliente.facturas?.filter(
                              (f) => f.estadoPago === "ppc",
                            ).length || 0;

                          return (
                            <div className="flex flex-col gap-1.5">
                              <span className="text-xs font-medium text-muted-foreground">{totalFacturas} facturas</span>
                              <div className="flex gap-1.5 flex-wrap justify-center">
                                {pagadas > 0 && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-1.5">
                                    {pagadas} ↑
                                  </Badge>
                                )}
                                {pendientes > 0 && (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs px-1.5">
                                    {pendientes} •
                                  </Badge>
                                )}
                                {vencidas > 0 && (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs px-1.5">
                                    {vencidas} ↓
                                  </Badge>
                                )}
                                {roc > 0 && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-1.5">
                                    {roc} R
                                  </Badge>
                                )}
                                {ppc > 0 && (
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-1.5">
                                    {ppc} P
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </TableCell>

                      <TableCell
                        className="text-xs max-w-[160px] px-4 py-3 hidden lg:table-cell"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-muted-foreground line-clamp-2 text-xs">
                          {cliente.observaciones || <span className="italic opacity-50">Sin observación</span>}
                        </span>
                        {(userType === "soporte" || userType === "admin") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditarObservacion(cliente)}
                            className="h-6 w-6 p-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()} className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerHistorial(cliente)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver más
                          </Button>
                          {(userType === "facturacion" ||
                            userType === "admin") && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAgregarFactura(cliente)}
                                >
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Agregar Factura
                                </Button>
                              </>
                            )}

                          {/* Botón Suspender para Facturación (Envía alerta) */}
                          {(userType === "facturacion" || userType === "admin") &&
                            cliente.estado_pago !== "suspendido" && cliente.estado_pago !== "en_dano" &&
                            calcularEstadoCliente(cliente) === "mora" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCliente(cliente);
                                  setSuspenderClienteOpen(true);
                                }}
                                className="border-orange-300 hover:bg-orange-50 text-orange-600 hover:text-orange-700"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Solicitar Suspensión
                              </Button>
                            )}

                          {/* Botón Reactivar para Facturación (Envía alerta) */}
                          {(userType === "facturacion" || userType === "admin") &&
                            cliente.estado_pago === "suspendido" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCliente(cliente);
                                  setReactivarClienteOpen(true);
                                }}
                                className="border-green-300 hover:bg-green-50 text-green-600 hover:text-green-700"
                              >
                                <Power className="h-4 w-4 mr-2" />
                                Solicitar Reactivación
                              </Button>
                            )}

                          {/* Botón En Daño para Soporte */}
                          {(userType === "soporte" || userType === "admin") &&
                            cliente.estado_pago !== "en_dano" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  if (window.confirm("¿Confirmas marcar este cliente como EN DAÑO? El servicio se inhabilitará.")) {
                                    try {
                                      await fetch(`https://soingtel.onrender.com/api/clientes/${cliente.kit}/estado`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ estado_pago: "en_dano" }),
                                      });
                                      await reloadClientes();
                                      toast.error("Cliente marcado en daño!");
                                    } catch (e) {
                                      toast.error("Hubo un error");
                                    }
                                  }
                                }}
                                className="border-red-900 hover:bg-slate-900 hover:text-red-500 text-red-900"
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                En Daño
                              </Button>
                            )}

                          {/* Botón Garantía para Soporte */}
                          {(userType === "soporte" || userType === "admin") &&
                            cliente.estado_pago !== "garantia" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  if (window.confirm("¿Confirmas marcar este cliente EN GARANTÍA? El servicio se inhabilitará.")) {
                                    try {
                                      await fetch(`https://soingtel.onrender.com/api/clientes/${cliente.kit}/estado`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ estado_pago: "garantia" }),
                                      });
                                      await reloadClientes();
                                      toast.error("Cliente marcado en garantía!");
                                    } catch (e) {
                                      toast.error("Hubo un error");
                                    }
                                  }
                                }}
                                className="border-cyan-600 hover:bg-cyan-900 hover:text-cyan-400 text-cyan-700"
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Garantía
                              </Button>
                            )}

                          {/* Botón Transferida para Soporte */}
                          {(userType === "soporte" || userType === "admin") &&
                            cliente.estado_pago !== "transferida" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  if (window.confirm("¿Confirmas marcar este cliente como TRANSFERIDO?")) {
                                    try {
                                      await fetch(`https://soingtel.onrender.com/api/clientes/${cliente.kit}/estado`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ estado_pago: "transferida" }),
                                      });
                                      await reloadClientes();
                                      toast.success("Cliente transferido!");
                                    } catch (e) {
                                      toast.error("Hubo un error");
                                    }
                                  }
                                }}
                                className="border-indigo-600 hover:bg-indigo-900 hover:text-indigo-400 text-indigo-700"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Transferida
                              </Button>
                            )}

                          {/* Botón Editar Cliente para Soporte y Admin */}

                          {userType === "admin" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEliminarCliente(cliente)}
                              className="border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Mostrando {clientes.length} de {totalCount}
        </div>
        <div className="flex gap-2 mt-4">
          <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Anterior
          </Button>

          <span>Página {page} de {totalPages}</span>

          <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            Siguiente
          </Button>
        </div>
      </div>

      <NuevoClienteModal
        open={nuevoClienteOpen}
        onOpenChange={setNuevoClienteOpen}
        onSave={handleNuevoCliente}
      />

      <HistorialFacturasModal
        open={historialModalOpen}
        onOpenChange={setHistorialModalOpen}
        cliente={selectedCliente}
        facturas={selectedCliente?.facturas || []}
        onRegistrarPago={() => {
          setHistorialModalOpen(false);
          setRegistrarPagoOpen(true);
        }}
        onEditarFactura={handleEditarFactura}
        onEliminarFactura={handleDeleteFactura}
        userType={userType}
      />

      <EditarObservacionModal
        open={editarObservacionOpen}
        onOpenChange={setEditarObservacionOpen}
        cliente={selectedCliente}
        observacionActual={selectedCliente?.observaciones || ""}
        onSave={handleSaveObservacion}
      />

      <EditarEstadoPagoModal
        open={editarEstadoPagoOpen}
        onOpenChange={setEditarEstadoPagoOpen}
        cliente={selectedCliente}
        onSave={handleSaveEstadoPago}
      />

      <AgregarFacturaModal
        open={agregarFacturaOpen}
        onOpenChange={setAgregarFacturaOpen}
        cliente={selectedCliente}
        onSave={handleSaveFactura}
        userType={userType}
      />

      <RegistrarPagoModal
        open={registrarPagoOpen}
        onOpenChange={setRegistrarPagoOpen}
        cliente={selectedCliente}
        onSave={handleRegistrarPago}
        userType={userType}
      />

      <EliminarClienteModal
        open={eliminarClienteOpen}
        onOpenChange={setEliminarClienteOpen}
        cliente={selectedCliente}
        onConfirm={handleConfirmarEliminar}
      />

      <SuspenderClienteModal
        open={suspenderClienteOpen}
        onOpenChange={setSuspenderClienteOpen}
        cliente={selectedCliente}
        facturasVencidas={
          selectedCliente ? contarFacturasVencidas(selectedCliente) : 0
        }
        onSuspender={handleSuspenderCliente}
      />

      <ReactivarClienteModal
        open={reactivarClienteOpen}
        onOpenChange={setReactivarClienteOpen}
        cliente={selectedCliente}
        onReactivar={handleReactivarCliente}
      />

      <VerDetallesClienteModal
        open={verDetallesOpen}
        onOpenChange={setVerDetallesOpen}
        cliente={selectedCliente}
        onGuardarCliente={handleSaveClienteCompleto}
        userType={userType}
      />

      <EditarFacturaModal
        open={editarFacturaOpen}
        onOpenChange={setEditarFacturaOpen}
        cliente={selectedCliente}
        factura={selectedFactura}
        userType={userType}
        onSave={handleSaveFacturaEditada}
      />

      <ImportarClientesModal
        open={importarClientesOpen}
        onOpenChange={setImportarClientesOpen}
        onImportSuccess={handleImportarClientes}
      />
    </div>
  );
}
