# WoToS React UI

React 18 single-page application for the [WoToS](https://github.com/users/kevinthelago/projects/2) system. Displays World of Tanks player and vehicle statistics with WN8 ratings. All data is fetched from the edge service.

## Prerequisites

- Node.js 18+
- npm or yarn
- `wotos-edge-service` running at `http://localhost:8081` (all API calls go here)

## Running Locally

```bash
npm install
npm start        # development server at http://localhost:3000
```

## Building for Production

```bash
npm run build    # output to build/
```

The production build is normally compiled automatically by `wotos-ui-service` via `frontend-maven-plugin` during its Maven build — a standalone `npm run build` here is only needed for development.

## Testing

```bash
npm test
```

## Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| React | 18.2.0 | UI framework |
| React Router | 6.3.0 | Client-side routing |
| Axios | 0.27.2 | HTTP client |
| D3 | 7.6.1 | Data visualisation |

## Key Components

| Component | Description |
|-----------|-------------|
| `App.jsx` | Root component, dark theme toggle |
| `components/player/Player.jsx` | Player profile and statistics view |
| `components/tankpage/TankPage.jsx` | Per-vehicle statistics view |
| `components/nav/` | Navigation bar and menus |
| `util/` | WN8 colour calculation utilities |

## API

All requests go to `http://localhost:8081/api` (hardcoded). The edge service aggregates responses from the individual microservices.
