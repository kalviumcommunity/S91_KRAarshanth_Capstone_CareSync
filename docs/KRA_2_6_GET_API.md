# KRA 2.6 — GET API Implementation

## Objective

IHROS exposes authenticated GET endpoints that read resource data through Mongoose and return JSON responses for the React client.

## Collection Endpoints

| Method | Endpoint | Database operation |
|---|---|---|
| GET | `/api/doctors` | `Doctor.find()` and `Doctor.countDocuments()` |
| GET | `/api/patients` | `Patient.find()` and `Patient.countDocuments()` |
| GET | `/api/departments` | `Department.find()` and `Department.countDocuments()` |
| GET | `/api/beds` | `Bed.find()` and `Bed.countDocuments()` |
| GET | `/api/appointments` | `Appointment.find()` and `Appointment.countDocuments()` |

Collection requests support `page`, `limit`, and `search` query parameters. Each request requires a valid JWT and returns a response shaped as:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 0,
    "totalPages": 0
  }
}
```

## Single-Record Endpoints

Each resource also supports a protected `GET /api/<resource>/:id` endpoint. It calls `Model.findById(req.params.id)` and returns HTTP 404 when the record does not exist.

Examples:

```text
GET /api/doctors/:id
GET /api/patients/:id
GET /api/departments/:id
GET /api/beds/:id
GET /api/appointments/:id
```

## Request Flow

```text
JWT request
    -> authenticate middleware
    -> MongoDB-backed controller
    -> Mongoose query
    -> JSON response
```

The routes are defined in `server/src/routes/crud.js`, and the shared GET handlers are implemented in `server/src/controllers/crudController.js`.

## Verification

A KRA 2.6 verification uses a valid registered user token and confirms both collection and single-record reads:

```text
GET /api/doctors?search=cardio
GET /api/doctors/<returned-id>
```

The first response confirms database-backed listing, filtering, and pagination. The second confirms a database-backed single-record lookup.
