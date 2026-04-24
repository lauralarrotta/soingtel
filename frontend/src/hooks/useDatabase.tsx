// ========================================
// HOOK UNIFICADO DE BASE DE DATOS
// Detecta automáticamente qué backend usar
// ========================================

import { useLocalPostgres } from "./useLocalPostgres";


const DATABASE_MODE = "local"; // Configuración local forzada para evitar error de importación

export function useDatabase<T>(key: string, initialValue: T, mergeKey?: any, page: number = 1, limit: number = 100, filters: Record<string, any> = {} )  {
  if (DATABASE_MODE === "local") {
    return useLocalPostgres<T>(key, initialValue, mergeKey, page, limit, filters);
  }

  throw new Error("Supabase no está implementado todavía");
}

// Re-exportar para compatibilidad
export { useLocalPostgres };
