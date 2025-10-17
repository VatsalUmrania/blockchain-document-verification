// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment of DocumentVerification contract...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  console.log("\n📄 Deploying DocumentVerification contract...");
  const DocumentVerification = await hre.ethers.getContractFactory("DocumentVerification");
  const documentVerification = await DocumentVerification.deploy();

  // Wait for deployment to complete
  await documentVerification.waitForDeployment();

  console.log("✅ DocumentVerification contract deployed successfully!");
  console.log("📍 Contract address:", await documentVerification.getAddress());
  console.log(
    "🔗 Transaction hash:",
    documentVerification.deploymentTransaction().hash
  );

  // Get network information
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId + ")");

  // Get deployer information
  console.log("👤 Deployed by:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");

  // Save deployment information
  const contractAddress = await documentVerification.getAddress();
    const deploymentTx = documentVerification.deploymentTransaction();

  const deploymentInfo = {
    contractAddress: contractAddress,
    transactionHash: deploymentTx.hash,
    deployer: deployer.address,
    network: network.name,
    chainId: network.chainId.toString(), // Convert BigInt to string
    deploymentTime: new Date().toISOString(),
    gasUsed: deploymentTx.gasLimit?.toString(),
    gasPrice: deploymentTx.gasPrice?.toString(),
  };

  // Write deployment info to file
  const fs = require("fs");
  const path = require("path");

  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentDir,
    `deployment-${network.name}-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("📄 Deployment info saved to:", deploymentFile);

  // Verify contract on Etherscan (if not local network)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    const deploymentTx = documentVerification.deploymentTransaction();
    await deploymentTx.wait(6); // Wait for 6 confirmations

    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      console.log("❌ Error verifying contract:", error.message);
    }
  }

  console.log("✅ DocumentVerification deployed to:", contractAddress);

  // ⚠️ SKIP auto-registration - Let users register from frontend
  console.log("\n⚠️  Institution registration skipped");
  console.log("📝 Please register your institution from the frontend:");
  console.log("   1. Go to Document Issuance Workflow");
  console.log("   2. Fill in institution details (name, registration number, contact)");
  console.log("   3. Click 'Register Institution'");
  console.log("   4. Switch to owner account and verify the institution");

  console.log("\n📋 Contract Details:");
  console.log("   • Contract Address:", contractAddress);
  console.log("   • Owner Address:", deployer.address);
  console.log("   • Network:", (await hre.ethers.provider.getNetwork()).name);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n💡 Add this to your .env files:");
  console.log(`\nBackend (.env):`);
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`RPC_URL=http://127.0.0.1:8545`);
  console.log(`\nFrontend (.env):`);
  console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`VITE_RPC_URL=http://127.0.0.1:8545`);

  console.log("\n📖 Next Steps:");
  console.log("1. Update .env files with contract address");
  console.log("2. Restart backend: cd backend && npm run dev");
  console.log("3. Restart frontend: cd frontend_new && npm run dev");
  console.log("4. Register institution from the frontend workflow");
  console.log("5. Verify institution using owner account");
  console.log("6. Issue documents with your custom institution name!");
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

module.exports = main;
