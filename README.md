# Blossomtask — To-Do List Application

A warm, feminine task manager with secure authentication and full task management capabilities. Built with a soft pastel pink aesthetic that makes productivity feel calm and joyful.

## Features

- **Secure Authentication** — Login, signup, and forgot password via Clerk (email/password + Google)
- **Task Management** — Create, edit, delete, and view tasks (User Stories 01–05)
- **Status Tracking** — Pending, In Progress, Completed
- **Priority Levels** — Low, Medium, High
- **Search & Filter** — Real-time search and filter by status/priority
- **Dashboard** — Stats overview, recent tasks, quick-add CTA
- **Profile Management** — Edit display name, view Clerk avatar
- **Toast Notifications** — Feedback for every CRUD action
- **Responsive Design** — Sidebar nav on desktop, bottom nav on mobile

## Architecture

```
/project-root
├── /artifacts/todo-app        → Client (React + Vite)
│   └── /src
│       ├── /pages             → dashboard.tsx, tasks.tsx, profile.tsx
│       ├── /components        → layout.tsx, task-dialog.tsx, /ui
│       ├── App.tsx            → Clerk provider, router
│       └── index.css          → Pastel pink theme
│
├── /artifacts/api-server      → Server (Express 5, MVC)
│   └── /src
│       ├── /routes            → tasks.ts, dashboard.ts, profile.ts (Controllers)
│       ├── /middlewares       → requireAuth.ts, clerkProxyMiddleware.ts
│       └── app.ts             → Express app setup
│
├── /lib/db                    → Models (Drizzle ORM + PostgreSQL)
│   └── /src/schema            → tasks.ts, profiles.ts
│
├── /lib/api-spec              → OpenAPI contract (single source of truth)
│   └── openapi.yaml
│
├── /lib/api-client-react      → Generated React Query hooks (from OpenAPI)
├── /lib/api-zod               → Generated Zod schemas (from OpenAPI)
│
└── /database
    └── schema.sql             → SQL reference schema
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Client | React + Vite, TypeScript, Tailwind CSS, Wouter, Framer Motion |
| Server | Express 5, Node.js 24, TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Clerk (email/password + Google OAuth, forgot password) |
| API | RESTful, OpenAPI 3.1, Orval codegen |
| Validation | Zod (server), react-hook-form (client) |

## RESTful API Endpoints

```
GET    /api/healthz           — Health check
GET    /api/tasks             — List tasks (filter by status, priority, search)
POST   /api/tasks             — Create task
GET    /api/tasks/:id         — Get task
PATCH  /api/tasks/:id         — Update task
DELETE /api/tasks/:id         — Delete task
GET    /api/dashboard/stats   — Dashboard statistics
GET    /api/profile           — Get user profile
PATCH  /api/profile           — Update display name
```

## Development

```bash
# Start all services (managed by Replit workflows)
pnpm --filter @workspace/api-server run dev   # API server
pnpm --filter @workspace/todo-app run dev     # Frontend

# Database
pnpm --filter @workspace/db run push          # Push schema changes

# Codegen (after OpenAPI spec changes)
pnpm --filter @workspace/api-spec run codegen

# Typecheck all packages
pnpm run typecheck
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Clerk server-side secret key |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (frontend) |
