# CoVoyage

CoVoyage is a working prototype of an AI-assisted social travel platform. It combines destination discovery, traveler profiles, Tribe matching, Group Voyages, Local Vibe destination intelligence, travel journals, community/event flows, and a planning-only travel essentials catalog.

The project is suitable for two audiences:

- Masters/application evaluation: it demonstrates a full-stack product with AI integration, external service configuration, fallback behavior, seeded data, and clear prototype boundaries.
- Startup/demo presentation: it supports a polished demo story around discovering a destination, asking CoVoyage AI for local guidance, and generating an itinerary.

CoVoyage is not a production marketplace or booking platform. Some areas are live application flows, some are seeded/demo data, and some are simulated planning experiences.

## Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion
- Backend: FastAPI, Python, Pydantic
- Database: MongoDB Atlas or compatible MongoDB
- Auth: JWT
- AI and matching: Gemini for Local Vibe assistant responses; Pinecone and profile embeddings for AI-assisted Tribe matching
- Demo data: backend seed scripts for traveler profiles, Group Voyages, and destination data

## Key Demo Story

The strongest AI demo path is:

1. Open `Explore`.
2. Choose a destination page, for example Iceland, Japan, Spain, or Guatemala.
3. Open `CoVoyage AI` / `AI Local Vibe`.
4. Ask a destination-specific question or generate an itinerary.

The itinerary flow calls the backend route:

```text
POST /assistant/local-vibe/itinerary
```

When `GEMINI_API_KEY` is configured, the backend tries Gemini first and grounds the response in CoVoyage destination context. If Gemini is missing, unavailable, rate-limited, or returns an unsafe/malformed response, the backend returns a deterministic fallback itinerary instead of breaking the demo.

## What Is Live vs Demo

Live application functionality:

- Account registration, login, JWT sessions, profile creation, and profile image upload.
- Tribe discoverability controls and matching requests.
- Group Voyage creation, listing, join requests, lifecycle actions, and group chat access rules.
- Destination pages, recommendations, community tips, events, and Local Vibe assistant routes.
- Journal creation and browsing flows.
- Essentials bag save/remove/update flows.

Seeded/demo data:

- `backend/scripts/seed_test_profiles.py` creates realistic demo traveler profiles and demo Group Voyages.
- Destination seed scripts populate destination records used by Explore and Local Vibe.
- Some static frontend destination content exists as fallback/demo content.

Gemini-powered functionality:

- Local Vibe chat: `POST /assistant/local-vibe/chat`
- Local Vibe discovery chat: `POST /assistant/local-vibe/discovery-chat`
- Local Vibe itinerary generation: `POST /assistant/local-vibe/itinerary`

Gemini fallback behavior:

- If `GEMINI_API_KEY` is missing or Gemini fails, Local Vibe routes return deterministic fallback responses.
- Fallback responses are intentionally grounded in CoVoyage destination data and are designed to keep demos safe and functional.
- The AI architecture is not replaced by the fallback; it is a reliability layer.

Planning-only/simulated functionality:

- Essentials is a travel planning catalog and saved bag experience.
- Checkout and payment are not connected.
- Prices are planning estimates only.
- Essentials should not be presented as a live ecommerce store.

External services required for full functionality:

- MongoDB for accounts, profiles, chats, community data, Group Voyages, journals, and saved Essentials.
- Pinecone for vector-backed profile matching and embedding lookup.
- Gemini API for AI-generated Local Vibe responses.

## Project Structure

```text
app/                  Next.js App Router pages
components/           Shared UI and feature components
lib/                  Frontend API helpers and shared client utilities
public/               Static assets
data/                 Static Essentials catalog
backend/
  main.py             FastAPI app entry point
  models.py           Pydantic models
  routers/            API route modules
  services/           Business logic, AI, matching, destination services
  scripts/            Seed and smoke-test scripts
  data/               Destination seed datasets
  tests/              Backend tests
```

## Prerequisites

- Node.js compatible with Next.js 16.
- Python 3.11+ recommended.
- MongoDB Atlas or another reachable MongoDB instance.
- Optional but recommended for full AI/matching demos: Gemini API key and Pinecone index.

## Frontend Setup

Install frontend dependencies from the project root:

```powershell
npm install
```

Create a frontend env file only if your backend is not on the default URL:

```text
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Start the frontend:

```powershell
npm run dev
```

The frontend runs on `http://localhost:3000` by default. If another Next dev server is already running, keep using the existing server or start on another port:

```powershell
npm run dev -- --port 3005
```

## Backend Setup

Create and activate the backend virtual environment:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
pip install -r requirements.txt
```

Create `backend/.env`:

```text
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>/?appName=<app-name>
DATABASE_NAME=covoyage
JWT_SECRET=<long-random-secret>

PINECONE_API_KEY=<pinecone-api-key>
PINECONE_INDEX_NAME=<pinecone-index-name>

GEMINI_API_KEY=<gemini-api-key>
GEMINI_MODEL=gemini-3.6-flash
GEMINI_FALLBACK_MODELS=gemini-3.5-flash-lite
GEMINI_TIMEOUT_SECONDS=60
```

Optional MongoDB TLS override:

```text
MONGODB_TLS_CA_FILE=C:\path\to\trusted-ca-bundle.pem
```

Use `MONGODB_TLS_CA_FILE` only when your local network or system trust store requires a custom CA bundle. Do not disable TLS verification for normal development.

Start the backend:

```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```powershell
Invoke-WebRequest http://127.0.0.1:8000/ -UseBasicParsing
```

Expected response:

```json
{"message":"CoVoyage Backend Running"}
```

## Seeding Demo Data

The demo seed script creates realistic traveler profiles and open Group Voyages:

```powershell
cd backend
.\venv\Scripts\python.exe scripts\seed_test_profiles.py
```

Current seed coverage:

- 15 realistic demo traveler profiles.
- 4 realistic open Group Voyages.
- Shared destinations, dates, interests, travel styles, budgets, and languages designed to make Tribe and Group Voyages look populated during demos.

Destination data can be seeded per country:

```powershell
cd backend
.\venv\Scripts\python.exe scripts\seed_destination_data.py iceland
.\venv\Scripts\python.exe scripts\seed_destination_data.py spain
.\venv\Scripts\python.exe scripts\seed_destination_data.py guatemala
```

There is also a convenience script for Iceland:

```powershell
.\venv\Scripts\python.exe scripts\seed_iceland_destination.py
```

Seeding requires a working MongoDB connection.

## Tests and Verification

Frontend production build:

```powershell
npm run build
```

Frontend lint:

```powershell
npm run lint
```

Backend Gemini/Local Vibe tests:

```powershell
cd backend
.\venv\Scripts\python.exe -m unittest tests.test_gemini_local_vibe
```

Backend import smoke:

```powershell
cd backend
.\venv\Scripts\python.exe -B -c "import main; print(main.home())"
```

Local Vibe fallback smoke without Gemini:

```powershell
cd backend
$env:GEMINI_API_KEY=""
.\venv\Scripts\python.exe -B -c "from fastapi.testclient import TestClient; import main; c=TestClient(main.app); r=c.post('/assistant/local-vibe/itinerary', json={'country_slug':'iceland','country':'Iceland','days':2,'budget':'Mid-range','interests':'culture','pace':'Balanced'}); print(r.status_code); print(r.json()['response_source']); print(len(r.json()['itinerary']))"
```

Expected fallback smoke result:

```text
200
fallback
2
```

## Configuration Notes

Required for backend startup health only:

- No external config is needed to import the backend and serve `/`.

Required for database-backed features:

- `MONGODB_URI`
- `DATABASE_NAME`

Required for auth flows:

- `JWT_SECRET`

Required for AI-assisted Tribe matching:

- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- Reachable Pinecone index with compatible profile vectors.

Required for Gemini-generated Local Vibe responses:

- `GEMINI_API_KEY`

Optional Gemini config:

- `GEMINI_MODEL`, default `gemini-3.6-flash`
- `GEMINI_FALLBACK_MODELS`, default `gemini-3.5-flash-lite`
- `GEMINI_GENERATE_CONTENT_ENDPOINT`
- `GEMINI_TIMEOUT_SECONDS`, default `60`

If Gemini is not configured, Local Vibe remains demo-ready through deterministic fallback responses.

## Prototype Boundaries

- Essentials is planning-only and does not process checkout, orders, fulfillment, or payments.
- Email delivery is prepared in backend account-token flows, but actual email sending is not configured in this prototype.
- Matching quality depends on complete profiles and vector service availability.
- External service issues should be handled as setup/configuration problems, not as product redesign work.

## Recommended Demo Script

1. Start MongoDB-backed backend and frontend.
2. Seed demo profiles, Group Voyages, and destination data.
3. Open the home page and show the product areas.
4. Navigate to `Explore`.
5. Open a destination such as Iceland.
6. Open `CoVoyage AI` / `AI Local Vibe`.
7. Generate a 2-5 day itinerary.
8. Mention that Gemini powers the best response when configured, while deterministic fallback keeps the same route reliable during evaluation.
9. Show Tribe and Group Voyages as live social flows populated by seeded demo data.
10. Show Essentials as a planning-only saved bag, not ecommerce checkout.
