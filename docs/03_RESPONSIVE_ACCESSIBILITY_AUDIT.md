# SyncSpace — Audit 3
# Responsive Design & Accessibility Audit

You are acting as a **Senior Accessibility Engineer, Responsive UX Engineer, and Frontend QA Engineer**.

This audit is ONLY about:

- responsive behavior
- accessibility
- keyboard interaction
- semantic structure
- usability across devices

Do not perform visual redesign.

Do not refactor architecture unless required to document a blocking issue.

Do not change backend behavior.

---

# Preparation

Read:

1. `AGENTS.md`
2. `.ai/*`
3. `DESIGN_SYSTEM.md`
4. `UX_PRINCIPLES.md`
5. Audit 1 if available
6. Audit 2 if available

Inspect the actual implementation rather than relying only on documentation.

---

# 1. Responsive Breakpoint Audit

Test the application at:

- 1440px
- 1280px
- 1024px
- 768px
- 640px
- 390px

Check:

- sidebar
- top navigation
- workspace switcher
- dashboard
- project lists
- tables
- Kanban
- task details
- dialogs
- forms
- members
- activity
- settings

Identify:

- overflow
- clipping
- horizontal scrolling
- unusable controls
- broken grids
- excessive whitespace
- unreadable content
- poor mobile navigation

---

# 2. Mobile Product Behavior

Determine how each workflow should behave on mobile.

Pay particular attention to:

- task creation
- task editing
- task details
- board interaction
- member management
- invitations
- workspace switching
- notifications

Do not simply shrink desktop UI.

Identify where a different mobile interaction is required.

---

# 3. Keyboard Navigation

Test:

- Tab
- Shift+Tab
- Enter
- Space
- Escape
- Arrow keys where relevant

Check:

- sidebar
- menus
- dialogs
- dropdowns
- forms
- task interactions
- Kanban controls
- workspace switcher

Users must be able to understand where focus is.

---

# 4. Focus Management

Audit:

- visible focus
- dialog focus trapping
- focus restoration
- dropdown focus
- modal close behavior
- route changes

Identify focus loss or keyboard traps.

---

# 5. Semantic HTML

Inspect whether:

- buttons are actual buttons
- links are actual links
- headings follow hierarchy
- lists use appropriate semantics
- forms use labels
- tables use table semantics
- navigation uses navigation landmarks

Identify clickable divs and other problematic patterns.

---

# 6. ARIA

Audit ARIA usage.

Avoid unnecessary ARIA.

Check:

- aria-label
- aria-describedby
- aria-expanded
- aria-selected
- aria-current
- dialog labeling
- menu labeling
- live regions

Do not add ARIA where native HTML already provides the correct semantics.

---

# 7. Screen Reader UX

Identify:

- missing labels
- confusing announcements
- inaccessible icons
- hidden important information
- meaningless decorative content

Pay special attention to icon-only buttons.

---

# 8. Color and Non-Color Indicators

Important information must not depend only on color.

Audit:

- task priority
- status
- errors
- success
- active states
- notification states

---

# 9. Forms

Audit:

- labels
- required fields
- errors
- error association
- autocomplete
- keyboard submission
- disabled states
- loading states

---

# 10. Touch Interaction

On mobile, check:

- button sizes
- icon buttons
- dropdowns
- task cards
- navigation
- dialogs
- drag interactions

Identify controls that are too small or difficult to use.

---

# 11. Reduced Motion

Audit animations and transitions.

Check whether important interactions remain usable when reduced motion is preferred.

Identify unnecessary motion.

---

# Output

Do not modify code.

Produce:

## 1. Executive Summary

## 2. Critical Accessibility Issues

## 3. Critical Responsive Issues

## 4. Keyboard Navigation Findings

## 5. Screen Reader / Semantic Findings

## 6. Mobile UX Findings

## 7. Tablet Findings

## 8. Desktop Findings

## 9. WCAG-Relevant Findings

Where possible, identify the relevant accessibility principle without claiming formal certification.

## 10. Prioritized Fix Plan

- P0 — Blocking
- P1 — Important
- P2 — Later

Do not implement yet.
