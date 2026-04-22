import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  FileSpreadsheet,
  Download,
  Upload,
  CheckSquare,
  XCircle
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";

export function GuiaImportacionAyuda() {
  return (
    <div className="space-y-4">
      {/* Resumen rápido */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Proceso de importación en 3 pasos:</strong>
          <ol className="mt-2 space-y-1 text-sm list-decimal list-inside">
            <li>Descarga la plantilla CSV</li>
            <li>Completa los datos de tus clientes</li>
            <li>Sube el archivo y valida antes de importar</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Campos requeridos vs opcionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-red-500" />
            Campos OBLIGATORIOS
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">*</span>
              <div>
                <strong>KIT:</strong> Identificador único (ej: CAR-001)
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">*</span>
              <div>
                <strong>NOMBRE:</strong> Nombre de la empresa
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">*</span>
              <div>
                <strong>CUENTA:</strong> Número de cuenta Starlink
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">*</span>
              <div>
                <strong>EMAIL:</strong> Email válido
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">*</span>
              <div>
                <strong>COSTO:</strong> Solo números (ej: 150000)
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">*</span>
              <div>
                <strong>CORTE:</strong> Día del mes (1-31)
              </div>
            </li>
          </ul>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium flex items-center gap-2 mb-3">
            <CheckSquare className="h-4 w-4 text-blue-500" />
            Campos Opcionales
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Coordenadas GPS</li>
            <li>• Contraseña</li>
            <li>• Fecha de activación (YYYY-MM-DD)</li>
            <li>• Corte facturación</li>
            <li>• Observaciones</li>
            <li>• Valor a facturar</li>
            <li>• Valor soporte</li>
            <li>• Cuenta bancaria</li>
            <li>• Tipo de soporte</li>
          </ul>
        </div>
      </div>

      {/* Validaciones y reglas */}
      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
        <h4 className="font-medium flex items-center gap-2 mb-3 text-blue-900">
          <AlertCircle className="h-4 w-4" />
          Validaciones Automáticas
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
            <div>
              <strong>Email:</strong> Verifica formato válido
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
            <div>
              <strong>Corte:</strong> Valida rango 1-31
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
            <div>
              <strong>KIT:</strong> Verifica unicidad
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
            <div>
              <strong>Fecha:</strong> Formato YYYY-MM-DD
            </div>
          </div>
        </div>
      </div>

      {/* Errores comunes */}
      <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
        <h4 className="font-medium flex items-center gap-2 mb-3 text-yellow-900">
          <XCircle className="h-4 w-4" />
          Errores Comunes a Evitar
        </h4>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li className="flex items-start gap-2">
            <span className="text-red-500">✗</span>
            <div>No dejes campos obligatorios vacíos</div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">✗</span>
            <div>No uses KITs duplicados (deben ser únicos)</div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">✗</span>
            <div>No uses comas dentro de los valores</div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">✗</span>
            <div>No cambies los nombres de las columnas</div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">✗</span>
            <div>No uses formatos de fecha incorrectos</div>
          </li>
        </ul>
      </div>

      {/* Tips y mejores prácticas */}
      <div className="border rounded-lg p-4 bg-green-50 border-green-200">
        <h4 className="font-medium flex items-center gap-2 mb-3 text-green-900">
          <CheckCircle className="h-4 w-4" />
          💡 Consejos Útiles
        </h4>
        <ul className="space-y-2 text-sm text-green-800">
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <div>Prueba primero con 2-3 clientes antes de importar todos</div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <div>Guarda una copia del archivo antes de importar</div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <div>Revisa los errores detallados después de validar</div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <div>Usa Excel o Google Sheets para editar el CSV</div>
          </li>
        </ul>
      </div>

      {/* Ejemplo visual */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium flex items-center gap-2 mb-3">
          <FileSpreadsheet className="h-4 w-4" />
          Ejemplo de Registro
        </h4>
        <div className="bg-slate-100 rounded p-3 font-mono text-xs overflow-x-auto">
          <div className="mb-2 text-slate-600">
            KIT,NOMBRE,CUENTA,EMAIL,COSTO,CORTE,...
          </div>
          <div className="text-slate-800">
            CAR-001,EMPRESA ABC S.A.S,STARLINKACCOUNT001,abc@empresa.com,150000,10,...
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            KIT único
          </Badge>
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Email válido
          </Badge>
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Costo numérico
          </Badge>
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Corte en rango
          </Badge>
        </div>
      </div>

      {/* Proceso paso a paso con íconos */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-3">🎯 Flujo del Proceso</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
              1
            </div>
            <Download className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Descarga la plantilla CSV</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
              2
            </div>
            <FileSpreadsheet className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Completa los datos en Excel</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
              3
            </div>
            <Upload className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Sube el archivo completado</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
              4
            </div>
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Revisa validaciones</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold">
              5
            </div>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Confirma e importa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
