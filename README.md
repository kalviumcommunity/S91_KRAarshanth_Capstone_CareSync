# IHROS — Intelligent Hospital Resource Optimization System

## Capstone

IHROS is an operational intelligence platform for hospital resource planning. It models doctors, patients, departments, beds and appointments and exposes secure REST APIs backed by MongoDB. The first implementation milestone covers the Kalvium capstone requirements through **Username & Password Authentication* and **JWT-Based Authorization **.

### Problem
Hospitals experience resource bottlenecks when patient demand, doctor availability and facility capacity do not match. IHROS creates a single operational data layer that can later power forecasting, bottleneck detection and resource recommendations.

## Architecture

```text
React + Vite
   │ Axios / REST
   ▼
Express API ── Middleware ── JWT Auth / RBAC / Validation / Rate Limit
   │
   ▼
Mongoose ODM
   │
   ▼
MongoDB
```

## Implemented milestones

- 2.1 GitHub repository setup documentation
- 2.2 React + Vite initialization
- 2.3 Reusable React components
- 2.4 Mongoose schemas
- 2.5 Database read/write
- 2.6 GET APIs
- 2.7 POST APIs
- 2.8 PUT APIs
- 2.9 Update/delete UI functionality
- 2.10 Entity relationships in the data model / operational domain
- 2.11 Username/password authentication with bcrypt
- 2.12 JWT-based authentication + role-based authorization

## REST endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public + rate limited |
| GET | `/api/auth/me` | JWT |
| GET | `/api/doctors` | JWT |
| POST | `/api/doctors` | Admin / Manager |
| PUT | `/api/doctors/:id` | Admin / Manager |
| DELETE | `/api/doctors/:id` | Super Admin / Hospital Admin |
| GET/POST/PUT/DELETE | `/api/patients...` | JWT / RBAC |
| GET/POST/PUT/DELETE | `/api/departments...` | JWT / RBAC |
| GET/POST/PUT/DELETE | `/api/beds...` | JWT / RBAC |
| GET/POST/PUT/DELETE | `/api/appointments...` | JWT / RBAC |
| GET | `/api/dashboard/summary` | JWT |

## Roles

`super_admin`, `hospital_admin`, `department_manager`, `doctor`, `nurse`.

- Authentication proves identity.
- JWT carries the user identity and role.
- `authenticate` middleware verifies the token and loads the user.
- `authorize(...)` middleware enforces role permissions.

## Run locally

### 1. Requirements
- Node.js 20+
- MongoDB running locally, or a MongoDB connection string

### 2. Install

```bash
npm install
npm install --workspace client
npm install --workspace server
```

### 3. Configure server

Copy `server/.env.example` to `server/.env` and set a strong `JWT_SECRET`.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ihros
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

### 4. Start

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
API: `http://localhost:5000`

### Demo account

Register a hospital admin from `/register`, or seed one manually in MongoDB. Self-registration cannot create `super_admin` accounts.

## Git workflow for each KRA

```bash
git checkout -b feat/2-12-jwt-authorization
git add .
git commit -m "feat(auth): add JWT authorization and RBAC"
git push -u origin feat/2-12-jwt-authorization
```

Create the PR, add the required Kalvium review comment, record the required demo video, merge the PR, and keep `main` as the default branch.

## Suggested demo order

1. Show the repository and branch.
2. Run the React application.
3. Register/login.
4. Open DevTools → Network and show `/api/auth/login` returning a token.
5. Show Axios attaching `Authorization: Bearer <token>`.
6. Open dashboard and CRUD pages.
7. Demonstrate role restrictions: manager can create/update; only admins can delete.
8. Attempt a protected endpoint without a token and show HTTP 401.
9. Attempt a restricted endpoint with a valid lower-privilege token and show HTTP 403.
10. Show the `authenticate` and `authorize` middleware in the backend.

## Security notes

- Passwords are hashed with bcrypt and never returned by API responses.
- JWT secret is loaded from environment variables.
- Authentication endpoints are rate limited.
- Request validation uses `express-validator`.
- MongoDB queries are performed through Mongoose models.
- CORS is restricted to the configured frontend origin.

## React Component Development (KRA 2.3)

Reusable React components were introduced to keep the IHROS frontend consistent and easier to maintain:

- `PageHeader` — shared page title, description, and action layout
- `StatusBadge` — reusable status indicator for live/system state
- `LoadingState` — consistent asynchronous loading feedback
- `EmptyState` — consistent empty-data experience
- `StatCard` — reusable operational KPI card
- `FormField` — reusable form field pattern
- `ProtectedAction` — reusable role-aware action wrapper

These components are used across the dashboard and CRUD resource workflow rather than keeping repeated UI markup inside individual pages.
