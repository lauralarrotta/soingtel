import { useState } from "react";
import { Search, RefreshCw, UserCheck, UserX } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useDatabase } from "../hooks/useDatabase";
import { toast } from "sonner";

interface Cliente {
  kit: string;
  nombre: string;
  cuenta: string;
  cuentastarlink?: string;
  email: string;
  corte: number;
  estadoPago: "confirmado" | "pendiente" | "suspendido" | "en_dano" | string;
  observaciones: string;
  costo: string;
  facturas?: any[];
}

export function ClientesStatusPanel() {
  const {
    data: clientes,
    loading,
    reload,
  } = useDatabase<Cliente[]>("clientes", []);

  const [searchTerm, setSearchTerm] = useState("");

  const activeClients = clientes.filter(
    (c) => c.estadoPago === "confirmado" || c.estadoPago === "pendiente",
  );
  const inactiveClients = clientes.filter((c) => c.estadoPago === "suspendido");

  const filterClients = (list: Cliente[]) => {
    return list.filter(
      (cliente) =>
        cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cuenta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.kit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cuentastarlink?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const filteredActive = filterClients(activeClients);
  const filteredInactive = filterClients(inactiveClients);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "confirmado":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            Activo (Al día)
          </Badge>
        );
      case "pendiente":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            Activo (Pendiente)
          </Badge>
        );
      case "suspendido":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white">
            Suspendido
          </Badge>
        );
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Estado de Clientes
          </h2>
          <p className="text-muted-foreground">
            Gestión de clientes activos e inactivos en el sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              reload();
              toast.info("Actualizando lista de clientes...");
            }}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clientes
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {activeClients.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {((activeClients.length / clientes.length) * 100).toFixed(1)}% del
              total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspendidos</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {inactiveClients.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {((inactiveClients.length / clientes.length) * 100).toFixed(1)}%
              del total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activos" className="w-full">
        <TabsList>
          <TabsTrigger value="activos" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Clientes Activos
            <Badge variant="secondary" className="ml-2">
              {activeClients.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="inactivos" className="flex items-center gap-2">
            <UserX className="h-4 w-4" />
            Clientes Inactivos
            <Badge variant="secondary" className="ml-2">
              {inactiveClients.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Listado de Clientes Activos</CardTitle>
              <CardDescription>
                Clientes con servicio habilitado (al día o pendientes de pago).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Cuenta Starlink</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última Actividad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActive.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No se encontraron clientes activos
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActive.map((cliente) => (
                      <TableRow key={cliente.kit}>
                        <TableCell className="font-medium">
                          <div>{cliente.nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            {cliente.email}
                          </div>
                        </TableCell>
                        <TableCell>{cliente.cuenta}</TableCell>
                        <TableCell>${cliente.costo}</TableCell>
                        <TableCell>
                          {getEstadoBadge(cliente.estadoPago)}
                        </TableCell>
                        <TableCell>
                          {cliente.facturas && cliente.facturas.length > 0
                            ? cliente.facturas[cliente.facturas.length - 1]
                                .fecha
                            : "Sin facturas"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactivos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Listado de Clientes Inactivos</CardTitle>
              <CardDescription>
                Clientes con servicio suspendido por falta de pago u otros
                motivos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Cuenta Starlink</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Deuda Pendiente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInactive.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No se encontraron clientes inactivos
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInactive.map((cliente) => (
                      <TableRow key={cliente.kit}>
                        <TableCell className="font-medium">
                          <div>{cliente.nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            {cliente.email}
                          </div>
                        </TableCell>
                        <TableCell>{cliente.cuenta}</TableCell>
                        <TableCell
                          className="max-w-[200px] truncate"
                          title={cliente.observaciones}
                        >
                          {cliente.observaciones || "Sin observaciones"}
                        </TableCell>
                        <TableCell>
                          {getEstadoBadge(cliente.estadoPago)}
                        </TableCell>
                        <TableCell className="text-red-600">
                          $
                          {cliente.facturas
                            ?.filter((f) => f.estadoPago === "vencido")
                            .reduce(
                              (acc, curr) => acc + parseFloat(curr.monto),
                              0,
                            ) || 0}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
