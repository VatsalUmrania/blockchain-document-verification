#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Decentralized Document Verification System...\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ Node.js version 16 or higher is required');
  console.error(`   Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if required files exist
const requiredFiles = [
  'package.json',
  'hardhat.config.js',
  'contracts/DocumentVerification.sol'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Required file missing: ${file}`);
    process.exit(1);
  }
}

console.log('✅ Required files found');

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
  
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
  
  execSync('cd backend && npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Create .env file if it doesn't exist
if (!fs.existsSync('.env')) {
  console.log('\n📝 Creating .env file...');
  try {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created from .env.example');
    console.log('⚠️  Please update .env with your actual configuration');
  } catch (error) {
    console.error('❌ Failed to create .env file');
  }
}

// Compile smart contracts
console.log('\n🔨 Compiling smart contracts...');
try {
  execSync('npx hardhat compile', { stdio: 'inherit' });
  console.log('✅ Smart contracts compiled successfully');
} catch (error) {
  console.error('❌ Failed to compile smart contracts');
  process.exit(1);
}

// Check if MetaMask is mentioned in setup
console.log('\n🦊 MetaMask Setup Required:');
console.log('   1. Install MetaMask browser extension');
console.log('   2. Create or import a wallet');
console.log('   3. Add test networks (Sepolia, Mumbai)');
console.log('   4. Get test ETH from faucets');

// Display next steps
console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next Steps:');
console.log('   1. Update .env file with your configuration');
console.log('   2. Deploy smart contract: npm run deploy:sepolia');
console.log('   3. Update REACT_APP_CONTRACT_ADDRESS in .env');
console.log('   4. Start development server: npm run dev');

console.log('\n🔗 Useful Links:');
console.log('   • Sepolia Faucet: https://sepoliafaucet.com/');
console.log('   • Mumbai Faucet: https://faucet.polygon.technology/');
console.log('   • Infura: https://infura.io/');
console.log('   • Etherscan: https://etherscan.io/');

console.log('\n📚 Documentation:');
console.log('   • README.md - Complete setup guide');
console.log('   • contracts/ - Smart contract documentation');
console.log('   • frontend/src/ - Frontend component documentation');

console.log('\n✨ Happy coding!');
