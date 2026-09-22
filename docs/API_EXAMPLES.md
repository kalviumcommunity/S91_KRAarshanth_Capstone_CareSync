# API examples

## Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Aarsh",
  "email": "admin@example.com",
  "password": "StrongPass123!",
  "role": "hospital_admin"
}
```

## Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "StrongPass123!"
}
```

The response includes a JWT. Subsequent protected calls use:

```http
Authorization: Bearer <JWT>
```

## Authorization behavior

- Missing/invalid token → `401 Unauthorized`
- Valid token but insufficient role → `403 Forbidden`
- Valid token + allowed role → request proceeds
