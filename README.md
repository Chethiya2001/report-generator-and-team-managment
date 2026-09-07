# TeamPulse – Weekly Report Generator & Team Dashboard

A full-stack React + ASP.NET Core application for fixed-format weekly reporting, manager review, correction cycles, version history, projects, users, and team analytics.

## Stack

- Frontend: React 19, TypeScript, Vite, Zustand, React Hook Form/Zod, Recharts
- Backend: ASP.NET Core 10 REST API, EF Core, JWT bearer authentication, PBKDF2 password hashing
- Database: MySQL / MariaDB (XAMPP-compatible)

## Prerequisites

- Node.js 22+
- .NET SDK 10
- XAMPP with MySQL/MariaDB running (or Docker Desktop)

## 1. Run the database

From the repository root:

```bash
docker compose up -d
```

Docker Compose uses its own credentials. To use another MySQL instance, override `ConnectionStrings__DefaultConnection` or update `ConnectionStrings:DefaultConnection` in `backend/TaskDb.Api/appsettings.json`.

## 2. Run the backend

```bash
cd backend
dotnet restore
dotnet run --project TaskDb.Api
```

The development API URL is `http://localhost:5160`; health check: `GET /health`.

For production, replace `Jwt:Key`, restrict `FrontendUrl`, use HTTPS, and provide secrets through environment variables or a secret manager.

## 3. Run the frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Demo accounts

All seeded accounts use password `Password123!`.

- Manager: `manager@demo.com`
- Members: `alex@demo.com`, `sarah@demo.com`, `maya@demo.com`, `daniel@demo.com`

Registration creates a team-member account. Managers create/deactivate users and assign roles from User Management.

## Main workflow

1. A team member creates and saves a fixed-format draft.
2. Submitting locks its content and makes it visible to managers.
3. A manager approves it or requests correction with a required comment.
4. A correction makes the report editable; saving creates a new version while preserving the reviewed version.
5. The member resubmits and the manager can review again. Every review action references the exact report version.

Backend authorization enforces ownership; hiding UI routes is not treated as security. Member list/detail/update endpoints are scoped to the authenticated user, while project/user management and review actions require the manager role.

## Pages

The application includes Login/Register foundation, Member Dashboard, Weekly Report Form, Report History, Report Detail with version history, Manager Dashboard, Manager Review, Team Member Profile, Project Management, User Management, and Settings.

## Gemini AI assistant (optional)

Create a Gemini API key in Google AI Studio, then set it in the terminal that starts the backend:

```powershell
$env:GEMINI_API_KEY="your-key-here"
cd backend
dotnet run --project TaskDb.Api
```

Do not put the key in frontend `.env` files or commit it to source control. The assistant is manager-only and sends anonymous aggregates rather than names or report text. See [`docs/AI_ASSISTANT.md`](docs/AI_ASSISTANT.md) for architecture, prompt design, and privacy notes.

## Useful commands

```bash
# frontend production validation
cd frontend && npm run build

# backend validation
cd backend && dotnet build TaskDb.slnx

# add a migration after a model change
cd backend && dotnet ef migrations add Name --project TaskDb.Infrastructure --startup-project TaskDb.Api
```

## Database design

The corrected ERD is in [`docs/ERD.md`](docs/ERD.md). Important corrections from the original diagram include a `report_version_id` on review actions, task deliverables, blocker severity/key flag, achievement key flag, and stable report-level identity with immutable submitted versions.

## API overview

- `POST /api/auth/login`, `POST /api/auth/register`
- `GET/POST/PUT/DELETE /api/projects`
- `GET/POST/PUT/DELETE /api/users` (manager)
- `GET /api/reports` with user/project/status/date pagination filters
- `GET/POST/PUT /api/reports/{id}`
- `POST /api/reports/{id}/submit`
- `POST /api/reports/{id}/review` (manager)

## Notes and future improvements

The AI assistant uses Gemini with anonymous aggregate report data and manager-only authorization. Recommended next steps are refresh-token rotation, email invitation/reset flows, audit export, server-side dashboard aggregation, and CI-backed integration tests using a disposable MySQL container.

