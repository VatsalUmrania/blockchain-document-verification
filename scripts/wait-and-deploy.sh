#!/bin/bash

# Wait for the blockchain node to be ready
echo "⏳ Waiting for blockchain node to be ready..."
until curl -s -X POST --data '{"jsonrpc":"2.0","method":"net_listening","params":[],"id":1}' http://localhost:8545 > /dev/null 2>&1; do
  sleep 1
done

echo "✅ Blockchain node is ready!"

# Compile contracts
echo "🔨 Compiling contracts..."
npm run compile

# Deploy contracts
echo "🚀 Deploying contracts..."
npx hardhat run scripts/deploy.js --network localhost

# Keep the container running
echo "🏁 Deployment completed. Keeping container running..."
tail -f /dev/null