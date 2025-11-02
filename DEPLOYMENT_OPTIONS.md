# Blockchain Document Verification - Deployment Options

This document outlines the different deployment options for the Blockchain Document Verification system, from local development to production deployment on Google Cloud.

## Overview

The system consists of four main components:

1. **Smart Contracts**: Solidity contracts deployed to a blockchain
2. **Backend**: Node.js/Express API server
3. **Frontend**: React/Vite web application
4. **Database**: MongoDB for user and document metadata

## Deployment Options

### Option 1: Local Development (Docker Compose)

For local development and testing:

```bash
# Build and run all services
docker-compose up --build
```

This uses the existing `compose.yaml` file and runs all services locally:

- Hardhat node for local blockchain
- Contract deployment
- Backend API
- Frontend web app
- MongoDB database

### Option 2: Simplified Cloud Deployment (cloudbuild-simple.yaml)

Deploy only backend and frontend to Google Cloud Run, using:

- Sepolia testnet for smart contracts
- MongoDB Atlas for database

**Pros:**

- Simplest to deploy
- Lowest cost
- No infrastructure management

**Cons:**

- Depends on external services (Sepolia, MongoDB Atlas)

**Use when:**

- Testing the application
- Demonstrating functionality
- Development environment

### Option 3: Full Cloud Deployment (cloudbuild-with-mongo.yaml)

Deploy all services to Google Cloud Run:

- Backend and frontend on Cloud Run
- MongoDB on Cloud Run with persistence
- Sepolia testnet for smart contracts

**Pros:**

- Self-contained database
- More control over infrastructure
- Better for production use

**Cons:**

- More complex setup
- Higher cost
- More services to manage

**Use when:**

- Production deployment
- Need for data control
- Enterprise environments

### Option 4: Complete Blockchain Deployment (cloudbuild.yaml)

Deploy everything including a private blockchain node:

- Full blockchain node on Cloud Run
- Backend and frontend on Cloud Run
- MongoDB on Cloud Run with persistence

**Pros:**

- Complete control over blockchain
- Private network
- No dependency on public testnets

**Cons:**

- Most complex setup
- Highest cost
- Requires blockchain expertise
- Persistent data management challenges

**Use when:**

- Private blockchain required
- Enterprise blockchain solutions
- Complete isolation needed

## Recommended Approach

For most use cases, we recommend:

1. **Development**: Use Docker Compose locally
2. **Testing/Staging**: Use simplified cloud deployment with Sepolia
3. **Production**: Use full cloud deployment with MongoDB Atlas

## Environment Configuration

### Local Development (.env files)

Create `.env` files in each service directory:

**Root .env:**

```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

**Backend .env:**

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/document_verification
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RPC_URL=http://localhost:8545
FRONTEND_URL=http://localhost:5173
```

**Frontend .env:**

```
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_RPC_URL=http://localhost:8545
```

### Cloud Deployment

For cloud deployment, environment variables are set through the cloudbuild.yaml files or Cloud Run service configuration.

## Deployment Steps Summary

### For Local Development:

1. Install dependencies: `npm run install:all`
2. Start services: `docker-compose up --build`

### For Cloud Deployment:

1. Deploy smart contracts to Sepolia: `npm run deploy:sepolia`
2. Note the contract address
3. Configure environment variables
4. Deploy using chosen cloudbuild.yaml:
   ```bash
   gcloud builds submit --config cloudbuild-simple.yaml --substitutions=...
   ```

## Monitoring and Maintenance

### Local Development:

- Use Docker Desktop for monitoring
- Check service logs with `docker-compose logs`

### Cloud Deployment:

- Use Google Cloud Console for monitoring
- Set up Cloud Monitoring alerts
- Regular backups for MongoDB data

## Scaling Considerations

### Backend Service:

- Can be scaled automatically based on request volume
- Statelessness allows for easy horizontal scaling

### Frontend Service:

- Scales automatically with traffic
- Static content delivery

### Database:

- MongoDB Atlas provides automatic scaling options
- For self-hosted MongoDB, manual scaling required

### Blockchain:

- Sepolia testnet is managed by Ethereum community
- For private blockchain, consider node redundancy

## Security Best Practices

1. **Secrets Management**:

   - Never commit secrets to version control
   - Use Google Secret Manager for cloud deployments
   - Rotate secrets regularly

2. **Network Security**:

   - Use HTTPS for all communications
   - Restrict database access
   - Implement proper CORS policies

3. **Authentication**:

   - Use strong JWT secrets
   - Implement rate limiting
   - Validate all inputs

4. **Data Protection**:
   - Encrypt sensitive data at rest
   - Use parameterized queries to prevent injection
   - Regular security audits

## Cost Considerations

### Google Cloud Pricing:

- Cloud Run: Pay per request and compute time
- Container Registry: Storage and network egress
- Cloud Build: Free tier available
- MongoDB (if self-hosted): Compute and storage costs

### Recommendations:

- Start with free tiers
- Set budget alerts
- Monitor usage regularly
- Consider MongoDB Atlas for managed database

## Troubleshooting Common Issues

### Deployment Failures:

1. Check Cloud Build logs
2. Verify environment variables
3. Ensure proper IAM permissions

### Service Connectivity:

1. Check service URLs
2. Verify network settings
3. Confirm inter-service authentication

### Performance Issues:

1. Monitor resource usage
2. Check for memory leaks
3. Optimize database queries

This document provides a comprehensive guide to deploying the Blockchain Document Verification system in various environments. Choose the option that best fits your requirements and expertise level.
