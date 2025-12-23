# AstroSky Web Application Design

## Overview

Transform AstroSky from a CLI tool into a web application that provides real-time night sky information with an interactive sky map. Users can share a URL with friends who get automatic location detection and visual representation of celestial objects.

## Goals

1. **Wider accessibility** - Share a URL, no Python installation required
2. **Visual experience** - Interactive sky map showing celestial objects
3. **Automatic location** - Browser geolocation detects user's position

## Architecture

```
┌─────────────────┐     JSON      ┌─────────────────┐
│   React SPA     │◄────────────►│   FastAPI       │
│   (Vercel)      │    /api/*    │   (Railway)     │
├─────────────────┤              ├─────────────────┤
│ - d3-celestial  │              │ - build_report()│
│ - Tailwind CSS  │              │ - Skyfield      │
│ - Geolocation   │              │ - astronomy-eng │
└─────────────────┘              └─────────────────┘
```

**Backend:** FastAPI wrapping existing Python astronomy code
**Frontend:** React + TypeScript + Vite
**Sky visualization:** d3-celestial (D3-based star map library)
**Styling:** Tailwind CSS
**Hosting:** Vercel (frontend), Railway or Fly.io (API)

## API Endpoints

### Phase 1

```
GET /api/report?lat={lat}&lon={lon}&date={iso_date}
```
Returns the full sky report (moon, planets, ISS, meteors, deep sky, events).

### Phase 2

```
GET /api/skymap?lat={lat}&lon={lon}&time={iso_datetime}
```
Returns object positions in altitude/azimuth coordinates for sky map rendering.

## Phased Implementation

### Phase 1: Foundation

**Goal:** Working web app matching CLI functionality with modern UI.

**Backend tasks:**
- [ ] Create FastAPI app wrapping `build_report()`
- [ ] Add CORS middleware
- [ ] Add `/api/report` endpoint returning JSON
- [ ] Add `/api/health` endpoint
- [ ] Dockerfile for deployment
- [ ] Deploy to Railway/Fly.io

**Frontend tasks:**
- [ ] Initialize React + TypeScript + Vite project
- [ ] Set up Tailwind CSS
- [ ] Implement browser geolocation hook
- [ ] Create card components for each data section:
  - Moon phase card (with SVG visual)
  - Planets card
  - ISS passes card
  - Meteor showers card
  - Deep sky objects card
  - Upcoming events card
- [ ] Loading and error states
- [ ] Mobile-responsive layout
- [ ] Deploy to Vercel

**Deliverable:** Shareable URL that auto-detects location and displays tonight's sky info.

### Phase 2: Interactive Sky Map

**Goal:** Add real-time, interactive sky chart.

**Backend tasks:**
- [ ] Add `/api/skymap` endpoint with alt/az coordinates
- [ ] Calculate object positions for given time
- [ ] Support time parameter for sky-at-time queries

**Frontend tasks:**
- [ ] Integrate d3-celestial library
- [ ] Render local horizon-to-zenith sky view
- [ ] Plot planets, moon, Messier objects on chart
- [ ] Implement click/tap for object details
- [ ] Add time slider for night progression
- [ ] Constellation lines and labels
- [ ] "Best viewing window" highlighting

**Deliverable:** Interactive sky map showing exactly where to look for objects.

### Phase 3: Polish & Sharing

**Goal:** Production-quality experience.

**Features:**
- [ ] Dark mode (default for astronomers)
- [ ] Weather/cloud cover overlay integration
- [ ] Save favorite locations (localStorage)
- [ ] Shareable links with embedded coordinates
- [ ] Equipment filter (naked eye / binoculars / telescope)
- [ ] "Right now" vs "Tonight's forecast" toggle
- [ ] Animated moon phase transitions
- [ ] Golden hour / blue hour indicators

**Deliverable:** Polished, shareable astronomy app.

### Future Ideas (Phase 4+)

- Push notifications for ISS passes
- AR mode using device orientation
- Observation logging / Messier marathon checklist
- User accounts for cross-device sync

## Project Structure

```
astrosky/
├── api/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app, CORS, routes
│   │   ├── routes/
│   │   │   ├── report.py
│   │   │   └── skymap.py
│   │   └── deps.py         # Dependencies
│   ├── Dockerfile
│   └── requirements.txt
├── web/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── lib/
│   ├── package.json
│   └── vite.config.ts
├── src/skycli/             # Existing CLI (unchanged)
└── docs/plans/
```

Monorepo structure keeps API and web together for easier development.

## Tech Stack Summary

| Layer | Technology | Rationale |
|-------|------------|-----------|
| API Framework | FastAPI | Async, automatic OpenAPI docs, Python ecosystem |
| Astronomy | Skyfield, astronomy-engine | Already proven in CLI |
| Frontend | React + TypeScript | Largest ecosystem, type safety |
| Bundler | Vite | Fast dev server, modern defaults |
| Styling | Tailwind CSS | Rapid UI development, dark mode support |
| Sky Map | d3-celestial | Mature, customizable, framework-agnostic |
| API Hosting | Railway / Fly.io | Free tier, easy Python deployment |
| Web Hosting | Vercel | Free, excellent React/Vite support |

## Open Questions

1. **Monorepo tooling** - Use Turborepo, Nx, or simple npm workspaces?
2. **API caching** - Cache astronomy calculations? (They're deterministic for a given time/location)
3. **Rate limiting** - Needed for public API?
