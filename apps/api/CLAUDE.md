# Backend app — agent guide (read me first)

## Purpose

This app is the API for @repo application. Optimize for correctness, maintainability, and fast feedback (tests).

## Quick map

- Language: TypeScript. Runtime: Node (>=20). Framework: Fastify.
- App: `apps/api` (@repo/api) — API Gateway / backend entrypoint.
- Architecture: Hexagonal (Ports & Adapters) + DDD by feature/modules.
  - Domain (entities/value objects/policies): `apps/api/src/**/domain`
  - Application (use-cases/services): `apps/api/src/**/application`
  - Ports:
    - In (use-cases): `apps/api/src/**/application/ports/in`
    - Out (repos/gateways): `apps/api/src/**/application/ports/out`
  - Infrastructure/adapters (DB, JWT, external services, queues): `apps/api/src/**/infrastructure`
  - Web entrypoints (Fastify routes/controllers + DTO/mappers): `apps/api/src/**/infrastructure/web`
- Tests (Vitest): `apps/api/test` mirrors `apps/api/src` structure.
  - Unit (domain + application): `apps/api/test/**/domain` and `apps/api/test/**/application`
  - Integration (infrastructure/adapters): `apps/api/test/**/infrastructure`
  - E2E (critical API flows): `apps/api/test/e2e`

## Working rules

### Default workflow

1. **Research → Plan → Implement → Validate.** Start by locating existing patterns before writing code.
2. Keep changes minimal and localized; avoid drive-by refactors.

## Architecture (DDD + Hexagonal)

Package layout per context (e.g., auth/, user/):

- domain/: entities and pure business logic. No framework/IO deps.
- application/: use-cases + orchestration. Depends on domain only.
  - ports/in: use-case interfaces (entrypoints call these)
  - ports/out: required gateways (repos, hashing, token provider, etc.)
- infrastructure/: adapters implementing ports/out + web controllers.
  - web/: controllers + HTTP DTOs + mappers. Controllers call ports/in only.
    Rules:
- domain and application MUST NOT import infrastructure.
- Controllers do mapping/validation only; business rules live in application/domain.
- Use-cases depend on ports; adapters implement ports.
- Never expose domain entities directly as HTTP DTOs.

### TDD expectations

- When adding/changing behavior: write/adjust tests first, confirm they fail, then implement until green.
- Prefer unit tests for domain/use-cases; integration tests for adapter wiring; e2e only for critical paths.
- Don’t “mock the world”: mock at the boundary (ports), not inside the domain.

### OOP expectations (TypeScript)

- Favor small cohesive objects; keep invariants inside constructors/factories.
- Domain entities/value objects should be immutable where practical.
- Prefer explicit domain errors (typed) over generic throws.

## Verification (always run before finishing)

Run from repo root unless noted.

- Unit tests: `npm test` (turbo test)
- Lint: `npm run lint` (turbo lint)
- Format check/fix (when touching lots of files):
  - check: `npm run format-and-lint` (biome check)
  - fix: `npm run format:fix` (biome format --write)
    API-specific (apps/api):
- Typecheck: `npm -C apps/api run check:types` (tsc --noEmit)
- Tests only for API: `npm -C apps/api test` (vitest)
