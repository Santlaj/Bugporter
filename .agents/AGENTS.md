# Bug Reporter — Project Rules

## Project Overview
Bug Reporter is a lightweight browser SDK + dashboard that turns a user's one-line bug report into a developer-ready report with screenshot, environment data, console errors, network failures, breadcrumbs, and optional GitHub/Telegram notifications.

**Tagline:** "A lightweight bug reporter for small teams that turns 'it's broken' into a ready-to-fix GitHub issue."

## Two Users
1. **Developer**: Creates account → creates project → gets public key → adds SDK snippet → receives & investigates reports
2. **End User / Tester**: Opens website → clicks "Report a Bug" → writes description → Submit. No account needed.

## Technology Stack
| Layer | Technology |
|---|---|
| Dashboard | Next.js, JavaScript, Tailwind CSS, shadcn/ui |
| SDK | Vanilla JavaScript, Shadow DOM, Canvas, DOM APIs |
| Backend | Next.js API routes (no separate backend service) |
| Database | PostgreSQL + Prisma |
| Validation | Zod |
| Image Storage | Cloudinary (signed uploads) |
| Rate Limiting | Upstash Redis |
| Queue | Upstash QStash |
| GitHub | GitHub App |
| Notifications | Telegram Bot API, Email |

## Architecture Principles (MUST follow)
1. **SDK must be lightweight** — Don't block page load, don't consume excess CPU, don't crash host app, no React inside SDK
2. **Capture continuously, transmit selectively** — Observe events in memory, send last ~40 on submit
3. **Privacy before transmission** — Mask/redact in the browser BEFORE sending to server
4. **Ingestion must be fast** — Validate → rate limit → create report → respond. Everything else is async via queue.

## MVC Architecture (MUST follow)
Both the Next.js app and the SDK use strict Model-View-Controller separation.

### Next.js App (`apps/web/src/`)
- **`models/`** — Pure data access (Prisma queries). One file per entity (user.model.js, report.model.js, etc.). MUST NOT contain business logic, HTTP concerns, or UI imports.
- **`views/`** — React components (`components/`, `layouts/`). MUST NOT import models directly or contain business logic.
- **`controllers/`** — Business logic, orchestration, error handling. Called by API routes and pages. MUST NOT render UI or construct raw Prisma queries.
- **`services/`** — External integrations (Cloudinary, Upstash, GitHub, Telegram). Used by controllers.
- **`lib/`** — Shared utilities (Prisma client, Zod schemas, constants, sanitization).
- **`app/`** — Next.js App Router. API routes are thin: extract HTTP concerns → delegate to controller. Pages call controllers → pass data to view components.

### SDK (`packages/sdk/src/`)
- **`models/`** — Data stores (ring buffers, bounded arrays, environment snapshot, report assembler). MUST NOT know about DOM or HTTP.
- **`views/`** — Shadow DOM UI (button, modal, form, element picker, success/error screens, styles). MUST NOT import models directly.
- **`controllers/`** — Orchestration: app init, widget state machine, capture coordination, submit flow, privacy pipeline. Bridges models ↔ views.
- **`capture/`** — Browser instrumentation modules. Write to model stores. Initialized by capture controller.
- **`privacy/`** — Masking/redaction modules. Used by privacy controller before transmission.
- **`transport/`** — API calls and Cloudinary upload. Used by submit controller.

### Layer Rules
- Models MUST NOT import from controllers or views
- Views MUST NOT import from models or make API/DB calls directly
- Controllers MUST NOT render DOM or construct raw database queries
- API routes are thin wrappers that delegate to controllers

## SDK Rules
- SDK must NEVER change behavior of the host application
- SDK must use Shadow DOM for UI isolation
- SDK target: <20 KB gzipped
- Screenshot library should be lazy-loaded (not in initial bundle)
- All capture modules must fail gracefully — screenshot fails → report still submits
- Ring buffer of 40 breadcrumbs max
- Console events capped at 100, network events capped at 100
- NO cookies, auth headers, request/response bodies, passwords, or tokens captured

## Screenshot Strategy
- V1: DOM → Canvas → WebP via html2canvas (lazy loaded)
- V1.5: getDisplayMedia() as optional "exact capture"
- V2: Chrome extension for native tab capture
- Max 5 MB, max ~3000px per side, default viewport (not full page)
- Optimize: canvas.toBlob("image/webp", 0.82)
- Upload flow: SDK → get signature from backend → direct upload to Cloudinary

## Privacy Model
- `data-bug-mask` attribute for developer-specified masking
- Auto-mask `input[type=password]`
- URL redaction for tokens, secrets, api_keys, etc.
- Screenshot masking: clone DOM → replace masked content → render clone → screenshot
- NEVER modify the real application DOM

## Security Layers
1. Public project key (identifier, NOT auth credential)
2. Origin allowlist
3. Payload validation (Zod)
4. Rate limiting (Upstash): 20 reports/10min per IP, 100 reports/hr per project
5. Payload size limits
6. Honeypot field
7. Cloudinary signed uploads
8. Dashboard authentication

## Database Design
Core models: User, Organization, Project, ProjectOrigin, ProjectApiKey, Report, ReportScreenshot, ReportEvent, Integration, GitHubInstallation, Notification

Key indexes: `(projectId, createdAt DESC)`, `(projectId, status)`, `(projectId, fingerprint)`, `(projectId, severity)`

Events stored as JSONB in ReportEvent table for flexibility.

## Report States
- Status: OPEN, IN_PROGRESS, RESOLVED, IGNORED, DUPLICATE
- Severity: P0 (blocker), P1 (critical), P2 (normal), P3 (minor)

## Duplicate Grouping
Fingerprint = SHA-256 of: normalized message + top stack frame + route

## Project Phases
0. Foundation (monorepo, Next.js, Prisma, PostgreSQL, Cloudinary)
1. SDK (widget, modal, console, errors, fetch, XHR, breadcrumbs, environment)
2. Screenshot (DOM capture, WebP, size limits, privacy masking, Cloudinary upload)
3. Dashboard (auth, projects, reports, report detail, status, filters)
4. Security (origin allowlist, rate limiting, payload limits, honeypot, URL redaction, input masking)
5. Integrations (GitHub App, Telegram, Email, Queue)
6. Polish (docs, landing page, install wizard, demo project, analytics, error handling)

## First Milestone
A standalone JavaScript SDK injectable into any webpage that captures a bug report without breaking the page. Dashboard comes AFTER the SDK works reliably.

## What We Do NOT Build (V1)
❌ Kafka, Kubernetes, microservices, Elasticsearch, custom auth, mobile SDK, full session replay, video recording, AI bug fixing, Jira/Linear/Slack

## Terminal Commands
No terminal commands should be used per user preference.
