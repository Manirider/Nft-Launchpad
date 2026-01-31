const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const deploymentConfig = {
    baseURI: process.env.BASE_URI || "ipfs://QmYourIPFSHash/",
    revealedURI: process.env.REVEALED_URI || "ipfs://QmYourRevealedPrereveal/",
    maxSupply: parseInt(process.env.MAX_SUPPLY || "10000"),
    royaltyReceiver: process.env.ROYALTY_RECEIVER || deployer.address,
    royaltyFeeNumerator: parseInt(process.env.ROYALTY_FEE || "500"),
  };

  console.log("Deployment config:", deploymentConfig);

  const MyNFT = await ethers.getContractFactory("MyNFT");
  const contract = await MyNFT.deploy(
    deploymentConfig.baseURI,
    deploymentConfig.revealedURI,
    deploymentConfig.maxSupply,
    deploymentConfig.royaltyReceiver,
    deploymentConfig.royaltyFeeNumerator
  );

  await contract.waitForDeployment();
  console.log("MyNFT deployed to:", contract.target);

  const deployment = {
    contract: "MyNFT",
    address: contract.target,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    timestamp: new Date().toISOString(),
    config: deploymentConfig,
  };

  const fileName = `deployment-${Date.now()}.json`;
  fs.writeFileSync(fileName, JSON.stringify(deployment, null, 2));
  console.log(`Deployment info saved to ${fileName}`);

  const networkName = (await ethers.provider.getNetwork()).name;
  if (
    process.env.ETHERSCAN_API_KEY &&
    process.env.VERIFY_CONTRACT === "true" &&
    networkName !== "unknown" &&
    networkName !== "hardhat" &&
    networkName !== "localhost"
  ) {
    console.log("Waiting for block confirmations before verification...");
    await contract.deploymentTransaction().wait(6);

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contract.target,
        constructorArguments: [
          deploymentConfig.baseURI,
          deploymentConfig.revealedURI || "ipfs://QmRevealedHash/",
          deploymentConfig.maxSupply,
          deploymentConfig.royaltyReceiver,
          deploymentConfig.royaltyFeeNumerator,
        ],
      });
      console.log("Contract verified on Etherscan");
    } catch (err) {
      console.error("Verification failed:", err);
    }
  } else {
    console.log("Skipping verification on local/testing network.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
