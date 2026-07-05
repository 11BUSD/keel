# Keel — Design Spec

Keel must feel like **institutional financial infrastructure**: calm, dense but legible,
zero gimmicks. The user is trusting this screen to supervise autonomous money — the UI's
job is to make risk and control *visible*.

## Principles

1. **Hierarchy first.** Every view answers, in order: What is the state? What changed?
   What needs me? Primary numbers large, context small, chrome minimal.
2. **Dense but legible.** Tables and stat grids over cards-with-air. 13–14px body in
   data surfaces, generous line-height, tabular numerals for all figures.
3. **Explainability is UI.** Decisions are never a bare "approved/denied" — the rule
   trace is a first-class component, always one click or zero clicks away.
4. **Simulated data is labeled.** A persistent "SIMULATED DATA" badge in the shell.
   Never let a screenshot pass as a live financial system.
5. **Motion is purposeful.** Only state transitions animate (evaluation progress,
   value updates). Durations ≤ 300ms. No decorative animation.

## Semantic color tokens (the only colors components may use)

Defined once in `src/app/globals.css`; components use Tailwind classes bound to them.
No hard-coded hex in components.

| Token        | Role                                    |
|--------------|-----------------------------------------|
| `surface-0/1/2/3` | page → panel → raised → overlay backgrounds |
| `line`, `line-strong` | borders/dividers                 |
| `ink`, `ink-muted`, `ink-faint` | text hierarchy         |
| `accent`     | interactive/brand (restrained indigo)    |
| `positive`   | healthy, approved, gains                 |
| `caution`    | degrading, warnings, pending             |
| `danger`     | breach, denied, kill                     |

Dark theme only for the prototype (institutional dashboards read best dark; one theme
= less drift).

## Typography & spacing

- Geist Sans for UI, Geist Mono for figures, IDs, hashes, and rule traces.
- Scale: 12 (labels/badges), 13–14 (body/data), 16 (section titles), 20–24 (page
  titles), 28–32 (hero stats). Weights 400/500/600 only.
- Spacing on a 4px grid; panel padding 16–24px; page gutter 24–32px, max-width 1440px.

## Required states — every data view must handle all four

- **Loading:** skeletons that match the final layout (no raw spinners).
- **Empty:** explanatory empty state with the action that fills it.
- **Error:** what failed + retry affordance. Never a blank panel or crash.
- **Partial:** stale-while-refetching is acceptable; show data over blocking.

## Accessibility (requirement, not afterthought)

- Full keyboard operability; visible focus ring (accent, 2px) on all interactives.
- Contrast ≥ 4.5:1 for text tokens on their surfaces.
- Status conveyed by text/icon + color, never color alone (badges carry labels).
- Semantic HTML: real tables for tabular data, buttons for actions, nav landmarks.

## Component inventory (design-system primitives)

Shell (sidebar nav + topbar), Card/Panel, StatBlock, DataTable, Badge (status variants),
Sparkline/TrendChart (inline SVG), ProgressMeter, Button (primary/ghost/danger),
Field/Input/Select, Skeleton, EmptyState, ErrorState, RuleTrace, AuditRow.
All primitives live in `src/components/ui` and are showcased at `/style`.
