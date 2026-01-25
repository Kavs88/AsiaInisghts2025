# Design System Documentation

## Overview

The Sunday Market platform uses a custom design system built on Tailwind CSS with a focus on accessibility, modern aesthetics, and consistent spacing.

## Design Tokens

### Color Palette

#### Primary (Blue)
- `primary-50` to `primary-900` - Main accent color
- Used for: CTAs, links, active states, primary actions

#### Secondary (Purple)
- `secondary-50` to `secondary-900` - Secondary accent
- Used for: Highlights, special features

#### Neutral (Gray)
- `neutral-50` to `neutral-900` - Base grays
- Used for: Text, backgrounds, borders

#### Semantic Colors
- **Success**: `success-50/100/500/600/700` - Success states, confirmations
- **Warning**: `warning-50/100/500/600` - Warnings, low stock
- **Error**: `error-50/100/500/600` - Errors, out of stock

### Typography

#### Font Family
- Primary: Inter (via Next.js)
- System fallback: sans-serif

#### Font Sizes (8px baseline)
- `xs`: 12px/16px
- `sm`: 14px/20px
- `base`: 16px/24px
- `lg`: 18px/28px
- `xl`: 20px/28px
- `2xl`: 24px/32px
- `3xl`: 30px/36px
- `4xl`: 36px/40px
- `5xl`: 48px/1
- `6xl`: 60px/1
- `7xl`: 72px/1
- `8xl`: 96px/1

#### Hero Typography
- Large scale: `text-5xl` to `text-8xl` for hero sections
- Bold weight for headings
- Regular weight for body text

### Spacing (8px Grid)

All spacing follows an 8px baseline grid:

- `0.5`: 4px
- `1`: 8px
- `1.5`: 12px
- `2`: 16px
- `3`: 24px
- `4`: 32px
- `5`: 40px
- `6`: 48px
- `8`: 64px
- `10`: 80px
- `12`: 96px
- `16`: 128px
- `20`: 160px

### Border Radius

- `sm`: 2px
- `DEFAULT`: 4px
- `md`: 6px
- `lg`: 8px
- `xl`: 12px
- `2xl`: 16px (primary for cards)
- `3xl`: 24px
- `full`: 9999px (for pills/badges)

### Shadows

- `soft`: `0 2px 8px rgba(0, 0, 0, 0.08)` - Default cards
- `soft-lg`: `0 4px 16px rgba(0, 0, 0, 0.1)` - Elevated cards
- Standard Tailwind shadows also available

## Component Patterns

### Cards
- Background: `bg-white`
- Border radius: `rounded-2xl` (16px)
- Shadow: `shadow-soft`
- Padding: `p-6` or `p-8`

### Buttons

#### Primary
```tsx
className="btn-primary"
// Styles: bg-primary-600, text-white, rounded-xl, hover:bg-primary-700
```

#### Secondary
```tsx
className="btn-secondary"
// Styles: bg-neutral-100, text-neutral-900, rounded-xl
```

### Inputs
```tsx
className="input"
// Styles: border, rounded-xl, focus:ring-2 focus:ring-primary-500
```

## Layout Patterns

### Container
- Max width: `max-w-7xl` (1280px)
- Horizontal padding: `px-4 sm:px-6 lg:px-8`
- Utility class: `container-custom`

### Sections
- Vertical padding: `py-12` or `py-16`
- Background: `bg-white` or `bg-neutral-50`

### Grid Systems
- Products: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Vendors: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Gap: `gap-6` (24px)

## Accessibility

### Focus States
- All interactive elements have visible focus rings
- Color: `ring-2 ring-primary-500`
- Offset: `ring-offset-2`

### Skip Links
```tsx
<a href="#main-content" className="skip-to-content">
  Skip to main content
</a>
```

### ARIA Labels
- All icons have `aria-label` or `aria-hidden="true"`
- Navigation uses `role="navigation"`
- Modals use `role="dialog"` and `aria-modal="true"`

### Keyboard Navigation
- Tab order follows visual order
- All interactive elements are keyboard accessible
- ESC key closes modals/menus

## Responsive Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Animation & Transitions

### Transitions
- Duration: `transition-colors`, `transition-all`
- Timing: Default (ease-in-out)
- Hover states use smooth transitions

### Hover Effects
- Cards: `hover:shadow-soft-lg`
- Images: `hover:scale-105`
- Links: `hover:text-primary-600`

## Usage Examples

See component files in `components/ui/` for implementation examples.

## Figma Integration

Design tokens can be exported from Tailwind config for Figma:
- Use tools like `tailwindcss-figma-plugin`
- Or manually export color/typography tokens






