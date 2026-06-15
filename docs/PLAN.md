# Plan de Implementación MVP: Battle Git

## Resumen

Se implementará Battle Git en fases, empezando con una versión mockeada jugable y testeable antes de conectar auth, base de datos e integraciones reales. El primer entregable documentado será `docs/IMPLEMENTATION_PLAN.md`, sincronizado con `docs/PRD.md` y `docs/ARCHITECTURE.md` según `AGENTS.md`.

Decisiones cerradas para el plan:

- Next.js 16 App Router + TypeScript + Tailwind.
- Package manager: `pnpm`.
- Auth: Clerk con GitHub OAuth.
- DB: Neon PostgreSQL.
- ORM: Drizzle.
- Three.js vía React Three Fiber.
- MVP mock-first con dos usuarios.
- Beta con códigos de invitación, validada después del login.
- Batallas simuladas server-side con botón `Skip`.
- Repos públicos solamente para MVP.

## Fases de Implementación

### Fase 0: Documentación y Bootstrap

- Crear `docs/IMPLEMENTATION_PLAN.md` con fases, criterios de aceptación y alcance MVP.
- Inicializar proyecto Next.js 16 App Router con `pnpm`.
- Configurar TypeScript, Tailwind, ESLint, Vitest y Playwright.
- Definir estructura inicial:
  - `app/` para rutas.
  - `components/` para UI.
  - `components/battle-scene/` para React Three Fiber.
  - `domain/` para stats, batalla y matchmaking.
  - `server/` para acciones, queries, db e integraciones.
  - `mocks/` para usuarios, repos, stats y batallas.

### Fase 1: Dominio + Mock de Datos

- Crear dos usuarios mock:
  - `Dev_Pixel`: perfil JS/TS, clase tipo hechicero, stats balanceados.
  - `CodeKnight`: perfil Python/Go, clase tipo caballero, alta guardia.
- Modelar datos mock de repos públicos, commits, PRs, reviews, issues, CI y lenguaje principal.
- Implementar funciones puras:
  - cálculo de stats;
  - asignación de clase/personaje;
  - generación de `visualPreset`;
  - simulación de batalla;
  - generación de timeline con `animationCue`;
  - ranking semanal mock.
- Cubrir estas reglas con Vitest antes de construir pantallas.

### Fase 2: Pantallas Mockeadas del MVP

- Landing con estética pixel-art/cyberpunk/terminal retro y CTA principal.
- Demo mock accesible sin auth para validar experiencia visual inicial.
- Dashboard mock con personaje, stats, repos/ejército, recomendaciones y acciones.
- Onboarding sync mock con animación estilo `git clone`.
- Reveal de personaje con clase, stats y explicación breve.
- Training battle y Arena battle usando los dos usuarios mock.
- Resultado de batalla con resumen, recompensas mock y opción de replay.
- Ranking semanal mock.
- Settings mock para privacidad y exclusión visual de repos, sin persistencia real todavía.

### Fase 3: Three.js / React Three Fiber

- Crear `ThreeBattleScene` como Client Component.
- Renderizar escenario placeholder estilo sala de servidores.
- Renderizar personajes con geometrías simples según `visualPreset`.
- Reproducir timeline de batalla:
  - idle;
  - ataque;
  - bloqueo;
  - daño;
  - especial;
  - derrota.
- Implementar botón `Skip` que detiene animación y muestra resultado final.
- Mantener el motor de batalla fuera de Three.js: la escena solo interpreta el timeline.

### Fase 4: Auth + Beta Invites

- Integrar Clerk con GitHub OAuth.
- Proteger rutas de juego bajo layout autenticado.
- Crear flujo de beta después del login:
  - usuario inicia sesión con GitHub;
  - si no tiene acceso beta, ve pantalla para ingresar código;
  - código válido activa acceso;
  - código inválido muestra error recuperable.
- Mantener landing pública.
- Mantener demo mock pública si no complica el flujo.

### Fase 5: Base de Datos + Drizzle

- Configurar Neon PostgreSQL y Drizzle.
- Crear esquema inicial:
  - users;
  - github_accounts;
  - beta_invites;
  - beta_redemptions;
  - repository_snapshots;
  - player_profiles;
  - player_stats;
  - battles;
  - battle_participants;
  - battle_turns;
  - ranking_entries;
  - sync_runs.
- Migrar mocks hacia seed local.
- Agregar server queries/actions para dashboard, batalla, ranking e invitaciones.
- Mantener modo mock/demo separado del modo autenticado real.

### Fase 6: Integración GitHub

- Usar GitHub OAuth vía Clerk para obtener identidad del usuario.
- Implementar cliente GitHub para repos públicos.
- Sincronizar perfil, repos, lenguajes y señales públicas disponibles.
- Guardar snapshots normalizados.
- Calcular stats reales y army de repositorios desde snapshots guardados en Neon.
- Renderizar `/game/army` desde `repository_snapshots`, evitando consultas a GitHub en cada visita.
- Permitir nuevo sync contra GitHub una vez por día por usuario.
- Registrar `sync_runs` con estado, errores, fecha y cantidad de repos procesados.
- Mostrar tooltip en Three.js con nombre, Fork/Source y poder del repositorio.
- Si GitHub falla o rate limita, mostrar estado recuperable y conservar último snapshot válido.

### Fase 7: Beta MVP

- Completar landing con invitación a beta.
- Agregar formulario para solicitar acceso beta.
- Agregar flujo de código de invitación post-login.
- Preparar dataset inicial con invites manuales.
- Validar onboarding completo:
  - landing;
  - login;
  - beta code;
  - sync;
  - reveal;
  - training battle;
  - dashboard;
  - arena mock/real según disponibilidad;
  - ranking.

## Interfaces y Contratos Clave

- `PlayerStats`: `hp`, `attack`, `guard`, `speed`, `special`, `powerScore`, `explanations`.
- `CharacterVisualPreset`: `className`, `primaryColor`, `secondaryColor`, `placeholderShape`, `futureAssetKey`.
- `BattleSimulation`: `battleId`, `mode`, `participants`, `turns`, `winnerId`, `rewards`.
- `BattleTurnView`: `turn`, `actorId`, `targetId`, `action`, `damage`, `blocked`, `message`, `animationCue`.
- Server actions mínimas:
  - `startTrainingBattle()`;
  - `startArenaBattle()`;
  - `redeemBetaInvite(code)`;
  - `syncGitHubProfile()`;
  - `excludeRepository(repoId)`.
- Variables de entorno mínimas:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`;
  - `CLERK_SECRET_KEY`;
  - `DATABASE_URL`;
  - `CLERK_WEBHOOK_SECRET`;
  - `APP_BASE_URL`.

## Test Plan

- Vitest:
  - cálculo de stats con ambos usuarios mock;
  - normalización anti-abuso básica;
  - asignación de clase y preset visual;
  - simulación de batalla determinística con seed;
  - ranking semanal;
  - validación de beta invite.
- Playwright:
  - landing carga y CTA visible;
  - demo mock navega hasta batalla;
  - dashboard mock muestra stats y personaje;
  - batalla reproduce timeline y `Skip` muestra resultado;
  - login gate redirige rutas protegidas;
  - beta gate bloquea sin código y permite con código válido.
- Visual/browser checks:
  - canvas Three.js no está en blanco;
  - personajes placeholder aparecen en desktop y mobile;
  - UI no se superpone con barras de HP, log ni botón `Skip`.

## Criterios de Aceptación MVP

- Un usuario puede entender la propuesta desde la landing.
- La demo mock permite ver dashboard, batalla y ranking sin integraciones reales.
- Dos usuarios mock pueden batallar con timeline reproducible.
- Three.js renderiza escenario y personajes placeholder.
- `Skip` funciona en batalla.
- Clerk protege el área autenticada.
- El acceso beta requiere código después del login.
- Drizzle + Neon persisten usuarios, invites, perfiles, stats y batallas.
- GitHub sync usa solo repos públicos.
- Vitest y Playwright cubren los flujos críticos.

## Supuestos

- No se implementan equipos, países, raids ni acciones elegidas por usuario en MVP.
- Redis/Upstash queda fuera hasta que haya necesidad real de cache, colas o rate limiting distribuido.
- Los assets finales se integrarán después; MVP usa geometrías y colores.
- La demo mock puede convivir con el flujo real siempre que esté aislada de datos productivos.
