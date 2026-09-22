# KRA 2.10 — Entity Relationship Implementation

## Objective

IHROS models operational relationships with Mongoose ObjectId references and returns linked entities through populated API responses.

## Relationships

```text
Department 1 ── many Doctor
Department 1 ── many Bed
Patient 1 ── many Appointment ── many 1 Doctor
```

| Entity | Reference field | Mongoose target |
|---|---|---|
| Doctor | `departmentId` | `Department` |
| Bed | `departmentId` | `Department` |
| Appointment | `patientId` | `Patient` |
| Appointment | `doctorId` | `Doctor` |

The existing display fields (`department`, `patientName`, and `doctorName`) remain available for the current forms and older records. The ObjectId fields provide actual database relationships for new linked records.

## Populated Reads

The shared CRUD controller accepts relationship configuration and calls Mongoose `populate()` for both collection and single-record GET requests:

- Doctor and bed responses populate `departmentId` with department name, code, and specialty.
- Appointment responses populate `patientId` and `doctorId` with the linked patient and doctor details.

This keeps relationship traversal in the API response while preserving the common CRUD handlers.

## Verification

A relationship verification creates a department, doctor linked through `departmentId`, patient, and appointment linked through `patientId` and `doctorId`. A subsequent appointment GET returns populated patient and doctor objects, and a doctor GET returns its populated department. The temporary records are deleted after verification.

Relationship schemas are defined in `server/src/models/Doctor.js`, `server/src/models/Bed.js`, and `server/src/models/Appointment.js`. Population is configured in `server/src/routes/crud.js` and executed by `server/src/controllers/crudController.js`.
