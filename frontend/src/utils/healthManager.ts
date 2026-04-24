import { API_CONFIG } from "@/config";

// ========================================
// HEALTH CHECK MANAGER GLOBAL
// Evita múltiples llamadas de health check simultáneas
// Respeta rate limits del servidor (429)
// ========================================

interface HealthState {
  available: boolean;
  timestamp: number;
  checking: boolean;
  subscribers: Set<(available: boolean) => void>;
  cooldownUntil: number; // Timestamp hasta el cual no hacer nuevos requests
}

const HEALTH_CACHE_TTL = 30000; // 30 segundos de caché
const HEALTH_CHECK_TIMEOUT = 5000; // 5 segundos timeout
const COOLDOWN_429 = 60000; // 60 segundos de cooldown tras 429
const COOLDOWN_ERROR = 15000; // 15 segundos de cooldown tras error

let globalHealthState: HealthState = {
  available: true,
  timestamp: 0,
  checking: false,
  subscribers: new Set(),
  cooldownUntil: 0,
};

let currentHealthCheck: Promise<boolean> | null = null;

export const healthManager = {
  // Obtener estado actual (sincrónico)
  isAvailable(): boolean {
    // Si estamos en cooldown post-429 o error, no permitir requests
    if (Date.now() < globalHealthState.cooldownUntil) {
      return false;
    }
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
    // Si estamos en cooldown, devolver estado actual inmediatamente
    if (Date.now() < globalHealthState.cooldownUntil) {
      return globalHealthState.available;
    }

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

        // Manejar rate limit (429)
        if (response.status === 429) {
          const newCooldown = Date.now() + COOLDOWN_429;
          globalHealthState = {
            available: globalHealthState.available, // Mantener último estado conocido
            timestamp: Date.now(),
            checking: false,
            subscribers: globalHealthState.subscribers,
            cooldownUntil: newCooldown,
          };
          console.warn(`[healthManager] Rate limited. Cooldown hasta ${new Date(newCooldown).toISOString()}`);
          return globalHealthState.available;
        }

        const isAvailable = response.ok;

        // Actualizar estado global
        globalHealthState = {
          available: isAvailable,
          timestamp: Date.now(),
          checking: false,
          subscribers: globalHealthState.subscribers,
          cooldownUntil: 0,
        };

        // Notificar a suscriptores
        globalHealthState.subscribers.forEach((cb) => cb(isAvailable));

        return isAvailable;
      } catch (err) {
        // Error de red o timeout - establecer cooldown corto
        const newCooldown = Date.now() + COOLDOWN_ERROR;
        globalHealthState = {
          available: false,
          timestamp: Date.now(),
          checking: false,
          subscribers: globalHealthState.subscribers,
          cooldownUntil: newCooldown,
        };

        globalHealthState.subscribers.forEach((cb) => cb(false));
        return false;
      } finally {
        currentHealthCheck = null;
      }
    })();

    return currentHealthCheck;
  },

  // Forzar una nueva verificación (ignora caché y cooldown)
  async forceCheck(): Promise<boolean> {
    // Limpiar cooldown y caché
    globalHealthState.cooldownUntil = 0;
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
      cooldownUntil: Date.now() + COOLDOWN_ERROR,
    };
    globalHealthState.subscribers.forEach((cb) => cb(false));
  },
};
