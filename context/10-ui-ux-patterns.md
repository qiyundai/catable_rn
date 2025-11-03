# UI/UX Patterns

This document describes design patterns and conventions used throughout the app.

## Design System

### Color Scheme
- **Primary**: Green (`#18C07A`) - used for active states, CTAs, progress
- **Background**: White - clean, minimal aesthetic
- **Text**: Dark gray (`#2C3E50`) - high contrast for readability
- **Accents**: Teal and blue for variety without overwhelming

### Typography Hierarchy
- **Headings**: LobsterTwo (decorative, friendly)
- **Body**: Roboto (clean, readable)
- **Sizing**: Clear hierarchy from h1 (32px) to small (12px)

### Spacing System
Consistent 4px base unit (4, 8, 16, 24, 32, 48px)

## Interaction Patterns

### Card-Based Interface
- **Onboarding**: 8-step card deck with swipe/tap navigation
- **Tasks**: Daily task cards in swipeable deck
- **Pet Profiles**: Card grid/list view

**Benefits**:
- Clear, focused interactions
- Low cognitive load (one thing at a time)
- Familiar swipe gesture (like Tinder)

### Swipe Gestures
- **Right swipe**: Confirm/complete (green indicator)
- **Left swipe**: Skip/cancel (gray indicator)
- Visual feedback with animated indicators
- Used in: Task completion, onboarding navigation

### Button Patterns
- **Primary**: Green background, white text, shadow
- **Secondary**: White background, green text/border
- **Outline**: Transparent with border
- All buttons have consistent padding, border radius, shadows

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
- Two side-by-side buttons (Yes/No)
- Selected: Green background
- Unselected: White/gray background
- Used for: Binary questions (fed today? groomed?)

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

### Stack Navigation
- Standard back button for nested screens
- Modal-style presentation for pet management
- No header on main tabs (custom tab bar)

## Feedback Patterns

### Loading States
- Global `isLoading` flag in store
- Can show loading spinner/overlay
- Currently minimal implementation

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
- **Pan gesture**: Cards follow finger during swipe
- **Rotation**: Cards rotate slightly based on swipe direction
- **Scale**: Background cards scale down for depth
- **Color change**: Top card changes color based on direction
- **Exit animation**: Smooth slide off screen

### Button Interactions
- **Press feedback**: Slight scale on press (1.1x)
- **Shadow elevation**: Increases on press

### Transitions
- **Screen transitions**: Default React Navigation animations
- **Modal transitions**: Slide up from bottom
- **Card transitions**: Smooth, spring-like

## Responsive Patterns

### Screen Dimensions
- Cards sized as percentage of screen width (75%)
- Heights calculated from screen dimensions
- Safe area insets respected for notches/home indicators

### Orientation
- Currently portrait-only (common for mobile apps)
- Could be extended for tablet landscape

## Gamification Patterns

### Streak Display
- Large, prominent number
- "Day Streak" label
- Updates immediately after task completion
- Visual prominence encourages maintenance

### Progress Tracking
- Progress bar showing X of Y completed
- Percentage display optional
- Green color indicates progress

### Achievement System
- Unlocked achievements shown with timestamp
- XP rewards (future: currency for features)
- Notification when unlocked

## Data Visualization Patterns

### Log History
- Timeline view (planned)
- Chart view (planned) for trends
- Color-coded by log type

### Reports
- Time range selector (7/30/90 days)
- Aggregated statistics
- Shareable format (PDF/CSV planned)

## Consistency Principles

1. **Color**: Always use design tokens, never hardcoded hex
2. **Spacing**: Use SPACING constants, multiples of 4
3. **Typography**: Use TYPOGRAPHY styles, never inline font sizes
4. **Shadows**: Use SHADOWS constants for elevation
5. **Border Radius**: Use BORDER_RADIUS or consistent values (20px for cards, 25px for buttons)

