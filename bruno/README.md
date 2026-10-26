# IHROS API — Bruno Collection

Open this `bruno` folder as a collection in Bruno. The **Local** environment points to `http://localhost:5000/api`; select it before running requests.

## Getting started

1. Start MongoDB and the app with `npm run dev` from the repository root.
2. Run **System → Health Check** to verify the API is available.
3. Run **Authentication → Register** with a new email, or **Login** with an existing account. The response script saves the returned JWT to the `token` environment variable.
4. Run authenticated requests with a role allowed by the endpoint. Resource creation and updates require an administrator or department manager; deletes require a super admin or hospital admin.
5. Create a department before a doctor or bed, then create a patient and doctor before an appointment. Successful create requests save their document IDs in the environment.
6. Use **Patient Files → Upload Patient File** with the included PDF fixture. Upload requires an administrator or department manager. Listing and downloading require a valid JWT.

The environment contains example credentials for local use; replace the demo email/password before sharing the collection. Google sign-in requires a real Google Identity Services ID token configured for the app. The patient-file upload request demonstrates multipart form data and can be changed to any supported PDF, JPEG, or PNG file under 5 MB.

## Coverage

The collection documents all current HTTP API routes:

- Health and dashboard summary
- Registration, password login, Google login, current user, and role assignment
- List, get, create, update, and delete requests for doctors, patients, departments, beds, and appointments
- Patient file upload, metadata listing, and authenticated download

See [API_EXAMPLES.md](../docs/API_EXAMPLES.md) and [KRA_2_14_FILE_UPLOAD.md](../docs/KRA_2_14_FILE_UPLOAD.md) for additional API and file-upload behavior.
