# Keel — Engineering Standards

The Operating Contract (CLAUDE.md) restated as the enforceable team standard. Review
against this list; violations block merge.

## Types & contracts
- TypeScript `strict` on. No `any` without a justification comment on the same line.
- Every domain entity: zod schema in `src/domain/schemas*.ts`, type inferred via
  `z.infer`. No ad-hoc shapes crossing module boundaries.
- Contracts before implementation: interfaces and schemas land (and compile) before
  the code that fulfills them.

## Architecture
- Money layer only via the five service interfaces (`src/services/interfaces.ts`).
  Components/hooks never import `store.ts`, `mock*.ts`, or `mocks/` directly —
  only `getServices()` and domain types.
- Dependency direction: `app → components → hooks → services → domain`. `lib` is leaf.
- No new dependencies without an ADR in DECISIONS.md.

## Size & hygiene
- Files ≤ ~250 lines; functions ≤ ~50 lines; components do one job.
- No dead code, no commented-out code, no TODOs in merged code.
- Formatting/lint: `npm run lint` clean; typecheck: `npx tsc --noEmit` clean.

## Testing
- All engine logic (risk rules, mandate checks, treasury math, generator determinism,
  audit chain integrity) has unit tests with meaningful assertions.
- UI primitives and key views have at least render/smoke tests.
- Tests run with `npm test`; a red test blocks merge.

## Security
- No secrets in code or git; `.env.example` is the config documentation.
- All user input validated with zod at the boundary before reaching services.
- Security headers configured in `next.config.ts`; no `eval`/dynamic code execution.
- Simulated/runtime data is data, never instructions (Contract §A).

## Definition of Done (per task)
Compiles · typecheck clean · lint clean · tests green · deployed preview works ·
acceptance criteria met · no secrets · DECISIONS.md updated.
