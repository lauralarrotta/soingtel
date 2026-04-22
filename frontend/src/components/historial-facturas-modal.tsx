import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CreditCard, AlertTriangle, FileText, Edit, Trash2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";

interface Factura {
  numero: string;
  fecha: string;
  valor: number;
  estadoPago: "pagado" | "pendiente" | "vencido" | "roc" | "ppc";
  metodoPago?: string;
  fechaPago?: string;
  periodo?: string;
}

interface HistorialFacturasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any;
  facturas: Factura[];
  onRegistrarPago?: () => void;
  onEditarFactura?: (factura: Factura) => void;
  onEliminarFactura?: (factura: Factura) => void;
  userType?: string;
}

export function HistorialFacturasModal({
  open,
  onOpenChange,
  cliente,
  facturas,
  onRegistrarPago,
  onEditarFactura,
  onEliminarFactura,
  userType = "soporte",
}: HistorialFacturasModalProps) {
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
      case "vencido":
        return <Badge className="bg-red-500 hover:bg-red-600">Vencido</Badge>;
      case "roc":
        return <Badge className="bg-purple-500 hover:bg-purple-600 uppercase">ROC</Badge>;
      case "ppc":
        return <Badge className="bg-orange-500 hover:bg-orange-600 uppercase">PPC</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const facturasPagadas = facturas.filter((f) => f.estadoPago === "pagado");
  const facturasPendientes = facturas.filter(
    (f) => f.estadoPago === "pendiente",
  );
  const facturasVencidas = facturas.filter((f) => f.estadoPago === "vencido");

  // Estadísticas adicionales
  const tasaPago =
    facturas.length > 0
      ? ((facturasPagadas.length / facturas.length) * 100).toFixed(1)
      : "0";

  // Último pago
  const ultimoPago =
    facturasPagadas.length > 0
      ? facturasPagadas.sort(
          (a, b) =>
            new Date(b.fechaPago || "").getTime() -
            new Date(a.fechaPago || "").getTime(),
        )[0]
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Facturas
          </DialogTitle>
          <DialogDescription className="text-sm">
            Detalle completo de facturas del cliente
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3 py-3 px-4 bg-slate-50 rounded-md border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{cliente?.nombre}</span>
            <Badge variant="outline" className="text-xs">
              {cliente?.cuenta}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {cliente?.kit}
            </Badge>
          </div>

          {(userType === "facturacion" || userType === "admin") &&
            (facturasPendientes.length > 0 || facturasVencidas.length > 0) &&
            onRegistrarPago && (
              <Button
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onRegistrarPago();
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Registrar Pago
              </Button>
            )}
        </div>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-4">
            {/* Métricas de Análisis de Rendimiento */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Análisis de Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        Tasa de pago
                      </p>
                      <p className="font-medium">{tasaPago}%</p>
                    </div>
                    <Progress value={parseFloat(tasaPago)} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Total facturas
                      </p>
                      <p className="text-xl">{facturas.length}</p>
                    </div>
                  </div>

                  {ultimoPago && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">
                        Último pago registrado
                      </p>
                      <div className="bg-secondary p-3 rounded-md border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {ultimoPago.numero}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {ultimoPago.fechaPago}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Alertas si hay facturas vencidas */}
            {facturasVencidas.length >= 2 && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <strong>Atención:</strong> Cliente en mora con{" "}
                  {facturasVencidas.length} facturas vencidas.
                  {facturasVencidas.length === 2 && (
                    <span className="block mt-1 text-sm">
                      Pendiente de suspensión del servicio.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Tabla de facturas */}
            <div>
              <h3 className="text-sm mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Detalle de Facturas ({facturas.length})
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Factura</TableHead>
                      <TableHead>Periodo</TableHead>
                      <TableHead>Fecha Emisión</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facturas.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground h-32"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8 opacity-50" />
                            <p>No hay facturas registradas</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      facturas
                        .sort((a, b) => {
                          const dateDiff = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
                          if (dateDiff === 0) {
                            const getPeriodValue = (p?: string) => {
                              if (!p) return 0;
                              const mes = p.split("-")[0].substring(0, 3).toLowerCase();
                              const meses: Record<string, number> = {
                                ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6,
                                jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12
                              };
                              return meses[mes] || 0;
                            };
                            return getPeriodValue(b.periodo) - getPeriodValue(a.periodo);
                          }
                          return dateDiff;
                        })
                        .map((factura) => (
                          <TableRow
                            key={factura.numero}
                            className={
                              factura.estadoPago === "vencido"
                                ? "bg-red-50"
                                : factura.estadoPago === "pendiente"
                                  ? "bg-yellow-50"
                                  : factura.estadoPago === "pagado"
                                    ? "bg-green-50"
                                    : factura.estadoPago === "roc"
                                      ? "bg-purple-50"
                                      : factura.estadoPago === "ppc"
                                        ? "bg-orange-50"
                                        : ""
                            }
                          >
                            <TableCell className="font-medium">
                              {factura.numero}
                            </TableCell>
                            <TableCell>{factura.periodo ? factura.periodo.toUpperCase() : "-"}</TableCell>
                            <TableCell>{factura.fecha}</TableCell>
                            <TableCell>
                              {getEstadoBadge(factura.estadoPago)}
                            </TableCell>
                            {(userType === "facturacion" ||
                              userType === "admin") &&
                              onEditarFactura && (
                                <TableCell className="text-center">
                                  <div className="flex gap-2 justify-center">
                                    <Button
                                      size="icon"
                                      onClick={() => onEditarFactura(factura)}
                                      className="bg-blue-600 hover:bg-blue-700"
                                      title="Editar factura"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    {userType === "admin" && onEliminarFactura && (
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => {
                                          if (window.confirm(`¿Estás seguro de eliminar la factura ${factura.numero}?`)) {
                                            onEliminarFactura(factura);
                                          }
                                        }}
                                        className="border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700"
                                        title="Eliminar factura"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              )}
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
