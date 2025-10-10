# Prime Fix Frontend

A Vue 3 + Vite + Pinia application for Prime Fix. It implements the Owner and IAM flows, including login, location filtering (Department/District), workshop selection, and visit scheduling.

## Tech stack
- Vue 3 (Composition API)
- Vite 7
- Pinia (state management)
- Vue Router 4
- PrimeVue + PrimeFlex + @primeuix/themes
- Axios
- JSON Server (mock API for local development)

## Requirements
- Node.js 20.19+ (or 22.12+)
- npm 10+
- Windows (commands below use cmd.exe syntax)

## Project setup
```cmd
npm install
```

## Running locally (with mock API)
The app uses environment variables to call an API. For development, the project is configured to call a local JSON Server (http://localhost:3000) using direct paths such as `/locations`, `/auto_repairs`, etc.

1) Start the mock API (in a first terminal):
```cmd
npm run mock
```
This serves the mock database from `server/db.json` at http://localhost:3000.

2) Start the frontend (in a second terminal):
```cmd
npm run dev
```
The app will run at http://localhost:5173.

### API endpoints used in development
- Base URL: `VITE_PRIMEFIX_PLATFORM_API_URL = http://localhost:3000`
- Resources (tables):
  - `/locations`
  - `/auto_repairs`
  - `/ratings`
  - `/vehicles`
  - `/visits`
  - `/users`, `/user_accounts`, `/payments`, etc.

Environment variables for development are defined in `.env.development`. Endpoint path variables are already set to the resource names above.

## Switching to a real API (optional)
If you want to point the app to a real API instead of the local mock:
- Set `VITE_PRIMEFIX_PLATFORM_API_URL` to your API base URL in `.env.development`.
- Ensure endpoint path variables (e.g., `VITE_LOCATIONS_ENDPOINT_PATH`, `VITE_AUTO_REPAIRS_ENDPOINT_PATH`) match your backend routes.
- If your API requires authentication headers (e.g., apikey/Bearer), configure them in your environment and/or an interceptor.
- Restart `npm run dev` after changing .env files.

## Key features and flow
- IAM: Login, session restore from localStorage.
- Owner flow:
  1) Search Workshops: select Department and District.
  2) Workshop Selection: shows workshops that belong to the selected location.
  3) Visit Request: select vehicle, date/time, and describe the failure to schedule a visit.

Notes:
- The District and Department options are populated from `/locations`.
- A workshop is shown if it is linked to a location that matches the selected Department/District. The app supports multiple backend conventions for linking workshops to locations (e.g., `id_location`, `location_id`, or a shared `id`).

## Project structure (excerpt)
```
frontend/
├─ index.html
├─ package.json
├─ vite.config.js
├─ server/
│  ├─ db.json            # Mock database
│  └─ routes.json        # (Optional) path rewrites for other setups
├─ src/
│  ├─ main.js
│  ├─ App.vue
│  ├─ router.js
│  ├─ pinia.js
│  ├─ i18n.js
│  ├─ iam/
│  │  ├─ application/iam.store.js
│  │  ├─ infrastructure/iam-api.js, location.assembler.js
│  │  └─ domain/model/location.entity.js, user*.entity.js
│  ├─ owner/
│  │  ├─ application/owner.store.js
│  │  ├─ infrastructure/owner-api.js, auto-repair.assembler.js, ...
│  │  ├─ domain/model/auto-repair.entity.js, vehicle.entity.js
│  │  └─ presentation/views/
│  │     ├─ search-workshop.vue
│  │     ├─ workshop-selection.vue
│  │     └─ visit-request.vue
│  └─ shared/
│     ├─ infrastructure/http/{base-api.js, base-endpoint.js}
│     └─ presentation/components/layout-*.vue
```

## Environment variables (development)
File: `.env.development`
- `VITE_PRIMEFIX_PLATFORM_API_URL` = base API URL (default: `http://localhost:3000`)
- Endpoint paths (must match your backend resource names):
  - `VITE_LOCATIONS_ENDPOINT_PATH=/locations`
  - `VITE_AUTO_REPAIRS_ENDPOINT_PATH=/auto_repairs`
  - `VITE_RATINGS_ENDPOINT_PATH=/ratings`
  - `VITE_VEHICLES_ENDPOINT_PATH=/vehicles`
  - `VITE_VISITS_ENDPOINT_PATH=/visits`
  - ...and others as needed

After editing `.env.development`, restart the dev server so changes take effect.

## Troubleshooting
- I see “No workshops for this location” for some districts
  - Verify your data in the API. A district will show workshops only if at least one `auto_repairs` item links to a `locations` item with that district and department. In the mock database, workshops exist for Los Olivos, San Miguel, Lince, and Surquillo.
- 404s when calling `/api/v1/...`
  - Ensure you are using direct paths (`/locations`, `/auto_repairs`, etc.) with `VITE_PRIMEFIX_PLATFORM_API_URL = http://localhost:3000`. If you rely on a proxy, align your Vite proxy and endpoint paths accordingly.
- Changes to .env are not applied
  - Stop and restart `npm run dev` after editing environment files.

## Production build
```cmd
npm run build
```
The output will be generated in `dist/`.

## License
This project is for internal use. Review your organization’s policies before distribution.
