// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment of DocumentVerification contract...");

  // Get the contract factory
  const DocumentVerification = await ethers.getContractFactory(
    "DocumentVerification"
  );

  // Deploy the contract
  console.log("📦 Deploying contract...");
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
  const [deployer] = await ethers.getSigners();
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

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Next steps:");
  console.log(
    "1. Update your frontend configuration with the contract address"
  );
  console.log(
    "2. Register institutions using the registerInstitution function"
  );
  console.log(
    "3. Verify institutions using the verifyInstitution function (owner only)"
  );
  console.log("4. Start issuing documents!");

  return {
    contractAddress: contractAddress,
    contract: documentVerification,
  };
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

module.exports = main;
