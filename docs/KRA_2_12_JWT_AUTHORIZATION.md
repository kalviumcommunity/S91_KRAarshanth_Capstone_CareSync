# KRA 2.12 — JWT Authorization

## Objective

IHROS uses JSON Web Tokens to maintain authenticated sessions and protect API resources after login or registration.

## Token Issuance

The auth controller signs a token containing the user id and role:

```js
jwt.sign(
  { sub: user._id.toString(), role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
);
```

The token is returned by `POST /api/auth/register` and `POST /api/auth/login`. The secret and expiration are loaded from the server environment.

## Token Verification

The `authenticate` middleware:

1. Requires an `Authorization: Bearer <token>` header.
2. Verifies the signature and expiration with `jwt.verify()`.
3. Loads the active user from MongoDB using the token subject.
4. Places the safe user record on `req.user` for downstream handlers.
5. Returns HTTP 401 for missing, invalid, expired, or inactive sessions.

Resource GET, POST, PUT, DELETE, and dashboard routes use this middleware. The React Axios interceptor reads the stored token and sends it on every API request.

## Role Authorization

The `authorize(...roles)` middleware checks `req.user.role` after authentication. For example, resource creation and updates allow managers and admins, while deletion is restricted to super admins and hospital admins. A valid token with an unauthorized role receives HTTP 403.

## Verification

JWT verification is demonstrated by:

```text
GET /api/auth/me with a valid Bearer token -> HTTP 200
GET /api/doctors without a token -> HTTP 401
GET /api/doctors with an invalid token -> HTTP 401
POST /api/doctors with a valid manager/admin token -> HTTP 201
DELETE /api/doctors with a manager token -> HTTP 403
```

The verification uses temporary users and records, then removes them from MongoDB.
