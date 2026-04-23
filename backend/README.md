# 🚀 Backend API — Sistema Soingtel

API interna para la gestión de clientes, facturación, pagos y alertas.
Desarrollada con arquitectura modular para facilitar mantenimiento, escalabilidad y trabajo en equipo.

---

## 🧠 Stack Tecnológico

- Node.js
- Express
- TypeScript
- PostgreSQL
- Arquitectura Modular (Routes / Controllers / Services)

---

## 📁 Estructura del Proyecto

backend/
├── src/
│ ├── config/
│ │ └── database.ts
│ │
│ ├── database/
│ │ ├── schema.sql
│ │ └── migrations/
│ │
│ ├── middlewares/
│ │ ├── logger.middleware.ts
│ │ └── error.middleware.ts
│ │
│ ├── modules/
│ │ ├── clientes/
│ │ │ ├── clientes.routes.ts
│ │ │ ├── clientes.controller.ts
│ │ │ └── clientes.service.ts
│ │ │
│ │ ├── facturas/
│ │ │ ├── facturas.routes.ts
│ │ │ ├── facturas.controller.ts
│ │ │ └── facturas.service.ts
│ │ │
│ │ ├── pagos/
│ │ │ ├── pagos.routes.ts
│ │ │ ├── pagos.controller.ts
│ │ │ └── pagos.service.ts
│ │ │
│ │ ├── alertas/
│ │ │ ├── alertas.routes.ts
│ │ │ ├── alertas.controller.ts
│ │ │ └── alertas.service.ts
│ │ │
│ │ └── health/
│ │ ├── health.routes.ts
│ │ └── health.controller.ts
│ │
│ ├── shared/
│ │ └── helpers.ts
│ │
│ ├── app.ts
│ └── server.ts
│
├── .env
├── .gitignore
├── package.json
└── README.md

---

## ⚙️ Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=soingtel_db

---

## 📦 Instalación

npm install

---

## 🛠️ Desarrollo

npm run dev

---

## 🏗️ Compilar TypeScript

npm run build

---

## ▶️ Ejecutar en Producción

npm start

---

## 🌐 Endpoints Disponibles

### ❤️ Health

GET /api/health

### 👥 Clientes

GET /api/clientes
POST /api/clientes
PUT /api/clientes/:kit

### 🧾 Facturas

GET /api/facturas
POST /api/facturas

### 💳 Pagos

GET /api/pagos

### 🚨 Alertas

GET /api/alertas

---

## 🧱 Arquitectura

Cada módulo sigue el patrón:

routes → endpoints
controller → manejo HTTP
service → lógica de negocio + base de datos

---

## 🔐 Uso Interno

Sistema diseñado para uso interno de la empresa.

---

## 🧪 Scripts

"scripts": {
"dev": "ts-node-dev --respawn --transpile-only src/server.ts",
"build": "tsc",
"start": "node dist/server.js"
}

---

## 🚀 Roadmap

- Autenticación JWT
- Roles y permisos
- Documentación Swagger
- Logs avanzados
- Docker
- Deploy en nube
- Monitoreo y métricas

---

## 👩‍💻 Autora

Proyecto interno — Soingtel
