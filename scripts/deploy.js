// scripts/deploy.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of DocumentVerification contract...\n");

  // Get deployer and network info
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  // Display deployment info
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId + ")\n");

  // Deploy contract
  console.log("📄 Deploying DocumentVerification contract...");
  const DocumentVerification = await hre.ethers.getContractFactory("DocumentVerification");
  const contract = await DocumentVerification.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deploymentTx = contract.deploymentTransaction();

  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 Transaction hash:", deploymentTx.hash);

  // Get network RPC URL
  const rpcUrl = hre.network.config.url || process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:8545";

  // Save deployment info
  saveDeploymentInfo({
    contractAddress,
    transactionHash: deploymentTx.hash,
    deployer: deployer.address,
    network: network.name,
    chainId: network.chainId.toString(),
    rpcUrl,
    deploymentTime: new Date().toISOString(),
    gasUsed: deploymentTx.gasLimit?.toString(),
    gasPrice: deploymentTx.gasPrice?.toString(),
  });

  // Verify on Etherscan (skip for local networks)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    await verifyContract(contractAddress, deploymentTx);
  }

  // Display next steps
  displayNextSteps(contractAddress, deployer.address, network.name, rpcUrl);
}

/**
 * Save deployment information to JSON file
 */
function saveDeploymentInfo(info) {
  const deploymentDir = path.join(__dirname, "../deployments");
  
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const filename = `deployment-${info.network}-${Date.now()}.json`;
  const filepath = path.join(deploymentDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(info, null, 2));
  console.log("📄 Deployment info saved to:", filepath);
}

/**
 * Verify contract on Etherscan
 */
async function verifyContract(contractAddress, deploymentTx) {
  console.log("\n⏳ Waiting for block confirmations...");
  await deploymentTx.wait(6);

  console.log("🔍 Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified on Etherscan!");
  } catch (error) {
    console.log("❌ Verification error:", error.message);
  }
}

/**
 * Display post-deployment instructions
 */
function displayNextSteps(contractAddress, ownerAddress, networkName, rpcUrl) {
  console.log("\n📋 Contract Details:");
  console.log("   • Contract Address:", contractAddress);
  console.log("   • Owner Address:", ownerAddress);
  console.log("   • Network:", networkName);
  console.log("   • RPC URL:", rpcUrl);

  console.log("\n⚠️  Institution Registration");
  console.log("Please register your institution from the frontend:");
  console.log("   1. Go to Document Issuance Workflow");
  console.log("   2. Fill in institution details");
  console.log("   3. Click 'Register Institution'");
  console.log("   4. Verify institution using owner account");

  console.log("\n💡 Environment Variables:");
  console.log("\nBackend (.env):");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`RPC_URL=${rpcUrl}`);
  
  console.log("\nFrontend (.env):");
  console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`VITE_RPC_URL=${rpcUrl}`);

  console.log("\n📖 Next Steps:");
  console.log("1. Update .env files with contract address and RPC URL");
  console.log("2. Restart backend: cd backend && npm run dev");
  console.log("3. Restart frontend: cd frontend_new && npm run dev");
  console.log("4. Register and verify your institution");
  console.log("5. Start issuing blockchain-verified documents!");

  console.log("\n🎉 Deployment completed successfully!\n");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

module.exports = main;
