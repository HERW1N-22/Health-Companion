<<<<<<< HEAD

# AI Health Companion

A full-stack wellness application with authentication, health tracking, AI chat, anomaly detection, and reporting.

## Tech Stack
- React + Vite frontend
- Express backend
- PostgreSQL for structured data
- MongoDB-ready chat log integration
- Anthropic Claude-compatible assistant response flow

## Setup
1. Install dependencies: npm run install:all
2. Create PostgreSQL and MongoDB instances.
3. Copy backend/.env.example to backend/.env and fill in values.
4. Apply the SQL schema: psql -f backend/schema.sql $POSTGRES_URL
5. Start the app: npm run dev

## Backend tests
- npm run test:backend
>>>>>>> acd0608 (Initial commit)
