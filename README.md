# 🚛 TransitOps — Fleet Management System

A full-stack fleet management application built with React + TypeScript (frontend) and Node.js + Express + Prisma (backend).

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router v6
- React Hook Form + Zod
- TanStack Table v8
- Recharts

### Backend
- Node.js + Express + TypeScript
- Prisma ORM (SQLite/PostgreSQL)
- JWT Authentication + bcrypt
- Zod validation

## Project Structure

```
TransitOps/
├── backend/                   # Express API server
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── src/
│       ├── controllers/       # Request handlers
│       ├── middleware/         # Auth, validation, error handling
│       ├── routes/            # Route definitions
│       ├── services/          # Business logic
│       ├── validators/        # Zod schemas
│       ├── types/             # TypeScript types
│       ├── utils/             # Helpers & utilities
│       ├── config/            # App configuration
│       ├── app.ts             # Express app setup
│       └── index.ts           # Server entry point
├── frontend/                  # React SPA
│   └── src/
│       ├── components/        # Reusable UI components
│       │   ├── common/        # Shared components
│       │   └── layout/        # Layout components
│       ├── pages/             # Page components
│       ├── services/          # API client & services
│       ├── context/           # React contexts
│       ├── hooks/             # Custom hooks
│       ├── routes/            # Route config
│       ├── types/             # TypeScript types
│       └── utils/             # Helpers
└── README.md
```

## Git Workflow

- `main` — Production-ready code
- `develop` — Integration branch
- `feature/*` — Feature branches (auth-dashboard, fleet-management, trip-reports)

### Setup

1. Clone and install dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Set up environment variables (see `.env.example` in each directory)

3. Run database migrations:
```bash
cd backend
npx prisma migrate dev --name init
npx prisma seed
```

4. Start development:
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

## Feature Branches

| Branch | Owner | Scope |
|--------|-------|-------|
| `feature/auth-dashboard` | Member 1 | Auth, RBAC, Layout, Dashboard, Shared UI |
| `feature/fleet-management` | Member 2 | Vehicles, Drivers, Maintenance |
| `feature/trip-reports` | Member 3 | Trips, Fuel, Expenses, Reports |

## Demo Flow

1. Login → 2. Add Vehicle → 3. Add Driver → 4. Create Trip → 5. Dispatch → 6. Complete → 7. Maintenance → 8. Reports
