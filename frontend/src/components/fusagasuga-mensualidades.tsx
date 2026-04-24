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
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { NuevoClienteModal } from "./nuevo-cliente-modal";
import { HistorialFacturasModal } from "./historial-facturas-modal";
import { EditarObservacionModal } from "./editar-observacion-modal";
import { EditarEstadoPagoModal } from "./editar-estado-pago-modal";
import { AgregarFacturaModal } from "./agregar-factura-modal";
import { RegistrarPagoModal } from "./registrar-pago-modal";
import { EliminarClienteModal } from "./eliminar-cliente-modal";
import { SuspenderClienteModal } from "./suspender-cliente-modal";
import { ReactivarClienteModal } from "./reactivar-cliente-modal";
import { VerDetallesClienteModal } from "./ver-detalles-cliente-modal";
import { EditarFacturaModal } from "./editar-factura-modal";
import { ImportarClientesModal } from "./importar-clientes-modal";
import { AlertsPanel } from "./alerts-panel";
import { DashboardStats } from "./dashboard-stats";
import { ContadorCorte } from "./contador-corte";
import { toast } from "sonner";
import { useDatabase } from "../hooks/useDatabase";
import { fusagasugaService } from "@/services/fusagasugaService";
import { alertasService } from "@/services/alertasService";
import { facturasService } from "@/services/facturasService";
import { API_CONFIG } from "@/config";
import { EstadoFacturacion, Factura, Cliente } from "@/types/cliente";

interface FusagasugaMensualidadesProps {
  userType?: string;
  clienteParaFacturar?: any;
  onFacturaAgregada?: () => void;
}

export function FusagasugaMensualidades({
  userType = "soporte",
  clienteParaFacturar,
  onFacturaAgregada,
}: FusagasugaMensualidadesProps) {

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

  const cargarEstadisticas = async () => {
    try {
      const data = await fusagasugaService.estadisticas();
      setEstadisticas(data);
    } catch { }
  };

  // 👇 AHORA ya no hay error
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
    "clientes_fusagasuga",
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
    window.addEventListener('soingtel_reload_clientes_fusagasuga', handleReload);
    return () => window.removeEventListener('soingtel_reload_clientes_fusagasuga', handleReload);
  }, [reloadClientes]);



  const calcularEstadoCliente = (cliente: Cliente) => {
    if (cliente.estado_pago === "suspendido") return "suspendido";
    if (cliente.estado_pago === "en_dano") return "en_dano";
    if (cliente.estado_pago === "garantia") return "garantia";
    if (cliente.estado_pago === "ROC") return "ROC";
    if (cliente.estado_pago === "ppc") return "ppc";

    if (!cliente.facturas || cliente.facturas.length === 0) {
      return "pendiente";
    }

    const pendientes = cliente.facturas.filter(
      (f) => f.estadoPago === "pendiente" || f.estadoPago === "vencido"
    ).length;

    if (pendientes >= 2) return "mora";
    if (pendientes === 1) return "pendiente";
    return "confirmado";
  };
  const crearCliente = async (cliente: Cliente) => {
    const payload = {
      ...cliente
    };

    const data = await fusagasugaService.crear(payload);
    await reloadClientes(); // 🔥 sincroniza con servidor
  };

  const exportarExcelBackend = async () => {
    try {
      const data = await fusagasugaService.exportar(clientes);

      if (data.url) {
        window.open(data.url, "_blank");
      }

      toast.success("Excel generado correctamente");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  ;


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
          await alertasService.crearFacturacion({
            kit: cliente.kit,
            nombre: cliente.nombrecliente,
            cuenta: cliente.cuenta,
            email: cliente.email,
            sede: "fusagasuga",
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
      console.log("CLIENTES ENVIADOS AL BACKEND:", clientesImportados);

      const response = await fusagasugaService.importar(clientesImportados, userType || "soporte");

      console.log("STATUS RESPUESTA:", response.status);

      const data = await response.json();

      console.log("RESPUESTA DEL BACKEND:", data);
    } catch (error) {
      console.error("ERROR IMPORTANDO CLIENTES:", error);
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
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/clientes_fusagasuga/${kit}/facturas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(factura),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error agregando factura");
      }

      const data = await response.json();

      // 🔥 actualizar cliente en memoria sin recargar
      setClientes((prev) =>
        prev.map((c) =>
          c.kit === kit
            ? {
              ...c,
              estado_facturacion:
                data.estado_facturacion ?? c.estado_facturacion,
              facturas: [...(c.facturas || []), data.factura],
            }
            : c,
        ),
      );

      toast.success(
        `Factura ${factura.numero} agregada como ${factura.estadoPago.toUpperCase()}`,
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
    facturaEditada: Factura,
  ) => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/clientes_fusagasuga/${kit}/facturas/${numeroOriginal}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(facturaEditada),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error actualizando factura");
    }

    await reloadClientes();

    toast.success("Factura actualizada correctamente");
  };

  const handleDeleteFactura = async (factura: Factura) => {
    if (!selectedCliente) return;

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/clientes_fusagasuga/${selectedCliente.kit}/facturas/${factura.numero}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error eliminando factura");
      }

      await reloadClientes();
      toast.success("Factura eliminada correctamente");

      // Close the modal to refresh data or could just update selectedCliente
      setHistorialModalOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const handleRegistrarPago = async (
    kit: string,
    numeroFactura: string,
    datosPago: { fechaPago: string; metodoPago: string; periodo?: string },
  ) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/clientes_fusagasuga/${kit}/facturas/${numeroFactura}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosPago),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error registrando pago");
      }

      await reloadClientes();

      toast.success(`Pago registrado para ${numeroFactura}`, {
        description: `Método: ${datosPago.metodoPago}`,
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSaveObservacion = async (kit: string, observacion: string) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/clientes_fusagasuga/${kit}/observacion`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ observacion }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error actualizando observación");
      }

      await reloadClientes();
      toast.success("Observación actualizada");
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const handleEditarEstadoPago = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setEditarEstadoPagoOpen(true);
  };

  const handleSaveEstadoPago = async (
    kit: string,
    nuevoEstado: "confirmado" | "pendiente" | "suspendido" | "en_dano" | string,
  ) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/clientes_fusagasuga/${kit}/estado`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado_pago: nuevoEstado }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error actualizando estado");
      }

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
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/clientes_fusagasuga/${selectedCliente.kit}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error eliminando cliente");
      }

      await reloadClientes();

      toast.success(
        `Cliente ${selectedCliente.nombrecliente} eliminado correctamente`,
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
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/clientes_fusagasuga/${kitOriginal}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosActualizados),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error actualizando cliente");
      }

      const clienteActualizado = await response.json();

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
        await alertasService.crearSuspension({
          kit: selectedCliente.kit,
          nombre: selectedCliente.nombrecliente || (selectedCliente as any).nombre_cliente,
          cuenta: selectedCliente.cuenta,
          email: selectedCliente.email,
          motivo,
          facturasVencidas: contarFacturasVencidas(selectedCliente),
          sede: "fusagasuga",
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
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/clientes_fusagasuga/${kit}/facturacion`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estado_facturacion: estado,
            rol: "facturacion",
          }),
        },
      );

      if (!res.ok) throw new Error("Error actualizando estado");

      // 🔥 ACTUALIZA UI INMEDIATO SIN REFRESH
      setClientes((prev) =>
        prev.map((c) =>
          c.kit === kit ? { ...c, estado_facturacion: estado } : c,
        ),
      );
    } catch (error) {
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
      await alertasService.crearReactivacion({
        kit: cliente.kit,
        nombre: cliente.nombrecliente,
        cuenta: cliente.cuenta,
        email: cliente.email,
        ultimoPago: ultimaFactura?.fechaPago || ultimaFactura?.fecha || "N/A",
        metodoPago: ultimaFactura?.metodoPago || "No especificado",
        sede: "fusagasuga",
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
      case "transferida":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
            Transferida
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
          className={`cursor-pointer transition-all h-full overflow-hidden ${activeCardFilter === "todos" ? "ring-2 ring-cyan-500" : "hover:shadow-md"}`}
        >
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-cyan-400" />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-5 w-5 text-cyan-500" />
              <Badge variant="outline" className="text-[10px] bg-cyan-50 text-cyan-600 border-cyan-200">Activos</Badge>
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
              <Wrench className="h-5 w-5 text-orange-500" />
              <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-600 border-orange-200">Daño</Badge>
            </div>
            <div className="text-3xl font-bold text-orange-600">{estadisticas.danadas}</div>
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

      <div className="backdrop-blur-xl rounded-xl border border-cyan-500/20 shadow-xl shadow-cyan-500/5 overflow-hidden">
        <div className="p-6 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-cyan-600 dark:text-white">
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
                  className="bg-cyan-50/50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-200/50 dark:border-cyan-500/30"
                >
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Cargando...
                </Badge>
              )}
              {!serverAvailable && !loadingClientes && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50/50 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 border-yellow-200/50 dark:border-yellow-500/30"
                >
                  💾 Modo Offline
                </Badge>
              )}
              {serverAvailable && !loadingClientes && (
                <Badge
                  variant="outline"
                  className="bg-green-50/50 dark:bg-green-500/20 text-green-600 dark:text-green-300 border-green-200/50 dark:border-green-500/30"
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

          <div className="bg-gradient-to-r from-cyan-50/80 to-blue-50/80 dark:from-[#0F2744]/80 dark:to-[#0A1628]/80 rounded-xl p-4 mb-6 border border-cyan-100/50 dark:border-cyan-500/20">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <Input
                  placeholder="Buscar por nombre, cuenta o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-[#0A1628]/80 border-cyan-200/50 dark:border-cyan-500/30 focus:border-cyan-500 focus:ring-cyan-500/20"
                />
              </div>

              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-full md:w-[200px] bg-white/80 dark:bg-[#0A1628]/80 border-cyan-200/50 dark:border-cyan-500/30 focus:ring-cyan-500/20">
                  <SelectValue placeholder="Estado de pago" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0A1628] border-cyan-200/50 dark:border-cyan-500/30">
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
                <SelectTrigger className="w-full md:w-[200px] bg-white/80 dark:bg-[#0A1628]/80 border-cyan-200/50 dark:border-cyan-500/30 focus:ring-cyan-500/20">
                  <SelectValue placeholder="Fecha de corte" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0A1628] border-cyan-200/50 dark:border-cyan-500/30">
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
                    className="bg-white/80 dark:bg-[#0A1628]/80 border-cyan-200/50 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white dark:bg-[#0A1628]/60 overflow-hidden shadow-sm">
          {errorClientes && <p className="text-red-500 p-4">{errorClientes}</p>}
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="bg-cyan-50/50 dark:bg-[#0F2744]/50 border-b">
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
                    className="text-center text-muted-foreground py-8"
                  >
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Cargando datos desde la nube...
                  </TableCell>
                </TableRow>
              ) : clientes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-8"
                  >
                    {clientes.length === 0
                      ? "No hay clientes registrados. Agrega el primero!"
                      : "No se encontraron clientes"}
                  </TableCell>
                </TableRow>
              ) : (

                clientes
                  .filter((cliente) => {
                    if (filterEstado === "sin_factura") {
                      return !cliente.facturas || cliente.facturas.length === 0;
                    }
                    const estadoCliente = calcularEstadoCliente(cliente);
                    return filterEstado === "todos" || estadoCliente === filterEstado;
                  }).map((cliente) => (
                    <TableRow
                      key={cliente.kit}
                      className={`cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors ${cliente.estado_pago === "en_dano"
                          ? "bg-red-50 dark:bg-red-950/20"
                          : cliente.estado_pago === "garantia"
                            ? "bg-cyan-50 dark:bg-cyan-950/20"
                            : cliente.estado_pago === "suspendido"
                              ? "bg-cyan-50/30 dark:bg-cyan-500/10"
                              : ""
                        }`}
                      onClick={() => handleVerDetalles(cliente)}
                    >
                      <TableCell className="whitespace-normal px-2 font-medium">{cliente.kit}</TableCell>
                      <TableCell className="whitespace-normal px-2 max-w-[120px] break-words">{cliente.nombrecliente}</TableCell>
                      <TableCell className="whitespace-normal px-2 break-all">{cliente.cuentastarlink || cliente.cuenta_starlink || "-"}</TableCell>
                      <TableCell className="whitespace-normal px-2 hidden md:table-cell break-all max-w-[150px]">{cliente.email}</TableCell>
                      <TableCell className="whitespace-normal px-2">
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-xs text-center font-bold">Día {cliente.corte}</span>
                          <ContadorCorte
                            diaCorte={cliente.corte}
                            mostrarIcono={true}
                          />
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()} className="px-2 text-center align-middle">
                        <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                          {getEstadoBadge(calcularEstadoCliente(cliente))}

                          {/* Selector de Estado de Facturación movido aquí debajo */}
                          {userType === "facturacion" || userType === "admin" ? (
                            <select
                              value={cliente.estado_facturacion ?? ""}
                              onChange={(e) =>
                                actualizarEstadoFacturacion(
                                  cliente.kit,
                                  (e.target.value || null) as EstadoFacturacion,
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
                              <option value="facturado">Facturado</option>
                              <option value="ROC">ROC</option>
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
                      <TableCell onClick={(e) => e.stopPropagation()} className="px-2">
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
                            <div className="flex flex-col gap-1">
                              <div className="text-sm">{totalFacturas} total</div>
                              <div className="flex gap-1 flex-wrap">
                                {pagadas > 0 && (
                                  <Badge className="bg-green-500 hover:bg-green-600 text-xs px-1 py-0" title="Pagadas">
                                    {pagadas}
                                  </Badge>
                                )}
                                {pendientes > 0 && (
                                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs px-1 py-0" title="Pendientes">
                                    {pendientes}
                                  </Badge>
                                )}
                                {vencidas > 0 && (
                                  <Badge className="bg-red-500 hover:bg-red-600 text-xs px-1 py-0" title="Vencidas">
                                    {vencidas}
                                  </Badge>
                                )}
                                {roc > 0 && (
                                  <Badge className="bg-purple-500 hover:bg-purple-600 text-xs px-1 py-0" title="ROC">
                                    {roc}
                                  </Badge>
                                )}
                                {ppc > 0 && (
                                  <Badge className="bg-orange-500 hover:bg-orange-600 text-xs px-1 py-0" title="PPC">
                                    {ppc}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </TableCell>

                      <TableCell
                        className="text-xs max-w-[150px] whitespace-normal px-2 hidden md:table-cell"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-start gap-1">
                          <span className="text-muted-foreground flex-1 line-clamp-2 text-xs">
                            {cliente.observaciones || "-"}
                          </span>
                          {(userType === "soporte" || userType === "admin") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditarObservacion(cliente)}
                              className="h-6 w-6 p-0 flex-shrink-0"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()} className="px-2">
                        <div className="flex flex-col gap-1 max-w-[120px]">
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
                                      await fusagasugaService.actualizarEstado(cliente.kit, "en_dano");
                                      await reloadClientes();
                                      toast.error("Cliente marcado en daño!");
                                    } catch (e) {
                                      toast.error("Hubo un error");
                                    }
                                  }
                                }}
                                className="border-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 text-red-600"
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
                                      await fusagasugaService.actualizarEstado(cliente.kit, "garantia");
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

                          {/* Botón Transferida */}
                          {(userType === "soporte" || userType === "admin") &&
                            cliente.estado_pago !== "transferida" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  if (window.confirm("¿Confirmas marcar este cliente como TRANSFERIDA?")) {
                                    try {
                                      await fusagasugaService.actualizarEstado(cliente.kit, "transferida");
                                      await reloadClientes();
                                      toast.success("Cliente marcado como transferida!");
                                    } catch (e) {
                                      toast.error("Hubo un error");
                                    }
                                  }
                                }}
                                className="border-blue-600 hover:bg-blue-50 text-blue-700 hover:text-blue-800"
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
