import { API_CONFIG } from "@/config";

// ========================================
// HEALTH CHECK MANAGER GLOBAL
// Evita múltiples llamadas de health check simultáneas
// ========================================

interface HealthState {
  available: boolean;
  timestamp: number;
  checking: boolean;
  subscribers: Set<(available: boolean) => void>;
}

const HEALTH_CACHE_TTL = 15000; // 15 segundos de caché
const HEALTH_CHECK_TIMEOUT = 5000; // 5 segundos timeout

let globalHealthState: HealthState = {
  available: true,
  timestamp: 0,
  checking: false,
  subscribers: new Set(),
};

let currentHealthCheck: Promise<boolean> | null = null;

export const healthManager = {
  // Obtener estado actual (sincrónico)
  isAvailable(): boolean {
    if (Date.now() - globalHealthState.timestamp < HEALTH_CACHE_TTL) {
      return globalHealthState.available;
    }
    return true; // Asumir disponible si no sabemos
  },

  // Suscribirse a cambios de disponibilidad
  subscribe(callback: (available: boolean) => void): () => void {
    globalHealthState.subscribers.add(callback);
    return () => {
      globalHealthState.subscribers.delete(callback);
    };
  },

  // Verificar salud del servidor
  async check(): Promise<boolean> {
    // Si hay una verificación en curso, devolver esa promesa
    if (currentHealthCheck) {
      return currentHealthCheck;
    }

    // Si el caché es reciente, devolver inmediatamente
    if (Date.now() - globalHealthState.timestamp < HEALTH_CACHE_TTL) {
      return globalHealthState.available;
    }

    // Marcar que estamos checking
    globalHealthState.checking = true;

    currentHealthCheck = (async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
          signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT),
        });

        const isAvailable = response.ok;

        // Actualizar estado global
        globalHealthState = {
          available: isAvailable,
          timestamp: Date.now(),
          checking: false,
          subscribers: globalHealthState.subscribers,
        };

        // Notificar a suscriptores
        globalHealthState.subscribers.forEach((cb) => cb(isAvailable));

        return isAvailable;
      } catch (err) {
        globalHealthState = {
          available: false,
          timestamp: Date.now(),
          checking: false,
          subscribers: globalHealthState.subscribers,
        };

        globalHealthState.subscribers.forEach((cb) => cb(false));
        return false;
      } finally {
        currentHealthCheck = null;
      }
    })();

    return currentHealthCheck;
  },

  // Forzar una nueva verificación (ignora caché)
  async forceCheck(): Promise<boolean> {
    // Limpiar caché
    globalHealthState.timestamp = 0;
    return this.check();
  },

  // Marcar como no disponible (ejemplo: cuando hay errores consecutivos)
  setUnavailable(): void {
    globalHealthState = {
      available: false,
      timestamp: Date.now(),
      checking: false,
      subscribers: globalHealthState.subscribers,
    };
    globalHealthState.subscribers.forEach((cb) => cb(false));
  },
};
