# AstroSky Roadmap

## Recently Completed

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
- [ ] **Export to social media** - Generate formatted posts for Twitter/Instagram

### Low Priority / Future Ideas
- [ ] **Social features** - Nearby observers, shared sightings
- [ ] **Aurora forecast** - Northern/Southern lights predictions
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

---

## Contributing

Feature requests and ideas welcome! When adding to this roadmap:
1. Add new ideas to the appropriate priority section
2. Move items to "Recently Completed" when done
3. Include the version number for completed batches
