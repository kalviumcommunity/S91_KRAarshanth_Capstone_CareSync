# KRA 2.4 — Database Schema Design Video Script

## 0:00–0:30 — Introduction

“Hi, I am K R Aarshanth. This is my KRA 2.4 submission for Database Schema Design in my IHROS capstone project. In this KRA I designed the Mongoose models for the core hospital resource entities.”

## 0:30–1:00 — Models

Show `server/src/models/` and explain that the project contains User, Department, Doctor, Patient, Bed, and Appointment models.

## 1:00–1:40 — User and Department

Explain authentication fields, roles, active status, department code, capacity, and specialty. Mention that passwords are protected and not returned by default.

## 1:40–2:20 — Doctor, Patient, Bed

Explain the fields and validation used for doctors, patients, and beds. Mention enum-based bed states and doctor availability.

## 2:20–2:50 — Appointment

Explain patient/doctor names, appointment date, status values, timestamps, and the date index for date-based queries.

## 2:50–3:20 — Design choices

Explain required fields, unique constraints, enum constraints, timestamps, and the plan to strengthen entity references in KRA 2.10.

## 3:20–3:40 — Git workflow

Show:

```bash
git status
git add server/src/models docs/KRA_2_4_SCHEMA_DESIGN.md
git commit -m "feat: add Mongoose schemas for hospital resources"
git push -u origin feature/database-schema-design
```

Then show the PR and comment:

```text
@CodiumAI-Agent /review
```

Finally explain that the PR is reviewed and merged as required by Kalvium.
