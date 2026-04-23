import { AlertCircle, CheckCircle, Wifi, WifiOff, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface SyncStatusInfoProps {
  serverAvailable: boolean;
  syncEnabled: boolean;
  onToggleSync: (enabled: boolean) => void;
}

export function SyncStatusInfo({ 
  serverAvailable, 
  syncEnabled,
  onToggleSync 
}: SyncStatusInfoProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {serverAvailable ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-yellow-600" />
          )}
          <span className="text-sm">Estado de Sincronización</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {serverAvailable ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Sincronización Activa
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-yellow-600" />
                Modo Offline
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {serverAvailable ? (
              "Tu sistema está conectado y sincronizado con la nube."
            ) : (
              "Tu sistema está funcionando en modo offline."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estado Actual */}
          <div className={`p-4 rounded-lg border-2 ${
            serverAvailable 
              ? "bg-green-50 border-green-200" 
              : "bg-yellow-50 border-yellow-200"
          }`}>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              {serverAvailable ? (
                <>
                  <Wifi className="h-4 w-4 text-green-700" />
                  <span className="text-green-900">Conectado a Servidor</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-yellow-700" />
                  <span className="text-yellow-900">Trabajando sin Conexión</span>
                </>
              )}
            </h3>
            
            {serverAvailable ? (
              <div className="text-sm text-green-800 space-y-2">
                <p>✓ Datos sincronizados automáticamente cada 30 segundos</p>
                <p>✓ Cambios compartidos entre todos los usuarios</p>
                <p>✓ Respaldo automático en la nube</p>
                <p>✓ Acceso desde cualquier dispositivo</p>
              </div>
            ) : (
              <div className="text-sm text-yellow-800 space-y-2">
                <p>✓ Sistema completamente funcional</p>
                <p>✓ Datos guardados localmente en tu navegador</p>
                <p>⚠ Los cambios NO se comparten con otros usuarios</p>
                <p>⚠ Los cambios NO se sincronizan entre dispositivos</p>
              </div>
            )}
          </div>

          {/* Información del Modo Offline */}
          {!serverAvailable && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h3 className="font-semibold mb-2 text-blue-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                ¿Por qué estoy en Modo Offline?
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                El servidor de sincronización de Supabase no está disponible o no ha sido desplegado. 
                Esto es normal en un entorno de desarrollo o si aún no has configurado el servidor.
              </p>
              <p className="text-sm text-blue-800 font-medium">
                Tu sistema funciona perfectamente en este modo. Los datos se guardan localmente 
                y estarán disponibles cada vez que abras la aplicación en este navegador.
              </p>
            </div>
          )}

          {/* Cómo activar la sincronización */}
          {!serverAvailable && (
            <div className="p-4 rounded-lg bg-secondary border border-border">
              <h3 className="font-semibold mb-2 text-foreground">
                ¿Cómo activar la sincronización?
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                Para habilitar la sincronización en tiempo real entre usuarios, necesitas desplegar 
                el servidor de Supabase Edge Functions.
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-2 mb-2 rounded">
                  <p className="font-semibold text-yellow-900 text-xs">⚠️ Error 403: Despliegue Manual Requerido</p>
                </div>
                <p><strong>Pasos rápidos:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Instala CLI: <code className="bg-gray-200 px-1 rounded text-xs">npm install -g supabase</code></li>
                  <li>Login: <code className="bg-gray-200 px-1 rounded text-xs">supabase login</code></li>
                  <li>Vincula: <code className="bg-gray-200 px-1 rounded text-xs">supabase link --project-ref pqhxzagqprukgevjpjce</code></li>
                  <li>Despliega: <code className="bg-gray-200 px-1 rounded text-xs">supabase functions deploy server</code></li>
                </ol>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href="https://supabase.com/docs/guides/functions" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ver Documentación Completa
                  </a>
                </Button>
              </div>
            </div>
          )}

          {/* Ventajas del Modo Online */}
          {serverAvailable && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
              <h3 className="font-semibold mb-2 text-green-900">
                🎉 Ventajas de la Sincronización Activa
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div>
                  <p className="font-medium text-green-800">Colaboración en Tiempo Real</p>
                  <p className="text-gray-600">Varios usuarios pueden trabajar simultáneamente</p>
                </div>
                <div>
                  <p className="font-medium text-green-800">Respaldo Automático</p>
                  <p className="text-gray-600">Tus datos están seguros en la nube</p>
                </div>
                <div>
                  <p className="font-medium text-green-800">Acceso Multiplataforma</p>
                  <p className="text-gray-600">Trabaja desde cualquier dispositivo</p>
                </div>
                <div>
                  <p className="font-medium text-green-800">Sin Pérdida de Datos</p>
                  <p className="text-gray-600">Los datos persisten aunque limpies el navegador</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}