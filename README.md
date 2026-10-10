# CotizaPro — Microapp SaaS de Cotizaciones Comerciales

CotizaPro es una aplicación SaaS diseñada para pequeños negocios y profesionales independientes que gestiona clientes, catálogo de productos/servicios y cotizaciones comerciales con cálculo de impuestos en servidor y exportación a PDF.

## 🛠️ Tecnologías
- **Framework**: [Next.js 16](https://nextjs.org) (App Router con React 19 y Server Actions)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org)
- **Base de Datos y Autenticación**: [Supabase](https://supabase.com) (PostgreSQL con Row Level Security)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com) y Lucide Icons
- **Validación**: [Zod](https://zod.dev)

---

## 🚀 Inicio Rápido

### 1. Clonar el repositorio e instalar dependencias
```bash
npm install
```

### 2. Configuración de Variables de Entorno
Copia el archivo `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```
Configura tus credenciales de Supabase en `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Migración de Base de Datos
Ejecuta el script SQL en el SQL Editor de tu proyecto en Supabase:
`supabase/migrations/20261010000000_init_schema.sql`

### 4. Pruebas del Motor de Cálculo
Para validar los cálculos matemáticos y redondeos bancarios del motor de cotizaciones:
```bash
npm run test:engine
```

### 5. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 🔒 Arquitectura de Seguridad
- **Aislamiento Multi-inquilino**: Las políticas RLS en PostgreSQL garantizan que cada usuario solo acceda a los datos de su negocio mediante `is_business_member(business_id)`.
- **Cálculo Determinista en Servidor**: Los montos, descuentos e impuestos son calculados y validados en el backend con `QuoteCalculator`, rechazando montos manipulados por el cliente.
- **Protección de Sesión**: Middleware/Proxy de Next.js (`src/proxy.ts`) sincroniza tokens de sesión y protege rutas privadas.
