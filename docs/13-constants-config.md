# Constants & Configuration

All constants and configuration in `src/constants/index.ts` and `src/constants/tasks.ts`.

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

See [09-styling-design.md](./09-styling-design.md) for detailed design token documentation.

### Colors
- Primary: `#18C07A` (green)
- Secondary: `#4ECDC4` (teal)
- Accent: `#45B7D1` (blue)
- Background: `#FFFFFF` (white)
- Text: `#2C3E50` (dark gray)
- Text Secondary: `#7F8C8D` (gray)
- Success/Warning/Error colors defined

### Typography
- Headings: LobsterTwo (32px, 24px, 20px)
- Body: Roboto (16px, 14px, 12px)
- Font weights: Regular, Medium, Bold

### Spacing
- Base unit: 4px
- Scale: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)

### Shadows
- Small, medium, large elevation presets

### Border Radius
- Small(4), medium(8), large(16)
- Common: Cards(20), Buttons(25)

## Onboarding Steps

```typescript
ONBOARDING_STEPS = [
  { id: 'welcome', title: "Let's get started!", ... },
  { id: 'cat_name', title: "What's your cat's name?", ... },
  { id: 'cat_info', title: 'Basic Information', ... },
  { id: 'add_another', title: 'Add Another Cat?', ... },
  { id: 'logging_goals', title: 'Set Logging Goals', ... },
  { id: 'daily_tasks', title: 'Daily Tasks', ... },
  { id: 'weekly_tasks', title: 'Weekly Tasks', ... },
  { id: 'monthly_tasks', title: 'Monthly Tasks', ... },
  { id: 'reminder_time', title: 'Reminder Time', ... },
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

## Achievements

```typescript
ACHIEVEMENTS = [
  {
    id: 'first_log',
    title: 'First Steps',
    description: 'Log your first cat activity',
    icon: '🌟',
    xpReward: 10,
  },
  // ... more achievements
]
```

## Task Definitions

See `src/constants/tasks.ts` for complete task repository.

All MVP tasks are defined with:
- Task ID, title, question template
- Field definitions (type, options, validation)
- Tags for categorization
- Recurring cycle (daily/weekly/monthly)
- Icon emoji

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

## Related Documentation

- [09-styling-design.md](./09-styling-design.md) - Design system details
- [10-tasks-system.md](./10-tasks-system.md) - Task definitions

