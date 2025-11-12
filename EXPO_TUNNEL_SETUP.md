# Expo Tunnel Setup Guide

This guide will help you set up Expo tunnel for remote testing so others can access your development server from anywhere.

## Method 1: Expo Tunnel (Recommended)

### Basic Setup
```bash
npx expo start --tunnel
```

### With Additional Options
```bash
npx expo start --tunnel --port 8081
```

### Clear Cache and Tunnel
```bash
npx expo start --tunnel --clear
```

## Method 2: ngrok (Alternative)

If you prefer using ngrok for tunneling:

### Install ngrok
```bash
npm install -g ngrok
```

### Start Expo on Local Network
```bash
npx expo start --lan
```

### In Another Terminal, Create Tunnel
```bash
ngrok http 8081
```

## Method 3: Expo Dev Client with Tunnel

For development builds:

```bash
npx expo start --dev-client --tunnel
```

## Configuration Options

### Tunnel Settings in app.json
```json
{
  "expo": {
    "developer": {
      "tool": "expo-cli"
    },
    "packagerOpts": {
      "config": "metro.config.js"
    }
  }
}
```

### Environment Variables
You can set these environment variables for better tunnel performance:

```bash
# For better tunnel performance
export EXPO_TUNNEL_SUBDOMAIN=your-custom-subdomain
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
```

## How It Works

1. **Expo Tunnel**: Creates a secure tunnel from Expo's servers to your local development server
2. **Public URL**: Generates a public URL (like `https://abc123.tunnel.expo.dev`)
3. **QR Code**: Displays a QR code that others can scan with Expo Go app
4. **Real-time Updates**: Changes to your code are reflected immediately for all connected users

## Sharing Instructions

### For Testers:
1. **Install Expo Go**: Download Expo Go app from App Store/Google Play
2. **Scan QR Code**: Use the app to scan the QR code from your terminal
3. **Wait for Bundle**: The app will download and install automatically
4. **Start Testing**: The app will open and they can test your features

### For Web Testing:
1. **Open URL**: Share the web URL with testers
2. **Browser Access**: They can test the web version directly in their browser

## Troubleshooting

### Common Issues:

**Tunnel Connection Failed**
```bash
# Try clearing cache and restarting
npx expo start --tunnel --clear --reset-cache
```

**Slow Performance**
```bash
# Use LAN mode for local network testing
npx expo start --lan
```

**Port Already in Use**
```bash
# Use different port
npx expo start --tunnel --port 8082
```

**Network Issues**
```bash
# Check your internet connection
# Ensure firewall isn't blocking Expo
# Try different tunnel subdomain
```

### Performance Tips:

1. **Use LAN for Local Testing**: `npx expo start --lan` is faster for local network
2. **Clear Cache Regularly**: Use `--clear` flag when having issues
3. **Close Unused Tunnels**: Stop previous tunnel sessions before starting new ones
4. **Stable Internet**: Ensure stable internet connection for tunnel

## Security Considerations

### Tunnel Security:
- ✅ **HTTPS**: Expo tunnels use HTTPS by default
- ✅ **Temporary**: Tunnels are temporary and expire
- ✅ **No Data Storage**: Expo doesn't store your app data
- ⚠️ **Public Access**: Anyone with the URL can access your app
- ⚠️ **Development Only**: Don't use tunnels for production

### Best Practices:
- Only share tunnel URLs with trusted testers
- Don't commit tunnel URLs to version control
- Use LAN mode for local development when possible
- Stop tunnels when not needed

## Advanced Configuration

### Custom Tunnel Subdomain
```bash
npx expo start --tunnel --tunnel-subdomain myapp-dev
```

### Multiple Platforms
```bash
# Start tunnel for all platforms
npx expo start --tunnel --web --ios --android
```

### Development Build
```bash
# For custom development builds
npx expo start --dev-client --tunnel
```

## Monitoring and Logs

### View Connected Devices
- Check terminal for connected device logs
- Monitor network requests in Expo DevTools
- View error logs in real-time

### Debugging Remote Issues
```bash
# Enable verbose logging
npx expo start --tunnel --verbose
```

## Alternative: Expo Development Build

For more advanced testing:

1. **Create Development Build**:
```bash
npx expo install expo-dev-client
npx expo run:ios --device
npx expo run:android --device
```

2. **Start with Tunnel**:
```bash
npx expo start --dev-client --tunnel
```

## Quick Commands Reference

```bash
# Basic tunnel
npx expo start --tunnel

# Tunnel with cache clear
npx expo start --tunnel --clear

# Tunnel on specific port
npx expo start --tunnel --port 8082

# LAN mode (local network only)
npx expo start --lan

# Development client with tunnel
npx expo start --dev-client --tunnel

# All platforms with tunnel
npx expo start --tunnel --web --ios --android
```

## Getting Help

If you encounter issues:
1. Check Expo documentation: https://docs.expo.dev/
2. Clear cache and restart: `npx expo start --tunnel --clear`
3. Try LAN mode first: `npx expo start --lan`
4. Check your internet connection
5. Ensure Expo CLI is up to date: `npm install -g @expo/cli`
