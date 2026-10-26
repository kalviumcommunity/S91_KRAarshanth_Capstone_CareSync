# KRA 2.14 — File Upload

IHROS supports authenticated file uploads associated with patient records. Files are saved to the server's private `uploads` directory; they are not exposed as static public assets. Set `UPLOAD_DIR` in `server/.env` to use a persistent storage volume or another private directory in deployment.

## Supported files

- PDF, JPEG, and PNG
- Maximum size: 5 MB per file
- The server checks the filename extension, declared media type, and file signature before saving metadata.

## API

All endpoints require a valid bearer token. Uploads are limited to super admins, hospital admins, and department managers; authenticated users can list and download files.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/patients/:patientId/files` | Upload one multipart file using the `file` field |
| `GET` | `/api/patients/:patientId/files` | List a patient's uploaded file metadata |
| `GET` | `/api/patients/:patientId/files/:fileId/download` | Download a file through the authenticated API |

The upload returns `201 Created` with the stored file metadata. Unsupported file types return `400`, files larger than 5 MB return `413`, and unknown patients or files return `404`.
