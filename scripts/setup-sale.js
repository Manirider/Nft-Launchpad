const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Setting up sale with account:", deployer.address);

  const deploymentFiles = fs.readdirSync(".").filter(f => f.startsWith("deployment-") && f.endsWith(".json"));
  const latestDeployment = deploymentFiles.sort().pop();
  
  if (!latestDeployment) {
    console.error("No deployment file found. Please deploy the contract first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(latestDeployment));
  console.log("Using contract at:", deployment.address);

  const MyNFT = await ethers.getContractFactory("MyNFT");
  const contract = MyNFT.attach(deployment.address);

  const allowlistPath = path.join(__dirname, "../allowlist.json");
  const allowlist = JSON.parse(fs.readFileSync(allowlistPath));

  const verifyLeaves = allowlist.map(addr => {
    return ethers.solidityPackedKeccak256(["address"], [addr]);
  });
  const leafBuffers = verifyLeaves.map(x => Buffer.from(x.replace(/^0x/, ""), "hex"));
  const tree = new MerkleTree(leafBuffers, keccak256, { sortPairs: true });
  const root = tree.getHexRoot();

  console.log("Setting Merkle Root:", root);
  const setRootTx = await contract.setMerkleRoot(root);
  await setRootTx.wait();
  console.log("Merkle Root set successfully!");

  console.log("Setting sale state to Public (2)...");
  const setSaleTx = await contract.setSaleState(2);
  await setSaleTx.wait();
  console.log("Sale state set to Public!");

  const currentState = await contract.saleState();
  console.log("Current sale state:", currentState.toString());

  console.log("\n=== Setup Complete ===");
  console.log("Contract Address:", deployment.address);
  console.log("Merkle Root:", root);
  console.log("Sale State:", currentState.toString(), "(2 = Public)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
