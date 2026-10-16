---
name: frontend-shadcn-blocks
description: "Build or revise frontend UI with shadcn/ui blocks and components while minimizing bespoke HTML and CSS. Use for React, Next.js, Vite, dashboards, forms, pages, responsive layouts, accessibility, and visual polish in this repository."
argument-hint: "Describe the frontend screen or workflow to build with shadcn blocks"
user-invocable: true
---

# Frontend UI With shadcn Blocks

Build usable, polished frontend experiences by composing the repository's shadcn/ui primitives and existing blocks. Prefer established components and design tokens over one-off markup, while keeping custom code focused on product behavior and composition.

## When to Use

Use this skill when:

- Creating or revising a React frontend screen, route, dashboard, form, table, dialog, navigation flow, or responsive layout.
- A request mentions shadcn, shadcn blocks, Radix/Base UI, Tailwind, Lucide, or reusable UI components.
- A design can be expressed by composing existing primitives instead of introducing a bespoke component system.

Do not use it for backend-only work, schema changes, or purely visual asset production.

## Repository Conventions

Before editing, inspect the relevant route and nearby components. This repository's frontend currently uses:

- `frontend/components.json` as the shadcn source of truth.
- `base-vega` styling with the `mist` base color and CSS variables.
- `frontend/components/ui` for primitives and `frontend/components` for shared composition.
- `@/components`, `@/components/ui`, `@/lib`, and `@/hooks` import aliases.
- Lucide icons through `lucide-react`.
- React Server Components by default where the route supports them; add `"use client"` only for client state, effects, browser APIs, or event handlers that require it.

Preserve existing local patterns when they differ from these defaults.

## Procedure

1. **Locate the owning surface.** Find the target route, layout, or existing feature component. Read its imports, data shape, and nearby UI before creating files. Identify whether the screen is server-rendered or client-interactive.
2. **Inventory reusable pieces.** Search `frontend/components/ui`, shared components, and existing routes for the needed pattern. Reuse the closest component before creating a new one. Prefer composition over copying markup.
3. **Choose the block composition.** Break the request into recognizable UI patterns such as a page header, sidebar, tabs, card, table, form, command menu, dialog, sheet, dropdown, alert, or empty state. Use shadcn primitives and existing blocks for those patterns.
4. **Add missing primitives through the project workflow.** If a required shadcn component is absent, use the configured shadcn CLI or registry entry and review the generated code. Do not hand-roll a replacement for a standard primitive. Keep generated additions limited to what the feature needs.
5. **Compose the feature.** Write the smallest route or feature component that wires together the selected blocks, domain data, actions, loading state, error state, empty state, and success feedback. Use semantic HTML only for structural elements that shadcn does not provide; avoid bespoke clickable divs and duplicated control styling.
6. **Follow the visual system.** Use the existing CSS variables, Tailwind utilities, spacing, radii, typography, and responsive conventions. Do not introduce a competing color palette, arbitrary gradients, or page-wide styling that bypasses the design system. Use Lucide icons for iconography and provide accessible labels or tooltips for unfamiliar icon-only controls.
7. **Make the workflow complete.** Ensure forms have labels, validation, keyboard access, disabled and pending states, and useful error feedback. Ensure tables, lists, and dashboards handle loading, empty, error, and dense-content states. Keep controls usable on narrow screens and avoid horizontal overflow unless the content genuinely requires it.
8. **Review the implementation.** Check that imports use project aliases, client boundaries are necessary, no standard shadcn primitive was duplicated, and custom HTML/CSS is limited to composition or domain-specific behavior. Remove unused components, props, and styles.
9. **Validate the touched slice.** Run the narrowest relevant checks first, then the frontend checks when practical:
   - `pnpm --dir frontend typecheck`
   - `pnpm --dir frontend lint`
   - `pnpm --dir frontend build` when routing, server/client boundaries, or generated components changed
   - Start the frontend dev server and inspect the target route at desktop and mobile widths when visual behavior is part of the request.

## Decision Rules

- **Existing component available:** import and compose it; do not recreate it.
- **Existing component close but not exact:** extend it through supported props or a small wrapper; keep the primitive's API intact.
- **Standard shadcn primitive missing:** add it with the configured shadcn workflow, then compose it.
- **Product-specific behavior missing:** create a focused feature component in the owning module; do not modify a generic primitive for one screen.
- **Interaction needs browser state or event handlers:** isolate that behavior in the smallest possible client component and keep surrounding layout server-rendered when appropriate.
- **No suitable block exists:** use semantic structural HTML and existing tokens for the narrow gap, then consider whether the pattern should become a reusable shared component.

## Completion Checklist

- The requested workflow is reachable and its primary action works.
- Existing shadcn primitives or blocks are reused wherever applicable.
- No bespoke clickable elements replace standard accessible controls.
- Responsive layout, keyboard navigation, focus treatment, and accessible names are covered.
- Loading, empty, error, disabled, and success states are handled where relevant.
- The implementation uses existing theme tokens and does not introduce unrelated visual systems.
- Typecheck and lint pass for the frontend, or any pre-existing failures are reported separately.
- The target route has been visually inspected when the change affects layout or styling.
