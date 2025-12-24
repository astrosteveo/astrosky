# PWA Setup Guide

## What is PWA?

AstroSky is now a Progressive Web App (PWA), which means:
- ✅ **Install like a native app** on Android, iOS, and desktop
- ✅ **Works offline** - Critical for dark sky sites with no cell service
- ✅ **Faster loading** - Caches assets for instant startup
- ✅ **Home screen icon** - Quick access without opening browser

## Installation

### Android
1. Open https://astrosky-beryl.vercel.app in Chrome
2. Tap the menu (⋮) → "Install app" or "Add to Home screen"
3. App will appear on your home screen like a native app

### iOS
1. Open https://astrosky-beryl.vercel.app in Safari
2. Tap the share button (□↑) → "Add to Home Screen"
3. Tap "Add" in the top right

### Desktop (Chrome/Edge)
1. Look for the install icon (⊕) in the address bar
2. Click "Install"

## Offline Features

### What Works Offline
- ✅ **Previously viewed reports** - Cached API responses
- ✅ **App shell** - UI loads instantly
- ✅ **Static assets** - All CSS, JS, images
- ✅ **Service worker** - Automatic background updates

### Offline Workflow
1. **At home (with internet):**
   - Open AstroSky
   - View tonight's sky report
   - Data is automatically cached

2. **At dark sky site (no internet):**
   - Open installed app
   - Last cached report loads instantly
   - Perfect for planning observations

## Development

### Testing PWA Locally

```bash
# Build the app
npm run build

# Serve built app (PWA requires HTTPS in production)
npm run preview

# Or use a tool like serve
npx serve -s dist
```

### Testing Service Worker

1. Open Chrome DevTools → Application → Service Workers
2. Check "Update on reload" for development
3. "Unregister" to clear service worker

### Testing Offline Mode

1. Chrome DevTools → Network → "Offline" checkbox
2. Reload page - should load from cache
3. Check Console for "[SW]" logs

## Icon Setup (TODO)

Currently using placeholder icons. To add proper icons:

1. Create icons at:
   - `public/icon-192.png` (192x192)
   - `public/icon-512.png` (512x512)

2. Design recommendations:
   - Dark background (#0a0e27)
   - Astronomy theme (moon, stars, constellation)
   - Simple, recognizable at small sizes

3. Tools:
   - https://realfavicongenerator.net
   - https://www.pwabuilder.com/imageGenerator

## Troubleshooting

### "Install" button doesn't appear
- Ensure you're using HTTPS (required for PWA)
- Check manifest.json loads without errors (DevTools → Application)
- Service worker must be registered successfully

### Offline mode not working
- Check Service Worker is "activated" (DevTools → Application)
- Verify cache entries exist (DevTools → Application → Cache Storage)
- Check Console for "[SW]" error logs

### App doesn't update
- Service worker caches aggressively
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Or: DevTools → Application → "Update" service worker

## Cache Strategy

### Static Assets (cache-first)
- HTML, CSS, JavaScript
- Images, fonts
- Falls back to network if not in cache

### API Requests (network-first)
- `/api/report` - Always tries network first
- Falls back to cached response if offline
- Caches successful responses for offline use

### Update Strategy
- Service worker checks for updates hourly
- Prompts user to reload when new version available
- Can force update with hard refresh

## Performance

### First Load (with internet)
- ~500ms - App shell loads
- ~1-2s - API data fetched
- Assets cached for next visit

### Subsequent Loads (with internet)
- ~100ms - Instant load from cache
- API data fetched in background
- Updates seamlessly

### Offline Load
- ~50ms - Instant load
- Shows last cached data
- No network delay

## Future Enhancements

Potential PWA features to add:
- 🔔 **Push notifications** - ISS pass alerts, meteor shower peaks
- 🔄 **Background sync** - Update data when connection restored
- 📍 **Geolocation caching** - Remember last location offline
- 📊 **Usage analytics** - Offline-capable event tracking
- 📥 **Pre-cache popular locations** - Major cities' data
