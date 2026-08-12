# Agent Guide

This guide is binding for coding and AI agents working in Oryzn.

## UI RULE

**Build ALL UI with shadcn/ui. Import from `@/components/ui/*`. NEVER hand-roll components or replicate them with raw styled elements. If a needed component is not installed, add it first with `npx shadcn@latest add <name>` before using it.**

Before any UI work, read [DESIGN.md](DESIGN.md) — color, typography, components, do's/don'ts. Color is semantic only; use the mono font for node IDs, delivery IDs, timestamps, and field values.

## Project conventions

- Use the Next.js App Router.
- Put API route handlers in `src/app/api/*` and pages in `src/app/*`.
- Access the database through `src/db`.
- Keep `audit_events` append-only. Access it only through `src/db/audit-events.ts`; never expose update or delete operations.
- Put migrations in `src/db/migrations` and apply them with `npm run migrate`.
- Read and validate environment configuration through `src/lib/env.ts`.
- Read the **UNMODIFIED raw body** before webhook signature verification. Never parse, normalize, or reserialize it first.

## Process

Follow [CONTRIBUTING.md](CONTRIBUTING.md): use conventional commits and satisfy the strict PR policy gate. Every implementation PR closing-links its issue with `Closes #N` and declares exactly one documentation decision. Never edit `CHANGELOG.md` manually.

## Pre-finish checklist for UI work

- [ ] Used shadcn components only
- [ ] Applied mono to audit values, IDs, and timestamps
- [ ] Used color for semantic meaning only
- [ ] Surfaced failures instead of hiding them
- [ ] Matched `DESIGN.md`
