# Lottie Animations for Floating Islands

## Getting Started

1. **Create your animation** in Adobe After Effects
2. **Export as Lottie** using the Bodymovin plugin
3. **Save the JSON file** in this directory
4. **Update FloatingIsland.tsx** to use your animation

## Recommended Animation Elements

### 🏝️ **Floating Island**
- Gentle bobbing motion (up/down)
- Subtle rotation
- Soft shadows underneath

### ☀️ **Sun**
- Gentle rotation
- Animated rays extending outward
- Warm glow effect

### 🐱 **Cats**
- Multiple cats playing
- Rolling, stretching, chasing tails
- Sleeping positions
- Different colors/patterns

### 🌤️ **Atmosphere**
- Floating clouds
- Gentle breeze effects
- Maybe some birds or butterflies

## File Structure
```
src/assets/animations/
├── floating-island.json          # Main island animation
├── floating-island-happy.json     # Happy mood variant
├── floating-island-sleepy.json   # Sleepy mood variant
└── floating-island-playful.json  # Playful mood variant
```

## Usage in Code
```typescript
// In FloatingIsland.tsx, uncomment and update:
<LottieView
  ref={animationRef}
  source={require('../assets/animations/floating-island.json')}
  style={styles.animation}
  autoPlay
  loop
  resizeMode="contain"
/>
```

## Animation Tips
- Keep file size under 500KB for best performance
- Use simple shapes and gradients
- Limit to 2-3 colors per element
- 30fps is usually sufficient
- Loop seamlessly for continuous play
