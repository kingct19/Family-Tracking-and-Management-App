# HaloHub Experience Design System

## Overview
Warm, trust-focused family safety product aesthetic built around lavender gradients, rounded cards, and supportive onboarding moments.

## Color Palette

### Primary Colors
- **Primary**: `#7A3BFF` (lavender purple)
- **Primary Light**: `#944BFF`
- **Primary Container**: `#F2EFFE` (light lavender)
- **On Primary**: `#FFFFFF`

### Secondary Colors
- **Secondary**: `#FFC857` (warm yellow)
- **Secondary Light**: `#FF8C94` (coral)
- **Secondary Container**: `#FFF4E6`

### Neutral Colors
- **White**: `#FFFFFF`
- **Gray 50**: `#F7F7FA`
- **Gray 300**: `#C9C5D5`
- **Gray 900**: `#1E1A2B`

### Background Colors
- **Background**: `#F2EFFE`
- **Background Light**: `#E7E0FF`

## Gradients

### Iris Glow
```css
background: linear-gradient(180deg, #7A3BFF 0%, #B682FF 60%, #FFE5FF 100%);
```

**Usage**: CTA backgrounds, hero overlays, half-circle illustrations

**Tailwind Class**: `.gradient-iris-glow` or `.gradient-iris-glow-horizontal`

## Typography

### Font Stack
1. **Primary**: Inter
2. **Secondary**: Roboto Flex
3. **Fallback**: system-ui, sans-serif

### Type Scale

| Style | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| Display | 48px | 56px | 600 | Hero headlines |
| Headline | 32px | 40px | 600 | Section headers |
| Title | 20px | 28px | 600 | Card titles |
| Body | 16px | 24px | 400 | Body text |
| Caption | 14px | 20px | 400 | Helper text |

### Tone
Conversational, reassuring, action-oriented

## Layout System

### Grid System

| Breakpoint | Columns | Gutter | Margin |
|------------|---------|--------|--------|
| Mobile (≤360px) | 4 | 16px | 24px |
| Tablet (361-599px) | 8 | 24px | 32px |
| Desktop (≥600px) | 12 | 32px | 80px |

**Tailwind Classes**: `.grid-halohub-mobile`, `.grid-halohub-tablet`, `.grid-halohub-desktop`

### Spacing Scale
4, 8, 12, 16, 20, 24, 32, 40, 48, 64 (4pt grid)

### Border Radius
- **Cards**: 24px (`.rounded-card`)
- **Buttons**: 9999px / full pill (`.rounded-button`)
- **Inputs**: 12px (`.rounded-input`)

## Component Library

### CTA Buttons

#### Filled Button
```css
background: #7A3BFF;
color: #FFFFFF;
box-shadow: 0 8px 20px rgba(122, 59, 255, 0.35);
border-radius: 9999px;
```

**Tailwind Classes**: `.btn-cta-filled`

#### Tonal Button
```css
background: #F2EFFE;
color: #7A3BFF;
border: 1px solid #CDB7FF;
border-radius: 9999px;
```

**Tailwind Classes**: `.btn-cta-tonal`

### Cards
- **Background**: `#FFFFFF`
- **Border Radius**: 24px
- **Border**: 1px solid `#E7E0FF`
- **Shadow**: elevation-1 (default), elevation-2 (hover)

**Tailwind Classes**: `.card`, `.card-interactive`

### Map Cards
- **Background**: `#FFFFFF`
- **Border Radius**: 24px
- **Shadow**: `0 0 30px -4px rgba(0, 0, 0, 0.15)`

**Tailwind Classes**: `.map-card`

### Input Fields
- **Border Radius**: 12px
- **Border**: 2px solid `#E7E0FF`
- **Focus**: 2px solid `#7A3BFF` with ring

**Tailwind Classes**: `.input-base`

### Selection Lists
- **Type**: Segmented radio list
- **Min Height**: 56px (touch target)
- **Border Radius**: 12px
- **Hover**: Background `#F2EFFE`, translateY(-2px)

**Tailwind Classes**: `.selection-list-item`

### Upload Cards
- **Background**: `#FFFFFF`
- **Border Radius**: 24px
- **Padding**: 24px
- **Border**: 1px solid `#E7E0FF`

**Tailwind Classes**: `.upload-card`

### State Badges
- **Pending**: `.badge-pending` - `#FFF4E6` background
- **Approved**: `.badge-approved` - `#E7F5E7` background
- **Rejected**: `.badge-rejected` - `#FFE5E5` background

## Motion

### Durations
- **Enter**: 200ms
- **Exit**: 160ms
- **Emphasis**: 280ms

### Easing
- **Standard**: `cubic-bezier(0.2, 0, 0, 1)`
- **Emphasized**: `cubic-bezier(0.3, 0, 0, 1)`

### Patterns
- **Fade + Slide**: Cards entering viewport
- **Scale In**: Map pins, avatars
- **Parallax/Blur**: Hero illustrations

**Tailwind Classes**: `.animate-fade-slide`, `.animate-scale-in`, `.animate-fade-in`

### Reduced Motion
All animations switch to simple fade without translation when `prefers-reduced-motion` is enabled.

## Interaction States

### Focus
- **Outline**: 2px solid `#7A3BFF`
- **Offset**: 2px

### Hover
- **Elevation**: +1 level
- **Transform**: translateY(-2px)

### Pressed
- **Elevation**: -1 level
- **Transform**: translateY(1px)

### Disabled
- **Opacity**: 0.4
- **Cursor**: not-allowed

## Content Voice

### Principles
- Reassuring
- Actionable
- Family-centric

### Microcopy Examples
- **CTAs**: "Get started", "Continue", "Join for free"
- **Helper Text**: "Securely share updates with your circle", "Verification takes under 2 minutes"

## Accessibility

### Contrast
- **Target**: ≥4.5:1 for text vs background
- All color combinations meet WCAG AA standards

### Touch Targets
- **Minimum**: 48px × 48px
- **Spacing**: ≥8px between targets

### ARIA Patterns
- Map views always paired with list alternative
- Upload options described with `aria-describedby`
- Hero CTAs labelled with action verbs

## Usage Examples

### Hero Section
```tsx
<div className="gradient-iris-glow rounded-card p-12">
  <h1 className="text-display text-white">Welcome to HaloHub</h1>
  <button className="btn-cta-filled">Get started</button>
</div>
```

### Card Component
```tsx
<div className="card p-6">
  <h2 className="text-headline text-on-surface">Card Title</h2>
  <p className="text-body text-on-variant">Card content</p>
</div>
```

### Interactive Card
```tsx
<div className="card-interactive p-6">
  <h2 className="text-title text-on-surface">Clickable Card</h2>
</div>
```

## Implementation Notes

- All components use Tailwind CSS utility classes
- Design tokens are defined in `tailwind.config.js`
- Base styles are in `src/styles/index.css`
- Components automatically inherit the design system through Tailwind classes
- No need to manually apply colors - use semantic tokens like `bg-primary`, `text-on-surface`, etc.

