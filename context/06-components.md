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

**Purpose**: Swipeable card deck interface (used in onboarding and tasks)

**Props**:
- `items`: Array of card data
- `currentIndex`: Current card position
- `onNext`: Callback when moving forward
- `onSkip`: Optional skip callback
- `onComplete`: Callback when deck finished
- `renderCard`: Function to render card content
- `cardWidth`, `cardHeight`: Card dimensions
- `maxVisibleCards`: How many cards to show stacked (default: 3)

**Features**:
- Pan responder for swipe gestures
- Smooth animations using Reanimated
- Visual indicators for swipe directions
- Stacked card effect with scale/position transforms
- Swipe right = next/complete, swipe left = skip

**Usage**: Used in `OnboardingScreen` and `TasksScreen`.

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

**Purpose**: Multi-column picker (like time picker)

**Props**:
- `columns`: Array of column data (options arrays)
- `selectedValues`: Array of selected indices per column
- `onValueChange`: Callback with new values
- `width`: Column width

**Usage**: Time picker (hour, minute, AM/PM), date pickers.

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

