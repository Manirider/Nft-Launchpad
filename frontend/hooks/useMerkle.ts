import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { ethers } from 'ethers';
import allowlist from '../lib/allowlist.json';

export function useMerkle() {
    const { address } = useAccount();

    const { tree, root } = useMemo(() => {
        const leaves = allowlist.map(addr => {
            const hash = ethers.solidityPackedKeccak256(["address"], [addr]);
            return Buffer.from(hash.replace(/^0x/, ''), 'hex');
        });

        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const root = tree.getHexRoot();

        return { tree, root };
    }, []);

    const proof = useMemo(() => {
        if (!address) return [];

        const leafHash = ethers.solidityPackedKeccak256(["address"], [address]);
        const leafBuffer = Buffer.from(leafHash.replace(/^0x/, ''), 'hex');

        return tree.getHexProof(leafBuffer);
    }, [address, tree]);

    const isAllowlisted = proof.length > 0;

    return { root, proof, isAllowlisted };
}
