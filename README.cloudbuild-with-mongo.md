# Google Cloud Deployment Guide with MongoDB

This guide explains how to deploy the complete Blockchain Document Verification system on Google Cloud, including MongoDB as a service.

## Overview

This deployment includes:

1. MongoDB database service
2. Backend Node.js service
3. Frontend React service

All services are deployed to Google Cloud Run with proper inter-service communication.

## Prerequisites

1. Google Cloud Project with billing enabled
2. Google Cloud SDK installed and configured
3. Cloud Build API enabled
4. Cloud Run API enabled
5. Container Registry API enabled

## Smart Contract Deployment

Before deploying the services, deploy the smart contract to Sepolia testnet:

1. Get Sepolia ETH from a faucet
2. Get an Infura/Alchemy project ID
3. Update your `.env` file with:
   ```
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY
   ```
4. Deploy the contract:
   ```bash
   npm run deploy:sepolia
   ```
5. Note the deployed contract address

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

### 2. Deploy using Cloud Build

```bash
# Submit build with custom substitutions
gcloud builds submit --config cloudbuild-with-mongo.yaml \
  --substitutions=_MONGO_USER="your_mongo_user",_MONGO_PASSWORD="your_secure_mongo_password",_JWT_SECRET="your_secure_jwt_secret",_SESSION_SECRET="your_secure_session_secret",_CONTRACT_ADDRESS="0xYourDeployedContractAddress",_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"
```

## Environment Variables

You must provide these environment variables during deployment:

- `_MONGO_USER`: MongoDB username
- `_MONGO_PASSWORD`: MongoDB password
- `_JWT_SECRET`: Secure JWT secret key
- `_SESSION_SECRET`: Secure session secret key
- `_CONTRACT_ADDRESS`: Address of deployed smart contract on Sepolia
- `_RPC_URL`: Sepolia RPC endpoint (Infura/Alchemy)

## Architecture

1. **MongoDB Service**: Official MongoDB image with persistent storage
2. **Backend Service**: Node.js Express server connecting to MongoDB and Sepolia testnet
3. **Frontend Service**: React/Vite application served statically

## Service Communication

- Backend connects to MongoDB using internal Cloud Run service discovery
- Frontend connects to Backend using the backend service URL
- Backend connects to Sepolia testnet using the provided RPC URL

## Persistent Storage

MongoDB data is persisted using Cloud Run's volume persistence feature:

- 10GB of storage allocated for MongoDB data
- Data persists across service restarts

## Post-Deployment Steps

1. Get the backend service URL:

   ```bash
   gcloud run services describe backend-service --region us-central1 --format "value(status.url)"
   ```

2. Get the frontend service URL:

   ```bash
   gcloud run services describe frontend-service --region us-central1 --format "value(status.url)"
   ```

3. Update frontend environment to point to the backend service
4. Redeploy frontend with updated configuration

## Security Considerations

1. MongoDB service is not publicly accessible
2. Backend service has authentication enabled
3. Use strong, randomly generated secrets for JWT and session
4. MongoDB credentials are passed as environment variables

## Troubleshooting

1. Check Cloud Build logs:

   ```bash
   gcloud builds list
   gcloud builds log BUILD_ID
   ```

2. Check individual service logs:

   ```bash
   gcloud run services logs read mongodb-service --region us-central1
   gcloud run services logs read backend-service --region us-central1
   gcloud run services logs read frontend-service --region us-central1
   ```

3. Verify service-to-service connectivity
4. Ensure environment variables are correctly set
5. Check MongoDB persistence is working correctly
