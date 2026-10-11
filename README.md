# Medical Inventory

A responsive Progressive Web App for single-store medical inventory management. Phase 0 establishes the frontend, backend, quality tooling, and PWA foundation; inventory business features follow in later phases.

## Technology stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, React Hook Form, Zod, and vite-plugin-pwa.
- Backend: Node.js, TypeScript, Express, Zod, Prisma, and PostgreSQL.

## Repository structure

```text
frontend/  React PWA client
backend/   Express API and Prisma project
```

## Prerequisites

- Node.js 22 or newer
- npm 11 or newer
- PostgreSQL, required when database features are introduced

## Installation

```bash
npm install
```

Copy the environment examples before connecting a database:

```bash
copy frontend\\.env.example frontend\\.env
copy backend\\.env.example backend\\.env
```

## Development commands

```bash
npm run dev
npm run build
npm run test
npm run lint
npm run format
npm run typecheck
```

`npm run dev` starts both applications. The frontend is served by Vite (normally `http://localhost:5173`) and the API is served at `http://localhost:5000`.

## Environment variables

Frontend:

```text
VITE_API_URL=http://localhost:5000/api
```

Backend:

```text
DATABASE_URL=
PORT=5000
NODE_ENV=development
```

The initial health endpoint is available at `GET /api/health`.
