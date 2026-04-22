# 🎨 Frontend - Sistema Soingtel

Aplicación React + TypeScript + Tailwind CSS para gestión de clientes Starlink.

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar conexión a base de datos

Edita `/src/config/database.ts`:

```typescript
// Para PostgreSQL Local
export const DATABASE_MODE = 'local';

// Para Supabase Cloud
export const DATABASE_MODE = 'supabase';
```

### 3. Iniciar aplicación
```bash
npm start
# o
npm run dev
```

La aplicación se abrirá en: `http://localhost:3000`

---

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── App.tsx                 # Componente principal
│   ├── components/             # Componentes React
│   │   ├── control-mensualidades.tsx
│   │   ├── login.tsx
│   │   ├── dashboard-*.tsx
│   │   ├── modales/           # Modales de la app
│   │   └── ui/                # Componentes UI reutilizables
│   ├── hooks/                 # Hooks personalizados
│   │   ├── useDatabase.tsx    # Hook principal (auto-detecta BD)
│   │   ├── useLocalPostgres.tsx
│   │   └── useSupabaseData.tsx
│   ├── config/                # Configuración
│   │   └── database.ts        # Configurar PostgreSQL/Supabase
│   ├── styles/                # Estilos globales
│   │   └── globals.css
│   └── utils/                 # Utilidades
├── package.json
└── README.md
```

---

## ⚙️ Configuración

### Modo de Base de Datos

**PostgreSQL Local:**
```typescript
// /src/config/database.ts
export const DATABASE_MODE = 'local';
export const LOCAL_API_URL = 'http://localhost:3001/api';
```

⚠️ **Requisito:** El backend debe estar corriendo en puerto 3001

**Supabase Cloud:**
```typescript
// /src/config/database.ts
export const DATABASE_MODE = 'supabase';
```

⚠️ **Requisito:** Edge Functions desplegadas en Supabase

---

## 👥 Tipos de Usuario

El sistema soporta 3 tipos de usuarios con permisos específicos:

### 1. **Facturación**
- ✅ Modificar estados de pago
- ✅ Agregar facturas (SOG-XXXX)
- ✅ Recibir alertas de nuevas empresas
- ❌ NO puede crear empresas
- ❌ NO puede editar observaciones

### 2. **Soporte**
- ✅ Crear nuevas empresas
- ✅ Editar observaciones
- ✅ Suspender/Reactivar clientes
- ❌ NO puede modificar facturas
- ❌ NO puede cambiar estados de pago

### 3. **Admin**
- ✅ Todos los permisos
- ✅ Crear/Editar/Eliminar empresas
- ✅ Modificar facturas y estados
- ✅ Acceso completo a todo

---

## 🔧 Funcionalidades Principales

### 📊 Gestión de Clientes
- Crear empresas (no personas individuales)
- Estados de pago: Confirmado ✅ / Pendiente ⚠️ / Suspendido 🔴
- Observaciones editables (daños de antenas, incidentes)
- Exportar a Excel/CSV

### 💰 Gestión de Facturas
- Facturas con formato SOG-XXXX
- Registro de pagos bimestrales
- Historial completo de pagos
- Alertas automáticas

### 🔔 Sistema de Alertas
- **Alertas de Facturación:** Cuando Soporte crea una empresa
- **Alertas de Suspensión:** Cuando se suspende un cliente
- **Alertas de Reactivación:** Cuando se reactiva un cliente

### 📤 Exportación de Datos
- Exportar a Excel (CSV) para macros
- Filtros por estado de pago
- Filtros por corte de facturación

---

## 🎨 Tecnologías Utilizadas

- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos
- **Lucide React** - Iconos
- **Sonner** - Notificaciones toast
- **React Hook Form** - Formularios

---

## 🔌 Conexión con Backend

### PostgreSQL Local

La aplicación se conecta a:
```
http://localhost:3001/api
```

Endpoints utilizados:
- `/api/clientes` - Gestión de clientes
- `/api/facturas` - Gestión de facturas
- `/api/pagos` - Registro de pagos
- `/api/alertas_*` - Sistema de alertas

### Supabase Cloud

Usa Edge Functions desplegadas en Supabase para la sincronización multi-usuario.

---

## 📝 Scripts Disponibles

```bash
# Desarrollo (con hot reload)
npm run dev

# Producción (build)
npm run build

# Preview de build
npm run preview

# Iniciar aplicación
npm start
```

---

## 🎯 Credenciales de Prueba

Para desarrollo/testing, el sistema incluye usuarios predefinidos:

**Admin:**
- Usuario: `admin`
- Contraseña: `admin123`

**Facturación:**
- Usuario: `facturacion`
- Contraseña: `facturacion123`

**Soporte:**
- Usuario: `soporte`
- Contraseña: `soporte123`

⚠️ **Importante:** Cambiar estas credenciales en producción

---

## 🔍 Verificar que Funciona

### 1. Backend corriendo
```bash
# Verificar que el backend está online
curl http://localhost:3001/api/health

# Respuesta esperada:
# {"status":"ok","database":"PostgreSQL Local"}
```

### 2. Frontend corriendo
```bash
npm start
# Abrir http://localhost:3000
```

### 3. Crear un cliente
1. Login con usuario `soporte`
2. Clic en "Nueva Empresa"
3. Completar formulario
4. Guardar

### 4. Verificar persistencia
1. Cerrar navegador
2. Abrir de nuevo
3. Login
4. El cliente debe seguir ahí ✅

---

## 🐛 Solución de Problemas

### ❌ "Failed to fetch" en la aplicación
**Causa:** Backend no está corriendo

**Solución:**
```bash
cd ../backend
npm start
```

### ❌ Los datos no se guardan
**Causa:** Configuración incorrecta en `database.ts`

**Solución:**
- Verificar que `DATABASE_MODE` sea 'local' o 'supabase'
- Si es 'local', verificar que backend esté corriendo
- Si es 'supabase', verificar Edge Functions

### ❌ "Cannot find module"
**Causa:** Dependencias no instaladas

**Solución:**
```bash
npm install
```

### ❌ Errores de TypeScript
**Causa:** Archivos movidos sin actualizar imports

**Solución:**
- Los imports deben usar rutas relativas desde `/src`
- Ejemplo: `import { Button } from '../components/ui/button'`

---

## 🔄 Flujo de Trabajo Típico

### Usuario: Soporte
1. Login → Dashboard
2. "Nueva Empresa" → Completar datos
3. Guardar → Se crea alerta para Facturación
4. Editar observaciones cuando hay incidentes

### Usuario: Facturación
1. Login → Dashboard
2. Ver alertas de nuevas empresas
3. Agregar número de factura (SOG-XXXX)
4. Actualizar estado de pago
5. Registrar pagos recibidos

### Usuario: Admin
1. Login → Dashboard
2. Acceso completo a todo
3. Puede editar/eliminar cualquier dato
4. Supervisar operaciones

---

## 📊 Exportación de Datos

### Exportar Clientes
1. Ir a "Control Mensualidades"
2. Aplicar filtros (opcional)
3. Clic en "Exportar a Excel"
4. Se descarga archivo CSV

### Exportar Facturas
1. Ir a "Gestión de Facturas"
2. Aplicar filtros de periodo
3. Clic en "Exportar Facturas"
4. Se descarga con todos los pagos

---

## 🎨 Personalización

### Cambiar Colores
Edita `/src/styles/globals.css`:
```css
:root {
  --primary: #...;
  --secondary: #...;
}
```

### Agregar Nuevos Componentes
```typescript
// /src/components/mi-componente.tsx
export function MiComponente() {
  return <div>...</div>;
}
```

### Crear Nuevos Hooks
```typescript
// /src/hooks/useMiHook.tsx
export function useMiHook() {
  // tu lógica
}
```

---

## 🚀 Despliegue a Producción

### Opción 1: Build Estático
```bash
npm run build
# Los archivos estarán en /dist
```

Subir carpeta `dist/` a:
- Vercel
- Netlify
- GitHub Pages
- S3 + CloudFront

### Opción 2: Docker
```bash
# Crear Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

---

## 📚 Recursos

### Documentación del Proyecto
- `/CONFIGURACION_POSTGRESQL_LOCAL.md` - Setup PostgreSQL
- `/INICIO_RAPIDO.md` - Guía de 5 minutos
- `../backend/README.md` - Documentación del backend

### Documentación Externa
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 🤝 Contribuir

Para agregar funcionalidades:

1. Crear nuevo componente en `/src/components`
2. Agregar hook si necesita lógica de estado
3. Actualizar tipos TypeScript
4. Probar con diferentes tipos de usuario
5. Documentar cambios

---

## 📄 Licencia

Sistema privado para Soingtel.

---

## ✨ Características Destacadas

✅ **Sistema multi-usuario** con roles y permisos
✅ **Alertas en tiempo real** entre departamentos
✅ **Persistencia de datos** en PostgreSQL o Supabase
✅ **Exportación a Excel** para análisis con macros
✅ **Interfaz responsive** optimizada para desktop
✅ **TypeScript** para código más seguro
✅ **Modo offline** con sincronización automática

---

**¿Preguntas?** Consulta la documentación completa en la carpeta raíz del proyecto.
