import { useState } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'ethers';
import { getMerkleProof } from '../lib/merkle';
import { CONTRACT_ADDRESS_CHECKSUM } from '../lib/contract';
import MyNFTABI from '../contracts/MyNFT.json';

interface MintParams {
  quantity: number;
  useAllowlist: boolean;
}

export function useMint() {
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { write: allowlistMint, isLoading: isAllowlistLoading } = useContractWrite({
    address: CONTRACT_ADDRESS_CHECKSUM,
    abi: MyNFTABI,
    functionName: 'allowlistMint',
    onError: (error: any) => {
      setError(error.message || 'Allowlist mint failed');
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    },
  } as any);

  const { write: publicMint, isLoading: isPublicLoading } = useContractWrite({
    address: CONTRACT_ADDRESS_CHECKSUM,
    abi: MyNFTABI,
    functionName: 'publicMint',
    onError: (error: any) => {
      setError(error.message || 'Public mint failed');
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    },
  } as any);

  const mint = async ({ quantity, useAllowlist }: MintParams) => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    setError(null);

    try {
      if (useAllowlist) {
        const proof = getMerkleProof(address);
        if (!proof) {
          setError('Address not on allowlist');
          return;
        }

        // @ts-ignore
        allowlistMint({
          args: [quantity, proof],
          value: parseEther((quantity * 0.05).toString()),
        });
      } else {
        // @ts-ignore
        publicMint({
          args: [quantity],
          value: parseEther((quantity * 0.1).toString()),
        });
      }
    } catch (err: any) {
      setError(err.message || 'Minting failed');
    }
  };

  return {
    mint,
    isLoading: isAllowlistLoading || isPublicLoading,
    error,
    success,
  };
}
