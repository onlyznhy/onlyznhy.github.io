---
version: alpha
name: Personal Portfolio System
description: A bright, restrained technology portfolio system for a student job seeker and blogger who demonstrates product judgment, supply-chain thinking, and tool-enabled work.
---

## 1. Visual Theme & Atmosphere

The system should feel premium, simple, and quietly technical. Use a porcelain canvas, crisp ink typography, hairline borders, and a generated system-map hero image to imply product architecture and supply-chain flow. The design should avoid generic template sections, dark-mode-first presentation, oversized decorative gradients, and heavy hover effects.

## 2. Product / Service Archetype

This is a personal portfolio and knowledge-exchange site. Primary users are HR reviewers, product/supply-chain peers, and followers. The task model is scanning identity, understanding thinking depth, reviewing selected work, then contacting the owner.

## 3. Color Palette & Roles

Use `#fbfaf7` for the page canvas, `#ffffff` for cards, and `#f4f7f8` for quiet inset surfaces. Use `#17191c` for headings and primary CTAs. Use cyan `#1f8aa5` for system labels, links, and focus states. Use muted amber and blue only for project category accents.

## 4. Typography Rules

Use a system sans stack with Inter-like behavior. Hero type uses `clamp(46px, 6.2vw, 86px)` at 0.98 line height. Section headings use `clamp(32px, 4vw, 56px)`. Body text is 16-17px with generous 1.7 line height. Letter spacing remains 0 except mono eyebrows at 0.08em.

## 5. Component Styling

Navigation is fixed, translucent, and hairline-separated. Buttons are 8px rounded rectangles with at least 46px height. Cards use 12px radius, white surfaces, hairline borders, and a subtle stacked shadow. Chips use 6px radius and muted backgrounds. Project cards are large, content-forward, and use one soft accent shape per category.

## 6. Layout Principles

Desktop uses a max-width of 1180px with fixed gutters. The hero is full viewport height with text left and the generated background image covering the surface. Sections follow a two-column introduction, three-column strengths, four-step method strip, three-card project grid, and two-column closing area. Below 920px, grids collapse to one column except the method strip, which becomes two columns; below 620px everything stacks.

## 7. Depth & Elevation

Depth is created by hairlines, soft card shadows, and translucent nav/hero panels. Do not introduce heavy material shadows, glassy blur everywhere, or nested card surfaces. Radius stays restrained: 6px for chips, 8px for buttons, 12px for cards.

## 8. Interaction & Motion

Hover raises buttons by 1px only. Navigation anchors scroll smoothly. Focus states use a cyan outline. Honor `prefers-reduced-motion` by disabling transitions and smooth scroll. No continuous animations are required for the first version.

## 9. Content & Data Rules

Content should prove thinking rather than list generic skills. Use labels such as `Product Case`, `Tool Workflow`, and `Blog Series`. Project summaries should mention the problem, thinking lens, and output format. Replace placeholder contact links before publishing.

## 10. Accessibility

Use semantic sections and nav labels. Keep CTA tap targets above 44px. Maintain strong contrast between ink and light surfaces. Avoid text over busy image regions by using a left-side light overlay in the hero. Keyboard focus must be visible.

## 11. Implementation Tokens

Implementation tokens live in `tokens.css` and mirror `tokens.json`: `--color-*`, `--font-*`, `--text-*`, `--space-*`, `--radius-*`, `--shadow-card`, `--duration-fast`, and `--ease-standard`. The React implementation imports the same values in `src/styles.css`.

## 12. Source Notes & Gaps

Input mode was a detailed prompt plus a generated hero bitmap. Inspiration pass used `linear.app` for restrained technical density, `vercel` for bright engineered surfaces, and `notion` for approachable knowledge-system structure. No real personal name, photo, resume, social URLs, or finished project links were provided, so contact information and project titles are representative placeholders for user review.
