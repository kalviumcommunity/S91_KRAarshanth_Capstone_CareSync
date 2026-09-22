# KRA 2.7 — POST API Implementation

## Objective

IHROS exposes authenticated POST endpoints that validate the request identity and create resource documents in MongoDB through Mongoose.

## Create Endpoints

| Method | Endpoint | Database operation |
|---|---|---|
| POST | `/api/doctors` | `Doctor.create(req.body)` |
| POST | `/api/patients` | `Patient.create(req.body)` |
| POST | `/api/departments` | `Department.create(req.body)` |
| POST | `/api/beds` | `Bed.create(req.body)` |
| POST | `/api/appointments` | `Appointment.create(req.body)` |

All resource POST endpoints require a JWT and allow `super_admin`, `hospital_admin`, or `department_manager` roles. Mongoose schema validation runs during creation, and duplicate unique values return a conflict response.

## Example Request

```http
POST /api/doctors
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "name": "Dr. Maya Rao",
  "email": "maya.rao@example.com",
  "specialization": "Cardiology",
  "department": "Clinical Services"
}
```

## Example Response

```json
{
  "success": true,
  "message": "Doctor created",
  "data": {
    "_id": "<mongodb-id>",
    "name": "Dr. Maya Rao",
    "email": "maya.rao@example.com",
    "specialization": "Cardiology",
    "department": "Clinical Services"
  }
}
```

The successful response uses HTTP `201 Created` and returns the persisted MongoDB document. The returned `_id` can be passed to `GET /api/doctors/:id` to verify the write.

## Request Flow

```text
JSON request
    -> JWT authentication and RBAC
    -> shared CRUD create handler
    -> Mongoose Model.create()
    -> MongoDB document
    -> HTTP 201 JSON response
```

The routes are defined in `server/src/routes/crud.js`, and the shared create handler is implemented in `server/src/controllers/crudController.js`.

## Verification

A KRA 2.7 verification registers a temporary hospital admin, calls `POST /api/doctors`, confirms HTTP 201 and the returned MongoDB `_id`, then calls `GET /api/doctors/:id` to confirm the created document is readable. The temporary record is deleted after verification.
