import { useState, useEffect } from "react";
import {
  Database,
  Server,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

export function PanelDiagnosticoDB() {
  const [serverStatus, setServerStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const [dbTableExists, setDbTableExists] = useState<boolean | null>(null);
  const [copiedProjectId, setCopiedProjectId] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState("");

  const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-b21861d1`;

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    setServerStatus("checking");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${SERVER_URL}/health`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setServerStatus(response.ok ? "online" : "offline");
    } catch (err) {
      setServerStatus("offline");
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(type);
    setTimeout(() => setCopiedCommand(""), 2000);
  };

  const copyProjectId = () => {
    navigator.clipboard.writeText(projectId);
    setCopiedProjectId(true);
    setTimeout(() => setCopiedProjectId(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Database className="h-4 w-4" />
          Panel de Diagnóstico PostgreSQL
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Diagnóstico de Base de Datos PostgreSQL (Supabase)
          </DialogTitle>
          <DialogDescription>
            Tu sistema usa PostgreSQL a través de Supabase. Aquí puedes ver el
            estado de la conexión.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información importante */}
          <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              ¿Qué es Supabase?
            </h3>
            <p className="text-sm text-blue-800">
              <strong>Supabase = PostgreSQL en la nube</strong>. No necesitas
              cambiar nada. Tu sistema ya está configurado para usar PostgreSQL.
              Solo necesitas activar la sincronización.
            </p>
          </div>

          {/* Estado del Proyecto */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Server className="h-4 w-4" />
              Configuración del Proyecto
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary rounded">
                <div>
                  <p className="text-sm font-medium">Project ID</p>
                  <code className="text-xs text-muted-foreground font-mono">
                    {projectId}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Configurado
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyProjectId}
                    className="h-8"
                  >
                    {copiedProjectId ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary rounded">
                <div>
                  <p className="text-sm font-medium">Base de Datos</p>
                  <p className="text-xs text-muted-foreground">
                    PostgreSQL (managed by Supabase)
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  PostgreSQL
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary rounded">
                <div>
                  <p className="text-sm font-medium">Tabla de Datos</p>
                  <code className="text-xs text-muted-foreground font-mono">
                    kv_store_soingtel
                  </code>
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Requiere creación manual
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">Estado del Servidor</p>
                  <p className="text-xs text-muted-foreground">
                    Edge Function de sincronización
                  </p>
                </div>
                {serverStatus === "checking" ? (
                  <Badge variant="outline" className="bg-secondary">
                    <AlertCircle className="h-3 w-3 mr-1 animate-pulse" />
                    Verificando...
                  </Badge>
                ) : serverStatus === "online" ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Offline (Modo Local)
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkServerStatus}
                  className="ml-2"
                >
                  Verificar
                </Button>
              </div>
            </div>
          </div>

          {/* Estado Actual */}
          {serverStatus === "offline" && (
            <div className="border-2 rounded-lg p-4 bg-yellow-50 border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Tu sistema está en Modo Offline
              </h3>
              <div className="space-y-2 text-sm text-yellow-800 mb-4">
                <p>
                  ✓ <strong>El sistema funciona perfectamente</strong> guardando
                  datos localmente
                </p>
                <p>✗ Los datos NO se sincronizan con PostgreSQL en la nube</p>
                <p>✗ Los cambios NO se comparten entre usuarios</p>
              </div>
              <div className="bg-yellow-100 border border-yellow-300 rounded p-3 text-sm text-yellow-900">
                <p className="font-semibold mb-1">
                  Para activar PostgreSQL en la nube:
                </p>
                <p>
                  Necesitas desplegar la Edge Function manualmente usando
                  Supabase CLI
                </p>
              </div>
            </div>
          )}

          {serverStatus === "online" && (
            <div className="border-2 rounded-lg p-4 bg-green-50 border-green-200">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                ¡Sistema Conectado a PostgreSQL!
              </h3>
              <div className="space-y-2 text-sm text-green-800">
                <p>✓ Datos sincronizados con PostgreSQL en Supabase</p>
                <p>✓ Sincronización automática cada 30 segundos</p>
                <p>
                  ✓ Cambios compartidos entre todos los usuarios en tiempo real
                </p>
                <p>✓ Respaldo automático en la nube</p>
              </div>
            </div>
          )}

          {/* Pasos para activar sincronización */}
          {serverStatus === "offline" && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">
                🚀 Cómo Activar la Sincronización con PostgreSQL
              </h3>
              <div className="space-y-4">
                <div className="bg-secondary p-3 rounded">
                  <p className="text-sm font-medium mb-2">
                    Paso 1: Instalar Supabase CLI
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-[#0B0C10] text-[#66FCF1] p-2 rounded font-mono">
                      npm install -g supabase
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard("npm install -g supabase", "install")
                      }
                    >
                      {copiedCommand === "install" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-secondary p-3 rounded">
                  <p className="text-sm font-medium mb-2">
                    Paso 2: Login en Supabase
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-[#0B0C10] text-[#66FCF1] p-2 rounded font-mono">
                      supabase login
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("supabase login", "login")}
                    >
                      {copiedCommand === "login" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-secondary p-3 rounded">
                  <p className="text-sm font-medium mb-2">
                    Paso 3: Vincular Proyecto
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-[#0B0C10] text-[#66FCF1] p-2 rounded font-mono">
                      supabase link --project-ref {projectId}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          `supabase link --project-ref ${projectId}`,
                          "link",
                        )
                      }
                    >
                      {copiedCommand === "link" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-secondary p-3 rounded">
                  <p className="text-sm font-medium mb-2">
                    Paso 4: Desplegar Edge Function
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-[#0B0C10] text-[#66FCF1] p-2 rounded font-mono">
                      supabase functions deploy server
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          "supabase functions deploy server",
                          "deploy",
                        )
                      }
                    >
                      {copiedCommand === "deploy" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                  <p className="text-sm text-blue-900">
                    <strong>⏱️ Tiempo estimado:</strong> 5 minutos
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    Después de completar estos pasos, tu sistema se conectará
                    automáticamente a PostgreSQL.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enlaces útiles */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">📚 Enlaces Útiles</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="justify-start"
              >
                <a
                  href={`https://supabase.com/dashboard/project/${projectId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Dashboard de Supabase
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="justify-start"
              >
                <a
                  href={`https://supabase.com/dashboard/project/${projectId}/editor`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Editor de PostgreSQL
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="justify-start"
              >
                <a
                  href={`https://supabase.com/dashboard/project/${projectId}/functions`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Server className="h-4 w-4 mr-2" />
                  Edge Functions
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="justify-start"
              >
                <a
                  href="https://supabase.com/docs/guides/functions"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Documentación
                </a>
              </Button>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Resumen</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>
                • <strong>Tu base de datos:</strong> PostgreSQL (a través de
                Supabase)
              </li>
              <li>
                • <strong>Estado actual:</strong>{" "}
                {serverStatus === "online"
                  ? "Sincronizado con la nube ✓"
                  : "Funcionando localmente (modo offline)"}
              </li>
              <li>
                • <strong>Para activar sync:</strong> Ejecutar 4 comandos del
                CLI (5 minutos)
              </li>
              <li>
                • <strong>Beneficio:</strong> Multi-usuario en tiempo real +
                respaldo en nube
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
