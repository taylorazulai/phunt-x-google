#!/usr/bin/env bash
set -e

# ==============================================================================
# ChallengerPage — Google Cloud Run Automated Deployment Script
# ==============================================================================

PROJECT_ID=${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || echo "powermindai")}
SERVICE_NAME="challenger-page"
REGION="us-central1"
IMAGE_TAG="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "=================================================================="
echo "🚀 Deploying ${SERVICE_NAME} to Google Cloud Run"
echo "Project: ${PROJECT_ID} | Region: ${REGION}"
echo "=================================================================="

# 1. Enable Required GCP APIs
echo "==> [1/5] Ensuring required Google Cloud APIs are enabled..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  containerregistry.googleapis.com \
  artifactregistry.googleapis.com \
  --project="${PROJECT_ID}"

# 2. Configure Secret Manager Access for Cloud Run Service Account
echo "==> [2/5] Configuring Secret Manager IAM permissions..."
PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format="value(projectNumber)")
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Binding roles/secretmanager.secretAccessor to ${COMPUTE_SA}..."
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None \
  --quiet >/dev/null 2>&1 || true

# 3. Build Container via Google Cloud Build
echo "==> [3/5] Submitting container build to Google Cloud Build..."
gcloud builds submit --tag "${IMAGE_TAG}" --project="${PROJECT_ID}"

# 4. Deploy to Google Cloud Run with Secret Manager Mounts
echo "==> [4/5] Deploying container to Cloud Run with Secret Manager mounts..."
gcloud run deploy "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --image="${IMAGE_TAG}" \
  --platform=managed \
  --region="${REGION}" \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --set-env-vars="NODE_ENV=production,GEMINI_MODEL=gemini-3.8-flash" \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest,OUTSCRAPER_API_KEY=OUTSCRAPER_API_KEY:latest,UPSTASH_REDIS_REST_URL=UPSTASH_REDIS_REST_URL:latest,UPSTASH_REDIS_REST_TOKEN=UPSTASH_REDIS_REST_TOKEN:latest"

# 5. Output Public Service URL
echo "==> [5/5] Deployment complete! Service details:"
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" --platform=managed --region="${REGION}" --project="${PROJECT_ID}" --format='value(status.url)')
echo "=================================================================="
echo "🎉 ChallengerPage is LIVE at: ${SERVICE_URL}"
echo "Health Check: ${SERVICE_URL}/api/health"
echo "=================================================================="
