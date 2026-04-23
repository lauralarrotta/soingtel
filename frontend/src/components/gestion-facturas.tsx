import { useState } from "react";
import { Search, Plus, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";

interface Cliente {
  kit: string;
  nombre: string;
  cuenta: string;
  cuentastarlink?: string;
  facturas: Factura[];
}

interface Factura {
  numero: string;
  fecha: string;
  monto: string;
  estado: "pagado" | "pendiente";
  fechaPago?: string;
  periodo?: string;
}

interface GestionFacturasProps {
  userType: string;
}

export function GestionFacturas({ userType }: GestionFacturasProps) {
  const [clientes] = useState<Cliente[]>([
    {
      kit: "KIT-1001",
      nombre: "Distribuidora El Sol S.A.",
      cuenta: "STL-45678",
      facturas: [
        {
          numero: "SOG-2024-001",
          fecha: "2024-01-05",
          monto: "1200",
          estado: "pagado",
          fechaPago: "2024-01-05",
        },
        {
          numero: "SOG-2024-002",
          fecha: "2024-02-05",
          monto: "1200",
          estado: "pagado",
          fechaPago: "2024-02-06",
        },
        {
          numero: "SOG-2024-003",
          fecha: "2024-03-05",
          monto: "1200",
          estado: "pendiente",
        },
      ],
    },
    {
      kit: "KIT-1002",
      nombre: "Transportes Rápidos Ltda.",
      cuenta: "STL-45679",
      facturas: [
        {
          numero: "SOG-2024-004",
          fecha: "2024-01-10",
          monto: "1200",
          estado: "pagado",
          fechaPago: "2024-01-10",
        },
        {
          numero: "SOG-2024-005",
          fecha: "2024-02-10",
          monto: "1200",
          estado: "pendiente",
        },
      ],
    },
    {
      kit: "KIT-1003",
      nombre: "Agrocomercial Santa Rosa",
      cuenta: "STL-45680",
      facturas: [
        {
          numero: "SOG-2024-007",
          fecha: "2024-01-15",
          monto: "1200",
          estado: "pendiente",
        },
      ],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [agregarFacturaOpen, setAgregarFacturaOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [facturasCliente, setFacturasCliente] = useState<{
    [key: string]: Factura[];
  }>({
    "KIT-1001": [
      {
        numero: "SOG-2024-001",
        fecha: "2024-01-05",
        monto: "1200",
        estado: "pagado",
        fechaPago: "2024-01-05",
      },
      {
        numero: "SOG-2024-002",
        fecha: "2024-02-05",
        monto: "1200",
        estado: "pagado",
        fechaPago: "2024-02-06",
      },
      {
        numero: "SOG-2024-003",
        fecha: "2024-03-05",
        monto: "1200",
        estado: "pendiente",
      },
    ],
    "KIT-1002": [
      {
        numero: "SOG-2024-004",
        fecha: "2024-01-10",
        monto: "1200",
        estado: "pagado",
        fechaPago: "2024-01-10",
      },
      {
        numero: "SOG-2024-005",
        fecha: "2024-02-10",
        monto: "1200",
        estado: "pendiente",
      },
    ],
    "KIT-1003": [
      {
        numero: "SOG-2024-007",
        fecha: "2024-01-15",
        monto: "1200",
        estado: "pendiente",
      },
    ],
  });

  const [nuevaFactura, setNuevaFactura] = useState({
    numero: "",
    fecha: new Date().toISOString().split("T")[0],
    monto: "1200",
  });

  const handleAgregarFactura = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setNuevaFactura({
      numero: "",
      fecha: new Date().toISOString().split("T")[0],
      monto: "1200",
    });
    setAgregarFacturaOpen(true);
  };

  const handleSubmitFactura = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCliente) return;

    const facturaConFormato: Factura = {
      numero: nuevaFactura.numero,
      fecha: nuevaFactura.fecha,
      monto: nuevaFactura.monto,
      estado: "pendiente", // Siempre pendiente por defecto
    };

    setFacturasCliente({
      ...facturasCliente,
      [selectedCliente.kit]: [
        ...(facturasCliente[selectedCliente.kit] || []),
        facturaConFormato,
      ],
    });

    toast.success(`Factura ${nuevaFactura.numero} agregada como PENDIENTE`);
    setAgregarFacturaOpen(false);
  };

  const handleCambiarEstado = (
    kit: string,
    numeroFactura: string,
    nuevoEstado: "pagado" | "pendiente",
  ) => {
    setFacturasCliente({
      ...facturasCliente,
      [kit]: facturasCliente[kit].map((f) =>
        f.numero === numeroFactura
          ? {
              ...f,
              estado: nuevoEstado,
              fechaPago:
                nuevoEstado === "pagado"
                  ? new Date().toISOString().split("T")[0]
                  : undefined,
            }
          : f,
      ),
    });
    toast.success(
      `Estado de factura ${numeroFactura} actualizado a ${nuevoEstado.toUpperCase()}`,
    );
  };

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cuenta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.kit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cuentastarlink?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pagado":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Pagado</Badge>
        );
      case "pendiente":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendiente</Badge>
        );
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const puedeModificarFacturas =
    userType === "facturacion" || userType === "admin";

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg border p-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2>Gestión de Facturas</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {puedeModificarFacturas
                  ? "Agrega y gestiona facturas SOG para cada cliente"
                  : "Visualiza las facturas de los clientes (solo lectura)"}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cuenta o kit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredClientes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron clientes
            </div>
          ) : (
            filteredClientes.map((cliente) => (
              <div key={cliente.kit} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg">{cliente.nombre}</h3>
                    <p className="text-sm text-muted-foreground">
                      Kit: {cliente.kit} | Cuenta: {cliente.cuenta}
                    </p>
                  </div>
                  {puedeModificarFacturas && (
                    <Button onClick={() => handleAgregarFactura(cliente)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Factura
                    </Button>
                  )}
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nº Factura</TableHead>
                        <TableHead>Fecha Emisión</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha de Pago</TableHead>
                        {puedeModificarFacturas && (
                          <TableHead>Acciones</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(facturasCliente[cliente.kit] || []).length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={puedeModificarFacturas ? 6 : 5}
                            className="text-center text-muted-foreground"
                          >
                            No hay facturas registradas
                          </TableCell>
                        </TableRow>
                      ) : (
                        (facturasCliente[cliente.kit] || []).map((factura) => (
                          <TableRow key={factura.numero}>
                            <TableCell>{factura.numero}</TableCell>
                            <TableCell>{factura.fecha}</TableCell>
                            <TableCell>${factura.monto}</TableCell>
                            <TableCell>
                              {getEstadoBadge(factura.estado)}
                            </TableCell>
                            <TableCell>{factura.fechaPago || "-"}</TableCell>
                            {puedeModificarFacturas && (
                              <TableCell>
                                <Select
                                  value={factura.estado}
                                  onValueChange={(
                                    value: "pagado" | "pendiente",
                                  ) =>
                                    handleCambiarEstado(
                                      cliente.kit,
                                      factura.numero,
                                      value,
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-[130px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pendiente">
                                      Pendiente
                                    </SelectItem>
                                    <SelectItem value="pagado">
                                      Pagado
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={agregarFacturaOpen} onOpenChange={setAgregarFacturaOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Factura</DialogTitle>
            <DialogDescription>
              Cliente: {selectedCliente?.nombre} | Kit: {selectedCliente?.kit}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitFactura}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="numero">Número de Factura SOG</Label>
                <Input
                  id="numero"
                  placeholder="Ej: SOG-2024-010"
                  value={nuevaFactura.numero}
                  onChange={(e) =>
                    setNuevaFactura({ ...nuevaFactura, numero: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  La factura se creará con estado PENDIENTE por defecto
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fecha">Fecha de Emisión</Label>
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
              <div className="grid gap-2">
                <Label htmlFor="monto">Monto</Label>
                <Input
                  id="monto"
                  type="number"
                  placeholder="1200"
                  value={nuevaFactura.monto}
                  onChange={(e) =>
                    setNuevaFactura({ ...nuevaFactura, monto: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAgregarFacturaOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Agregar Factura</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
