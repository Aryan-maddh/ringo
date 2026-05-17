# Deploy Ringo To Google Cloud Run

This repo deploys as two Cloud Run services:

- `ringo-backend`: Flask API
- `ringo-frontend`: Next.js app, with `/api/*` proxied to the backend

## Backend

Production is configured to use Cloud SQL Postgres:

- Instance: `ringo-postgres`
- Database: `ringo`
- User: `ringo_user`
- Connection name: `nice-opus-474509-s1:us-central1:ringo-postgres`
- Backend URL: `https://ringo-backend-ucfchnoxpa-uc.a.run.app`

## Frontend

After the backend deploy finishes, copy its URL and deploy:

```powershell
gcloud run deploy ringo-frontend `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars "BACKEND_API_URL=https://ringo-backend-ucfchnoxpa-uc.a.run.app,NEXT_PUBLIC_API_URL="
```

Then update backend CORS:

```powershell
gcloud run services update ringo-backend `
  --region us-central1 `
  --update-env-vars "FRONTEND_URL=https://ringo-frontend-ucfchnoxpa-uc.a.run.app,BASE_URL=https://ringo-backend-ucfchnoxpa-uc.a.run.app"
```
