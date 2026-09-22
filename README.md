# IHROS — Intelligent Hospital Resource Optimization System
> **Capstone Project:** Full-Stack Healthcare Operational Intelligence  
> **Topic:** Addressing hospital resource bottlenecks caused by mismatches between patient demand, doctor availability, and facility capacity through data-driven planning.  
> **Milestone Covered:** All Kalvium KRAs through **2.12 (JWT-Based Authorization)**.

---

## 1. Project Overview & Problem Statement

### The Problem
Hospitals operate in high-stress, resource-constrained environments where mismatches between patient demand, physician shifts, and facility capacity trigger severe bottlenecks:
- Emergency department overcrowding and boarding delays.
- Intensive Care Unit (ICU) bed shortages occurring alongside unmonitored idle bed time.
- Imbalanced outpatient appointment loads leading to patient wait times exceeding 85 minutes.
- Manual morning spreadsheet handoffs that result in stale capacity counts and unnecessary patient diverts.

### The Solution: IHROS
**IHROS** is a centralized operational command center built on the MERN stack. It establishes a real-time transactional data layer connecting doctors, patients, departments, beds, and appointments. Backed by MongoDB, protected by bcrypt and JWT-based Role-Based Access Control (RBAC), IHROS provides sub-second operational visibility and sets the stage for AI-driven predictive allocation.

---

## 2. Day-by-Day Capstone Journey Plan

| Day | Milestone / Phase | Activities & Deliverables |
|---|---|---|
| **Day 1** | **KRA 1.3: PRD Creation** | Documented problem statement, stakeholder matrix, quantified KPIs, dataset sources, user stories, in-scope vs out-of-scope boundaries, and 15-point checklist in `docs/PRD.md`. |
| **Day 2** | **KRA 1.4: Mock UX & User Flows** | Designed analytical user modes (Monitor, Explore, Compare, Filter, Investigate), created wireframe ASCII layouts, defined error & empty states in `docs/MOCK_UX.md`. |
| **Day 3** | **KRA 2.1: GitHub Repo & Git Setup** | Configured repository following naming convention `Squad_Name_Capstone_Project`, created `.gitignore`, documented branching strategy, and added CodiumAI review instructions. |
| **Day 4** | **KRA 2.2: React App Initialization** | Initialized frontend client using Vite with React 18, set up proxy configuration in `vite.config.js`, and structured client-side routing. |
| **Day 5** | **KRA 2.3: Reusable Components** | Built modular components: `StatCard`, `FormField`, `Shell`, `ProtectedAction`, responsive topbar, and sidebar navigation. |
| **Day 6** | **KRA 2.4: Database Schema Design** | Designed Mongoose schemas for `User`, `Department`, `Doctor`, `Bed`, `Patient`, and `Appointment` with data validation, indexes, and timestamps. |
| **Day 7** | **KRA 2.5: DB Read & Write Setup** | Connected Express to MongoDB with connection pooling and error listeners; built database seeder `server/src/scripts/seed.js` for one-command test data. |
| **Day 8** | **KRA 2.6: GET API Endpoints** | Built RESTful GET endpoints for list queries with pagination, field filtering, regex search, and single-item lookups (`/api/:resource/:id`). |
| **Day 9** | **KRA 2.7: POST API Endpoints** | Implemented validated POST creation routes returning HTTP 201 with `express-validator` request sanitization and error handling. |
| **Day 10** | **KRA 2.8: PUT API Endpoints** | Implemented validated PUT update routes returning HTTP 200 with MongoDB ObjectId validation and atomic update handling. |
| **Day 11** | **KRA 2.9: Update & Delete Functionality** | Completed DELETE endpoints (HTTP 200) and linked React frontend with live editing, search filtering, and deletion confirmation dialogs. |
| **Day 12** | **KRA 2.10: Entity Relationships** | Modeled and populated relational links: Doctors & Beds assigned to Departments, Appointments referencing Doctors and Patients. |
| **Day 13** | **KRA 2.11: Password Authentication** | Implemented user registration and login with bcrypt password hashing (salt rounds = 12) and secure credential validation. |
| **Day 14** | **KRA 2.12: JWT Authorization & Testing** | Deployed signed JWT issuance, `authenticate` and `authorize(roles)` middlewares, route protection, and automated Jest + Supertest suites. |

---

## 3. Architecture & Tech Stack

```text
┌─────────────────────────────────────────────────────────────┐
│               Frontend: React 18 + Vite                     │
│  - React Router DOM v7 (Client Routing & Route Guards)      │
│  - Lucide React (Operational Healthcare Icons)              │
│  - Axios with Request/Response Interceptors for JWT         │
└──────────────────────────────┬──────────────────────────────┘
                               │  REST Calls (JSON + Bearer JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Backend: Express 5 + Node.js 20               │
│  - Rate Limiting Middleware (express-rate-limit)            │
│  - Morgan HTTP Request Logger & CORS                        │
│  - express-validator (Request Schema Validation)            │
│  - JWT Middleware (authenticate) & RBAC Guard (authorize)   │
│  - Centralized Error Handler (ApiError + AsyncHandler)      │
└──────────────────────────────┬──────────────────────────────┘
                               │  Mongoose 8 ODM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Database: MongoDB                             │
│  - Collections: Users, Departments, Doctors, Beds,          │
│                 Patients, Appointments                      │
│  - B-Tree Indexes on unique IDs, dates, and lookups         │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Role-Based Access Control (RBAC) Matrix

| Endpoint / Operation | HTTP Method | `super_admin` | `hospital_admin` | `department_manager` | `doctor` | `nurse` | Public |
|---|---|---|---|---|---|---|---|
| Register Account | POST `/api/auth/register` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Login / Get Token | POST `/api/auth/login` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Current Profile | GET `/api/auth/me` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Dashboard Metrics | GET `/api/dashboard/summary` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Resources (Read) | GET `/api/:resource` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create Resource | POST `/api/:resource` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Resource | PUT `/api/:resource/:id` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Resource | DELETE `/api/:resource/:id` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 5. Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v20+
- **MongoDB**: Running locally on port `27017` or a MongoDB Atlas URI.

### 2. Installation
```bash
# Clone the repository
git clone <YOUR_REPO_URL>
cd <YOUR_REPO_FOLDER>

# Install all workspace dependencies
npm install
```

### 3. Environment Configuration
Verify `server/.env` exists:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ihros
JWT_SECRET=super_secret_ihros_jwt_hospital_resource_key_2026_secure
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

### 4. Seed Realistic Data
Populate the database with demo hospital departments, doctors, beds, patients, appointments, and ready-to-test role accounts:
```bash
npm run seed
```

### 5. Run the Application
```bash
# Concurrently starts Express API (port 5000) and Vite React app (port 5173)
npm run dev
```
- **Frontend Command Center:** [http://localhost:5173](http://localhost:5173)
- **Backend API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 6. Run Automated Tests
```bash
npm run test
```

---

## 6. Pre-Configured Demo Credentials

| Role | Email | Password | Allowed Permissions |
|---|---|---|---|
| **Hospital Admin** | `admin@ihros.local` | `Admin@123` | Full access: View, Add, Update, and Delete all resources. |
| **Department Manager**| `manager@ihros.local`| `Manager@123` | Operations access: View, Add, and Update doctors, beds, appointments. |
| **Physician / Doctor**| `doctor@ihros.local` | `Doctor@123` | Clinical read-only access. |
| **Ward Nurse** | `nurse@ihros.local` | `Nurse@123` | Operational read-only access. |

---

## 7. Kalvium Submission & Git Workflow

### Branch Naming Guide for KRAs
Follow standard Kalvium branch naming for each sub-milestone:
```bash
# Example for KRA 2.12
git checkout -b feat/2-12-jwt-authorization
git add .
git commit -m "feat(auth): implement JWT authorization and RBAC middleware"
git push -u origin feat/2-12-jwt-authorization
```

### Requesting CodiumAI Review
In your GitHub Pull Request description or comment, copy and paste:
```text
@CodiumAI-Agent /review
```
*(Notice the space between `@CodiumAI-Agent` and `/review`)*. Once generated, address feedback and merge into `main`.

---

## 8. 3-Minute Video Recording Script (Presentation Guide)

When recording your video for the Kalvium evaluation (using Google Meet with camera ON and full screen shared):

1. **Minute 0:00 – 0:45 | Introduction & Problem Context**
   - Introduce yourself: *"Hello, I am [Your Name] from Squad [Your Squad Number]. This is my Capstone Project: IHROS (Intelligent Hospital Resource Optimization System)."*
   - Show the problem statement: *"Hospitals face severe resource bottlenecks between patient demand, physician rosters, and bed turnover. IHROS builds a unified operational command center to eliminate these bottlenecks."*
   - Show the repository structure, `main` branch, and GitHub commit history.
2. **Minute 0:45 – 1:45 | Architecture & Authentication Flow**
   - Open your browser to `http://localhost:5173/login`.
   - Open Chrome DevTools → Network tab.
   - Log in using `admin@ihros.local` / `Admin@123`.
   - Highlight the `/api/auth/login` network call returning HTTP 200 with the signed JWT token.
   - Show how the frontend stores the token and how Axios attaches `Authorization: Bearer <token>` on all subsequent requests.
3. **Minute 1:45 – 2:30 | Dashboard & CRUD Capabilities**
   - Show the Dashboard: live patient count, doctor rosters, bed availability (`ICU`, `General`), and appointment schedules.
   - Navigate to **Beds** or **Doctors**. Create a new record (demonstrates POST API & HTTP 201).
   - Click the pencil icon to edit the record (demonstrates PUT API & HTTP 200).
   - Click the delete trash icon to delete a record (demonstrates DELETE API & HTTP 200).
4. **Minute 2:30 – 3:15 | Role-Based Access Control (RBAC) & Security**
   - Log out and log in as `nurse@ihros.local` / `Nurse@123`.
   - Point out that the mutation forms and delete action buttons are hidden for read-only roles.
   - Show the backend code in `server/src/middleware/auth.js` highlighting `authenticate` (JWT verification) and `authorize('super_admin', 'hospital_admin')` (RBAC enforcement).
   - Conclude by running `npm test` in the terminal to show all automated integration tests passing.
