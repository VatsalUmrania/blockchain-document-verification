# Google Cloud Deployment Guide

This guide explains how to deploy the Blockchain Document Verification system on Google Cloud using Cloud Build and Cloud Run.

## Prerequisites

1. Google Cloud Project with billing enabled
2. Google Cloud SDK installed and configured
3. Cloud Build API enabled
4. Cloud Run API enabled
5. Container Registry API enabled

## Deployment Steps

### 1. Set up Google Cloud

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Configure Substitutions

The cloudbuild.yaml file uses substitutions that you need to provide during deployment:

- `_GCR_HOSTNAME`: Container Registry hostname (default: gcr.io)
- `_DEPLOY_REGION`: Region for Cloud Run services (default: us-central1)
- `_SERVICE_BLOCKCHAIN`: Name for blockchain service (default: blockchain-service)
- `_SERVICE_BACKEND`: Name for backend service (default: backend-service)
- `_SERVICE_FRONTEND`: Name for frontend service (default: frontend-service)
- `_MONGO_URI`: MongoDB connection string
- `_JWT_SECRET`: JWT secret key
- `_SESSION_SECRET`: Session secret key
- `_CONTRACT_ADDRESS`: Deployed contract address
- `_RPC_URL`: Blockchain RPC URL
- `_FRONTEND_URL`: Frontend service URL

### 3. Deploy using Cloud Build

```bash
# Submit build with default substitutions
gcloud builds submit --config cloudbuild.yaml

# Or submit with custom substitutions
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_DEPLOY_REGION=us-west1,_SERVICE_BACKEND=my-backend-service
```

### 4. Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Build and push images
docker build -t gcr.io/YOUR_PROJECT_ID/blockchain-service:latest .
docker build -t gcr.io/YOUR_PROJECT_ID/backend-service:latest ./backend
docker build -t gcr.io/YOUR_PROJECT_ID/frontend-service:latest ./frontend_new

docker push gcr.io/YOUR_PROJECT_ID/blockchain-service:latest
docker push gcr.io/YOUR_PROJECT_ID/backend-service:latest
docker push gcr.io/YOUR_PROJECT_ID/frontend-service:latest

# Deploy to Cloud Run
gcloud run deploy blockchain-service \
  --image gcr.io/YOUR_PROJECT_ID/blockchain-service:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8545

gcloud run deploy backend-service \
  --image gcr.io/YOUR_PROJECT_ID/backend-service:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 5000 \
  --set-env-vars NODE_ENV=production,PORT=5000,MONGO_URI=your_mongo_uri

gcloud run deploy frontend-service \
  --image gcr.io/YOUR_PROJECT_ID/frontend-service:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 5173
```

## Environment Variables

Make sure to update the environment variables in the cloudbuild.yaml file or provide them during deployment:

- For MongoDB, you might want to use MongoDB Atlas or deploy a MongoDB instance separately
- Update the contract address after deploying the smart contract
- Update the RPC URL to point to your deployed blockchain service
- Generate secure secrets for JWT and Session

## Architecture Considerations

1. **Blockchain Service**: Runs Hardhat node for local blockchain development
2. **Backend Service**: Node.js Express server with MongoDB connection
3. **Frontend Service**: React/Vite application served statically

## Troubleshooting

1. If deployment fails, check Cloud Build logs:

   ```bash
   gcloud builds list
   gcloud builds log BUILD_ID
   ```

2. For service issues, check Cloud Run logs:

   ```bash
   gcloud run services list
   gcloud run services logs read SERVICE_NAME
   ```

3. Ensure all services can communicate with each other (especially backend to blockchain)
