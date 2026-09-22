# IHROS — KRA 2.5 Database Read & Write Operations Video Script

**Target duration:** 3–4 minutes

## 0:00–0:30 — Introduction

“Hi, I am K R Aarshanth, and this is my submission for KRA 2.5, Database Read and Write Operations.

In this KRA, I connected the IHROS Express server to MongoDB using Mongoose and ensured that the API endpoints perform real database operations.”

## 0:30–1:00 — Database connection

Show:

```text
server/src/config/db.js
```

Explain:

“The database connection is centralized in the `db.js` file. It reads the MongoDB connection string from the environment variable `MONGO_URI` and uses `mongoose.connect()` to establish the connection.”

## 1:00–1:40 — Read operations

Show:

```text
server/src/routes/crud.js
server/src/controllers/crudController.js
```

Explain:

“The GET endpoints call the generic CRUD controller. The controller uses `Model.find()` to read records from MongoDB and `Model.countDocuments()` to calculate pagination totals.

For example, `GET /api/doctors` reads doctor documents from the Doctors collection.”

Also show a request in Postman or the browser.

## 1:40–2:20 — Write operations

Explain:

“For creating records, the API uses `Model.create(req.body)`. For updates, it uses `findByIdAndUpdate()` with validation enabled. For deletion, it uses `findByIdAndDelete()`.

These operations are connected to the same Mongoose models created in KRA 2.4.”

Show examples:

```text
POST /api/doctors
PUT /api/doctors/:id
DELETE /api/doctors/:id
```

## 2:20–2:50 — Database flow

Show the flow:

```text
React
 ↓
Axios
 ↓
Express Route
 ↓
Controller
 ↓
Mongoose
 ↓
MongoDB
 ↓
JSON Response
 ↓
React
```

Explain:

“This confirms that the API is not returning hard-coded data. The request reaches the server, executes a Mongoose database operation, and returns the result from MongoDB.”

## 2:50–3:20 — Verification

Show:

```bash
cd server
npm install
npm run dev
```

Explain the expected startup:

```text
MongoDB connected
IHROS API running on http://localhost:5000
```

Then demonstrate one GET and one POST/read-back operation.

## 3:20–3:45 — Git and PR

Show:

```bash
git checkout -b feature/database-read-write
git add server
git commit -m "feat: connect API to MongoDB for read and write operations"
git push -u origin feature/database-read-write
```

Then show the Pull Request and add:

```text
@CodiumAI-Agent /review
```

Finally explain that the PR is reviewed and merged.

## Closing

“This completes KRA 2.5. The IHROS APIs now communicate with MongoDB through Mongoose for real read and write operations. The next KRA will build on this foundation with GET API implementation.”
