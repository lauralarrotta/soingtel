import { useState, useEffect, useCallback, useRef } from "react";
import { fetchWithRetry } from "../utils/fetchWithRetry";
import { healthManager } from "../utils/healthManager";
import { API_CONFIG } from "@/config";

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
  filters: Record<string, any> = {}
) {
  const [data, setData] = useState<T>(initialValue);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverAvailable, setServerAvailable] = useState(true);
  const initialValueRef = useRef(initialValue);
  const lastSaveTimestamp = useRef<number>(0);
  const [pageState, setPageState] = useState(page);
  const isMountedRef = useRef(true);
  const loadAttemptRef = useRef(0);

  // Suscribirse a cambios de disponibilidad del health manager global
  useEffect(() => {
    const unsubscribe = healthManager.subscribe((available) => {
      if (isMountedRef.current) {
        setServerAvailable(available);
      }
    });
    setServerAvailable(healthManager.isAvailable());
    return unsubscribe;
  }, []);

  // Función para convertir datos del servidor (snake_case -> camelCase)
  const convertServerData = useCallback((serverData: any[]): any[] => {
    if (!Array.isArray(serverData)) return serverData;
    return serverData.map((c: any) => ({
      ...c,
      nombrecliente: c.nombre_cliente,
      cuentastarlink: c.cuenta_starlink,
      costoplan: c.costo_plan,
      valorFactura: c.valor_factura,
      valorSoporte: c.valor_soporte,
      fechaActivacion: c.fecha_activacion,
      tipoSoporte: c.tipo_soporte,
    }));
  }, []);

  // Función para obtener URL con filtros
  const buildUrl = useCallback(() => {
    let url = `${API_CONFIG.BASE_URL}/${key}?page=${pageState}&limit=${limit}`;
    if (filters) {
      Object.entries(filters).forEach(([filterKey, value]) => {
        if (value && value !== "todos") {
          url += `&${filterKey}=${encodeURIComponent(value)}`;
        }
      });
    }
    return url;
  }, [key, pageState, limit, filters]);

  // Función principal de carga
  const loadData = useCallback(async (options: { background?: boolean } = {}) => {
    if (!isMountedRef.current) return;
    const { background = false } = options;
    const attempt = ++loadAttemptRef.current;

    // Si es carga en background, NO bloquear nada
    if (background) {
      // Solo intentar cargar si ha pasado tiempo suficiente desde el último intento
      const timeSinceLastAttempt = Date.now() - lastSaveTimestamp.current;
      if (timeSinceLastAttempt < 2000) return;

      try {
        const isAvailable = await Promise.race([
          healthManager.check(),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2500))
        ]);

        if (!isAvailable || attempt !== loadAttemptRef.current) return;

        const url = buildUrl();
        const response = await Promise.race([
          fetchWithRetry(url, { signal: AbortSignal.timeout(10000) }),
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
        ]);

        if (!response?.ok || attempt !== loadAttemptRef.current) return;

        const result = await response.json();
        let serverData = (key === "clientes" || key === "clientes_fusagasuga")
          ? result?.data || []
          : Array.isArray(result) ? result : result?.[key];

        if (!serverData || !Array.isArray(serverData)) return;

        serverData = convertServerData(serverData);
        localStorage.setItem(`soingtel_${key}`, JSON.stringify(serverData));
        setData(serverData as T);

        if (key === "clientes" || key === "clientes_fusagasuga") {
          setTotalCount(result?.total || 0);
        }
      } catch (err) {
        console.log(`[useLocalPostgres] Background load falló para ${key}:`, err);
      }
      return;
    }

    // Carga normal (no background)
    try {
      setLoading(true);
      setError(null);

      // Cargar datos locales primero
      const localData = localStorage.getItem(`soingtel_${key}`);
      if (localData) {
        const parsed = safeParse(localData, initialValueRef.current);
        setData(parsed);
      }

      // Verificar servidor
      const isAvailable = await Promise.race([
        healthManager.check(),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 3000))
      ]);

      if (!isAvailable) {
        setServerAvailable(false);
        setError("Servidor no disponible. Usando datos locales.");
        return;
      }

      setServerAvailable(true);

      // Cargar del servidor
      const url = buildUrl();
      const response = await fetchWithRetry(url, {
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`Error al cargar ${key}: ${response.statusText}`);
      }

      const result = await response.json();
      let serverData = (key === "clientes" || key === "clientes_fusagasuga")
        ? result?.data || []
        : Array.isArray(result) ? result : result?.[key];

      if (!serverData) {
        serverData = initialValueRef.current;
      }

      serverData = convertServerData(serverData);

      setData(serverData as T);
      localStorage.setItem(`soingtel_${key}`, JSON.stringify(serverData));

      if (key === "clientes" || key === "clientes_fusagasuga") {
        setTotalCount(result?.total || 0);
      }
    } catch (err) {
      console.error(`[useLocalPostgres] Error al cargar ${key}:`, err);
      setServerAvailable(false);
      healthManager.setUnavailable();
      setError("No se pudo conectar al servidor.");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [key, pageState, limit, filters, mergeKey, buildUrl, convertServerData]);

  // Guardar datos
  const saveData = useCallback(async (newData: T) => {
    try {
      lastSaveTimestamp.current = Date.now();

      const cleanData = (key === "clientes" || key === "clientes_fusagasuga") && Array.isArray(newData)
        ? newData.map((cliente: any) => ({
            ...cliente,
            kit: cliente.kit?.trim() || `KIT-${Math.floor(Math.random() * 100000)}`,
          }))
        : newData;

      setData(cleanData as T);
      localStorage.setItem(`soingtel_${key}`, JSON.stringify(cleanData));

      if (!healthManager.isAvailable()) {
        console.log(`[useLocalPostgres] Guardando solo localmente ${key}`);
        return;
      }

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

      const response = await fetch(`${API_CONFIG.BASE_URL}/${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: dataToSend }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Error al guardar ${key}: ${response.statusText}`);
      }
    } catch (err) {
      console.error(`[useLocalPostgres] Error al guardar ${key} en servidor:`, err);
      healthManager.setUnavailable();
    }
  }, [key]);

  // Carga inicial en background
  useEffect(() => {
    isMountedRef.current = true;
    loadData({ background: true });

    return () => {
      isMountedRef.current = false;
    };
  }, [key, pageState, limit, JSON.stringify(filters)]);

  // Recarga periódica cada 60s
  useEffect(() => {
    if (!serverAvailable) return;

    const interval = setInterval(() => {
      const timeSinceLastSave = Date.now() - lastSaveTimestamp.current;
      if (timeSinceLastSave < 10000) {
        console.log(`[useLocalPostgres] Saltando recarga automática (cambios recientes)`);
        return;
      }
      console.log(`[useLocalPostgres] Recarga automática para ${key}`);
      loadData({ background: true });
    }, 60000);

    return () => clearInterval(interval);
  }, [serverAvailable, key, loadData]);

  return {
    data,
    totalCount,
    page: pageState,
    setPage: setPageState,
    setData,
    saveData,
    loading,
    error,
    reload: () => loadData({ background: false }),
    serverAvailable,
  };
}
