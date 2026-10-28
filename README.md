# IHROS — Intelligent Hospital Resource Optimization System

IHROS is a hospital resource management application for organizing doctors, patients, departments, beds, and appointments. It provides authenticated workflows for hospital staff and a dashboard for reviewing operational data.

## Problem statement

Hospitals need a reliable way to keep resource and appointment information organized so staff can coordinate patient care and facility capacity.

## Proposed solution

IHROS provides a React interface and a REST API backed by MongoDB. Staff can manage hospital resources in one application, with authentication and role-based permissions protecting sensitive workflows.

## Technology stack

- Frontend: React, Vite, Axios
- Backend: Node.js, Express
- Database: MongoDB, Mongoose
- Authentication: JWT, bcrypt, optional Google sign-in
- Testing: Jest, Supertest
- AI assistance: server-side OpenAI API integration for department specialty suggestions
- Deployment: Netlify (frontend), Render (backend), Docker Compose (local API and database)

## Key features

- Dashboard and CRUD workflows for doctors, patients, departments, beds, and appointments
- Username/password authentication, JWT-protected APIs, and role-based authorization
- Optional Google sign-in and authenticated patient file uploads
- Jest and Supertest API tests
- Dockerized API and MongoDB development environment
- Authenticated AI assistance for editable department specialty descriptions

## Architecture Overview

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

The client uses Axios to call the Express REST API. Authentication, authorization, request validation, and rate limiting are enforced by backend middleware. Mongoose maps application data to MongoDB.

## Folder structure

```text
.
├── bruno/                  # Bruno API collection and local environment
├── client/
│   ├── src/                 # React pages, components, and styles
│   └── .env.example         # Vite client configuration template
├── docs/                    # KRA, API, and data-model documentation
├── server/
│   ├── src/                 # Express application, routes, models, middleware
│   ├── tests/               # Jest and Supertest API tests
│   └── .env.example         # Backend configuration template
├── Dockerfile
├── docker-compose.yml
├── netlify.toml
├── render.yaml
└── package.json             # npm workspaces and root scripts
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
- 2.13 Google sign-in with server-verified ID tokens
- 2.14 Patient file upload with authenticated download
- 2.15 Bruno API collection covering all current endpoints
- 2.16 Render backend deployment
- 2.17 Netlify frontend deployment configuration
- 2.18 Jest and Supertest API tests
- 2.19 Docker support for the API
- 2.20 AI-assisted department specialty autocomplete

## Live deployments

- Frontend: [https://gleeful-bombolone-7b9dcd.netlify.app/](https://gleeful-bombolone-7b9dcd.netlify.app/)
- Backend: [https://ihros-api.onrender.com](https://ihros-api.onrender.com)
- Backend health endpoint: [https://ihros-api.onrender.com/api/health](https://ihros-api.onrender.com/api/health)

**Deployment verification status:** Netlify live access is now Public; an anonymous request returned HTTP 200 and the login page loaded. The Render dashboard reports the latest deploy as Live, MongoDB connected, and internal `/api/health` checks returning HTTP 200. External requests from this environment reset during TLS connection, so verify the health endpoint and end-to-end workflows from your network before final submission. Google sign-in is currently unavailable on the deployed frontend until its OAuth client ID is configured.

## Bruno API collection

Open the [`bruno/`](bruno/) folder in Bruno and select the **Local** environment. Setup steps and request ordering are documented in [bruno/README.md](bruno/README.md).

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
| POST | `/api/patients/:patientId/files` | Admin / Manager + multipart file |
| GET | `/api/patients/:patientId/files` | JWT |
| GET | `/api/patients/:patientId/files/:fileId/download` | JWT |
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

## Installation Instructions

### Requirements
- Node.js 20+
- MongoDB running locally, or a MongoDB Atlas connection string
- npm (included with Node.js)

Clone the repository and install workspace dependencies from the repository root:

```powershell
git clone https://github.com/kalviumcommunity/S91_KRAarshanth_Capstone_CareSync.git
Set-Location S91_KRAarshanth_Capstone_CareSync
npm ci
```

## Environment Setup

Create the backend environment file from the template:

```powershell
Copy-Item server/.env.example server/.env
```

Set at least these values in `server/.env`:

- `MONGO_URI`: local MongoDB URI or MongoDB Atlas connection string
- `JWT_SECRET`: unique, strong secret of at least 32 characters
- `CLIENT_URL`: frontend origin, usually `http://localhost:5173` locally
- `PORT`: API port; defaults to `5000`

Optional integrations:

- Google sign-in: set `GOOGLE_CLIENT_ID` in `server/.env` and `VITE_GOOGLE_CLIENT_ID` in `client/.env` to the same OAuth web client ID. Create `client/.env` from `client/.env.example` if enabling this locally.
- AI specialty suggestions: set `OPENAI_API_KEY` in `server/.env`. Keep the key server-side; never commit it or add it to the frontend.
- Tests: set `MONGO_TEST_URI` only if you want to use a separate disposable MongoDB test database; otherwise tests default to `mongodb://127.0.0.1:27017/ihros_test`.

Never commit `.env` files or real credentials. The checked-in `.env.example` files contain placeholders only.

## Running the Project

Start MongoDB, then run both application workspaces from the repository root:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
API: `http://localhost:5000`

Create a production frontend build with:

```bash
npm run build
```

## Run backend tests

The backend uses Jest and Supertest for automated API tests. Run the full suite from the repository root:

```bash
npm run test --workspace server
```

The tests cover the health endpoint, authentication and authorization, Google sign-in, and patient file uploads. MongoDB-backed tests use `MONGO_TEST_URI` when set, or `mongodb://127.0.0.1:27017/ihros_test` by default.

## AI department specialty autocomplete

The Departments form can generate a concise specialty description from the department name and optional text already entered. The authenticated API sends only those two fields to OpenAI; do not enter patient information. Suggestions remain editable and are not saved until the user submits the form.

To enable it locally, set `OPENAI_API_KEY` in `server/.env`. The optional `OPENAI_MODEL` setting defaults to `gpt-4o-mini`. Keep the key on the server; never add it to frontend environment variables or commit it. The route returns a clear configuration error when the key is missing.

For the deployed API, add `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) in the `ihros-api` Render service's environment settings. Render restarts the service after the change; no frontend secret or deployment is needed.

## Run with Docker

Docker Compose runs the API and MongoDB together. Create `server/.env` from the example, then set a unique `JWT_SECRET` before starting:

```powershell
Copy-Item server/.env.example server/.env
```

In `server/.env`, replace the example `JWT_SECRET` with a strong random secret. Compose configures the API to connect to its MongoDB container, so the `MONGO_URI` value in this file is overridden.
To enable AI autocomplete in Docker, also set `OPENAI_API_KEY` in `server/.env`; the model setting is optional.

Build and start the application:

```bash
docker compose up --build
```

The API is available at `http://localhost:5000`, and its health endpoint is `http://localhost:5000/api/health`. Uploaded files and MongoDB data are stored in Docker volumes. Stop the services with `docker compose down`; add `--volumes` only if you intend to delete that stored data. The API container runs as the non-root `node` user and includes a Docker health check.

## Backend deployment

The API is deployed on Render: [https://ihros-api.onrender.com](https://ihros-api.onrender.com). Its health endpoint is [https://ihros-api.onrender.com/api/health](https://ihros-api.onrender.com/api/health).

The service is configured from the root [render.yaml](render.yaml) Blueprint. See [KRA_2_16_BACKEND_DEPLOYMENT.md](docs/KRA_2_16_BACKEND_DEPLOYMENT.md) for setup and free-tier file-storage limitations. Google sign-in is not enabled on the deployed frontend/backend until `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` are configured with the same OAuth web client ID.

## Deploy the frontend to Netlify

The repository includes a `netlify.toml` with the Vite build command, publish directory, and SPA fallback needed by React Router.

Live frontend: [https://gleeful-bombolone-7b9dcd.netlify.app/](https://gleeful-bombolone-7b9dcd.netlify.app/)

1. The backend is deployed at `https://ihros-api.onrender.com`.
2. In Netlify, choose **Add new site → Import an existing project** and connect this GitHub repository. Keep the base directory at the repository root; the build settings are read from `netlify.toml`.
3. In the Netlify site settings, add the environment variable `VITE_API_URL` with the value `https://ihros-api.onrender.com/api`. Trigger a new deploy after adding or changing the variable.
4. Once Netlify assigns the site URL, set the backend's `CLIENT_URL` environment variable to that exact origin (for example, `https://<your-site>.netlify.app`) and redeploy/restart the backend. The API's CORS policy allows this configured origin.
5. Open the deployed site, refresh a nested route such as `/login`, and verify that login and API-backed pages can reach the deployed backend.

For the required final walkthrough, record 5–8 minutes with your camera on and your entire screen shared. Demonstrate the live application, major workflows, repository structure, README, architecture decisions, challenges, and lessons learned. Upload the video to Google Drive, set access to "Anyone with the link can view", and test it in an incognito browser. Add the public URL to the final PR before submission.

## Final submission checklist

- [ ] Confirm the frontend and backend links work in a signed-out browser.
- [ ] Add `OPENAI_API_KEY` privately to the Render service if the deployed AI autocomplete should be enabled. Never put this key in the frontend or this repository.
- [ ] Record a 5–8 minute walkthrough with your camera on and the entire screen shared.
- [ ] Upload the video to Google Drive, set access to "Anyone with the link can view", and test the link in an incognito browser.
- [ ] Add the public video URL to the final PR and the README.
- [ ] Be ready to explain the architecture, implementation decisions, challenges, and lessons learned.

### Walkthrough video

**Video URL:** add the publicly accessible Google Drive link after recording; no video has been recorded for this submission yet.

## Future Improvements

- Add persistent object storage for patient uploads in production deployments.
- Enable and verify Google OAuth on the deployed frontend and backend.
- Add frontend component and end-to-end tests for critical hospital workflows.
- Expand the dashboard with validated operational trends and resource-planning insights.

## Contributors

- K R Aarshanth

### Demo account

Register a hospital admin from `/register`, or seed one manually in MongoDB. Self-registration cannot create `super_admin` accounts.

## Earlier KRA Git workflow example

```bash
git checkout -b feat/2-12-jwt-authorization
git add .
git commit -m "feat(auth): add JWT authorization and RBAC"
git push -u origin feat/2-12-jwt-authorization
```

That example reflects the workflow used for earlier milestones. For this final assignment, use `feature/final-project-submission` as the PR branch and leave the PR open and unmerged, targeting `main`.

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


## KRA 2.5 — Database Read & Write Operations

The IHROS backend is connected to MongoDB through Mongoose. Resource API calls execute real database operations for Doctors, Patients, Departments, Beds, and Appointments.

- Read: `Model.find()`, `Model.findById()`, `Model.countDocuments()`
- Create: `Model.create()`
- Update: `Model.findByIdAndUpdate()`
- Delete: `Model.findByIdAndDelete()`
- Connection: `mongoose.connect(process.env.MONGO_URI)`

See `docs/KRA_2_5_DATABASE_READ_WRITE.md` for the complete database flow and API examples.

## KRA 2.6 — GET API Implementation

Authenticated GET endpoints provide paginated, searchable collection reads and single-record reads for doctors, patients, departments, beds, and appointments.

See `docs/KRA_2_6_GET_API.md` for the endpoint list, response shape, and verification flow.

## KRA 2.7 — POST API Implementation

Authenticated POST endpoints create doctors, patients, departments, beds, and appointments through Mongoose and return HTTP 201 responses containing the persisted documents.

See `docs/KRA_2_7_POST_API.md` for the endpoint list, request flow, and verification steps.

## KRA 2.8 — PUT API Implementation

Authenticated PUT endpoints update doctors, patients, departments, beds, and appointments through Mongoose and return the updated documents with HTTP 200 responses.

See `docs/KRA_2_8_PUT_API.md` for the endpoint list, update behavior, and verification steps.

## KRA 2.9 — React Update & Delete Functionality

The shared React CRUD page supports role-aware editing and deletion for doctors, patients, departments, beds, and appointments. It submits PUT and DELETE requests through Axios, confirms destructive actions, reloads data after changes, and displays API errors.

See `docs/KRA_2_9_UPDATE_DELETE_UI.md` for the user workflow and role behavior.

## KRA 2.10 — Entity Relationship Implementation

Mongoose ObjectId references connect doctors and beds to departments, and appointments to patients and doctors. GET responses populate those linked entities while preserving existing display fields for older records and current forms.

See `docs/KRA_2_10_ENTITY_RELATIONSHIPS.md` for the relationship map and verification flow.

## KRA 2.11 — Username & Password Authentication

IHROS provides registration and login with bcrypt-hashed passwords, validation, rate limiting, safe user responses, session restoration, and protected API requests from the React authentication context.

See `docs/KRA_2_11_USERNAME_PASSWORD_AUTH.md` for the authentication flow and verification steps.

## KRA 2.12 — JWT Authorization

IHROS issues signed JWTs at registration and login, verifies Bearer tokens in middleware, restores the active user from MongoDB, attaches tokens through Axios, and applies role-based authorization to protected operations.

See `docs/KRA_2_12_JWT_AUTHORIZATION.md` for the token flow and verification steps.
