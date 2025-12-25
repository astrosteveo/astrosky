# AstroSky Roadmap

## Recently Completed

### v1.12 - Aurora Forecast
- [x] **Aurora/Geomagnetic Alerts** - Real-time Kp index from NOAA SWPC
- [x] Visual Kp meter - Color-coded 0-9 scale with storm level indicators
- [x] Location-based visibility - Probability calculation based on latitude
- [x] Pro feature - Aurora alerts gated behind subscription with upgrade prompts
- [x] Storm level display - G0-G5 geomagnetic storm classification

### v1.11 - AstroSky Pro (Subscription Model)
- [x] Subscription infrastructure - Pro state management with localStorage persistence
- [x] Feature gating system - Pro-only features with upgrade prompts
- [x] Upgrade modal - Beautiful pricing UI with monthly/yearly options ($2.99/mo or $19.99/yr)
- [x] Pro badge - Visual indicator in header for Pro subscribers
- [x] **Smart Clear Sky Alerts** - Observability scoring (0-100) combining weather, moon phase, and events
- [x] Alert preferences - Configurable cloud cover thresholds, alert timing, notification types
- [x] **Observation Planner** - "What should I observe tonight?" personalized recommendations
- [x] Prioritized hit list - Scores objects by visibility, equipment match, and observation history
- [x] Object difficulty ratings - Easy/Moderate/Challenging based on equipment
- [x] **Weekly Challenges** - Rotating challenges (3 per week: Easy, Medium, Hard)
- [x] XP reward system - Earn XP for completing challenges
- [x] Challenge types - Planet hunting, DSO exploration, observation streaks, constellation quests

### v1.10 - Social Media Export
- [x] Platform-specific text formatters for Twitter, Instagram, Threads, Bluesky
- [x] Twitter/X intent URL integration - Opens with pre-filled post
- [x] Bluesky intent URL integration - Opens with pre-filled post
- [x] Instagram-optimized square image (1080x1080) with stats visualization
- [x] Threads support with clipboard copy and app redirect
- [x] Platform-appropriate hashtags and character limits
- [x] Emoji-enhanced planet symbols in social posts
- [x] 13 tests for ShareObservations component

### v1.9 - Sky Chart Integration
- [x] Interactive polar projection sky chart - Center = zenith, edge = horizon
- [x] Planet markers with color-coded visualization
- [x] Deep sky object markers with type-based colors (galaxy, nebula, cluster)
- [x] Filter toggles for planets and DSO visibility
- [x] Click-to-select with detailed tooltips (alt/az, magnitude, description)
- [x] Cardinal direction labels (N/E/S/W) and zenith marker
- [x] Azimuth data added to backend DSO API response
- [x] 16 comprehensive tests for SkyChart component

### v1.8 - Session Notes
- [x] Session data model - Date, location, equipment, conditions, notes, highlights
- [x] Smart date handling - Sessions before 6am count as previous night
- [x] Conditions tracking - Seeing, transparency, Bortle class (1-9 scale)
- [x] Equipment selection - Multiple equipment types per session
- [x] Location naming - Custom site names for observing locations
- [x] Session history - Browse and edit past sessions
- [x] 21 comprehensive tests for session management

### v1.7 - Technical Debt Cleanup
- [x] TonightsBest component tests - 18 comprehensive tests for recommendation logic
- [x] Theme cycling tests - 28 tests for ThemeContext and ThemeToggle components
- [x] Lazy-loading for tabs - Sky, Deep Sky, ISS, and Log tabs load on demand
- [x] Bundle size optimization - 33% reduction in main bundle (118KB → 77KB gzip)
- [x] Vendor chunk splitting - React and Framer Motion in separate cacheable chunks

### v1.6 - Equipment Profiles
- [x] Equipment profile management - Save binoculars and telescopes
- [x] Quick presets - 16 common configurations from 7x35 binoculars to 12" Dobsonians
- [x] Custom equipment entry - Add any aperture/focal length configuration
- [x] Limiting magnitude calculation - Automatic based on aperture
- [x] DSO filtering - "My Gear" filter shows objects viewable with saved equipment
- [x] Primary equipment selector - Set default for recommendations

### v1.5 - Achievement System
- [x] Achievement badges - 28 achievements across 7 categories
- [x] Progress tracking - Visual progress bars for in-progress achievements
- [x] Tiered rewards - Bronze, Silver, Gold, and Platinum tiers
- [x] Categories: Observations, Messier Catalog, Planets, Streaks, Equipment, Object Types, Dedication

### v1.4 - Social & Engagement Features
- [x] Share observations - Visual share cards, Web Share API, copy text
- [x] Observation photos - Camera/gallery capture, compression, thumbnails
- [x] Push notifications - ISS passes, meteor peaks, celestial events

### v1.3 - Enhanced Stargazing Experience
- [x] Tonight's Best - Smart recommendations with urgency badges
- [x] Red Night Mode - Preserves dark adaptation at telescope
- [x] Bortle Scale indicator - Light pollution estimation
- [x] Planet visibility ratings - 5-star scoring system
- [x] DSO magnitude filter - Bright/Medium/Faint filtering
- [x] Constellation grouping - Toggle for deep sky objects
- [x] Add-to-calendar - Google Calendar + .ics export for events

### v1.2 - Observation Tracking
- [x] Observation logging with equipment type
- [x] Observation analytics dashboard
- [x] ISS magnitude display
- [x] Theme-aware moon visualization
- [x] Weather-based observing conditions

### v1.1 - Core Features
- [x] PWA with offline support
- [x] Real-time countdowns (sunset, ISS, meteors)
- [x] Current sky status banner
- [x] Live clock with auto-refresh
- [x] Light/Dark theme toggle

---

## Backlog

### Medium Priority
- [x] **Sky chart integration** - Interactive star map with object positions ✓ v1.9
- [x] **Export to social media** - Generate formatted posts for Twitter/Instagram ✓ v1.10

### Low Priority / Future Ideas
- [ ] **Social features** - Nearby observers, shared sightings
- [x] **Aurora forecast** - Northern/Southern lights predictions ✓ v1.12
- [ ] **Satellite tracker** - Beyond ISS (Starlink, notable satellites)
- [ ] **Light pollution map** - Visual Bortle scale overlay
- [ ] **Astrophotography mode** - Exposure calculator, polar alignment helper
- [ ] **Widgets** - iOS/Android home screen widgets for next event

---

## Technical Debt
- [x] Add tests for TonightsBest component ✓ v1.7
- [x] Add tests for theme cycling behavior ✓ v1.7
- [x] Consider lazy-loading for less-used tabs ✓ v1.7
- [x] Optimize bundle size (analyze with vite-bundle-visualizer) ✓ v1.7
- [ ] **API/Frontend type sync** - Auto-generate TypeScript types from FastAPI OpenAPI spec (use `openapi-typescript`) to prevent API model mismatches like the missing DSO azimuth field
- [ ] **Automate SW cache versioning** - Use `vite-plugin-pwa` or Workbox to auto-generate service worker with content-based cache hashing instead of manual version bumps

---

## Contributing

Feature requests and ideas welcome! When adding to this roadmap:
1. Add new ideas to the appropriate priority section
2. Move items to "Recently Completed" when done
3. Include the version number for completed batches
