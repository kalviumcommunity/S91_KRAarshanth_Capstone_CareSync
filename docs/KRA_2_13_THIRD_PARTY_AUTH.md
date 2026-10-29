# KRA 2.13 — Third-Party Authentication

IHROS supports Google sign-in alongside its existing email/password flow.

## Setup

1. Create a Google OAuth **Web application** client in Google Cloud Console and configure the consent screen.
2. Add the development and production website origins to the OAuth client's authorized JavaScript origins.
3. Set the same client ID in `server/.env` as `GOOGLE_CLIENT_ID` and in `client/.env` as `VITE_GOOGLE_CLIENT_ID`.
4. Restart both applications after changing environment variables.

The client uses Google Identity Services to receive an ID credential. It sends that credential to `POST /api/auth/google`; the server verifies the signature and audience against `GOOGLE_CLIENT_ID` before using any profile claims.

## Account behavior

- Google accounts must have a verified email address.
- First-time Google sign-ins create nurse-level accounts; an administrator must grant elevated roles.
- Existing Google identities sign in to the same account.
- A verified Google identity with the same email as an existing account is linked automatically, allowing direct Google sign-in while preserving the existing account's role and password.
- If that account is already linked to a different Google identity, sign-in returns HTTP 409 instead of replacing the link.
- Google-only accounts do not have a local password; password login continues to use the existing email/password checks.
- The API returns the same JWT and safe user profile shape used by the existing login flow.

## Endpoint

`POST /api/auth/google`

```json
{ "credential": "<Google Identity Services ID token>" }
```

Successful authentication returns HTTP 200 with a session JWT and user profile. Invalid credentials or unverified email claims return HTTP 401. A Google verification service outage is treated as a server error rather than as invalid user credentials.

Automated API tests mock Google's token verification at the service boundary and cover account creation, repeat sign-in, verified-email linking, conflicting Google identities, unverified email, and invalid credentials.
