const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');
const path = require('path');

function main() {
  const allowlistPath = path.join(__dirname, '../allowlist.json');

  if (!fs.existsSync(allowlistPath)) {
    console.error("allowlist.json not found!");
    process.exit(1);
  }

  const rawData = fs.readFileSync(allowlistPath);
  const allowlist = JSON.parse(rawData);

  const leaves = allowlist.map(addr => keccak256(addr));

  const { ethers } = require("ethers");

  const verifyLeaves = allowlist.map(addr => {
    return ethers.solidityPackedKeccak256(["address"], [addr]);
  });

  const leafBuffers = verifyLeaves.map(x => Buffer.from(x.replace(/^0x/, ''), 'hex'));

  const tree = new MerkleTree(leafBuffers, keccak256, { sortPairs: true });

  const root = tree.getHexRoot();

  console.log("Allowlist size:", allowlist.length);
  console.log("Merkle Root:", root);

  const proofStruct = {};
  allowlist.forEach((addr, idx) => {
    const leaf = leafBuffers[idx];
    const proof = tree.getHexProof(leaf);
    proofStruct[addr] = proof;
  });

  fs.writeFileSync(path.join(__dirname, '../merkle-proofs.json'), JSON.stringify(proofStruct, null, 2));
  console.log("Proofs saved to merkle-proofs.json");
}

main();
