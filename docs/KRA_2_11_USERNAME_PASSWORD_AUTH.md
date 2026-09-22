# KRA 2.11 — Username & Password Authentication

## Objective

IHROS authenticates users with an email username and password. Passwords are hashed with bcrypt before storage and are never returned by API responses.

## Registration

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Hospital Admin",
  "email": "admin@example.com",
  "password": "a-secure-password",
  "role": "hospital_admin"
}
```

Registration validates the name, email, password length, and role. The `User` model hashes the password with bcrypt in a Mongoose `pre('save')` hook. A successful response returns a safe user object and a session token without exposing the password.

## Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "a-secure-password"
}
```

The login controller loads the password-protected user record, compares the submitted password with bcrypt, rejects inactive or invalid credentials with HTTP 401, and returns the authenticated user's safe profile and token on success.

## React Authentication Flow

- `Register.jsx` collects name, email, password, and role.
- `Login.jsx` collects email and password and displays API errors.
- `AuthContext.jsx` stores the token and user profile in local storage after registration or login.
- On reload, `AuthContext` calls `GET /api/auth/me` to restore the authenticated session.
- `api.js` attaches the token to subsequent API requests.

## Security Controls

- Passwords use bcrypt with a cost factor of 12.
- Password selection is disabled by default in Mongoose queries.
- Passwords are excluded from safe API responses.
- Authentication endpoints are rate limited.
- Duplicate emails return HTTP 409.
- Invalid credentials return the same generic HTTP 401 message.

## Verification

A KRA 2.11 verification registers a temporary user, logs in with the correct password, confirms that an incorrect password returns HTTP 401, and calls `/api/auth/me` with the returned token to confirm the authenticated session. The temporary user can then be removed from MongoDB.
