<div align="center">

# 🌍 CoVoyage

### AI-Powered Social Travel Ecosystem

*Travel is better when you find the right people—not just the right destination.*

<p align="center">
An intelligent social travel platform that connects compatible travelers through AI-powered matching, destination discovery, local intelligence, and a community-driven travel experience.
</p>

![Status](https://img.shields.io/badge/Status-Prototype-orange)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.116-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![Pinecone](https://img.shields.io/badge/Vector%20Search-Pinecone-purple)

</div>

---

# 🌍 About CoVoyage

CoVoyage is an **AI-powered social travel ecosystem** built around a simple idea:

> **Travel is better when you find the right people—not just the right destination.**

The prototype brings together traveler matching, destination discovery, local travel intelligence, travel journals, community experiences, and travel essentials into one connected platform.

Instead of treating travel planning as a collection of separate tools, CoVoyage explores what it could look like to have a single ecosystem where travelers can:

- Find compatible co-travelers
- Explore destinations and local culture
- Discover community tips and experiences
- Read and share travel journals
- Discover local events and activities
- Find useful last-minute travel essentials

The current version is a **working prototype**, not a finished production application. Some planned AI capabilities and integrations are still part of the future roadmap.

---

# ✨ Features

### 👤 Personalized Travel Profiles

Create a personal travel profile containing:

- Profile Photo
- Bio
- Preferred Destinations
- Interests
- Travel Style
- Budget Range
- Preferred Trip Duration
- Languages
- Travel Dates
- Travel Preferences

Users can also control whether their profile is discoverable through the traveler matching system.

---

### 🤝 AI Traveler Matching

CoVoyage matches travelers based on semantic and structured compatibility.

The matching system considers:

- Shared destinations
- Travel date overlap
- Travel preferences
- Interests
- Travel style
- Budget
- Languages
- Preferred travel gender
- Semantic profile similarity

Traveler profiles are converted into embeddings using **multilingual-e5-large** and compared using vector similarity through **Pinecone**.

The system also applies hard eligibility filters before calculating compatibility, so travelers must meet important requirements such as destination and date overlap.

---

### 🌎 Explore & Local Vibe

Explore destinations through a visual travel discovery experience.

Destination intelligence includes:

- Culture
- Local tips
- Do's & Don'ts
- Safety information
- Travel essentials
- Language
- Currency
- Time zone
- Destination recommendations
- Community-generated information

The goal is to help travelers understand a destination rather than simply visit it.

---

### 📰 Travel Journals

CoVoyage includes a journal and discovery experience for travel stories.

Users can explore:

- Video journals
- Photo journals
- Text journals
- Travel experiences
- Destination stories

The journal section is designed to make the platform feel like an active travel community rather than a static planning tool.

---

### 📅 Events & Community Experiences

The prototype includes infrastructure for discovering and sharing travel-related activities and events.

Examples include:

- Trekking groups
- Festivals
- Photography walks
- Food experiences
- Local activities
- Community meetups

---

### 🛍️ CoVoyage Essentials

A travel-essentials section for useful and unusual items travelers may need before or during a trip.

Examples include:

- Travel adapters
- Power banks
- Travel bottles
- Neck pillows
- Anti-theft travel gear
- Multi-purpose travel clothing

The current version is primarily a prototype experience and can be expanded into a full travel marketplace in the future.

---

# 💡 Why CoVoyage?

Modern travel planning is fragmented.

Travelers often switch between:

- Booking websites
- Reddit
- Facebook Groups
- Discord Communities
- WhatsApp
- Instagram

trying to find trustworthy travel companions.

CoVoyage brings these experiences together into a single intelligent platform that understands not only **where you want to travel**, but **who you would enjoy travelling with.**

---

# 🏗 System Architecture

```
                    Next.js Frontend
                           │
                           ▼
                    FastAPI Backend
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        MongoDB Atlas              Pinecone
     Application & Profile      Vector Embeddings
             Data                    │
                                    ▼
                         Semantic Traveler Matching
                                    │
                                    ▼
                       Compatibility Scoring
```

---

# 🛠 Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Animation | Framer Motion |
| Backend | FastAPI, Python |
| Database | MongoDB Atlas |
| Authentication | JWT |
| Embeddings | multilingual-e5-large |
| Embedding Framework | Sentence Transformers |
| Vector Search | Pinecone |
| Version Control | Git & GitHub |

---

# 📂 Project Structure

```text
CoVoyage/
│
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                 # Frontend utilities and API helpers
├── public/              # Images, videos and static assets
│
├── backend/
│   ├── main.py          # FastAPI entry point
│   ├── models.py
│   ├── routers/
│   ├── services/
│   ├── scripts/
│   └── data/
│
├── package.json
├── next.config.ts
└── README.md
```
---

#  Getting Started

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend

python -m venv venv

pip install -r requirements.txt

uvicorn main:app --reload
```

---


# 🔮 Future Scope

CoVoyage is currently a working prototype. Planned future development includes:

- Gemini-powered personalized itinerary generation
- Adaptive itinerary refinement
- AI-generated compatibility explanations
- Conversational AI travel assistant
- Destination RAG for grounded travel information
- MCP-based agent workflows
- Google Cloud Agent Builder integration
- Expanded community and event features
- Full travel essentials marketplace
---
#  Vision

CoVoyage aims to become the world's intelligent social travel ecosystem.

By combining artificial intelligence, semantic search, and community-driven experiences, the platform seeks to help travelers discover meaningful connections—not just destinations.

Our long-term vision is to build an ecosystem where AI enhances every stage of the travel journey, from finding compatible companions to planning personalized adventures and sharing experiences with a global community.

---

<div align="center">

## 🚧 CoVoyage is currently under active development.


Made by **Nivedana Kataki**

</div>