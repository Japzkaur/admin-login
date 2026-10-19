# Admin Management Portal (Port 8080)

Dedicated, private administrative web application for reviewing client inquiries, updating milestones, and communicating with clients.

- **Port**: 8080 (configured via `PORT` or `vite.config.ts`)
- **Backend API**: `http://localhost:5000/api`

## Features
- Administrator authentication gate (Login & Logout with session tokens).
- Inquiries dashboard with real-time KPI counter cards.
- Search and multi-criteria filters (ticket ID, client, company, service category, status).
- Live milestone updater (updates status visible in the client tracker).
- Direct message dispatch to clients.
- Single-click CSV export and inquiry deletion.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start development server on port 8080:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
npm run preview
```

## Connecting to Backend API
By default, the admin portal connects to `http://localhost:5000/api`. To change this, create a `.env` file:
```env
VITE_API_URL=http://your-backend-host:5000/api
```
