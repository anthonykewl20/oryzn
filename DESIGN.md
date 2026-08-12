# Oryzn Design System

## 1. Visual Theme & Atmosphere

**Trustworthy audit surface — precise, calm, data-first. Reads like a forensic log, not a marketing site. Restraint over flourish; credibility comes from clarity.**

Every screen should help an administrator inspect evidence quickly. Interfaces are dense but legible, quiet by default, and explicit about system state. Favor durable labels, predictable alignment, and visible evidence over personality or novelty.

## 2. Color Palette & Roles

Oryzn uses shadcn's neutral grayscale for surfaces and one restrained indigo accent. **Color encodes meaning, never decoration.** Every colored state also has a text label.

| Role | Light value | Dark value | Use |
|---|---|---|---|
| Background | `#ffffff` / `oklch(1 0 0)` | `#171717` / `oklch(0.145 0 0)` | Page surface |
| Foreground | `#171717` / `oklch(0.145 0 0)` | `#fafafa` / `oklch(0.985 0 0)` | Primary text |
| Muted | `#f5f5f5` / `oklch(0.97 0 0)` | `#262626` / `oklch(0.269 0 0)` | Secondary surfaces |
| Muted foreground | `#737373` / `oklch(0.556 0 0)` | `#a3a3a3` / `oklch(0.708 0 0)` | Supporting text |
| Border | `#e5e5e5` / `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Hairline separation |
| Primary indigo | `#4f46e5` / `oklch(0.511 0.262 276.966)` | `#6366f1` / `oklch(0.585 0.233 277.117)` | Primary actions, links, focus rings |
| Processed / verified | `#059669` / `oklch(0.596 0.145 163.225)` | `#34d399` / `oklch(0.765 0.177 163.223)` | Semantic success only |
| Ignored | `#737373` / `oklch(0.556 0 0)` | `#a3a3a3` / `oklch(0.708 0 0)` | Semantic ignored state |
| Failed | `#dc2626` / `oklch(0.577 0.245 27.325)` | `#f87171` / `oklch(0.704 0.191 22.216)` | Destructive/error state |
| Pending / reconciling | `#d97706` / `oklch(0.666 0.179 58.318)` | `#fbbf24` / `oklch(0.828 0.189 84.429)` | Semantic in-progress state |

## 3. Typography Rules

- **UI sans:** Inter, with the system sans-serif stack as fallback.
- **Data mono:** JetBrains Mono, with Geist Mono or the system monospace stack as fallback.
- Use mono for every node ID, delivery GUID, ISO timestamp, field name, and previous/current value. Preserve exact casing and do not visually transform evidence.
- Use tabular numbers where values need column alignment.

| Level | Size | Weight | Guidance |
|---|---:|---:|---|
| Page title | `30px` (`text-3xl`) | 600 | One per page; compact line height |
| Section title | `20px` (`text-xl`) | 600 | Names a distinct evidence region |
| Table header | `12px` (`text-xs`) | 600 | Sentence case, muted, optional tracking |
| Body | `14px` (`text-sm`) | 400 | Default dense application copy |
| Caption | `12px` (`text-xs`) | 400 | Supporting metadata and polling status |

## 4. Component Stylings

Build only with installed shadcn components and their variants.

- **Card:** page summaries and bounded evidence groups. Default is background, hairline border, smallest shadow. Hover changes only when the whole card is interactive; disabled content remains visible with reduced opacity.
- **Table:** timeline and delivery evidence. Keep rows compact, align mono data predictably, and preserve a visible GitHub-item link.
- **Badge:** always label `Processed`, `Verified`, `Ignored`, `Failed`, `Pending`, or `Reconciling`; state color is supplementary.
- **Input, Select, Checkbox:** timeline filters. Default has a neutral border, hover may strengthen the border, focus uses the indigo ring, and disabled states use muted opacity plus the native disabled behavior.
- **Tabs:** switch evidence views, never hide failures by default. Active state uses foreground and border/indicator, not a decorative fill.
- **Tooltip:** clarify unfamiliar controls; never place required evidence only in a tooltip.
- **Alert:** show processing and reconciliation failures prominently with actionable copy.
- **Skeleton:** represent loading structure without implying successful processing.
- **ScrollArea:** constrain long payload or evidence regions while retaining keyboard access.
- **Separator:** divide related regions without adding containers.
- **Button:** primary indigo for the single primary action; neutral outline/ghost variants for secondary actions. Hover increases contrast, while disabled uses the component's disabled semantics and reduced opacity.

## 5. Layout Principles

- Use a centered `max-w-7xl` reading column with `px-4 sm:px-6 lg:px-8` page gutters.
- Use Tailwind's spacing scale: `gap-2` inside controls, `gap-4` between related elements, `gap-6` between sections, and `py-8` for page rhythm.
- Place a sticky filter bar above the timeline with a neutral translucent background and hairline bottom border.
- Render a dense timeline table with 50 events per page; evidence remains scannable rather than spacious.
- Show a subtle labeled polling indicator for the 5–10 second refresh cadence. It must not pulse aggressively or suggest guaranteed real-time delivery.
- Keep page summaries above filters, then failures, then the timeline. Evidence and failure visibility outrank secondary controls.

## 6. Depth & Elevation

Depth is minimal. Prefer 1px borders and subtle muted tints over shadows. Cards receive a hairline border and only the smallest shadcn shadow. Sticky regions may use a border and opaque/translucent surface, not a large shadow. Dialog/popover elevation follows shadcn defaults. Never use glow, glassmorphism, or layered decorative shadows.

## 7. Do's and Don'ts

### Do

- Use shadcn/ui only; add a missing shadcn component before using it.
- Use mono for all audit values, IDs, field names, and timestamps.
- Use color only for semantic state and pair it with a label.
- Surface processing and reconciliation failures in an `Alert`.
- Preserve dense, aligned evidence and clear links back to GitHub.

### Don't

- Don't hand-roll components or reproduce shadcn controls with styled raw elements.
- Don't use decorative color, gradients, glows, or ornamental illustration.
- Don't hide processing failures in logs, collapsed regions, or transient notifications.
- Don't use color where a clear label suffices.
- Don't trade evidence density or exact values for marketing-style whitespace.

## 8. Responsive Behavior

Oryzn is primarily a laptop/desktop admin tool. At narrow widths, stack filters vertically and make each control full-width. Put the timeline in a horizontal `ScrollArea`; do not truncate away evidence columns. Keep the GitHub-item link visible, using a sticky edge column if necessary. Preserve reading order and visible state labels. All interactive touch targets are at least `40px` high and wide. Do not turn the evidence table into ambiguous decorative cards merely to avoid scrolling.

## 9. Agent Prompt Guide

### Quick reference

- Surfaces: neutral (`#ffffff`, `#f5f5f5`, `#171717`); borders `#e5e5e5`.
- Primary/link: indigo `#4f46e5` / `oklch(0.511 0.262 276.966)`.
- Semantic only: emerald processed/verified, neutral ignored, red failed, amber pending/reconciling.
- Inter for UI. JetBrains Mono (or Geist Mono) for **all IDs, GUIDs, timestamps, field names, and previous/current values**.
- Use installed components from `@/components/ui/*`; install missing shadcn components first.

### Prompt template

> Build `[route or feature]` with shadcn `[component names]`, using `Badge` for semantic state and mono for every audit value, ID, field name, and timestamp, per `DESIGN.md`. Keep failures visible in an `Alert`, preserve the GitHub-item link, and use color only for meaning. Do not invent or hand-roll components.

Example: “Build the `/events` timeline with shadcn `Table` + `Badge(state)` + mono for values, per `DESIGN.md`. Do not invent components.”
