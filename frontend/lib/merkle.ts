import { keccak256, toUtf8Bytes } from 'ethers';

interface MerkleProofData {
  root: string;
  proofs: {
    [address: string]: string[];
  };
}

let merkleData: MerkleProofData | null = null;

export async function loadMerkleData(url: string = '/merkle-tree.json') {
  try {
    const response = await fetch(url);
    merkleData = await response.json();
    return merkleData;
  } catch (err) {
    console.error('Failed to load Merkle data:', err);
    return null;
  }
}

export function getMerkleProof(address: string): string[] | null {
  if (!merkleData) {
    console.warn('Merkle data not loaded. Call loadMerkleData() first.');
    return null;
  }

  const normalizedAddress = address.toLowerCase();
  return merkleData.proofs[normalizedAddress] || null;
}

export function getMerkleRoot(): string | null {
  return merkleData?.root || null;
}

export function isAddressAllowlisted(address: string): boolean {
  return getMerkleProof(address) !== null;
}

export function verifyProofLocally(
  address: string,
  proof: string[]
): boolean {
  if (!merkleData) return false;

  const leaf = keccak256(address);
  let computedHash = leaf;

  for (const proofElement of proof) {
    if (computedHash < proofElement) {
      computedHash = keccak256(
        Buffer.concat([
          Buffer.from(computedHash.slice(2), 'hex'),
          Buffer.from(proofElement.slice(2), 'hex'),
        ])
      );
    } else {
      computedHash = keccak256(
        Buffer.concat([
          Buffer.from(proofElement.slice(2), 'hex'),
          Buffer.from(computedHash.slice(2), 'hex'),
        ])
      );
    }
  }

  return computedHash.toLowerCase() === merkleData.root.toLowerCase();
}
