# KRA 2.5 — Database Read & Write Operations

## Objective

Connect the IHROS Node.js/Express server to MongoDB and ensure that API calls perform real database operations through Mongoose.

## Database Connection

The database connection is implemented in:

`server/src/config/db.js`

The server reads `MONGO_URI` from the environment and calls:

```js
await mongoose.connect(process.env.MONGO_URI);
```

The application starts the Express server only after the database connection succeeds.

## API → Database Flow

```text
React Client
    ↓
Axios HTTP Request
    ↓
Express Route
    ↓
Authentication / Validation
    ↓
Controller
    ↓
Mongoose Model
    ↓
MongoDB
    ↓
Database Result
    ↓
JSON API Response
    ↓
React UI
```

## Read Operations

The generic CRUD controller performs real MongoDB reads.

### List records

```js
const data = await Model.find(filter)
  .sort({ createdAt: -1 })
  .limit(...)
  .skip(...);

const total = await Model.countDocuments(filter);
```

This is used by resource GET endpoints such as:

```text
GET /api/doctors
GET /api/patients
GET /api/departments
GET /api/beds
GET /api/appointments
```

### Read one record

```js
const item = await Model.findById(req.params.id);
```

Example:

```text
GET /api/doctors/:id
```

## Write Operations

### Create

```js
const item = await Model.create(req.body);
```

Example:

```text
POST /api/doctors
POST /api/patients
POST /api/departments
POST /api/beds
POST /api/appointments
```

### Update

```js
const item = await Model.findByIdAndUpdate(
  req.params.id,
  req.body,
  { new: true, runValidators: true }
);
```

Example:

```text
PUT /api/doctors/:id
```

### Delete

```js
const item = await Model.findByIdAndDelete(req.params.id);
```

Example:

```text
DELETE /api/doctors/:id
```

## Environment Configuration

Create:

`server/.env`

Example:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ihros
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

## Verification

Start MongoDB, then run the server:

```bash
cd server
npm install
npm run dev
```

A successful startup should print:

```text
MongoDB connected
IHROS API running on http://localhost:5000
```

The API can then be tested with Postman, Thunder Client, curl, or the IHROS React client.

## KRA Scope

This KRA demonstrates:

- Server-to-MongoDB connection
- Mongoose database reads
- Mongoose database writes
- API routes that execute database operations
- JSON responses from database results
- Error handling for missing records
- Validation before database operations
