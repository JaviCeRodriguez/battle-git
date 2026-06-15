# Variables de Entorno: Battle Git

Este documento lista las credenciales y variables necesarias para crear `.env.local`.

No commits credenciales reales. Usar este documento como guia y `.env.example` como plantilla.

## Archivo local

Crear en la raiz del proyecto:

```bash
.env.local
```

Plantilla:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

DATABASE_URL=

APP_BASE_URL=http://localhost:3000

GITHUB_TOKEN=
```

## Clerk

Battle Git usa Clerk para autenticacion con GitHub OAuth.

### `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

Clave publica de Clerk.

- Se obtiene en el dashboard de Clerk.
- Es segura para exponer al cliente.
- Suele empezar con `pk_test_` en desarrollo.

### `CLERK_SECRET_KEY`

Clave secreta server-side de Clerk.

- Se obtiene en el dashboard de Clerk.
- Nunca debe exponerse en el cliente.
- Suele empezar con `sk_test_` en desarrollo.

### `CLERK_WEBHOOK_SECRET`

Secret para validar webhooks de Clerk.

- Se usa cuando activemos `/api/clerk/webhooks`.
- En desarrollo puede quedar vacio hasta conectar webhooks reales.
- En produccion debe configurarse antes de confiar en eventos de Clerk.

### Configuracion GitHub OAuth en Clerk

En Clerk hay que habilitar el proveedor GitHub.

Para desarrollo local, configurar callback/origin segun indique Clerk. La URL base local esperada es:

```text
http://localhost:3000
```

## Base de Datos

Battle Git usa PostgreSQL con Neon y Drizzle.

### `DATABASE_URL`

Connection string de Neon PostgreSQL.

Ejemplo de forma, sin usar como valor real:

```env
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
```

Uso actual:

- Drizzle Kit la usa para generar/migrar schema.
- `src/server/db/index.ts` la usa para inicializar la DB de forma lazy.

## App

### `APP_BASE_URL`

URL base de la aplicacion.

Desarrollo local:

```env
APP_BASE_URL=http://localhost:3000
```

Produccion:

```env
APP_BASE_URL=https://tu-dominio.com
```

## GitHub

### `GITHUB_TOKEN`

Token opcional para llamadas server-side a la API de GitHub.

Estado actual:

- La demo mock no lo necesita.
- La integracion real de GitHub puede usar OAuth via Clerk.
- Este token sirve como fallback tecnico para pruebas server-side o syncs internos.

Permisos recomendados para MVP:

- Solo lectura de datos publicos.
- No solicitar repos privados.

## Variables minimas por etapa

### Demo mock local

Para usar la demo actual no hace falta ninguna credencial.

```bash
pnpm dev
```

### Auth local con Clerk

Necesarias:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
APP_BASE_URL=http://localhost:3000
```

### DB local/remota con Neon

Necesaria:

```env
DATABASE_URL=
```

### Webhooks de Clerk

Necesaria:

```env
CLERK_WEBHOOK_SECRET=
```

## Checklist

- Crear `.env.local` desde `.env.example`.
- Completar Clerk publishable key.
- Completar Clerk secret key.
- Completar Neon `DATABASE_URL`.
- Mantener `APP_BASE_URL=http://localhost:3000` en local.
- Dejar `GITHUB_TOKEN` vacio salvo que se necesite para pruebas server-side.
- Reiniciar `pnpm dev` despues de cambiar variables.
