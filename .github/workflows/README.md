# CI/CD pipeline

## Workflows

| File | Trigger | What it does |
|---|---|---|
| `ci.yml` | PRs to `master`, pushes to non-master branches | Frontend: `npm ci`, `npm run lint`, `tsc --noEmit`, `npm run build`. Backend: `pip install`, `compileall`, smoke-import `create_app()`. |
| `deploy.yml` | Push to `master` (or manual dispatch) | Builds `ringo-backend` and `ringo-frontend` images via Cloud Build, tags them with the 12-char commit SHA, pushes to Artifact Registry (`us-central1-docker.pkg.dev/.../ringo`), then runs `gcloud run deploy --image=...` for each service. Frontend and backend run in parallel. |

## Auth model

GitHub Actions authenticates to GCP via **Workload Identity Federation** — no service-account JSON keys are stored in GitHub. The WIF provider is scoped to `assertion.repository_owner == 'Aryan-maddh'`, so only workflows from this owner's repos can mint GCP tokens with the `gh-deployer@nice-opus-474509-s1.iam.gserviceaccount.com` identity.

Roles granted to `gh-deployer`:
- `roles/run.admin` — deploy Cloud Run services
- `roles/iam.serviceAccountUser` — let Cloud Run revisions use the runtime SA
- `roles/artifactregistry.writer` — push images
- `roles/cloudbuild.builds.editor` — submit Cloud Build jobs
- `roles/storage.admin` — Cloud Build needs to upload source tarballs
- `roles/secretmanager.admin` — manage backend secrets when needed

## Required GitHub repository variables

Set these in **Settings → Secrets and variables → Actions → Variables** (NOT Secrets — they're identifiers, not credentials):

| Name | Value |
|---|---|
| `GCP_PROJECT_ID` | `nice-opus-474509-s1` |
| `WIF_PROVIDER` | `projects/281574336283/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `GCP_DEPLOYER_SA` | `gh-deployer@nice-opus-474509-s1.iam.gserviceaccount.com` |

## Rolling back

Cloud Run keeps every revision. To roll back without touching this repo:

```bash
gcloud run services update-traffic ringo-backend \
  --region us-central1 \
  --to-revisions=ringo-backend-<SHA>=100
```

## Secret Manager

Sensitive backend env vars (`DATABASE_URL`, `JWT_SECRET_KEY`, `SECRET_KEY`, `TWILIO_*`, `STRIPE_*`, `ADMIN_PASSWORD`) live in Secret Manager and are wired into the Cloud Run service as `--set-secrets`. The runtime SA (`281574336283-compute@developer.gserviceaccount.com`) has `roles/secretmanager.secretAccessor` on each one. To rotate a secret:

```bash
printf "%s" "new-value" | gcloud secrets versions add ringo-jwt-secret --data-file=-
gcloud run services update ringo-backend --region us-central1
```

Cloud Run picks up the new version on the next revision because the service config uses `:latest`.
