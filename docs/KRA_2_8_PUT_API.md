# KRA 2.8 — PUT API Implementation

## Objective

IHROS exposes authenticated PUT endpoints that update existing resource documents in MongoDB through Mongoose and return the updated record.

## Update Endpoints

| Method | Endpoint | Database operation |
|---|---|---|
| PUT | `/api/doctors/:id` | `Doctor.findByIdAndUpdate()` |
| PUT | `/api/patients/:id` | `Patient.findByIdAndUpdate()` |
| PUT | `/api/departments/:id` | `Department.findByIdAndUpdate()` |
| PUT | `/api/beds/:id` | `Bed.findByIdAndUpdate()` |
| PUT | `/api/appointments/:id` | `Appointment.findByIdAndUpdate()` |

All resource PUT endpoints require a JWT and allow `super_admin`, `hospital_admin`, or `department_manager` roles. The route validates the MongoDB id, and Mongoose runs schema validators during the update.

## Example Request

```http
PUT /api/doctors/<mongodb-id>
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "availability": "On Leave"
}
```

## Update Behavior

The shared controller calls:

```js
await Model.findByIdAndUpdate(
  req.params.id,
  req.body,
  { new: true, runValidators: true }
);
```

`new: true` returns the updated document. `runValidators: true` prevents invalid updates from being persisted. A valid id with no matching document returns HTTP `404`.

## Request Flow

```text
JSON update request
    -> JWT authentication and RBAC
    -> MongoDB id validation
    -> shared CRUD update handler
    -> Mongoose findByIdAndUpdate()
    -> updated MongoDB document
    -> HTTP 200 JSON response
```

The routes are defined in `server/src/routes/crud.js`, and the shared update handler is implemented in `server/src/controllers/crudController.js`.

## Verification

A KRA 2.8 verification registers a temporary hospital admin, creates a doctor, calls `PUT /api/doctors/:id`, confirms the HTTP 200 response contains the changed value, then reads the document back with GET and deletes it after verification.
