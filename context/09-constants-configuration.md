# Constants & Configuration

All constants and configuration in `src/constants/index.ts`.

## App Configuration

```typescript
APP_CONFIG = {
  name: 'CAT-able',
  version: '1.0.0',
  supportedLanguages: ['en', 'zh', 'ja'],
  defaultLanguage: 'en',
  databaseName: 'catable.db',
  apiBaseUrl: 'https://api.catable.app', // Placeholder
}
```

## Design Tokens

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
  black: '#000000',
  gray: '#F5F5F5',
  darkInk: '#1E232C',
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
- `LobsterTwo`: Headings (has Regular 400 and Bold 700 weights)
- `Roboto`: Body text (has Regular 400, Medium 500, Bold 700 weights)

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

## Log Types

Predefined log type configurations:

### Daily Log Types
- **water**: Numeric input (ml)
- **feeding**: Yes/No
- **playtime**: Slider (Very Lazy → Super Energetic)
- **poop**: Slider (Hard & Dry → Watery Diarrhea)
- **litter**: Yes/No

### Recurring Log Types
- **grooming**: Yes/No
- **teeth_brushing**: Yes/No
- **nail_clipping**: Yes/No
- **flea_treatment**: Yes/No
- **showering**: Yes/No
- **deworming**: Yes/No
- **vet_checkup**: Yes/No

Each log type has:
- `id`, `name`, `category`, `inputType`, `unit` (optional), `options` (optional), `isActive`

## Onboarding Steps

```typescript
ONBOARDING_STEPS = [
  { id: 'welcome', ... },
  { id: 'cat_name', ... },
  { id: 'cat_info', ... },
  { id: 'add_another', ... },
  { id: 'logging_goals', ... },
  { id: 'daily_tasks', ... },
  { id: 'weekly_tasks', ... },
  { id: 'monthly_tasks', ... },
  { id: 'reminder_time', ... },
]
```

Each step has:
- `id`: Unique identifier
- `title`: Display title
- `description`: Subtitle
- `component`: Component name to render
- `type`: 'flow_control' | 'data_collection'
- `skipBehavior`: How skip button behaves

## Selection Options

### Pet Gender
```typescript
PET_GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]
```

### Pet Breeds
```typescript
PET_BREED_OPTIONS = [
  'Mixed', 'Persian', 'Maine Coon', 'Siamese',
  'British Shorthair', 'Ragdoll', 'American Shorthair',
  'Scottish Fold', 'Other'
]
```

### Pet Personalities
```typescript
PET_PERSONALITY_OPTIONS = [
  'Playful', 'Calm', 'Energetic', 'Independent',
  'Affectionate', 'Curious', 'Shy', 'Social'
]
```

### Social Login Providers
```typescript
SOCIAL_LOGIN_PROVIDERS = [
  { id: 'google', name: 'Google', icon: '🔍', color: '#DB4437' },
  { id: 'facebook', name: 'Facebook', icon: '📘', color: '#4267B2' },
  { id: 'apple', name: 'Apple', icon: '🍎', color: '#000000' },
]
```

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

## Best Practices

1. **Always use constants** instead of hardcoded values
2. **Import only what you need** (tree-shaking friendly)
3. **Don't modify constants** - they're immutable
4. **Extend with computed values** if needed:
   ```typescript
   const dynamicColor = isActive ? COLORS.primary : COLORS.disabled;
   ```

