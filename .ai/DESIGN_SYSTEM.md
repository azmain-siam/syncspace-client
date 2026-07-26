# DESIGN_SYSTEM.md — SyncSpace Design System

Version: 1.0

---

# Overview

SyncSpace is a modern SaaS productivity platform inspired by:

- Linear
- Notion
- Vercel Dashboard
- GitHub
- Slack

The UI should feel:

- Professional
- Calm
- Premium
- Fast
- Minimal
- Focused

The interface should never distract users from their work.

Every design decision should prioritize usability over decoration.

---

# Design Philosophy

## Core Principles

- Simplicity over complexity.
- Clarity over decoration.
- Speed over animations.
- Consistency over creativity.
- Accessibility by default.
- Dark mode first.
- Mobile responsive.
- Keyboard friendly.

Every screen should answer four questions:

1. Where am I?
2. What can I do?
3. What changed?
4. What should I do next?

---

# Visual Identity

## Personality

The product should feel like:

- Linear
- Vercel
- Notion

Avoid looking like:

- Bootstrap admin templates
- Material Design dashboards
- Glassmorphism showcases
- Crypto dashboards
- Gaming interfaces

The UI should disappear into the background so users can focus on completing work.

---

# Color System

Use Tailwind CSS v4 CSS Variables.

```css
:root {
  --background: oklch(0.985 0.002 260);
  --foreground: oklch(0.16 0.01 260);

  --card: oklch(1 0 0);
  --card-foreground: oklch(0.16 0.01 260);

  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.16 0.01 260);

  --primary: oklch(0.58 0.22 262);
  --primary-foreground: oklch(0.99 0 0);

  --secondary: oklch(0.95 0.01 260);
  --secondary-foreground: oklch(0.22 0.01 260);

  --muted: oklch(0.96 0.005 260);
  --muted-foreground: oklch(0.52 0.015 260);

  --accent: oklch(0.95 0.015 260);
  --accent-foreground: oklch(0.2 0.02 260);

  --success: oklch(0.72 0.18 150);
  --warning: oklch(0.78 0.18 80);
  --danger: oklch(0.65 0.22 28);

  --border: oklch(0.9 0.01 260);

  --input: oklch(0.9 0.01 260);

  --ring: var(--primary);

  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.13 0.02 260);
  --foreground: oklch(0.97 0.01 260);

  --card: oklch(0.17 0.02 260);
  --card-foreground: oklch(0.97 0.01 260);

  --popover: oklch(0.17 0.02 260);
  --popover-foreground: oklch(0.97 0.01 260);

  --primary: oklch(0.68 0.22 262);
  --primary-foreground: oklch(0.99 0 0);

  --secondary: oklch(0.23 0.02 260);
  --secondary-foreground: oklch(0.97 0.01 260);

  --muted: oklch(0.21 0.02 260);
  --muted-foreground: oklch(0.7 0.01 260);

  --accent: oklch(0.24 0.02 260);
  --accent-foreground: oklch(0.97 0.01 260);

  --success: oklch(0.7 0.18 150);
  --warning: oklch(0.78 0.18 80);
  --danger: oklch(0.65 0.22 28);

  --border: oklch(0.26 0.01 260);

  --input: oklch(0.26 0.01 260);

  --ring: var(--primary);
}
```

---

# Color Usage

Primary

- Main actions
- Active navigation
- Primary buttons
- Selected items

Success

- Completed tasks
- Success alerts
- Positive status

Warning

- Due soon
- Pending review
- Warnings

Danger

- Delete
- Errors
- Critical actions

Muted

- Secondary text
- Metadata
- Placeholders

---

# Status Colors

## Priority

| Priority | Color |
| -------- | ----- |
| Low      | Gray  |
| Medium   | Blue  |
| High     | Amber |
| Urgent   | Red   |

## Task Status

| Status      | Color   |
| ----------- | ------- |
| Todo        | Gray    |
| In Progress | Primary |
| Review      | Amber   |
| Done        | Green   |

---

# Typography

Font Family

Inter

Fallback

system-ui

sans-serif

## Type Scale

Display

36px

Page Title

30px

Section Title

24px

Card Title

18px

Body

14px

Small Text

13px

Caption

12px

Badge

12px

Buttons

14px Medium

Code

JetBrains Mono

---

# Font Weights

Regular

400

Medium

500

Semibold

600

Bold

700

---

# Spacing System

Use an 8px grid.

Allowed spacing values:

4

8

12

16

20

24

32

40

48

64

96

Avoid arbitrary spacing values.

---

# Border Radius

Small

6px

Medium

8px

Large

12px

Extra Large

16px

Cards should use Medium.

Dialogs should use Large.

---

# Shadows

Small

Cards

Medium

Dropdowns

Large

Dialogs

Extra Large

Command Palette

Avoid heavy shadows.

---

# Borders

Default

1px

Use subtle borders instead of shadows whenever possible.

Cards should always have borders.

---

# Elevation

Level 0

Background

Level 1

Sidebar

Cards

Tables

Level 2

Dropdown

Popover

Tooltip

Level 3

Drawer

Dialog

Level 4

Toast

Command Palette

---

# Icons

Use only:

Lucide Icons

Sizes

16

18

20

24

Never mix icon libraries.

---

# Layout Rules

Maximum content width

1600px

Header height

64px

Sidebar width

280px

Collapsed sidebar

72px

Page padding

24px

Card spacing

16px

Section spacing

32px

---

# Responsive Breakpoints

Mobile

<768px

Tablet

768px+

Desktop

1024px+

Wide

1440px+

Ultra Wide

1600px+

---

# Component Principles

Every reusable component should:

- Support dark mode
- Support loading state
- Support disabled state
- Support error state
- Support empty state
- Support keyboard navigation

Never create one-off components.

---

# Buttons

Variants

Primary

Secondary

Outline

Ghost

Destructive

Link

Sizes

Small

Medium

Large

Icon

Loading state required.

---

# Cards

Cards should be:

- Flat
- Minimal
- Border first
- Small shadow only

Never use glassmorphism for standard cards.

---

# Forms

Use:

React Hook Form

Zod

Inline validation.

Validation should appear while typing when appropriate.

---

# Tables

Use TanStack Table.

Support:

- Sorting
- Pagination
- Filtering
- Empty state
- Skeleton loading

---

# Empty States

Every page must define:

Illustration

Title

Description

Primary Action

Optional Secondary Action

---

# Loading States

Prefer skeletons over spinners.

Use:

- Skeleton
- Optimistic updates
- Button loading
- Infinite loading

Avoid full-page loading screens.

---

# Animations

Duration

150–200ms

Timing

ease-out

Allowed animations

Fade

Opacity

Scale

Translate

Subtle slide

Avoid

Bounce

Spin

Elastic

Long animations

---

# Interaction Principles

Every interaction should feel immediate.

Use optimistic UI whenever possible.

Never block the interface for background operations.

Always provide feedback after actions.

Confirm destructive actions.

Preserve user context after updates.

Support keyboard shortcuts.

---

# Accessibility

Support:

- WCAG AA contrast
- Keyboard navigation
- Focus rings
- Screen readers
- Reduced motion
- Proper ARIA labels

Never remove focus outlines.

---

# Dark Mode

Dark mode is the default experience.

Light mode should feel identical in layout and hierarchy.

Only colors should change.

---

# Performance

Keep UI responsive.

Lazy load heavy components.

Virtualize large lists.

Memoize expensive renders.

Avoid unnecessary re-renders.

Use optimistic updates with TanStack Query.

---

# Micro-interactions

Hover

Subtle background change.

Active

Slight scale (0.98).

Focus

Visible ring.

Drag

Smooth lift with shadow.

Drop

Short easing animation.

Toast

Slide + Fade.

Dialogs

Fade + Scale.

---

# Reusable Components

Core UI

- Button
- Input
- Textarea
- Select
- Checkbox
- Switch
- Badge
- Avatar
- Tooltip
- Dropdown
- Dialog
- Drawer
- Popover
- Tabs
- Breadcrumb
- Skeleton
- Empty State
- Error State
- Spinner
- Toast

Application Components

- Sidebar
- Header
- Workspace Switcher
- Project Card
- Board
- Column
- Task Card
- Task Modal
- Comment
- Activity Timeline
- Notification Item
- Member Avatar Group
- File Attachment Card

---

# Do Not

❌ Use Bootstrap components

❌ Use Material UI

❌ Use heavy gradients

❌ Use glassmorphism everywhere

❌ Use inconsistent spacing

❌ Mix icon libraries

❌ Overuse colors

❌ Create decorative animations

❌ Sacrifice usability for aesthetics

---

# Success Criteria

A user should describe SyncSpace as:

- Fast
- Clean
- Professional
- Intuitive
- Premium
- Focused
- Modern

The interface should resemble the quality of Linear or Vercel rather than a typical admin dashboard.
