# SLAHotels

A professional, modern, mobile-first website and member portal for the Sierra Leone Association of Hotels (SLAH), the national umbrella body representing hotels and hospitality stakeholders in Sierra Leone.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create a local environment file and configure:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Start the development server:
   `npm run dev`

## Production Build

`npm run build`

The frontend uses Supabase Auth, Database, Storage, Realtime, and Edge Functions. Keep service-role keys and other privileged secrets out of frontend environment variables and out of the repository.
