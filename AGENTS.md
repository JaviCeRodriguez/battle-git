# AGENTS.md

## Documentation Synchronization

When editing documentation in this repository, always review the rest of the documentation before finishing the change.

Current documentation set:

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/ENVIRONMENT.md`
- `docs/PLAN.md`

Required behavior:

- If a product decision changes in `docs/PRD.md`, check whether `docs/ARCHITECTURE.md` must be updated.
- If a technical decision changes in `docs/ARCHITECTURE.md`, check whether `docs/PRD.md` must be updated.
- If an implementation phase changes in `docs/IMPLEMENTATION_PLAN.md`, check whether `docs/PRD.md` and `docs/ARCHITECTURE.md` must be updated.
- If required environment variables or credentials change, update `docs/ENVIRONMENT.md` and `.env.example` together.
- Keep MVP scope, stack choices, privacy assumptions, gameplay decisions, and future-phase notes aligned across documents.
- Do not leave answered questions duplicated as open decisions.
- Prefer adding a short "Decisiones Tomadas" or "Decisiones Abiertas" update instead of scattering contradictory notes.

## Validation Workflow

Use this validation workflow for code changes:

- Run lint with `pnpm lint`.
- Run typecheck with `pnpm tsc --noEmit`.
- Do not use `pnpm build` as the default validation step.
- Do not start the dev server from the agent.
- Test business logic with Vitest, focusing on the newly implemented logic and any directly affected behavior.
- For Vitest, prefer targeted tests when possible, for example `pnpm vitest run path/to/file.test.ts`.
- Run Playwright only when browser-level behavior changed.
- Playwright must use a dev server already started by the user. Do not start it from the agent.
- If Playwright validation is needed and no user-started dev server is available, ask the user to start it and provide the local URL.
- Avoid killing or restarting dev server ports unless the user explicitly asks for it.

Project decisions currently established:

- Next.js 16 App Router.
- Clerk with GitHub OAuth.
- Drizzle ORM.
- Public GitHub repositories only for MVP.
- Simulated battles with a Skip button for MVP.
- Three.js for battle scenarios, character placeholders, and animations.
- Own visual assets later; geometric color placeholders during MVP.
- Individual players first; teams, entry requirements, and country representation later.
- Redis/Upstash only when there is a real need, while keeping the architecture ready for it.
