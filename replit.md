# Blossomtask — To-Do List Application

A warm, feminine task manager with secure authentication and full task management. Soft pastel pink UI, real-time task CRUD, dashboard stats, and role-safe Clerk auth.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/todo-app run dev` — run the frontend (port 25230)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Wouter, Framer Motion, shadcn/ui
- API: Express 5
- Auth: Clerk (email/password + Google OAuth, forgot password, email verification)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`, react-hook-form
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Frontend pages: `artifacts/todo-app/src/pages/`
- Frontend components: `artifacts/todo-app/src/components/`
- Theme / CSS vars: `artifacts/todo-app/src/index.css`
- API routes (controllers): `artifacts/api-server/src/routes/`
- Auth middleware: `artifacts/api-server/src/middlewares/requireAuth.ts`
- DB schema (models): `lib/db/src/schema/`
- OpenAPI contract: `lib/api-spec/openapi.yaml`
- Generated hooks: `lib/api-client-react/src/generated/`
- Generated Zod schemas: `lib/api-zod/src/generated/`
- SQL reference: `database/schema.sql`

## Architecture decisions

- Contract-first: OpenAPI spec gates all codegen; never hand-write types that Orval produces
- Clerk proxy: All Clerk frontend calls are proxied through `/api/__clerk` to avoid CORS issues
- Auth token injection: `setAuthTokenGetter` wired in `AuthTokenSetter` component (App.tsx) — the `customFetch` in `api-client-react` picks it up automatically
- Per-user data isolation: all DB queries filter by `userId` from `getAuth(req)` — no cross-user data leakage
- MVC pattern: routes/ = controllers, lib/db/schema/ = models, React pages = views

## Product

Blossomtask is a personal to-do manager with Clerk authentication. Users can create, edit, delete, and filter tasks by status (Pending / In Progress / Completed) and priority (Low / Medium / High). The dashboard shows a stats overview and recent tasks. The profile page lets users update their display name.

## User preferences

- Pastel pink UI theme (blush, rose, peach, lavender, cream)
- Soft neumorphic shadows, rounded cards, smooth animations
- No emojis in the UI — lucide-react icons only
- Feminine, warm, and calming aesthetic

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Re-run `pnpm --filter @workspace/db run push` after adding schema columns
- `clerkClient()` is NOT callable in newer @clerk/express — use `createClerkClient({ secretKey })` instead
- `@clerk/shared/keys` is a server-only package — do not import in Vite frontend bundles

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- README.md has the full API endpoint reference and architecture map
