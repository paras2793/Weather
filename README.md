# AETHER — Weather, clearly.

AETHER is a React + Vite weather dashboard built around Open-Meteo forecast and air-quality data. This upgrade preserves the existing weather-fetching flow and saved-city/temperature-unit preferences while adding an interactive map, weather-responsive backgrounds, richer hourly charts, and transparent weather insights.

## Requirements

- Node.js 22.12 or newer (recommended for the current Vite toolchain)
- npm
- Internet access for weather data, map tiles, and the optional Unsplash background photographs

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite (the default in this project is `http://localhost:5173`). On Windows, PowerShell users can copy `.env.example` to `.env` manually instead of using `cp`.

Useful commands:

```bash
npm test       # tests the deterministic weather-insight rules
npm run build  # creates the production bundle in dist/
npm run preview
```

## What changed

- **Cleaner light interface:** switched the dashboard to a soft light palette, reduced unnecessary vertical spacing, and kept the map beside the current weather near the top so the main information is visible sooner. The weather photograph is intentionally more visible through the translucent panels.

- **Location search:** the Open-Meteo geocoder now returns populated-place feature types (`PPL*`) only. Country (`PCL*`) and administrative (`ADM*`) results are not treated as cities. Results are ranked by exact name and the preferred country code, but ambiguous results remain visible for the user to choose.
- **Noida accuracy:** `VITE_PREFERRED_COUNTRY_CODE=IN` ranks Indian matches first. Searching `Noida` presents the Indian result near the top; selecting “Noida, Uttar Pradesh, India” uses the coordinates returned by Open-Meteo. No Noida coordinates are hardcoded. Search `Noida, India` to narrow the geocoding query.
- **Interactive map:** MapLibre GL JS renders an interactive light vector map beside the current-weather card near the top of the page. The map has no visible card frame and softly fades into the page around its edges. A custom marker and popup are moved to the selected city's actual longitude/latitude whenever the selected location changes.
- **Weather backgrounds:** `src/assets/weatherBackgrounds.js` maps WMO weather codes and day/night to matching photo scenes. A generated clear-sky photograph is bundled locally at `public/backgrounds/clear-day.webp` (optimized to WebP); the other weather scenes currently use resized Unsplash CDN photographs. A local CSS gradient remains as a fallback if any image fails. The remote scenes require an internet connection.
- **Atmosphere:** subtle rain, snow, cloud, fog, sun and star effects use CSS. Reduced-motion preferences are respected.
- **Forecast charts:** the next-24-hour chart can switch between temperature, precipitation probability and wind speed. Daily rainfall remains a separate chart; the 7-day high/low forecast is preserved.
- **Weather insights:** fixed JavaScript rules generate rain, UV, wind, humidity and air-quality tips. Missing AQI is shown as unavailable, not assumed to be good.
- **Project setup:** this ZIP includes a Vite entry point, package manifest, Tailwind v4 Vite plugin configuration, `.env.example`, documentation and a small Node test suite because the original upload contained only `src/` files.

## Beginner-friendly architecture

```text
src/
├── assets/
│   └── weatherBackgrounds.js   # WMO code + day/night -> image/fallback
public/
└── backgrounds/
    └── clear-day.webp          # locally bundled clear-sky photograph
├── components/
│   ├── Sidebar.jsx             # search, candidate selection, saved cities
│   ├── WeatherBackground.jsx  # animated full-screen weather scene
│   ├── WeatherDashboard.jsx   # assembles the dashboard sections
│   ├── WeatherCharts.jsx      # Recharts hourly + daily charts
│   ├── WeatherInsights.jsx    # displays rule-based tips
│   └── WeatherMap.jsx         # MapLibre map, marker and popup
├── hooks/
│   └── useWeatherData.js      # fetches when the selected city changes
├── services/
│   ├── weatherApi.js          # geocoding, weather and AQI requests
│   └── weatherInsights.js     # plain JavaScript weather rules
├── store/
│   └── weatherStore.js        # saved cities and °C/°F preference
├── App.jsx                    # app layout and loading/error/empty states
├── index.css                  # Tailwind import and custom map/scene styles
└── main.jsx                   # React entry point
```

**How the data flows:** the Sidebar searches the geocoding endpoint. When you select a result, Zustand stores that location, including its returned coordinates. `useWeatherData` requests the forecast and AQI for those coordinates. `App` passes the response to `WeatherDashboard`; the dashboard passes weather arrays to charts, insights and the map. Changing city changes the selected coordinates and therefore updates both the weather request and the map marker.

## APIs, keys and attribution

### Open-Meteo

The default weather, geocoding and air-quality endpoints are configured in `src/services/weatherApi.js`. No API key is needed for the basic public endpoints used here. The weather request includes current conditions, 24-hour chart variables, and a 7-day forecast. AQI is optional: if the air-quality request fails, the weather dashboard still loads and the AQI panel says unavailable.

The geocoder's `feature_code` follows GeoNames-style feature categories. AETHER keeps populated-place (`PPL*`) results and filters country and administrative-area results. The preferred country code changes result ranking only; it does not hardcode a coordinate or prevent other countries being searched.

### MapLibre + OpenFreeMap

MapLibre GL JS is the map renderer; OpenFreeMap supplies the light Positron vector style and map tiles at `https://tiles.openfreemap.org/styles/positron`. No MapTiler token or map API key is required with this default public style. The public tile service is offered as-is; for a production product with reliability or volume requirements, review the provider's current terms and consider a managed or self-hosted tile service. Required map data attribution remains available through a small expandable information control; the separate row of provider links has been removed from the dashboard.

To use a different MapLibre-compatible style, set `VITE_MAP_STYLE` in `.env`. Do not put private server secrets in a `VITE_` variable: Vite exposes those values in browser code.

### Background photos

Photo selection is centralized in `src/assets/weatherBackgrounds.js`. The clear-day scene is bundled as an optimized WebP file under `public/backgrounds/`. The remaining day/night weather scenes use Unsplash CDN image URLs with resize/format/quality parameters, so those require internet access. The CSS gradient fallback keeps text readable when a remote image does not load. To make every scene offline, replace the remaining CDN URLs with appropriately licensed local files in `public/backgrounds/`.

### Weather insights

The thresholds are in `src/services/weatherInsights.js` and are intentionally simple to inspect and change. They are product guidance, not official warnings or medical advice. The examples currently use rain probability `>= 60%`, UV index `>= 8`, wind `>= 30 km/h`, hot/humid conditions `>= 28°C` and `>= 85%` humidity, and US AQI `> 150`.

## Test status

- The geocoder filtering/ranking and deterministic weather-insight rules are tested with `npm test`.
- The production build can be checked with `npm run build` after dependencies install.
- This source archive was not tested in a real browser session in this environment. Before demonstrating it, test the OpenFreeMap style/tiles and Unsplash photos on your network, select “Noida, Uttar Pradesh, India”, verify the displayed coordinate pair, and test the mobile layout. Public tile and photo services can be unavailable or rate-limited independently of the app code.
