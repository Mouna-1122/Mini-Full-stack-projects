# 🌍 Weather Lookup App

An Express/Node.js web app that lets users search for any city and see its **current weather** and **5-day forecast**, built using the free [Open-Meteo API](https://open-meteo.com/).

Built for the "Public API Integration" project — uses Express, Axios, and EJS as required.

## Why Open-Meteo?

- **No API key required** — works out of the box.
- **CORS enabled** and fully free for non-commercial use.
- Provides both a **Geocoding endpoint** (turn a city name into coordinates) and a **Forecast endpoint** (turn coordinates into weather data), which made it possible to build a real two-step data pipeline: user input → geocode → forecast → present.

## How it works

1. User types a city name into the search form on the home page.
2. The server calls the **Open-Meteo Geocoding API** with Axios to resolve the city name into latitude/longitude (and a nice display name like "Bengaluru, Karnataka, India").
3. The server calls the **Open-Meteo Forecast API** with those coordinates to get the current weather and the next 5 days of daily highs/lows and conditions.
4. Numeric WMO weather codes returned by the API are mapped to human-readable descriptions and emoji icons (see `utils/weatherCodes.js`).
5. Results are rendered with EJS templates and styled with plain CSS.
6. If the city can't be found, or either API call fails, the user sees a friendly error message instead of a crash — the real error is also logged to the server console for debugging.

## Project structure

```
weather-app/
├── index.js                 # Express app entry point, middleware, error handlers
├── routes/
│   └── weather.js           # Route handlers + Axios calls to Open-Meteo APIs
├── utils/
│   └── weatherCodes.js      # Maps WMO weather codes to descriptions/icons
├── views/
│   ├── index.ejs            # Home page (search form)
│   ├── result.ejs           # Weather results page
│   └── error.ejs            # Generic error page (404 / 500)
├── public/
│   └── css/
│       └── style.css        # Styling
├── package.json
└── README.md
```

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (comes with Node.js)

### Installation & running

```bash
# 1. Install dependencies
npm i

# 2. Start the server (with auto-restart on file changes)
nodemon index.js

# — or, without nodemon —
npm start
```

Then open your browser to:

```
http://localhost:3000
```

### Usage

1. On the home page, type a city name (e.g. `Bengaluru`, `Tokyo`, `Paris`) into the search box.
2. Click **Search**.
3. View the current temperature/conditions and the 5-day forecast.
4. Click **← New search** to look up another city.

## APIs used

| API | Purpose | Docs |
|---|---|---|
| Open-Meteo Geocoding API | Convert a city name to latitude/longitude | https://open-meteo.com/en/docs/geocoding-api |
| Open-Meteo Forecast API | Get current weather + daily forecast for coordinates | https://open-meteo.com/en/docs |

## Error handling

- **Empty search** — form requires input; server also validates and re-renders the form with a message if bypassed.
- **City not found** — if the geocoding API returns no results, the user sees a friendly "couldn't find that place" message.
- **API/network failures** — wrapped in try/catch; the real error is logged with `console.error`, and the user sees a generic friendly message rather than a stack trace.
- **404 routes** — any unmatched route renders a styled error page instead of Express's default HTML error.
- **Unhandled server errors** — caught by a final Express error-handling middleware in `index.js`.


