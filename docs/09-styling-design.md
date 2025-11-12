# Styling & Design System

This document describes the design system, styling patterns, and UI/UX conventions used throughout the app.

## Design Tokens

All design tokens are centralized in `src/constants/index.ts`.

### Colors

```typescript
COLORS = {
  primary: '#18C07A',      // Main brand green
  secondary: '#4ECDC4',    // Teal accent
  accent: '#45B7D1',       // Blue accent
  background: '#FFFFFF',   // Main background
  surface: '#FFFFFF',      // Card/surface background
  text: '#2C3E50',         // Primary text
  textSecondary: '#7F8C8D', // Secondary text
  border: '#E1E8ED',       // Border color
  success: '#18C07A',      // Success states
  warning: '#F39C12',      // Warning states
  error: '#E74C3C',        // Error states
  disabled: '#BDC3C7',     // Disabled elements
  progress: '#FF9633',     // Progress indicators
}
```

### Typography

```typescript
TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: 'bold', fontFamily: 'LobsterTwo' },
  h2: { fontSize: 24, fontWeight: 'bold', fontFamily: 'LobsterTwo' },
  h3: { fontSize: 20, fontWeight: '600', fontFamily: 'LobsterTwo' },
  body: { fontSize: 16, fontWeight: 'normal', fontFamily: 'Roboto' },
  caption: { fontSize: 14, fontWeight: 'normal', fontFamily: 'Roboto' },
  small: { fontSize: 12, fontWeight: 'normal', fontFamily: 'Roboto' },
  // Plus medium/bold variants
}
```

**Font Families**:
- `LobsterTwo`: Headings (Regular 400 and Bold 700 weights)
- `Roboto`: Body text (Regular 400, Medium 500, Bold 700 weights)

### Spacing

```typescript
SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}
```

### Shadows

```typescript
SHADOWS = {
  small: { elevation: 2, shadowOpacity: 0.25, shadowRadius: 3.84 },
  medium: { elevation: 4, shadowOpacity: 0.25, shadowRadius: 3.84 },
  large: { elevation: 8, shadowOpacity: 0.25, shadowRadius: 3.84 },
}
```

### Border Radius

```typescript
BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 16,
}
```

Common values:
- Cards: 20px
- Buttons: 25px (pill shape) or 12px (rounded rectangle)

## Usage Pattern

```typescript
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
});
```

## UI Patterns

### Card-Based Interface
- **Onboarding**: Card deck with button-based navigation
- **Tasks**: Daily task cards in button-navigated deck
- **Pet Profiles**: Card grid/list view

**Benefits**:
- Clear, focused interactions
- Low cognitive load (one thing at a time)
- Consistent button-based navigation
- Accessible (no gesture requirement)

### Button Patterns
- **Primary**: Green background (`COLORS.primary`), white text, shadow
- **Secondary**: White background, green text/border
- **Outline**: Transparent with border
- All buttons have consistent padding, border radius (25px), shadows

### Input Patterns

**Numeric Input**:
- Large display number in center
- +/- buttons on sides
- Used for: Water intake, counts

**Slider Input**:
- Multiple choice buttons in horizontal row
- Selected state: Green background, white text
- Unselected: White background, gray border
- Used for: Poop consistency, activity level

**Yes/No Input**:
- For task cards: Uses deck navigation buttons ("Yes" and "No" at bottom)
- Card shows question only, no inline buttons
- Selecting Yes/No sets value and advances to next card

**Text Input**:
- Standard text input with optional label
- Error state: Red border/text
- Used for: Names, notes, custom tasks

## Navigation Patterns

### Tab Bar
- **Custom design**: Two edge tabs + floating center button
- **Active state**: Green background on active tab
- **Inactive state**: Green text/icon only
- **Community button**: Circular, floating, hides when on Community screen

### Header
- **Left**: Screen title (LobsterTwo font, large)
- **Right**: Profile icon (navigates to Profile)
- Consistent across all tabs

## Feedback Patterns

### Loading States
- Global `isLoading` flag in store
- Can show loading spinner/overlay

### Success States
- Completion screen after finishing tasks
- Achievement notifications
- Confirmation messages after saves

### Error States
- Form validation errors (red text below inputs)
- Network errors (when backend integrated)
- Database errors (logged, user-friendly message)

### Progress Indicators
- **Progress Bar**: Shows completion percentage
- **Streak Counter**: Large number display
- Used in: Tasks screen, onboarding

## Accessibility Patterns

### Text Scaling
- All text uses relative sizing (no absolute pixel values in TYPOGRAPHY)
- Respects system font size settings
- Line heights adjusted for readability

### Color Contrast
- Text colors meet WCAG contrast ratios
- Primary text: Dark on light background
- Error text: Red on light background

### Screen Readers
- Components should support `accessibilityLabel` props
- Buttons have descriptive labels
- Images have alt text equivalents

## Animation Patterns

### Card Deck Animations
- **Scale**: Background cards scale down for depth (stacked effect)
- **Transitions**: Smooth card transitions when advancing
- **Button interactions**: Press feedback with scale/shadow effects

### Button Interactions
- **Press feedback**: Slight scale on press
- **Shadow elevation**: Increases on press

## Consistency Principles

1. **Color**: Always use design tokens, never hardcoded hex
2. **Spacing**: Use SPACING constants, multiples of 4
3. **Typography**: Use TYPOGRAPHY styles, never inline font sizes
4. **Shadows**: Use SHADOWS constants for elevation
5. **Border Radius**: Use BORDER_RADIUS or consistent values (20px for cards, 25px for buttons)

## Related Documentation

- [13-constants-config.md](./13-constants-config.md) - Constants reference
- [07-components.md](./07-components.md) - Component styling

