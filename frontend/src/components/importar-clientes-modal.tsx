import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { GuiaImportacionAyuda } from "./guia-importacion-ayuda";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ImportarClientesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (clientes: any[]) => void;
}

interface ErrorImportacion {
  fila: number;
  campo: string;
  mensaje: string;
}

// Períodos bimestrales para el sistema
const PERIODOS_BIMESTRALES = [
  "ENE-FEB",
  "FEB-MAR",
  "MAR-ABR",
  "ABR-MAY",
  "MAY-JUN",
  "JUN-JUL",
  "JUL-AGO",
  "AGO-SEP",
  "SEP-OCT",
  "OCT-NOV",
  "NOV-DIC",
  "DIC-ENE",
];

const MAPEO_CAMPOS: Record<string, string> = {
  KIT: "kit",
  CLIENTE: "nombre_cliente",
  CUENTA_STARLINK: "cuenta_starlink",
  COORDENADAS: "coordenadas",
  CORTE: "corte",
  EMAIL: "email",
  CONTRASEÑA: "contrasena",
  OBSERVACION: "observacion",
  CUENTA: "cuenta",
  COSTO_PLAN: "costo_plan",
  VALOR_A_FACTURAR: "valor_factura",
  VALOR_SOPORTE: "valor_soporte",
  CORTE_FACTURACION: "corte_facturacion",
  TIPO_DE_SOPORTE: "tipo_soporte",
  FECHA_DE_ACTIVACION: "fecha_activacion",
};

export function ImportarClientesModal({
  open,
  onOpenChange,
  onImportSuccess,
}: ImportarClientesModalProps) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [importando, setImportando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [errores, setErrores] = useState<ErrorImportacion[]>([]);
  const [clientesValidos, setClientesValidos] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const camposRequeridos = [
    { nombre: "KIT", ejemplo: "NTS26228772" },
    { nombre: "CLIENTE", ejemplo: "YUMA COLOMBIA S.A" },
    { nombre: "CUENTA_STARLINK", ejemplo: "YUMA COLOMBIA" },
    { nombre: "COORDENADAS", ejemplo: "3.8616,-76.5862" },
    { nombre: "CORTE", ejemplo: "1" },
    { nombre: "EMAIL", ejemplo: "empresa@ejemplo.com" },
    { nombre: "CONTRASEÑA", ejemplo: "Tinfas024*" },
    { nombre: "OBSERVACION", ejemplo: "ok" },
    { nombre: "CUENTA", ejemplo: "5429" },
    { nombre: "COSTO_PLAN", ejemplo: "$472,800" },
    { nombre: "VALOR_A_FACTURAR", ejemplo: "$472,800" },
    { nombre: "VALOR_SOPORTE", ejemplo: "N/A" },
    { nombre: "CORTE_FACTURACION", ejemplo: "1ER" },
    { nombre: "TIPO_DE_SOPORTE", ejemplo: "N/A" },
    { nombre: "FECHA_DE_ACTIVACION", ejemplo: "25/10/2025" },
  ];

  const descargarPlantilla = () => {
    // Crear datos de ejemplo para Excel con todos los campos y períodos
    const datosEjemplo = [
      {
        KIT: "NTS26228772",
        CLIENTE: "YUMA COLOMBIA S.A",
        CUENTA_STARLINK: "YUMA COLOMBIA",
        COORDENADAS: "3.8616,-76.5862",
        CORTE: "1",
        EMAIL: "empresa@ejemplo.com",
        CONTRASEÑA: "Tinfas024*",
        OBSERVACION: "Cliente activo - Antena instalada",
        CUENTA: "5429",
        COSTO_PLAN: "$472,800",
        VALOR_A_FACTURAR: "$472,800",
        VALOR_SOPORTE: "0",
        TIPO_DE_SOPORTE: "0",
        CORTE_FACTURACION: "1ER",
        FECHA_DE_ACTIVACION: "25/10/2025",
        "ENE-FEB": "FVE268",
        "FEB-MAR": "FVE269",
        "MAR-ABR": "FVE322",
        "ABR-MAY": "FVE562",
        "MAY-JUN": "FVE563",
        "JUN-JUL": "FVE564",
        "JUL-AGO": "FVE811",
        "AGO-SEP": "FVE943",
        "SEP-OCT": "FVE1074",
      },
    ];

    // Crear libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosEjemplo);

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 15 }, // KIT
      { wch: 30 }, // CLIENTE
      { wch: 20 }, // CUENTA_STARLINK
      { wch: 20 }, // COORDENADAS
      { wch: 8 }, // CORTE
      { wch: 25 }, // EMAIL
      { wch: 15 }, // CONTRASEÑA
      { wch: 35 }, // OBSERVACION
      { wch: 15 }, // ESTADO
      { wch: 12 }, // CUENTA
      { wch: 18 }, // VALOR_A_FACTURAR
      { wch: 15 }, // VALOR_SOPORTE
      { wch: 18 }, // CORTE_FACTURACION
      { wch: 18 }, // FECHA_DE_ACTIVACION
      ...PERIODOS_BIMESTRALES.map(() => ({ wch: 12 })), // Períodos bimestrales
    ];
    worksheet["!cols"] = columnWidths;

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes Soingtel");

    // Descargar archivo Excel
    const nombreArchivo = `soingtel_plantilla_clientes_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);

    toast.success("Plantilla descargada exitosamente", {
      description:
        "Completa el archivo Excel y súbelo para importar los clientes",
    });
  };

  const normalizarFila = (fila: any) => {
    const nueva: any = {};

    Object.keys(fila).forEach((key) => {
      nueva[key.trim().toUpperCase()] = fila[key];
    });

    return nueva;
  };

  const mapearCliente = (fila: any) => {
    const clienteMapeado: any = {};

    Object.keys(MAPEO_CAMPOS).forEach((columnaExcel) => {
      const campoBackend = MAPEO_CAMPOS[columnaExcel];

      clienteMapeado[campoBackend] =
        fila[columnaExcel]?.toString().trim() || "";
    });

    return clienteMapeado;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar que sea Excel
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!["xlsx", "xls"].includes(extension || "")) {
        toast.error("Formato no válido", {
          description: "Por favor sube un archivo Excel (.xlsx o .xls)",
        });
        return;
      }
      setArchivo(file);
      setErrores([]);
      setClientesValidos([]);
      toast.info(`Archivo seleccionado: ${file.name}`);
    }
  };

  const limpiarValor = (valor: any): string => {
    if (!valor) return "";
    return String(valor).replace(/[$,]/g, "").trim();
  };

  const validarCliente = (cliente: any, fila: number): ErrorImportacion[] => {
    const erroresCliente: ErrorImportacion[] = [];

    camposRequeridos.forEach((campo) => {
      const valor = cliente[campo.nombre];

      if (!valor || !valor.toString().trim()) {
        erroresCliente.push({
          fila,
          campo: campo.nombre,
          mensaje: "Campo requerido",
        });
      }
    });

    if (cliente.EMAIL) {
      const email = cliente.EMAIL.toString().trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        erroresCliente.push({
          fila,
          campo: "EMAIL",
          mensaje: "Formato de email inválido",
        });
      }
    }

    return erroresCliente;
  };
  const procesarExcel = (data: ArrayBuffer) => {
    try {
      // Leer archivo Excel
      const workbook = XLSX.read(data, { type: "array" });

      // Obtener la primera hoja
      const nombrePrimeraHoja = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[nombrePrimeraHoja];

      // Convertir a JSON
      const datosJson: any[] = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: "",
      });
      console.log("DATOS DEL EXCEL:", datosJson);

      if (datosJson.length === 0) {
        toast.error("Archivo vacío", {
          description: "El archivo no contiene datos para importar",
        });
        return;
      }

      const clientesProcesados: any[] = [];
      const erroresEncontrados: ErrorImportacion[] = [];

      // Procesar cada fila
      datosJson.forEach((filaOriginal, index) => {
        console.log("FILA ORIGINAL:", filaOriginal);
        const fila = normalizarFila(filaOriginal);
        console.log("FILA NORMALIZADA:", fila);
        if (!fila.KIT && !fila.CLIENTE && !fila.CUENTA_STARLINK) return;

        const erroresCliente = validarCliente(fila, index + 2);
        console.log("ERRORES VALIDACION:", erroresCliente);

        if (erroresCliente.length > 0) {
          erroresEncontrados.push(...erroresCliente);
        } else {
          const facturas: any[] = [];

          PERIODOS_BIMESTRALES.forEach((periodo) => {
            const numeroFactura = fila[periodo];

            // 🔥 CLAVE: buscar columna de estado
            const columnas = Object.keys(fila);
            const indexCol = columnas.indexOf(periodo);
            const estadoCol = columnas[indexCol + 1]; // la siguiente columna

            const estadoExcel = fila[estadoCol];

            if (
              numeroFactura &&
              numeroFactura.toString().trim() !== "" &&
              numeroFactura.toString().toUpperCase() !== "N/A"
            ) {
              const estadoExcelLower = estadoExcel
                ? estadoExcel.toString().toLowerCase()
                : "";
                
              let estadoFinal = "pendiente";
              if (estadoExcelLower.includes("pagado")) estadoFinal = "pagado";
              else if (estadoExcelLower.includes("roc")) estadoFinal = "roc";
              else if (estadoExcelLower.includes("ppc")) estadoFinal = "ppc";

              facturas.push({
                numero: numeroFactura.toString().trim(),
                periodo: periodo,
                fecha: new Date().toISOString().split("T")[0],
                monto:
                  limpiarValor(fila.VALOR_A_FACTURAR) ||
                  limpiarValor(fila.COSTO_PLAN) ||
                  "0",

                estadoPago: estadoFinal,

                metodoPago: estadoFinal === "pagado" ? "Transferencia" : null,
                fechaPago:
                  estadoFinal === "pagado"
                    ? new Date().toISOString().split("T")[0]
                    : null,
              });
            }
          });

          const clienteMapeado = mapearCliente(fila);
          
          let estadoGeneral = clienteMapeado.estado_pago || "pendiente";
          
          if (facturas.some(f => f.estadoPago === "ppc")) estadoGeneral = "ppc";
          if (facturas.some(f => f.estadoPago === "roc")) estadoGeneral = "roc";
          
          clienteMapeado.estado_pago = estadoGeneral;

          console.log("CLIENTE MAPEADO:", clienteMapeado);

          clientesProcesados.push({
            ...clienteMapeado,
            facturas: facturas,
          });
        }
      });

      console.log("CLIENTES PROCESADOS:", clientesProcesados);
      console.log("ERRORES ENCONTRADOS:", erroresEncontrados);

      setErrores(erroresEncontrados);
      setClientesValidos(clientesProcesados);

      if (erroresEncontrados.length === 0 && clientesProcesados.length > 0) {
        const totalFacturas = clientesProcesados.reduce(
          (sum, c) => sum + (c.facturas?.length || 0),
          0,
        );
        toast.success("Validación exitosa", {
          description: `${clientesProcesados.length} cliente(s) y ${totalFacturas} factura(s) listas para importar`,
        });
      } else if (
        erroresEncontrados.length > 0 &&
        clientesProcesados.length > 0
      ) {
        toast.warning("Validación con errores", {
          description: `${clientesProcesados.length} válidos, ${erroresEncontrados.length} errores encontrados`,
        });
      } else {
        toast.error("Validación fallida", {
          description: `Se encontraron ${erroresEncontrados.length} errores. Corrige el archivo e intenta nuevamente.`,
        });
      }
    } catch (error) {
      console.error("Error procesando Excel:", error);
      toast.error("Error al procesar el archivo", {
        description: "Asegúrate de que el archivo tenga el formato correcto",
      });
    }
  };

  const handleProcesarArchivo = () => {
    if (!archivo) {
      toast.error("No hay archivo seleccionado");
      return;
    }

    setImportando(true);
    setProgreso(10);

    const reader = new FileReader();

    reader.onload = (e) => {
      setProgreso(50);
      const data = e.target?.result as ArrayBuffer;

      setTimeout(() => {
        procesarExcel(data);
        setProgreso(100);
        setImportando(false);
      }, 500);
    };

    reader.onerror = () => {
      toast.error("Error al leer el archivo");
      setImportando(false);
    };

    reader.readAsArrayBuffer(archivo);
  };

  const handleImportar = () => {
    if (clientesValidos.length === 0) {
      toast.error("No hay clientes válidos para importar");
      return;
    }

    if (errores.length > 0) {
      toast.warning(
        "Hay errores en algunos registros. Solo se importarán los válidos.",
      );
    }

    onImportSuccess(clientesValidos);

    // Limpiar estado
    setArchivo(null);
    setErrores([]);
    setClientesValidos([]);
    setProgreso(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onOpenChange(false);
  };

  const handleCancelar = () => {
    setArchivo(null);
    setErrores([]);
    setClientesValidos([]);
    setProgreso(0);
    setImportando(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancelar}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Importar Clientes desde Excel - Soingtel
          </DialogTitle>
          <DialogDescription>
            Descarga la plantilla Excel, complétala con los datos de tus
            clientes incluyendo los períodos bimestrales de facturación.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="importar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="importar">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </TabsTrigger>
            <TabsTrigger value="ayuda">
              <HelpCircle className="w-4 h-4 mr-2" />
              Guía y Ayuda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="importar" className="space-y-6 py-4">
            {/* Paso 1: Descargar plantilla */}
            <div className="border border-primary/20 rounded-lg p-6 space-y-4 bg-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary">
                      1
                    </span>
                    <span className="font-semibold">
                      Descargar plantilla Excel
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground ml-10">
                    Descarga el archivo Excel con la estructura completa
                    incluyendo campos de información y períodos bimestrales
                  </p>
                </div>
                <Button
                  onClick={descargarPlantilla}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar plantilla
                </Button>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 ml-10 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium">La plantilla incluye:</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div>
                    <p className="font-medium text-foreground mb-1">
                      📋 Información del cliente:
                    </p>
                    <ul className="space-y-0.5 text-muted-foreground ml-4">
                      {camposRequeridos.map((campo) => (
                        <li key={campo.nombre}>• {campo.nombre}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">
                      📅 Períodos bimestrales:
                    </p>
                    <ul className="space-y-0.5 text-muted-foreground ml-4">
                      {PERIODOS_BIMESTRALES.slice(0, 6).map((periodo) => (
                        <li key={periodo}>• {periodo}</li>
                      ))}
                      <li className="text-xs italic">... y 6 períodos más</li>
                    </ul>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Tip:</strong> En las columnas de períodos,
                    ingresa el número de factura (ej: FVE268) o deja en blanco /
                    N/A si no aplica
                  </p>
                </div>
              </div>
            </div>

            {/* Paso 2: Subir archivo */}
            <div className="border border-primary/20 rounded-lg p-6 space-y-4 bg-card">
              <div>
                <h3 className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary">
                    2
                  </span>
                  <span className="font-semibold">
                    Subir archivo completado
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground ml-10">
                  Selecciona el archivo Excel con los datos completos
                </p>
              </div>

              <div className="ml-10 space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="block cursor-pointer">
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 hover:border-primary/60 hover:bg-primary/5 transition-all text-center">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-primary" />
                    {archivo ? (
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">
                          {archivo.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(archivo.size / 1024).toFixed(2)} KB
                        </p>
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                          ✓ Archivo cargado
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-medium">
                          Click para seleccionar archivo
                        </p>
                        <p className="text-sm text-muted-foreground">
                          o arrastra y suelta aquí (XLSX, XLS)
                        </p>
                      </div>
                    )}
                  </div>
                </label>

                {archivo && (
                  <Button
                    onClick={handleProcesarArchivo}
                    disabled={importando}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {importando ? "Validando datos..." : "Validar archivo"}
                  </Button>
                )}

                {importando && (
                  <div className="space-y-2">
                    <Progress value={progreso} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      Procesando archivo y validando datos... {progreso}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Resultados de validación */}
            {(clientesValidos.length > 0 || errores.length > 0) && (
              <div className="space-y-3">
                {clientesValidos.length > 0 && (
                  <Alert className="border-green-500/30 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-400">
                      <strong>
                        {clientesValidos.length} cliente(s) válido(s)
                      </strong>{" "}
                      con{" "}
                      <strong>
                        {clientesValidos.reduce(
                          (sum, c) => sum + (c.facturas?.length || 0),
                          0,
                        )}{" "}
                        factura(s)
                      </strong>{" "}
                      listo(s) para importar
                    </AlertDescription>
                  </Alert>
                )}

                {errores.length > 0 && (
                  <Alert className="border-red-500/30 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">
                      <strong>{errores.length} error(es) encontrado(s)</strong>
                      <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                        {errores.slice(0, 10).map((error, idx) => (
                          <div key={idx} className="text-xs">
                            • Fila {error.fila}, campo {error.campo}:{" "}
                            {error.mensaje}
                          </div>
                        ))}
                        {errores.length > 10 && (
                          <div className="text-xs font-medium">
                            ... y {errores.length - 10} error(es) más
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ayuda" className="py-4">
            <GuiaImportacionAyuda />
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancelar}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleImportar}
            disabled={clientesValidos.length === 0 || importando}
            className="bg-primary hover:bg-primary/90"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar{" "}
            {clientesValidos.length > 0 &&
              `(${clientesValidos.length} clientes, ${clientesValidos.reduce((sum, c) => sum + (c.facturas?.length || 0), 0)} facturas)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
