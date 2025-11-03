# State Management

The app uses **Zustand** for global state management with **AsyncStorage** persistence.

## Store Location

**File**: `src/store/index.ts`

## Store Structure

### State

```typescript
interface AppStore {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  
  // Pets
  pets: Pet[];
  currentPet: Pet | null;
  
  // Tasks & Logs
  userTasks: UserTasks | null;
  tasks: Task[];
  logs: Log[];
  
  // Gamification
  streaks: { [petId: string]: Streak };
  achievements: Achievement[];
  
  // UI State
  isLoading: boolean;
}
```

## Key Actions

### User Management
- `setUser(user: User | null)`: Set current user
- `setAuthenticated(boolean)`: Set auth status
- `setOnboardingComplete(boolean)`: Mark onboarding done
- `signOut()`: Clear user session and reset auth state

### Pet Management
- `addPet(pet: Pet)`: Add new pet (also sets as current if none selected)
- `updatePet(petId, updates)`: Update pet fields
- `removePet(petId)`: Delete pet from state
- `setCurrentPet(pet: Pet | null)`: Switch active pet

### Task Management
- `setUserTasks(tasks: UserTasks)`: Save user's task selections from onboarding
- `addTask(task: Task)`: Add new task
- `updateTask(taskId, updates)`: Update task
- `completeTask(taskId)`: Mark task complete with timestamp

### Logging
- `addLog(log: Log)`: Add new log entry
- `updateLog(logId, updates)`: Update log
- `deleteLog(logId)`: Remove log

### Streaks
- `updateStreak(petId, streak)`: Replace streak data
- `getCurrentStreak(petId)`: Get current streak count
- `incrementStreak(petId)`: Increment streak (handles logic):
  - Checks if logged today (doesn't increment if already logged)
  - Checks if consecutive day (increments) or missed day (resets to 1)
  - Updates longest streak if needed
- `resetStreak(petId)`: Reset streak to 0

### Achievements
- `unlockAchievement(achievementId)`: Mark achievement unlocked with timestamp

### Utility
- `setLoading(boolean)`: Set global loading state
- `reset()`: Clear all state (testing/reset)

## Persistence

### Persisted State
Only these fields are persisted to AsyncStorage:
- `user`
- `pets`
- `currentPet`
- `isOnboardingComplete`
- `isAuthenticated`
- `userTasks`
- `streaks`
- `logs`
- `tasks`
- `achievements`

### Persistence Key
Storage key: `'catable-storage'`

### Storage Implementation
Uses `createJSONStorage(() => AsyncStorage)` from Zustand's persist middleware.

## Usage Pattern

```typescript
import { useAppStore } from '../store';

function MyComponent() {
  const { user, pets, currentPet, addPet } = useAppStore();
  
  const handleAddPet = () => {
    const newPet = { /* ... */ };
    addPet(newPet);
    // Also save to database
    await DatabaseService.savePet(newPet);
  };
  
  return (/* ... */);
}
```

## State Synchronization

### Store ↔ Database
- **Store**: In-memory state, persists to AsyncStorage
- **Database**: SQLite persistent storage

Current pattern:
1. Update store (for immediate UI update)
2. Save to database (for persistence)

Future: Could add sync layer to keep them in sync automatically.

### Store ↔ Backend
Not yet implemented. When backend is integrated:
- Store will track `synced` flags
- Background sync will push unsynced data
- Store will update from backend on login/sync

## Best Practices

1. **Always update store first** for immediate UI feedback
2. **Then persist** to database for long-term storage
3. **Use selectors** to avoid unnecessary re-renders:
   ```typescript
   const currentPet = useAppStore(state => state.currentPet);
   ```
4. **Don't mutate state directly** - Zustand uses immutable updates
5. **Reset on sign out** - `signOut()` clears sensitive data

## Store vs Local State

**Use Store For**:
- User session data
- Pet profiles
- Logs and tasks
- Global UI flags (loading, auth)

**Use Local State (`useState`) For**:
- Form input values
- UI toggles (modal open/closed)
- Temporary UI state
- Animation values

