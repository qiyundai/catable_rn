# Components

Reusable UI components in `src/components/`. This document describes each component's purpose and usage.

## Core Components

### Button
**Location**: `src/components/Button.tsx`

**Purpose**: Standardized button component

**Props**:
- `title`: Button text
- `onPress`: Click handler
- `variant`: 'primary' | 'secondary' | 'outline'
- `disabled`: Boolean
- `icon`: Optional icon component

**Usage**: Used throughout app for consistent button styling.

---

### Card
**Location**: `src/components/Card.tsx`

**Purpose**: Generic card container component

**Props**:
- `children`: Card content
- `style`: Custom styles
- `onPress`: Optional tap handler

**Usage**: Base component for pet cards, task cards, etc.

---

### CardDeck
**Location**: `src/components/CardDeck.tsx`

**Purpose**: Card deck interface with button-based navigation (used in onboarding and tasks)

**Props**:
- `items`: Array of card data
- `currentIndex`: Current card position
- `onNext`: Callback when moving forward
- `onSkip`: Optional skip callback
- `onComplete`: Callback when deck finished
- `renderCard`: Function to render card content
- `cardWidth`, `cardHeight`: Card dimensions
- `maxVisibleCards`: How many cards to show stacked (default: 3)
- `primaryButtonText`: Text for primary button (default: 'Yes')
- `secondaryButtonText`: Text for secondary button (default: 'Skip')
- `onPrimaryAction`: Optional custom handler for primary button (receives item, index)
- `onSecondaryAction`: Optional custom handler for secondary button (receives item, index)

**Features**:
- Two-button navigation at bottom of each card
- Buttons positioned at center bottom with 40px gap between them
- Buttons overlap card by 50% (30px of 60px height)
- Stacked card effect with scale transforms for depth
- Configurable button text and actions per card
- Smooth card transitions

**Button Behavior**:
- Primary button: Default calls `onNext()` or `onComplete()` if last card
- Secondary button: Default calls `onSkip()` if provided
- Custom actions can override default behavior (e.g., for yes/no tasks or special flows)

**Usage**: Used in `OnboardingScreen` and `TasksScreen`. Cards should have extra bottom padding (typically 60px) to accommodate buttons.

---

### Input
**Location**: `src/components/Input.tsx`

**Purpose**: Text input component

**Props**:
- Standard TextInput props
- `label`: Optional label
- `error`: Error message display
- `icon`: Optional icon

**Usage**: Forms throughout app.

---

### Logo
**Location**: `src/components/Logo.tsx`

**Purpose**: App logo display

**Props**:
- `size`: Logo size
- `style`: Custom styles

**Usage**: Auth screen, onboarding, etc.

---

### ProgressBar
**Location**: `src/components/ProgressBar.tsx`

**Purpose**: Progress indicator

**Props**:
- `current`: Current progress value
- `total`: Total value
- `showText`: Display percentage text
- `height`: Bar height
- `color`: Optional custom color

**Usage**: Onboarding progress, task completion progress.

---

### TagSelector
**Location**: `src/components/TagSelector.tsx`

**Purpose**: Multi-select tag picker with "pool" UI

**Props**:
- `tasks`: Array of selectable tasks
- `selectedTasks`: Array of selected task IDs
- `onTaskToggle`: Handler when task selected/deselected
- `onAddCustomTask`: Handler for custom task button
- `title`: Section title
- `description`: Section description

**Features**:
- Selected tags shown in top "pool"
- Unselected tags in bottom pool
- Visual separation between pools
- Custom task creation button

**Usage**: Onboarding task selection screens.

---

### WheelPicker
**Location**: `src/components/WheelPicker.tsx`

**Purpose**: Scrollable wheel picker component for selecting values (like iOS picker)

**Props**:
- `items`: Array of `WheelPickerItem` objects with `label` and `value`
- `selectedIndex`: Currently selected index (0-based)
- `onSelectionChange(index)`: Callback when selection changes
- `width?`: Optional width (default: 80)
- `height?`: Optional height (default: 200)

**Features**:
- Smooth scrolling with momentum
- Automatic snapping to nearest item
- Self-contained styling (no external style dependencies)
- Proper initialization to selected value
- Supports jumping to far values without interference

**Usage**:
```typescript
<WheelPicker
  items={[
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    // ...
  ]}
  selectedIndex={selectedIndex}
  onSelectionChange={(index) => setSelectedIndex(index)}
  width={100}
/>
```

**Multi-Column Layout**:
For multi-column pickers, use multiple `WheelPicker` components side-by-side:
```typescript
<View style={{ flexDirection: 'row' }}>
  <View style={{ flex: 1 }}>
    <WheelPicker items={numberItems} selectedIndex={numIndex} ... />
  </View>
  <View style={{ flex: 1 }}>
    <WheelPicker items={periodItems} selectedIndex={periodIndex} ... />
  </View>
</View>
```

**Usage**: Time picker (hour, minute, AM/PM), date pickers, age picker.

---

### TabBarIcon
**Location**: `src/components/TabBarIcon.tsx`

**Purpose**: Icon component for tab bar

**Props**:
- `name`: Icon name
- `focused`: Active state
- `color`: Icon color

**Usage**: Used by React Navigation tab bar (though custom tab bar is used instead).

---

### FloatingIsland
**Location**: `src/components/FloatingIsland.tsx`

**Purpose**: Visual island for community screen

**Props**:
- `pets`: Array of pets to display as avatars
- `messages`: Array of messages to display as bubbles
- `style`: Custom styles

**Usage**: CommunityScreen background.

---

## Component Patterns

### Styling
All components use:
- Design tokens from `src/constants` (COLORS, SPACING, TYPOGRAPHY)
- StyleSheet API (not inline styles)
- Consistent prop interfaces

### Reusability
Components are:
- Stateless when possible
- Accept style props for customization
- Follow single responsibility principle

### Accessibility
Components should support:
- `accessibilityLabel` props
- Scalable text (respects system font size)
- Color contrast (uses design token colors)

## Creating New Components

When creating new components:
1. Place in `src/components/ComponentName.tsx`
2. Use TypeScript interfaces for props
3. Import design tokens from constants
4. Follow existing component patterns
5. Export as default

## Related Documentation

- [09-styling-design.md](./09-styling-design.md) - Design system used by components
- [08-screens.md](./08-screens.md) - Screens that use these components

