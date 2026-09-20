# CoVoyage

CoVoyage is a full-stack prototype of an AI-assisted social travel platform. It combines destination discovery, traveler profiles, AI-assisted Tribe matching, Group Voyages, Local Vibe destination guidance, travel journals, community/event flows, and a planning-only travel essentials bag.

The project is designed for evaluation as a Master's-level software project and as a startup-style product demo. It should be presented as a working prototype with real application flows, seeded demonstration data, and clearly documented external-service requirements.

CoVoyage is not a live booking marketplace, payment system, or production travel agency.

## Live Demo
https://co-voyage.vercel.app/

## Core Idea

CoVoyage helps solo and small-group travelers answer three questions:

- Where should I go?
- Who could I travel with?
- What should I know before I arrive?

AI is used in two focused places:

- Tribe matching: profile embeddings and compatibility scoring help rank compatible travelers.
- Local Vibe: Gemini-generated destination responses are grounded in CoVoyage destination context, with deterministic fallback responses when Gemini is unavailable.

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide icons
- Backend: FastAPI, Python, Pydantic
- Database: MongoDB Atlas or compatible MongoDB
- Authentication: JWT-based sessions
- AI matching: `sentence-transformers`, `intfloat/multilingual-e5-large`, 1024-dimensional profile embeddings, Pinecone-backed vector storage/retrieval, compatibility scoring
- Local Vibe AI: Gemini API with grounded prompts, response validation, fallback responses, and itinerary schema handling
- Demo data: backend seed scripts for traveler profiles, destination data, and Group Voyages

## System Architecture

```text
Next.js frontend
  |
  | NEXT_PUBLIC_API_BASE_URL
  v
FastAPI backend
  |
  +-- MongoDB: users, profiles, chats, connections, journals, community content,
  |           Group Voyages, events, Essentials bag data
  |
  +-- Pinecone: profile embedding vectors for AI-assisted matching
  |
  +-- sentence-transformers: local 1024-dimensional profile embedding generation
  |
  +-- Gemini API: Local Vibe chat, discovery chat, and itinerary generation
```

The frontend and backend are deployed separately. The Next.js frontend can be hosted on Vercel, but the FastAPI backend must be deployed as its own service.

## Implemented Features

- Account registration, login, JWT authentication, profile setup, and profile media upload
- Traveler discoverability controls and AI-assisted Tribe matching
- Tribe connection requests and direct chat access rules
- Group Voyage creation, listing, join requests, lifecycle actions, and group chat access rules
- Destination exploration pages and recommendation flows
- Local Vibe chat, discovery chat, and itinerary generation
- Community tips, replies, destination events, and source-aware event listing
- Travel journal creation and browsing
- Essentials catalog browsing and saved bag management
- Backend seed scripts for repeatable demo data

## Event Trust Model

Public event listing preserves discovery of trusted event data. User-created destination events require authentication and are stored with `verification_status="needs-review"` so anonymous users cannot create events that appear verified or source-recorded.

Verified/source-recorded events can still appear in destination discovery where the backend filters for trusted event statuses.

## AI Matching Engine

Tribe matching is not a simple keyword search. It combines eligibility filters, semantic profile similarity, structured compatibility scoring, and match explanation data.

### Embeddings

Profile text is embedded with `intfloat/multilingual-e5-large` through `sentence-transformers`. The embedding service expects 1024-dimensional vectors and applies the E5 `passage:` prefix before encoding profile text.

The Pinecone index used for CoVoyage profile vectors must also be configured for 1024 dimensions and cosine similarity. A mismatched Pinecone index will prevent AI-assisted matching from working correctly.

### Vector Storage And Similarity

Profile embedding synchronization stores vectors in Pinecone by user ID. The similarity service can query Pinecone for similar vectors and, in the current filtered match path, fetches eligible candidate vectors from Pinecone and computes cosine similarity before compatibility scoring.

### Eligibility Filters

Before compatibility scoring, the matching flow filters for profiles that are discoverable, complete enough to match, gender-preference compatible, destination-compatible, and date-compatible.

### Compatibility Scoring

The backend combines semantic similarity with structured profile overlap. The current scoring weights are:

- Semantic similarity: 35%
- Preferred destination overlap: 15%
- Travel date overlap: 15%
- Interest overlap: 15%
- Travel style: 7.5%
- Budget range: 5%
- Preferred trip duration: 5%
- Languages spoken: 2.5%

Matches below the configured minimum compatibility score are filtered out. Returned match data includes compatibility factors and explanation-oriented evidence so the UI can show why a traveler was recommended.

## Gemini Local Vibe

Local Vibe uses Gemini for destination-specific guidance through these backend routes:

```text
POST /assistant/local-vibe/chat
POST /assistant/local-vibe/discovery-chat
POST /assistant/local-vibe/itinerary
```

Prompts are grounded in CoVoyage destination context rather than open-ended generic chat. The itinerary flow validates the response shape and falls back to deterministic itinerary generation when Gemini is missing, rate-limited, unavailable, or returns malformed output.

Gemini does not power Tribe matching. Matching uses the embedding and compatibility pipeline described above.

## Data And Demo Transparency

CoVoyage includes a mix of live flows, seeded data, and static fallback content:

- Live MongoDB-backed flows: auth, profiles, chats, connections, Group Voyages, journals, community content, events, and saved Essentials bag data
- Seeded demo data: traveler profiles, generated/open Group Voyages, and destination records
- Static/fallback data: destination and Essentials content used to keep the prototype demonstrable
- AI-generated content: Gemini Local Vibe responses when configured
- Deterministic fallback content: Local Vibe responses when Gemini is unavailable

The Essentials feature is a planning catalog and saved bag experience. Checkout, payment processing, order fulfillment, and inventory management are not implemented.

## Project Structure

```text
app/                  Next.js App Router pages
components/           Shared UI and feature components
lib/                  Frontend API clients and shared frontend utilities
public/               Static frontend assets
data/                 Static Essentials catalog data
backend/
  main.py             FastAPI app entry point
  models.py           Pydantic models
  routers/            API route modules
  services/           Business logic, AI, matching, media, destination services
  scripts/            Seed, embedding sync, and smoke-test scripts
  data/               Destination seed datasets
  tests/              Backend tests
docs/                 Deployment and operational notes
```

## Local Setup

### Prerequisites

- Node.js compatible with Next.js 16
- Python 3.11 or newer recommended
- MongoDB Atlas or another reachable MongoDB instance
- Pinecone API key and a 1024-dimensional cosine index for AI-assisted matching
- Gemini API key for generated Local Vibe responses

### Frontend

Install dependencies from the project root:

```powershell
npm install
```

Create `.env.local` only if your backend is not running on the default local URL:

```text
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

If `NEXT_PUBLIC_API_BASE_URL` is not set, the frontend falls back to `http://127.0.0.1:8000` for local development.

Start the frontend:

```powershell
npm run dev
```

The default frontend URL is `http://localhost:3000`.

### Backend

Create and activate a virtual environment:

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

Optional backend environment variables:

```text
MONGODB_TLS_CA_FILE=C:\path\to\trusted-ca-bundle.pem
COVOYAGE_CORS_ORIGINS=https://your-frontend.example
COVOYAGE_CORS_ORIGIN_REGEX=https://.*\.your-preview-domain\.example
COVOYAGE_MEDIA_ROOT=C:\path\to\persistent\media
COVOYAGE_SENTENCE_TRANSFORMER_MODEL=intfloat/multilingual-e5-large
COVOYAGE_MIN_TRIBE_COMPATIBILITY_SCORE=40
COMMUNITY_MODERATION_TOKEN=<moderation-token>
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

## Seeding Demo Data And Embeddings

The main demo seed script creates repeatable traveler profiles and demo Group Voyages:

```powershell
cd backend
.\venv\Scripts\python.exe scripts\seed_test_profiles.py
```

The script includes 15 demo traveler profiles plus a generated set of open Group Voyages derived from seeded destinations. It is intended to make Tribe, Group Voyages, and social travel flows populated during demos.

Destination data can be seeded per country:

```powershell
cd backend
.\venv\Scripts\python.exe scripts\seed_destination_data.py iceland
.\venv\Scripts\python.exe scripts\seed_destination_data.py spain
.\venv\Scripts\python.exe scripts\seed_destination_data.py guatemala
```

There is also a convenience script for Iceland:

```powershell
cd backend
.\venv\Scripts\python.exe scripts\seed_iceland_destination.py
```

After seeding or materially changing demo profiles, synchronize profile embeddings:

```powershell
cd backend
.\venv\Scripts\python.exe scripts\sync_profile_embeddings.py
```

Do not use fake vectors for demos. AI-assisted matching depends on real 1024-dimensional profile embeddings stored in the configured Pinecone index.

## Verification

Frontend production build:

```powershell
npm run build
```

Frontend lint:

```powershell
npm run lint
```

Backend import smoke:

```powershell
cd backend
.\venv\Scripts\python.exe -B -c "import main; print(main.home())"
```

Backend Gemini/Local Vibe tests:

```powershell
cd backend
.\venv\Scripts\python.exe -m unittest tests.test_gemini_local_vibe
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

## Deployment Notes

Deploy the frontend and backend as separate services:

- Frontend: deploy the Next.js app to Vercel or an equivalent frontend host.
- Backend: deploy the FastAPI app to a Python-capable host.
- Frontend environment: set `NEXT_PUBLIC_API_BASE_URL` to the deployed backend origin.
- Backend CORS: set `COVOYAGE_CORS_ORIGINS` to the deployed frontend origin or origins. Use `COVOYAGE_CORS_ORIGIN_REGEX` only when preview deployments need pattern-based allowance.
- Backend services: configure MongoDB, Pinecone, Gemini, and JWT environment variables on the backend host.

Do not hardcode a production API URL in the frontend. The backend URL is controlled by `NEXT_PUBLIC_API_BASE_URL`.

Do not hardcode a future Vercel domain in the backend. CORS is configured through backend environment variables after the frontend deployment URL is known.

### Media Storage Limitation

Profile media uploads are written to the backend filesystem by default. For production, the backend host must provide persistent writable storage or `COVOYAGE_MEDIA_ROOT` must point to a persistent mounted directory. The repository does not currently add S3, Cloudinary, or another object-storage provider.

## Prototype Boundaries

- CoVoyage is a prototype, not a production travel marketplace.
- Essentials is planning-only and does not process checkout, orders, fulfillment, or payments.
- Email-token flows exist, but real email delivery is not configured by default.
- Rate limiting is in-memory and suitable for local/demo use, not multi-instance production enforcement.
- AI-assisted matching depends on complete profiles, a reachable Pinecone index, and synchronized embeddings.
- Local Vibe generated responses depend on Gemini configuration; deterministic fallback keeps routes usable for evaluation.
- Media persistence depends on backend hosting storage configuration.
- Some destination and product data is seeded or static demonstration content.

## Recommended Demo Path

1. Start the MongoDB-backed backend and the frontend.
2. Seed demo profiles, Group Voyages, and destination data.
3. Synchronize profile embeddings into the 1024-dimensional Pinecone index.
4. Open the home page and show the core product areas.
5. Navigate to Explore and open a destination such as Iceland, Spain, or Guatemala.
6. Open Local Vibe and generate a short itinerary.
7. Show Tribe matching as an AI-assisted social flow.
8. Show Group Voyages, journals, community content, and Essentials as supporting product areas.

