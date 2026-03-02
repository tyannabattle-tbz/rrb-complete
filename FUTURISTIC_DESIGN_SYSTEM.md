# QUMUS Futuristic AI Design System

## Color Palette

**Primary Neon Colors:**
- Cyan: `#00D9FF` - Primary accent, neural connections
- Magenta: `#FF00FF` - Secondary accent, energy flows
- Electric Purple: `#9D00FF` - Tertiary, data streams
- Lime Green: `#00FF41` - Success states, active processes
- Deep Navy: `#0A0E27` - Background, depth

**Secondary Colors:**
- Dark Slate: `#1A1F3A` - Card backgrounds
- Neon Blue: `#0080FF` - Information states
- Neon Orange: `#FF6B00` - Warning states
- Neon Red: `#FF0040` - Critical states

## Typography

- **Display Font:** "Space Mono" or "IBM Plex Mono" - Futuristic, technical feel
- **Body Font:** "Inter" or "Roboto" - Clean, readable
- **Weights:** Bold (700) for headers, Regular (400) for body

## Visual Effects

### 1. Neural Network Background
- Animated particle system with connecting lines
- Particles move in organic, flowing patterns
- Lines glow with cyan/magenta gradient
- Subtle parallax on scroll

### 2. Holographic Elements
- Gradient borders with neon colors
- Semi-transparent backgrounds with backdrop blur
- Glowing box-shadow effects
- Animated shimmer effect on hover

### 3. Data Flow Animations
- Animated lines flowing between metrics
- Pulsing data points
- Cascading animations on load
- Real-time metric updates with smooth transitions

### 4. Glowing Effects
- Text glow on primary elements
- Icon glow on hover
- Neon border glow on cards
- Pulsing indicators for active processes

## Component Patterns

### Cards
- Border: 1px solid with neon gradient
- Background: `rgba(26, 31, 58, 0.5)` with backdrop blur
- Glow: `box-shadow: 0 0 20px rgba(0, 217, 255, 0.3)`
- Hover: Increased glow, slight scale

### Buttons
- Background: Gradient from cyan to magenta
- Text: Bold, uppercase, letter-spaced
- Hover: Increased glow, animation
- Active: Pulsing effect

### Metrics Display
- Large, bold numbers in neon colors
- Animated counters on load
- Trend indicators with arrows
- Real-time update animations

### Status Indicators
- Pulsing circles with glow
- Color-coded by status (green=active, red=error, yellow=warning)
- Animated rings expanding outward

## Animation Principles

1. **Smooth Transitions:** All state changes use 300-500ms transitions
2. **Easing Functions:** `cubic-bezier(0.4, 0, 0.2, 1)` for natural motion
3. **Staggered Animations:** Elements animate in sequence for visual interest
4. **Micro-interactions:** Hover, focus, and click states have subtle animations
5. **Loading States:** Animated spinners with neon colors

## Layout Principles

1. **Grid-based:** 12-column responsive grid
2. **Asymmetric Design:** Mix of different sized cards and sections
3. **Depth Layers:** Multiple z-index layers for visual hierarchy
4. **Whitespace:** Generous spacing for breathing room
5. **Mobile-first:** Responsive breakpoints at 640px, 1024px, 1280px

## Accessibility

1. **Contrast Ratios:** All text meets WCAG AA standards
2. **Color Blindness:** Don't rely solely on color for meaning
3. **Animations:** Respect `prefers-reduced-motion`
4. **Focus States:** Clear, visible focus indicators
5. **Keyboard Navigation:** All interactive elements keyboard accessible

## Implementation Strategy

1. Create CSS custom properties for all colors and effects
2. Build reusable component library with animations
3. Implement particle system for background
4. Add smooth transitions between pages
5. Optimize animations for performance
6. Test on various devices and browsers
