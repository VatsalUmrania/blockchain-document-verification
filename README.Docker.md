# Docker Setup for Blockchain Document Verification

This project uses Docker to containerize the blockchain network, backend API, and frontend application.

## Services Overview

1. **blockchain** - Hardhat local blockchain node
2. **backend** - Node.js Express API server
3. **frontend** - React/Vite frontend application
4. **mongo** - MongoDB database
5. **mongo-express** - Web-based MongoDB admin interface

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 1.29+

## Quick Start

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd blockchain-document-verification
   ```

2. Create environment files:

   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

3. Update environment variables in both `.env` files according to your configuration.

4. Build and start all services:

   ```bash
   docker-compose up --build
   ```

5. Access the applications:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Blockchain Node: http://localhost:8545
   - MongoDB Express: http://localhost:8081

## Environment Variables

### Root .env

- `REACT_APP_CONTRACT_ADDRESS` - Deployed contract address
- `SEPOLIA_RPC_URL` - Sepolia network RPC endpoint
- `PRIVATE_KEY` - Private key for deployment
- `ETHERSCAN_API_KEY` - For contract verification

### Backend .env

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token signing
- `SESSION_SECRET` - Secret for session management
- `CONTRACT_ADDRESS` - Smart contract address
- `RPC_URL` - Blockchain RPC endpoint
- `FRONTEND_URL` - Frontend application URL

## Development Workflow

To run in development mode with hot-reloading:

```bash
docker-compose up --build
```

To run in detached mode:

```bash
docker-compose up -d --build
```

To stop all services:

```bash
docker-compose down
```

To stop all services and remove volumes:

```bash
docker-compose down -v
```

## Smart Contract Deployment

1. Start only the blockchain service:

   ```bash
   docker-compose up blockchain
   ```

2. In another terminal, deploy contracts:

   ```bash
   docker-compose exec blockchain npx hardhat run scripts/deploy.js --network localhost
   ```

3. Note the deployed contract address and update it in your environment files.

## Troubleshooting

### Common Issues

1. **Port already in use**: Stop conflicting services or change ports in `docker-compose.yml`
2. **Permission denied**: Ensure Docker daemon is running and you have necessary permissions
3. **Environment variables not loaded**: Check that `.env` files exist and are properly formatted

### Useful Commands

View logs for a specific service:

```bash
docker-compose logs <service-name>
```

Execute commands in a running container:

```bash
docker-compose exec <service-name> <command>
```

Rebuild specific service:

```bash
docker-compose build <service-name>
```
