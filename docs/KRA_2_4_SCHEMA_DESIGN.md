# IHROS — KRA 2.4 Database Schema Design

This document records the Mongoose schema design for the IHROS hospital resource platform.

## Models

1. User — authentication and role information.
2. Department — hospital department identity, capacity, and specialty.
3. Doctor — doctor identity, specialization, department, and availability.
4. Patient — patient operational information.
5. Bed — bed identity, department, type, and operational status.
6. Appointment — patient/doctor appointment data, date, status, and date index.

## Schema Design Principles

- Required fields are marked with `required: true` where the domain requires them.
- Unique constraints are used for identifiers such as user email, doctor email, department code, and bed number.
- Enumerated values are used for roles and operational statuses.
- Timestamps are enabled on every model.
- The appointment model has an index on `date` to support date-based operational queries.
- Passwords are excluded from normal queries through `select: false` and are hashed in the User model before save.

## Relationship Direction for Later KRAs

The current resource models keep the main domain fields simple so that the following KRA sequence can implement and demonstrate relationships without breaking the existing CRUD foundation:

- Department → Doctors
- Department → Beds
- Patient → Appointments
- Doctor → Appointments

The dedicated entity-relationship KRA can strengthen these associations with ObjectId references and population where required.

## Files

```text
server/src/models/
├── User.js
├── Department.js
├── Doctor.js
├── Patient.js
├── Bed.js
├── Appointment.js
└── ResourceModels.js
```
