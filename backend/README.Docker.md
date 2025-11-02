# Backend Docker Setup

This directory contains the Docker configuration for the backend API service of the blockchain document verification system.

## Building the Backend Image

To build the backend Docker image:

```bash
docker build -t blockchain-doc-verification-backend .
```

## Running the Backend Container

To run the backend container:

```bash
docker run -p 5000:5000 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/document_verification \
  -e JWT_SECRET=your_jwt_secret_key_here \
  -e SESSION_SECRET=your_session_secret_here \
  -e CONTRACT_ADDRESS=your_contract_address \
  -e RPC_URL=http://host.docker.internal:8545 \
  -e FRONTEND_URL=http://localhost:5173 \
  blockchain-doc-verification-backend
```

## Environment Variables

The backend service requires the following environment variables:

- `PORT` - Port to run the server on (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token signing
- `SESSION_SECRET` - Secret for session management
- `CONTRACT_ADDRESS` - Smart contract address
- `RPC_URL` - Blockchain RPC endpoint
- `FRONTEND_URL` - Frontend application URL

## Using with Docker Compose

For the easiest setup, use the docker-compose.yml file in the root directory which will orchestrate all services including the backend.
