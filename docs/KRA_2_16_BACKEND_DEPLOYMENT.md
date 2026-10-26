# KRA 2.16 — Backend Deployment on Render

The repository root includes a Render Blueprint in `render.yaml`. It configures the Node web service to install the monorepo lockfile with `npm ci`, start the Express API with `npm run start --workspace server`, and use `/api/health` for health checks.

## Deploy

1. Push the repository to GitHub and sign in to [Render](https://dashboard.render.com/) with your account.
2. Choose **New → Blueprint**, connect `kalviumcommunity/S91_KRAarshanth_Capstone_CareSync`, and select the `main` branch.
3. Review the `ihros-api` service. The Blueprint uses the free web-service plan and generates a private `JWT_SECRET`.
4. Enter the required `MONGO_URI` for your MongoDB Atlas database and `CLIENT_URL` for the deployed frontend origin. Enter the same Google OAuth web client ID used by the frontend as `GOOGLE_CLIENT_ID`.
5. Deploy the Blueprint. Render runs the configured build and start commands; wait for the health check to pass.
6. Verify `https://<your-render-service>.onrender.com/api/health` returns a healthy response.
7. Configure the frontend's `VITE_API_URL` as `https://<your-render-service>.onrender.com/api`. Add the deployed frontend origin to Google OAuth's authorized JavaScript origins.

Never commit production environment values. Keep MongoDB network access restricted to the deployment's trusted outbound addresses where practical, and use synthetic patient data for demonstrations.

## File-storage limitation on the free plan

The free Render service does not provide a persistent disk. Patient files saved by the upload feature can be lost when the service restarts or is redeployed. Do not treat local service storage as durable production patient-file storage. For durable uploads, choose a paid Render service with a persistent disk and set `UPLOAD_DIR` to the disk's mount path, or move uploads to a private object-storage service before handling real patient records.

## Local validation

```bash
npm run build
npm run test --workspace server
```
