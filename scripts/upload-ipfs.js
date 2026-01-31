const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const fetch = require("node-fetch");

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY;

const LOCAL_IPFS_API = process.env.LOCAL_IPFS_API || "http://localhost:5001";

async function uploadToPinata(filePath, fileName) {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    throw new Error("Pinata API keys not configured");
  }

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    ipfsHash: data.IpfsHash,
    gateway: PINATA_GATEWAY,
    url: `${PINATA_GATEWAY}/${data.IpfsHash}`,
  };
}

async function uploadToNFTStorage(filePath) {
  if (!NFT_STORAGE_KEY) {
    throw new Error("NFT.storage API key not configured");
  }

  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);

  const response = await fetch("https://api.nft.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NFT_STORAGE_KEY}`,
    },
    body: blob,
  });

  if (!response.ok) {
    throw new Error(`NFT.storage upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    ipfsHash: data.value.cid,
    gateway: "https://nft.storage",
    url: `https://nft.storage/ipfs/${data.value.cid}`,
  };
}

async function uploadMetadata(metadataDir, provider = "pinata") {
  if (!fs.existsSync(metadataDir)) {
    throw new Error(`Metadata directory not found: ${metadataDir}`);
  }

  const files = fs.readdirSync(metadataDir).filter((f) => f.endsWith(".json"));
  const results = [];

  for (const file of files) {
    const filePath = path.join(metadataDir, file);
    console.log(`Uploading ${file}...`);

    let result;
    if (provider === "pinata") {
      result = await uploadToPinata(filePath, file);
    } else if (provider === "nft.storage") {
      result = await uploadToNFTStorage(filePath);
    }

    results.push({
      file,
      ...result,
    });

    console.log(`✓ ${file} uploaded: ${result.url}`);
  }

  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const metadataDir = args[0] || "./metadata";
  const provider = args[1] || "pinata";

  console.log(`Uploading metadata from ${metadataDir} to ${provider}...`);

  const results = await uploadMetadata(metadataDir, provider);

  const outputFile = `ipfs-uploads-${Date.now()}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to ${outputFile}`);

  console.log("\nIPFS URLs:");
  results.forEach((r) => console.log(`${r.file}: ${r.url}`));
}

main().catch((err) => {
  console.error("Upload failed:", err.message);
  process.exit(1);
});
