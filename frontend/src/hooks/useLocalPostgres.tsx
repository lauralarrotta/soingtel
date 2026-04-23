import { useState, useEffect, useCallback, useRef } from "react";
import { fetchWithRetry } from "../utils/fetchWithRetry";

// URL del backend local
const API_URL = "https://soingtel.onrender.com/api";

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value || value === "undefined") return fallback;
    return JSON.parse(value);
  } catch (err) {
    console.warn("Error parseando JSON:", err);
    return fallback;
  }
}


export function useLocalPostgres<T>(
    key: string,
  initialValue: T,
  mergeKey?: string,
  page: number = 1,
  limit: number = 100,
  filters: Record<string, any> = {} // ✅ NUEVO
) {
  const [data, setData] = useState<T>(initialValue);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverAvailable, setServerAvailable] = useState(true);
  const initialValueRef = useRef(initialValue);
  const lastSaveTimestamp = useRef<number>(0); 
  const [pageState, setPageState] = useState(page);

  // Verificar si el servidor está disponible
  const checkServerHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      const isAvailable = response.ok;
      setServerAvailable(isAvailable);
      return isAvailable;
    } catch (err) {
      setServerAvailable(false);
      return false;
    }
  }, []);

  // Cargar datos desde el servidor o localStorage
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Primero cargar desde localStorage para mostrar datos rápidamente
      const localData = localStorage.getItem(`soingtel_${key}`);

      if (localData) {
        console.log(`[useLocalPostgres] Cargando datos locales para ${key}`);

        const parsed = safeParse(localData, initialValueRef.current);

        setData(parsed);
        setLoading(false);
      }

      // Verificar si el servidor está disponible
      const isAvailable = await checkServerHealth();
      if (!isAvailable) {
        console.log(
          `[useLocalPostgres] Servidor no disponible, usando datos locales para ${key}`,
        );
        setError("Servidor no disponible. Usando datos locales.");
        if (!localData) {
          setData(initialValueRef.current);
        }
        setLoading(false);
        return;
      }

      console.log(`[useLocalPostgres] Cargando ${key} desde ${API_URL}/${key} (page: ${page}, limit: ${limit})`);

   let url = `${API_URL}/${key}?page=${pageState}&limit=${limit}`;

// ✅ agregar filtros dinámicos
if (filters) {
  Object.entries(filters).forEach(([filterKey, value]) => {
    if (value && value !== "todos") {
      url += `&${filterKey}=${encodeURIComponent(value)}`;
    }
  });
}
      const response = await fetchWithRetry(url, {
  signal: AbortSignal.timeout(5000),
});

     

      console.log(`[useLocalPostgres] Respuesta status:`, response.status);

      if (!response.ok) {
        throw new Error(`Error al cargar ${key}: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log(`[useLocalPostgres] Datos recibidos para ${key}:`, result);

     let serverData: any;

if (key === "clientes" || key === "clientes_fusagasuga") {
  serverData = result?.data || [];
  setTotalCount(result?.total || 0); // ✅ ESTA LÍNEA ES LA CLAVE
} else {
  serverData = Array.isArray(result) ? result : result?.[key];
}

      if (!serverData) {
        serverData = initialValueRef.current;
      }

      // Convertir snake_case del backend a camelCase del frontend
      if ((key === "clientes" || key === "clientes_fusagasuga") && Array.isArray(serverData)) {
        serverData = serverData.map((c: any) => ({
          ...c,
          nombrecliente: c.nombre_cliente,
          cuentastarlink: c.cuenta_starlink,
          costoplan: c.costo_plan,
          valorFactura: c.valor_factura,
          valorSoporte: c.valor_soporte,
          fechaActivacion: c.fecha_activacion,
          tipoSoporte: c.tipo_soporte,
        }));
      }

      serverData = serverData as T;

      setData((currentData) => {
        if (
          mergeKey &&
          Array.isArray(currentData) &&
          Array.isArray(serverData)
        ) {
          const map = new Map(
            currentData.map((item: any) => [item[mergeKey], item]),
          );

          serverData.forEach((item: any) => {
            const existing = map.get(item[mergeKey]);

            map.set(item[mergeKey], {
              ...existing,

              // SOLO sobreescribir si el backend trae valor
              ...Object.fromEntries(
                Object.entries(item).filter(
                  ([_, value]) => value !== null && value !== undefined,
                ),
              ),
            });
          });

          const merged = Array.from(map.values()) as T;
          localStorage.setItem(`soingtel_${key}`, JSON.stringify(merged));
          return merged;
        }

        localStorage.setItem(`soingtel_${key}`, JSON.stringify(serverData));
        return serverData;
      });
    } catch (err) {
      console.error(`[useLocalPostgres] Error al cargar ${key}:`, err);

      // Marcar el servidor como no disponible
      setServerAvailable(false);

      // Mostrar error solo si no tenemos datos locales
      const localData = localStorage.getItem(`soingtel_${key}`);
      if (localData) {
        console.log(
          `[useLocalPostgres] Usando datos locales después de error para ${key}`,
        );
        setError("Modo offline: usando datos locales");
      } else {
        console.log(
          `[useLocalPostgres] Usando valor inicial después de error para ${key}`,
        );
        setData(initialValueRef.current);
        setError(
          "No se pudo conectar al servidor. Trabajando en modo offline.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [key, checkServerHealth, pageState, limit, filters]);

  // Guardar datos en el servidor y localStorage
  const saveData = useCallback(
    async (newData: T) => {
      try {
        lastSaveTimestamp.current = Date.now();

        const cleanData =
          (key === "clientes" || key === "clientes_fusagasuga") && Array.isArray(newData)
            ? newData.map((cliente: any) => ({
                ...cliente,
                kit:
                  cliente.kit && cliente.kit.trim() !== ""
                    ? cliente.kit
                    : `KIT-${Math.floor(Math.random() * 100000)}`,
              }))
            : newData;

        // ✅ usar cleanData aquí también
        setData(cleanData as T);
        localStorage.setItem(`soingtel_${key}`, JSON.stringify(cleanData));

        if (!serverAvailable) {
          console.log(`[useLocalPostgres] Guardando solo localmente ${key}`);
          return;
        }

        // Convertir camelCase del frontend a snake_case del backend antes de enviar
        let dataToSend = cleanData;
        if ((key === "clientes" || key === "clientes_fusagasuga") && Array.isArray(cleanData)) {
          dataToSend = cleanData.map((c: any) => ({
            ...c,
            nombre_cliente: c.nombrecliente,
            cuenta_starlink: c.cuentastarlink,
            costo_plan: c.costoplan,
            valor_factura: c.valorFactura,
            valor_soporte: c.valorSoporte,
            fecha_activacion: c.fechaActivacion,
            tipo_soporte: c.tipoSoporte,
          }));
        }

        console.log("Enviando al backend:", dataToSend);
        const response = await fetch(`${API_URL}/${key}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ [key]: dataToSend }),
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("Respuesta backend:", text);
          throw new Error(`Error al guardar ${key}: ${response.statusText}`);
        }

        console.log(
          `[useLocalPostgres] Datos guardados en servidor para ${key}`,
        );
      } catch (err) {
        console.error(
          `[useLocalPostgres] Error al guardar ${key} en servidor:`,
          err,
        );
        setServerAvailable(false);
      }
    },
    [key, serverAvailable],
  );

  // Cargar datos al montar el componente
  useEffect(() => {
  loadData();
}, [pageState, limit, JSON.stringify(filters), key]);

  // Recargar datos periódicamente (cada 30 segundos) para sincronizar con otros usuarios
  useEffect(() => {
    if (!serverAvailable) return;

    const interval = setInterval(() => {
      // NO recargar si se guardaron datos hace menos de 10 segundos
      // Esto evita sobrescribir cambios recientes
      const timeSinceLastSave = Date.now() - lastSaveTimestamp.current;
      if (timeSinceLastSave < 10000) {
        // 10 segundos
        console.log(
          `[useLocalPostgres] Saltando recarga automática (cambios recientes para ${key})`,
        );
        return;
      }

      console.log(`[useLocalPostgres] Recarga automática para ${key}`);
      loadData();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [loadData, serverAvailable]);

return {
  data,
  totalCount,
  page: pageState,
  setPage: setPageState,
  setData,
  saveData,
  loading,
  error,
  reload: loadData,
  serverAvailable,
};
}
