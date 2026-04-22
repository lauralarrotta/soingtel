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
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { CreditCard, AlertCircle, CheckCircle2, Receipt } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface Factura {
  numero: string;
  fecha: string;
  monto: string;
  estadoPago: "pagado" | "pendiente" | "vencido";
  metodoPago?: string;
  fechaPago?: string;
  periodo?: string;
}

interface RegistrarPagoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any;
  onSave: (kit: string, numeroFactura: string, datosPago: { fechaPago: string; metodoPago: string; periodo?: string }) => void;
  userType: string;
}

export function RegistrarPagoModal({
  open,
  onOpenChange,
  cliente,
  onSave,
  userType,
}: RegistrarPagoModalProps) {
  const [facturaSeleccionada, setFacturaSeleccionada] = useState("");
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split("T")[0]);
  const [metodoPago, setMetodoPago] = useState("Transferencia");
  const [periodo, setPeriodo] = useState("");

  // Obtener facturas pendientes y vencidas
  const facturasPendientes = cliente?.facturas?.filter(
    (f: Factura) => f.estadoPago === "pendiente" || f.estadoPago === "vencido"
  ) || [];

  useEffect(() => {
    if (open) {
      // Obtener el periodo bimestral actual
      const periodosBimestrales = ["Ene-Feb", "Ene-Feb", "Mar-Abr", "Mar-Abr", "May-Jun", "May-Jun", 
                                   "Jul-Ago", "Jul-Ago", "Sep-Oct", "Sep-Oct", "Oct-Nov", "Nov-Dic"];
      const periodoActual = periodosBimestrales[new Date().getMonth()];
      
      // Resetear valores
      setFacturaSeleccionada("");
      setFechaPago(new Date().toISOString().split("T")[0]);
      setMetodoPago("Transferencia");
      setPeriodo(periodoActual);
    }
  }, [open]);

  // Actualizar el periodo cuando se selecciona una factura
  useEffect(() => {
    if (facturaSeleccionada) {
      const factura = facturasPendientes.find((f: Factura) => f.numero === facturaSeleccionada);
      if (factura && factura.periodo) {
        setPeriodo(factura.periodo);
      }
    }
  }, [facturaSeleccionada, facturasPendientes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!facturaSeleccionada) {
      return;
    }

    onSave(cliente?.kit, facturaSeleccionada, {
      fechaPago,
      metodoPago,
      periodo,
    });
    
    onOpenChange(false);
  };

  const puedeModificar = userType === "facturacion" || userType === "admin";

  if (!puedeModificar) {
    return null;
  }

  const facturaData = facturasPendientes.find((f: Factura) => f.numero === facturaSeleccionada);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Registrar Pago
          </DialogTitle>
          <DialogDescription>
            Cliente: {cliente?.nombre} | Kit: {cliente?.kit}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {facturasPendientes.length === 0 ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Este cliente no tiene facturas pendientes. Todas las facturas están al día.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Selecciona la factura que deseas marcar como pagada y completa la información del pago.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-2">
                  <Label htmlFor="factura">Factura a Pagar *</Label>
                  <Select
                    value={facturaSeleccionada}
                    onValueChange={setFacturaSeleccionada}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una factura..." />
                    </SelectTrigger>
                    <SelectContent>
                      {facturasPendientes.map((factura: Factura) => (
                        <SelectItem key={factura.numero} value={factura.numero}>
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4" />
                            <span>{factura.numero}</span>
                            {factura.periodo && (
                              <span className="text-xs text-muted-foreground">({factura.periodo})</span>
                            )}
                            <Badge 
                              className={
                                factura.estadoPago === "vencido" 
                                  ? "bg-red-500" 
                                  : "bg-yellow-500"
                              }
                            >
                              {factura.estadoPago === "vencido" ? "Vencida" : "Pendiente"}
                            </Badge>
                            <span className="text-muted-foreground">
                              ${factura.monto}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {facturaData && (
                  <div className="bg-muted p-3 rounded-md border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Número:</span>
                      <span className="font-medium">{facturaData.numero}</span>
                    </div>
                    {facturaData.periodo && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Periodo registrado:</span>
                        <span className="font-medium">{facturaData.periodo}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Fecha emisión:</span>
                      <span className="font-medium">{facturaData.fecha}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Monto:</span>
                      <span className="font-medium text-lg">${facturaData.monto}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Estado actual:</span>
                      <Badge 
                        className={
                          facturaData.estadoPago === "vencido" 
                            ? "bg-red-500" 
                            : "bg-yellow-500"
                        }
                      >
                        {facturaData.estadoPago === "vencido" ? "Vencida" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="periodo">Periodo *</Label>
                    <Select
                      value={periodo}
                      onValueChange={setPeriodo}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar periodo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ene-Feb">Ene-Feb</SelectItem>
                        <SelectItem value="Mar-Abr">Mar-Abr</SelectItem>
                        <SelectItem value="May-Jun">May-Jun</SelectItem>
                        <SelectItem value="Jul-Ago">Jul-Ago</SelectItem>
                        <SelectItem value="Sep-Oct">Sep-Oct</SelectItem>
                        <SelectItem value="Oct-Nov">Oct-Nov</SelectItem>
                        <SelectItem value="Nov-Dic">Nov-Dic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="fechaPago">Fecha de Pago *</Label>
                    <Input
                      id="fechaPago"
                      type="date"
                      value={fechaPago}
                      onChange={(e) => setFechaPago(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="metodoPago">Método de Pago *</Label>
                  <Select
                    value={metodoPago}
                    onValueChange={setMetodoPago}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Transferencia">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Transferencia bancaria
                        </div>
                      </SelectItem>
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Zelle">Zelle</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Tarjeta">Tarjeta de crédito/débito</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Pago Móvil">Pago móvil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {facturaSeleccionada && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Confirmar:</strong> La factura {facturaSeleccionada} será marcada como <strong>PAGADA</strong> y el estado del cliente se actualizará automáticamente.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            {facturasPendientes.length > 0 && (
              <Button 
                type="submit" 
                disabled={!facturaSeleccionada}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Registrar Pago
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}