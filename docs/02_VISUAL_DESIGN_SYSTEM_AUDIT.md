# SyncSpace — Audit 2
# Visual Design & Design System Audit

You are acting as a **Senior Product Designer, Design Systems Engineer, and Frontend UI Engineer**.

SyncSpace is a real enterprise team collaboration and project management SaaS. This audit is ONLY about visual design and the design system.

## Important

Before auditing:

1. Read `AGENTS.md`.
2. Read the relevant `.ai/` documentation.
3. Read `DESIGN_SYSTEM.md`.
4. Read `UX_PRINCIPLES.md`.
5. Inspect the complete frontend.
6. Review the existing Stitch/design reference images if available.
7. Review the results of Audit 1 if available.

Do not perform backend changes.

Do not change product functionality.

Do not perform performance optimization in this audit.

Do not perform major architecture refactoring.

---

# Audit Goals

Determine whether the entire application feels like one mature, cohesive product.

The goal is NOT visual novelty.

The goal is:

- clarity
- consistency
- hierarchy
- restraint
- professional enterprise appearance
- comfortable long-session use
- coherent light/dark themes
- reusable design patterns

---

# 1. Typography

Audit:

- font family
- font sizes
- heading hierarchy
- body text
- metadata
- labels
- buttons
- table text
- dialog text
- line heights
- font weights
- letter spacing

Identify inconsistent or unnecessary typography variations.

---

# 2. Color System

Audit:

- background
- foreground
- surfaces
- cards
- borders
- primary accent
- destructive states
- success
- warning
- information
- muted text
- badges
- status colors

Check whether colors communicate meaning consistently.

Avoid excessive accent colors.

Avoid hardcoded colors that bypass the design system.

---

# 3. Light and Dark Themes

Audit both themes independently.

Check:

- contrast
- surface hierarchy
- border visibility
- muted text
- cards
- dialogs
- dropdowns
- inputs
- tables
- badges
- focus states

Dark mode should not simply be an inverted light mode.

---

# 4. Spacing System

Audit:

- page padding
- section spacing
- card padding
- modal spacing
- form spacing
- table row spacing
- navigation spacing
- component gaps

Identify arbitrary spacing values.

Establish a consistent rhythm.

Do not make everything unnecessarily spacious.

Enterprise productivity interfaces should maintain useful information density.

---

# 5. Layout and Width

Audit:

- sidebar width
- top bar height
- page content width
- max-width rules
- grid layouts
- dashboard columns
- form widths
- task detail width
- table width
- Kanban width

Different page types may intentionally use different widths.

Do not force a single width on every page.

---

# 6. Components

Audit shared components:

- Button
- Input
- Select
- Dropdown
- Dialog
- Sheet
- Tooltip
- Badge
- Avatar
- Card
- Table
- Tabs
- Breadcrumb
- Toast
- Skeleton
- Empty state
- Error state

Identify:

- duplicate implementations
- inconsistent variants
- inconsistent sizing
- inconsistent states
- inconsistent styling

---

# 7. Enterprise Visual Restraint

Identify unnecessary:

- gradients
- glassmorphism
- shadows
- glowing effects
- excessive rounded corners
- decorative icons
- animations
- badges
- visual separators

Ask:

> Does this element improve comprehension or interaction?

If not, recommend simplifying it.

---

# 8. Page-Level Consistency

Compare:

- Authentication
- Dashboard
- Projects
- Project details
- Boards
- Tasks
- Members
- Activity
- Notifications
- Settings
- Profile
- Invitations

Every page should feel like the same product.

---

# 9. Navigation Visual Language

Audit:

- active navigation
- hover states
- selected workspace
- breadcrumbs
- sidebar grouping
- icons
- notification indicators
- profile menu

Ensure states are clear without being visually loud.

---

# 10. Data-Dense Interfaces

Audit:

- project lists
- task lists
- tables
- Kanban
- activity feeds
- members

Prioritize scanability.

Avoid giant cards where compact information would work better.

---

# 11. Responsive Visual Design

Review visual behavior at:

- 1440px
- 1280px
- 1024px
- 768px
- 640px
- 390px

Do not redesign responsiveness in this audit; identify visual problems only.

---

# 12. Accessibility

Audit:

- contrast
- focus visibility
- text readability
- color-only indicators
- touch target sizes
- reduced motion support

---

# Output

Do not modify code.

Produce:

## 1. Executive Summary

## 2. Critical Visual Issues

## 3. High Priority Issues

## 4. Medium Priority Issues

## 5. Low Priority Polish

## 6. Design Token Findings

## 7. Component Consistency Findings

## 8. Light/Dark Theme Findings

## 9. Responsive Visual Findings

## 10. Unnecessary Visual Elements

## 11. Recommended Design System Changes

## 12. Prioritized Implementation Plan

Use:

- P0 — Must Fix
- P1 — Should Fix
- P2 — Later

Do not use scores or rankings.

Do not implement changes yet.
