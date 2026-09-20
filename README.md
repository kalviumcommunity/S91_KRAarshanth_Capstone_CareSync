# IHROS — Intelligent Hospital Resource Optimization System

## Capstone Project

**Project:** IHROS  
**Full Form:** Intelligent Hospital Resource Optimization System  
**Domain:** Healthcare / Hospital Operations / Resource Optimization  
**Technology Focus:** MERN Stack + Authentication + Role-Based Authorization + Future Analytics/AI

---

## Project Idea

IHROS is a web-based hospital operations platform designed to improve how hospitals manage and coordinate critical resources such as **doctors, patients, departments, beds, and appointments**.

Hospitals can experience operational bottlenecks when patient demand, doctor availability, department capacity, and facility utilization are not coordinated through a centralized system. IHROS addresses this problem by providing a secure operational platform where authorized hospital staff can manage resources, monitor operational information, and build a structured data foundation for future analytics, prediction, and resource optimization.

The project is designed around the progression:

**Manage → Monitor → Analyze → Predict → Optimize**

The current foundation focuses on secure hospital resource management and reliable operational data. Future development can extend this foundation with demand forecasting, bed-demand prediction, doctor workload analysis, department capacity planning, alerts, and intelligent resource recommendations.

---

## Problem Statement

> Hospitals experience resource bottlenecks due to mismatches between patient demand, doctor availability, and facility utilization. Data-driven planning can improve operational efficiency and support better resource management.

### Core Challenges

- Unpredictable patient arrivals and changing demand
- Limited visibility into hospital resource utilization
- Doctor availability and appointment scheduling conflicts
- Bed allocation and capacity-management difficulties
- Department-level resource imbalance
- Manual operational planning
- Delayed administrative decisions
- Underutilized or overloaded resources
- Lack of a unified operational data foundation

---

## Target Users

### Hospital Admin
Responsible for hospital-wide operations, resource management, access control, and overall visibility.

### Department Manager
Monitors and coordinates resources within a department, including doctors, beds, and appointments.

### Doctor
Uses the system for relevant appointment and availability workflows.

### Nurse
Uses permitted operational information needed for day-to-day hospital activities.

---

## Core Modules

- User Authentication
- Role-Based Authorization
- Dashboard
- Doctor Management
- Patient Management
- Department Management
- Bed Management
- Appointment Management
- REST API Layer
- Validation and Error Handling
- Operational Data Storage

---

## High-Level Workflow

```text
User
  ↓
Login / Register
  ↓
Authentication
(Bcrypt + JWT)
  ↓
Role-Based Authorization
(RBAC)
  ↓
IHROS Dashboard
  ↓
Hospital Resources
  ├── Doctors
  ├── Patients
  ├── Departments
  ├── Beds
  └── Appointments
  ↓
REST APIs
(Node.js + Express)
  ↓
Validation + Error Handling
  ↓
Mongoose
  ↓
MongoDB
  ↓
Database Response
  ↓
React UI Update
  ↓
Operational Data
  ↓
Future Analytics
  ↓
Prediction
  ↓
Resource Optimization
```

---

## Technology Stack

### Frontend
- React
- Vite
- React Router
- Axios
- CSS / responsive UI

### Backend
- Node.js
- Express.js
- REST APIs
- Express Validator
- JWT
- bcrypt

### Database
- MongoDB
- Mongoose

### Security
- JWT Authentication
- Role-Based Access Control (RBAC)
- Password hashing with bcrypt
- Protected routes
- Authentication rate limiting
- Environment variables
- Request validation
- Centralized error handling

### Development & Collaboration
- Git
- GitHub
- Pull Requests
- CodiumAI review
- VS Code
- Postman / API testing

---

## Repository Structure

```text
IHROS/
├── client/
│   └── React frontend
├── server/
│   └── Node.js + Express backend
├── docs/
│   ├── API documentation
│   ├── Data model documentation
│   └── KRA checklist
├── README.md
└── package.json
```

---

## Capstone Development Plan

This plan is organized around the project foundation and the planned KRA sequence.

### Day 1 — Project Setup & Repository
- Create the capstone GitHub repository
- Set the repository naming convention
- Initialize Git
- Create the main branch
- Prepare the initial README
- Define the project problem and technology stack

### Day 2 — Product Requirement & Planning
- Finalize the project problem statement
- Identify target users
- Define product scope
- Identify core features
- Define assumptions and success criteria
- Prepare the PRD

### Day 3 — Mock UX & User Flow
- Design the main user journeys
- Design Login/Register flow
- Design Dashboard
- Design Doctors, Patients, Departments, Beds, and Appointments screens
- Define navigation and major interactions

### Day 4 — React Application Initialization
- Initialize the React frontend
- Configure Vite
- Set up application routing
- Create the initial application layout
- Prepare reusable UI components

### Day 5 — React Component Development
- Build navigation components
- Build dashboard components
- Build forms and tables
- Add reusable form fields and UI elements
- Implement responsive layouts

### Day 6 — Database Schema Design
- Design the MongoDB collections
- Create Mongoose schemas
- Define User, Doctor, Patient, Department, Bed, and Appointment models
- Define validation rules and indexes where needed

### Day 7 — Database Read & Write Operations
- Connect the backend to MongoDB
- Implement create operations
- Implement read operations
- Test database interactions
- Validate API-to-database communication

### Day 8 — GET API Implementation
- Create resource GET routes
- Return Doctors, Patients, Departments, Beds, and Appointments
- Add query/filter support where required
- Validate API responses

### Day 9 — POST API Implementation
- Create resource POST routes
- Implement request validation
- Add new resource records
- Handle duplicate and invalid-data errors

### Day 10 — PUT API Implementation
- Create update routes
- Validate update requests
- Update resource records
- Verify successful and failed update scenarios

### Day 11 — Update & Delete Functionality
- Complete frontend CRUD interactions
- Implement delete operations
- Add confirmation/action feedback
- Handle API errors in the UI

### Day 12 — Entity Relationships
- Connect related hospital resources conceptually
- Define Department–Doctor relationships
- Define Department–Bed relationships
- Connect Patient–Appointment–Doctor workflows
- Validate consistency between entities

### Day 13 — Authentication
- Create user registration
- Hash passwords using bcrypt
- Implement login
- Return authenticated user information securely

### Day 14 — JWT Authorization & RBAC
- Generate JWT tokens
- Protect private routes
- Verify JWT tokens on protected requests
- Implement role-based authorization
- Restrict actions based on role

### Day 15 — Integration & Testing
- Test frontend/backend integration
- Test authentication flows
- Test CRUD workflows
- Test authorization rules
- Test validation and error handling
- Fix integration issues

### Day 16 — Documentation & Review
- Update README
- Update API/data-model documentation
- Review the completed KRA work
- Run application validation checks
- Record demonstration videos
- Create required GitHub Pull Requests

### Future Development Phase
After the operational foundation is stable:

- Historical operational analytics
- Patient-demand forecasting
- Bed-demand prediction
- Doctor workload analysis
- Department capacity planning
- Early-warning alerts
- Intelligent resource recommendations
- Advanced dashboards
- Real-time operational signals
- Production hardening and monitoring

---

## Product Differentiation

IHROS is designed to go beyond simple hospital record management.

A basic management workflow can be represented as:

```text
Data → Store → Display
```

IHROS is designed toward:

```text
Data
 ↓
Manage
 ↓
Monitor
 ↓
Analyze
 ↓
Predict
 ↓
Recommend
 ↓
Optimize
```

The current implementation establishes the secure operational foundation required for this longer-term intelligence layer.

---

## Security Approach

Security is treated as a core part of the architecture.

- Passwords are hashed using bcrypt
- JWT tokens are used for authenticated API requests
- Protected routes require valid authentication
- Role-based authorization controls access
- Input validation reduces invalid requests
- Rate limiting is applied to sensitive authentication routes
- Environment variables are used for secrets/configuration
- Centralized error handling avoids exposing unnecessary internal details

---

## Expected Project Impact

IHROS aims to support:

- Centralized hospital resource management
- Better operational visibility
- Improved resource coordination
- Reduced manual coordination effort
- Better utilization of available resources
- A stronger data foundation for operational analytics
- Future predictive planning and optimization

---

## Mock UX Design

**Mock UX Link:**  

https://www.figma.com/design/bRyoSoBdNAfesndqgEMTKM/Untitled?node-id=2002-2763&t=CjjJjsgP9uY0NHUs-1

The Mock UX demonstrates the primary IHROS screens, navigation flow, authentication journey, hospital resource-management workflows, and major user interactions.

---

## Project Documentation

- Product Requirement Document (PRD)
- Mock UX & User Flow Design
- API documentation
- Data model documentation
- KRA checklist
- Project demonstration videos

---

## Development Status

### Foundation
- [x] Product idea defined
- [x] Problem statement defined
- [x] PRD created
- [x] Mock UX created
- [x] Repository setup plan prepared

### Current Full-Stack Foundation
- [x] React frontend foundation
- [x] Node.js + Express backend
- [x] MongoDB + Mongoose
- [x] Resource CRUD
- [x] REST APIs
- [x] Validation
- [x] Error handling
- [x] bcrypt password hashing
- [x] JWT authentication
- [x] Role-based authorization

### Future Intelligence
- [ ] Demand forecasting
- [ ] Bed-demand prediction
- [ ] Doctor workload optimization
- [ ] Department capacity planning
- [ ] Intelligent recommendations
- [ ] Advanced analytics
- [ ] Real-time operational signals

---

## Conclusion

IHROS is designed as a secure hospital operations foundation that can evolve into an intelligent resource optimization platform. The project connects hospital resources through a common operational workflow and prepares the system for future analytics, prediction, and optimization capabilities.

**Manage • Monitor • Optimize • For Better Healthcare**
