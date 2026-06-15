# Plan de Implementacion MVP: Battle Git

## Resumen

Battle Git se implementa por fases, empezando con una version mockeada, jugable y testeable antes de conectar autenticacion, base de datos e integraciones reales.

Decisiones cerradas:

- Next.js 16 App Router + TypeScript + Tailwind.
- Package manager: `pnpm`.
- Auth: Clerk con GitHub OAuth.
- DB: Neon PostgreSQL.
- ORM: Drizzle.
- Three.js via React Three Fiber.
- MVP mock-first con dos usuarios.
- Beta con codigos de invitacion validada despues del login.
- Batallas simuladas server-side con boton `Skip`.
- Repos publicos solamente para MVP.

## Fases

### Fase 0: Documentacion y Bootstrap

- Crear `docs/IMPLEMENTATION_PLAN.md`.
- Inicializar Next.js 16 App Router.
- Configurar TypeScript, Tailwind, ESLint, Vitest y Playwright.
- Definir carpetas `app`, `components`, `domain`, `server` y `mocks`.

### Fase 1: Dominio + Mock de Datos

- Crear usuarios mock `Dev_Pixel` y `CodeKnight`.
- Modelar repos publicos, actividad, stats y presets visuales.
- Implementar calculo de stats, personaje, batalla, timeline y ranking.
- Cubrir dominio con Vitest.

### Fase 2: Pantallas Mockeadas

- Landing publica.
- Demo publica sin auth.
- Dashboard, sync, reveal, batalla, ranking y settings mock.
- Resultado de batalla con resumen y replay.

### Fase 3: Three.js / React Three Fiber

- Crear escena de batalla client-side.
- Renderizar escenario server-room y personajes placeholder.
- Reproducir cues de animacion.
- Implementar `Skip`.

### Fase 4: Auth + Beta Invites

- Integrar Clerk con GitHub OAuth.
- Proteger rutas bajo `/game`.
- Validar codigo beta despues del login.

### Fase 5: Base de Datos + Drizzle

- Configurar Neon + Drizzle.
- Crear schema inicial para usuarios, invites, repos, stats, batallas, ranking y sync.
- Mantener demo mock aislada de datos productivos.

### Fase 6: Integracion GitHub

- Obtener identidad via Clerk.
- Sincronizar repos publicos y senales disponibles.
- Guardar snapshots en Neon y recalcular stats/personajes desde base de datos.
- Renderizar `/game/army` siempre desde `repository_snapshots`, no desde GitHub.
- Permitir un sync manual diario por usuario, registrado en `sync_runs`.
- Mostrar personajes de repositorios en Three.js con tooltip de nombre, Fork/Source y poder.
- Conservar ultimo snapshot valido ante errores.

### Fase 7: Beta MVP

- Completar invitacion beta desde landing.
- Habilitar codigos manuales.
- Validar flujo completo de onboarding, batalla y ranking.

## Criterios de Aceptacion

- La landing comunica la propuesta.
- La demo mock permite jugar sin integraciones reales.
- Dos usuarios mock pueden batallar con timeline reproducible.
- React Three Fiber renderiza escenario y personajes placeholder.
- `Skip` muestra el resultado final.
- Vitest cubre dominio critico.
- Playwright cubre landing, demo, batalla y beta gate.
- Drizzle define el schema inicial para Neon.
