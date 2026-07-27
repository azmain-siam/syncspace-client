---
name: SyncSpace Signature
colors:
  surface: '#fcf8ff'
  surface-dim: '#dbd8e4'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2fe'
  surface-container: '#efecf8'
  surface-container-high: '#e9e6f3'
  surface-container-highest: '#e4e1ed'
  on-surface: '#1b1b23'
  on-surface-variant: '#464554'
  inverse-surface: '#303038'
  inverse-on-surface: '#f2effb'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#904900'
  on-tertiary: '#ffffff'
  tertiary-container: '#b55d00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#fcf8ff'
  on-background: '#1b1b23'
  surface-variant: '#e4e1ed'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
  max_width: 1280px
---

## Brand & Style
The design system is engineered for "Serious Software"—tools that demand high cognitive focus and reliability without sacrificing a contemporary edge. The brand personality is authoritative yet approachable, characterized by a refined minimalism that prioritizes clarity over decoration. 

The aesthetic sits at the intersection of **Modern Minimalism** and **Functional Precision**. It utilizes extreme spaciousness to reduce visual noise, allowing the content to breathe. Unlike the hyper-technical look of developer tools, this system leans into a high-end editorial feel, where "Electric Indigo" serves as a precise signal for action and intelligence against a stark, high-contrast canvas.

## Colors
The palette is rooted in a monochromatic foundation to maintain a professional "utility" feel, using the Primary "Electric Indigo" sparingly but intentionally to guide the eye.

- **Backgrounds:** Utilize the off-white `#fcfcfd` for light mode to reduce eye strain compared to pure white, while dark mode uses the deep `#09090b` for maximum contrast.
- **Surfaces:** Floating elements and containers use pure white (Light) or a slightly elevated grey (Dark) to create a clear layering effect.
- **Semantic Colors:** Success, Danger, and Warning colors are vibrant and saturated, ensuring they stand out immediately against the neutral background for critical user feedback.

## Typography
Plus Jakarta Sans provides a modern, slightly geometric feel that remains highly readable. The hierarchy is "top-heavy," meaning headlines are bold and tightly tracked to feel confident and impactful.

- **Headlines:** Use tight letter-spacing and heavy weights (700-800) to create a distinct visual anchor.
- **Body:** Uses a generous line-height (1.6) to ensure long-form text remains legible and inviting.
- **Labels:** Small labels use a semi-bold or bold weight with slightly increased tracking to maintain legibility at small scales.

## Layout & Spacing
This design system employs a **Fixed-Fluid Hybrid Grid**. Content is housed in a centered container with a max-width of 1280px, while background elements bleed to the edges.

- **Rhythm:** An 8px base unit governs all dimensions.
- **Hierarchy through Scale:** Use "lg" (48px) and "xl" (80px) spacing to separate major sections, creating a "spacious" feeling that signifies premium software.
- **Mobile Adaptation:** On mobile, margins reduce to 16px and "xl" spacing units are halved to maintain momentum without losing the airy feel.

## Elevation & Depth
Depth is conveyed through **Tonal Layering** supplemented by **Precise Ambient Shadows**. 

- **Surface Tiers:** Background (`#fcfcfd`) sits at the lowest level. Primary surfaces (cards, sidebars) sit on top with a subtle 1px border (`#e2e8f0` in light mode).
- **Shadows:** Use extremely diffused, low-opacity shadows for floating elements like modals or dropdowns. Avoid "heavy" shadows; the goal is a soft lift that feels natural.
- **Micro-elevation:** Buttons and interactive cards use a subtle "pressed" transition where the shadow disappears and the element scales slightly (98%) to simulate tactile feedback.

## Shapes
The design system uses a consistent **8px (0.5rem) radius** for standard UI components. 

- **Standard (8px):** Buttons, Input fields, and small Cards.
- **Large (16px):** Main content containers and Modals.
- **Full (Pill):** Used exclusively for status chips (e.g., "Active", "Pending") and toggle switches.

This "Rounded" approach balances the "Serious Software" aesthetic by softening the edges of a high-contrast layout, making the interface feel modern and accessible.

## Components
Consistent component behavior is critical for the "Serious Software" narrative.

- **Buttons:** Primary buttons use the Electric Indigo background with white text. They feature a 1px inset top-border (white, 20% opacity) to give a subtle "premium" feel. Secondary buttons are ghost-style with a 1px border.
- **Input Fields:** Use a 1px border that shifts from neutral to Electric Indigo on focus. The focus state includes a subtle glow (indigo, 10% opacity) rather than a harsh ring.
- **Cards:** Cards should have no shadow by default, relying on a 1px neutral border. They gain a soft ambient shadow only on hover to indicate interactivity.
- **Status Chips:** Small, pill-shaped, and use low-saturation background tints of the semantic colors (e.g., Success is a light mint background with dark emerald text).
- **Navigation:** Sidebars should use the surface color with a clear vertical separator. Active states are indicated by a 2px vertical bar in Electric Indigo on the leading edge.