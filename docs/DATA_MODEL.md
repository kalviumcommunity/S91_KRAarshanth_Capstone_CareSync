# IHROS Data Model

The first capstone slice uses MongoDB/Mongoose because KRA 2.4 explicitly requires Mongoose schemas. The operational entities are separated into collections and are referenced by domain identifiers in the current UI; this keeps the foundation simple while leaving room for ObjectId references in the intelligence layer.

```text
User
 └─ role controls access to hospital operations

Department ──< Doctor
Department ──< Bed
Patient ──< Appointment >── Doctor
```

### Why these relationships matter

- A department has multiple doctors and beds.
- An appointment links a patient workflow to a doctor workflow.
- Bed status contributes to utilization metrics.
- User role controls which operations a person may perform.

Indexes are applied to unique operational identifiers and appointment date queries. Further indexes can be added when analytics workloads are introduced.
