# Simplified Google Cloud Deployment Guide

This guide explains how to deploy the Blockchain Document Verification system on Google Cloud using Cloud Build and Cloud Run. This simplified version focuses on deploying the backend and frontend services, using a public testnet (Sepolia) instead of a local blockchain.

## Why Simplified Version?

The full blockchain node deployment on Cloud Run is complex due to:

1. Persistent data storage requirements
2. Network connectivity challenges
3. Long-running process limitations

This simplified version uses the Sepolia testnet for smart contract deployment.

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
gcloud builds submit --config cloudbuild-simple.yaml \
  --substitutions=_MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/document_verification",_JWT_SECRET="your_secure_jwt_secret",_SESSION_SECRET="your_secure_session_secret",_CONTRACT_ADDRESS="0xYourDeployedContractAddress",_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"
```

## Environment Variables

You must provide these environment variables during deployment:

- `_MONGO_URI`: MongoDB connection string (use MongoDB Atlas for cloud MongoDB)
- `_JWT_SECRET`: Secure JWT secret key
- `_SESSION_SECRET`: Secure session secret key
- `_CONTRACT_ADDRESS`: Address of deployed smart contract on Sepolia
- `_RPC_URL`: Sepolia RPC endpoint (Infura/Alchemy)

## Architecture

1. **Backend Service**: Node.js Express server connecting to MongoDB and Sepolia testnet
2. **Frontend Service**: React/Vite application served statically

## Post-Deployment Steps

1. Get the backend service URL:

   ```bash
   gcloud run services describe backend-service --region us-central1 --format "value(status.url)"
   ```

2. Update frontend environment variables to point to the backend service
3. Redeploy frontend with updated environment variables

## Troubleshooting

1. Check Cloud Build logs:

   ```bash
   gcloud builds list
   gcloud builds log BUILD_ID
   ```

2. Check Cloud Run service logs:

   ```bash
   gcloud run services logs read SERVICE_NAME --region us-central1
   ```

3. Ensure environment variables are correctly set
4. Verify smart contract is deployed and accessible on Sepolia
