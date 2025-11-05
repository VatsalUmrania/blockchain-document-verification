# Frontend Docker Setup

This directory contains the Docker configuration for the frontend application of the blockchain document verification system.

## Building the Frontend Image

To build the frontend Docker image:

```bash
docker build -t blockchain-doc-verification-frontend .
```

## Running the Frontend Container

To run the frontend container:

```bash
docker run -p 5173:5173 blockchain-doc-verification-frontend
```

## Environment Variables

The frontend application can be configured with the following environment variables:

- `VITE_APP_CONTRACT_ADDRESS` - Smart contract address
- `VITE_APP_RPC_URL` - Blockchain RPC endpoint
- `VITE_APP_BACKEND_URL` - Backend API URL

These should be set in a `.env.production` file in the frontend directory.

## Using with Docker Compose

For the easiest setup, use the docker-compose.yml file in the root directory which will orchestrate all services including the frontend.

The frontend will be available at http://localhost:5173 when running through docker-compose.
