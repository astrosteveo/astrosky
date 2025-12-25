# AstroSky Roadmap

## Recently Completed

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
- [ ] **Sky chart integration** - Interactive star map with object positions
- [ ] **Session notes** - Add notes and conditions to entire observation sessions
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
- [ ] Add tests for TonightsBest component
- [ ] Add tests for theme cycling behavior
- [ ] Consider lazy-loading for less-used tabs
- [ ] Optimize bundle size (analyze with vite-bundle-visualizer)

---

## Contributing

Feature requests and ideas welcome! When adding to this roadmap:
1. Add new ideas to the appropriate priority section
2. Move items to "Recently Completed" when done
3. Include the version number for completed batches
