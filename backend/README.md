# 🚀 Backend API — Sistema Soingtel

API interna para la gestión de clientes, facturación, pagos y alertas.
Desarrollada con arquitectura modular para facilitar mantenimiento, escalabilidad y trabajo en equipo.

---

## 🧠 Stack Tecnológico

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **Database:** PostgreSQL 14+
- **Validation:** Zod 4.x
- **Security:** Helmet, CORS, express-rate-limit
- **Logging:** Winston
- **Testing:** Jest
- **Language:** JavaScript (ES6+) con soporte TypeScript

---

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # PostgreSQL connection pool
│   │   └── env.js            # Environment validation with Zod
│   │
│   ├── database/
│   │   ├── schema.sql        # Database schema
│   │   └── migrations/       # Database migrations
│   │
│   ├── integrations/
│   │   └── googleSheets/     # Google Sheets export
│   │
│   ├── modules/
│   │   ├── auth/             # Authentication
│   │   ├── clientes/        # Clients (CRUD + sede support)
│   │   ├── facturas/        # Invoices
│   │   ├── pagos/            # Payments
│   │   └── alertas/          # Alerts
│   │
│   ├── routes/               # Route aggregation
│   ├── shared/
│   │   ├── constants/        # App constants
│   │   ├── errors/          # Custom error classes
│   │   ├── middleware/       # Auth & error handlers
│   │   ├── utils/           # Logger, ApiResponse, helpers
│   │   └── validations/      # Input validation helpers
│   ├── tests/               # Test files
│   ├── app.js               # Express app setup
│   └── server.js            # Server entry point
│
├── .editorconfig           # Editor configuration
├── .env.example            # Environment template
├── .eslintrc.json          # ESLint config
├── .gitignore              # Git ignore rules
├── .prettierrc             # Prettier config
├── CHANGELOG.md            # Version history
├── CONTRIBUTING.md         # Contribution guidelines
├── docker-compose.yml       # PostgreSQL setup
├── jest.config.js          # Jest config
├── package.json
├── README.md
└── tsconfig.json          # TypeScript config
```

---

## ⚙️ Configuración

### 1. Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Variables principales:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `3001` |
| `NODE_ENV` | Entorno | `development` |
| `DATABASE_URL` | Connection string PostgreSQL | - |
| `DATABASE_SSL` | Usar SSL | `false` |
| `RATE_LIMIT_WINDOW_MS` | Ventana rate limit (ms) | `900000` |
| `RATE_LIMIT_MAX` | Máx requests por ventana | `100` |
| `CORS_ORIGINS` | Orígenes CORS (coma) | localhost:3000,5173 |
| `USERS` | Usuarios auth (user:pass:rol) | soporte, facturacion, admin |

### 2. Base de Datos

Opción A: Docker Compose (recomendado)
```bash
docker-compose up -d
```

Opción B: PostgreSQL local
- Crear base de datos: `soingtel`
- Actualizar `DATABASE_URL` en `.env`

### 3. Instalar Dependencias

```bash
npm install
```

---

## 🛠️ Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar en desarrollo (con hot reload) |
| `npm start` | Iniciar en producción |
| `npm test` | Ejecutar tests |
| `npm run build` | Compilar TypeScript |

---

## 🌐 Endpoints API

### Autenticación
```
POST /api/auth          # Login (Basic Auth)
```

### Clientes
```
GET    /api/clientes                  # Listar clientes
GET    /api/clientes/:kit             # Obtener por KIT
POST   /api/clientes                  # Crear cliente
PUT    /api/clientes/:kit             # Actualizar
PUT    /api/clientes/:kit/estado       # Cambiar estado pago
PUT    /api/clientes/:kit/facturacion  # Actualizar facturación
DELETE /api/clientes/:kit             # Eliminar
POST   /api/clientes/importar          # Importar CSV
GET    /api/clientes/estadisticas      # Estadísticas

# Fusagasuga (sede alterna)
GET    /api/clientes_fusagasuga/...
```

### Facturas
```
GET    /api/facturas            # Listar facturas
GET    /api/facturas/:id        # Obtener por ID
POST   /api/facturas            # Crear factura
PUT    /api/facturas/:id        # Actualizar
DELETE /api/facturas/:id        # Eliminar
```

### Pagos
```
GET    /api/pagos               # Listar pagos
GET    /api/pagos/:id           # Obtener por ID
POST   /api/pagos               # Registrar pago
```

### Alertas
```
GET    /api/alertas/facturacion # Alertas de facturación
GET    /api/alertas/suspension  # Alertas de suspensión
GET    /api/alertas/reactivacion # Alertas de reactivación
```

### Utilidades
```
GET    /api/health              # Health check
POST   /api/exportar-sheets     # Exportar a Google Sheets
```

---

## 🔐 Seguridad

- **Autenticación:** HTTP Basic Auth
- **CORS:** Configurable por origen
- **Rate Limiting:** 100 requests / 15 minutos
- **Helmet:** Headers de seguridad HTTP
- **Validation:** Zod para validación de entrada
- **SQL:** Prepared statements (pg library)

---

## 🧱 Arquitectura

```
Request → Route → Middleware → Controller → Service → Repository → Database
                                              ↓
                                         Validation
```

Cada módulo sigue el patrón MVC simplificado:
- **Routes:** Definición de endpoints y middleware
- **Controller:** Manejo de HTTP (request/response)
- **Service:** Lógica de negocio
- **Repository:** Acceso a datos

---

## 🧪 Testing

```bash
# Todos los tests
npm test

# Modo watch
npm run test:watch

# Coverage
npm test -- --coverage
```

---

## 🐳 Docker

```bash
# Iniciar PostgreSQL
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

---

## 📝 Historial de Versiones

Ver [CHANGELOG.md](./CHANGELOG.md) para detalles de cambios.

---

## 🤝 Contribuir

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para guías de contribución.

---

## 📄 Licencia

Proyecto interno — Soingtel
