# KRA 2.9 — React Update & Delete Functionality

## Objective

The shared React CRUD page lets authorized users update and delete resource entities through the existing REST API.

## Update Workflow

1. An authorized user selects the pencil action for a table row.
2. The row values populate the form and the heading changes to `Edit record`.
3. Submitting the form sends `PUT /api/<resource>/:id` through the Axios service.
4. The form resets and the list reloads with the updated record.
5. A `Cancel` action exits edit mode without changing the record.

Department managers, hospital admins, and super admins can update records. The UI and backend use the same role policy.

## Delete Workflow

1. A hospital admin or super admin selects the trash action for a table row.
2. The UI asks for confirmation before deleting.
3. Confirming sends `DELETE /api/<resource>/:id` through Axios.
4. The list reloads after a successful deletion.

Delete controls are hidden from department managers because the backend also restricts deletion to hospital admins and super admins. API errors are displayed in the shared alert area.

## Shared Implementation

The behavior is implemented once in `client/src/pages/CrudPage.jsx` and reused by the Doctors, Patients, Departments, Beds, and Appointments pages. The Axios service in `client/src/services/api.js` attaches the JWT to both update and delete requests.

The UI uses stable icon actions with accessible labels and hover titles for edit and delete.
