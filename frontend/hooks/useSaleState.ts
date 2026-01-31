import { useEffect, useState } from 'react';
import { useContractRead } from 'wagmi';
import { CONTRACT_ADDRESS_CHECKSUM } from '../lib/contract';
import MyNFTABI from '../contracts/MyNFT.json';

interface SaleState {
  phase: number | null;
  totalSupply: number | null;
  maxSupply: number | null;
  prices: {
    allowlist: string;
    public: string;
  } | null;
}

export function useSaleState() {
  const [state, setState] = useState<SaleState>({
    phase: null,
    totalSupply: null,
    maxSupply: null,
    prices: null,
  });

  const { data: phase } = useContractRead({
    address: CONTRACT_ADDRESS_CHECKSUM,
    abi: MyNFTABI as any,
    functionName: 'saleState',
  });

  const { data: totalSupply } = useContractRead({
    address: CONTRACT_ADDRESS_CHECKSUM,
    abi: MyNFTABI as any,
    functionName: 'totalSupply',
  });

  const { data: maxSupply } = useContractRead({
    address: CONTRACT_ADDRESS_CHECKSUM,
    abi: MyNFTABI as any,
    functionName: 'maxSupply',
  });

  const { data: allowlistPrice } = useContractRead({
    address: CONTRACT_ADDRESS_CHECKSUM,
    abi: MyNFTABI as any,
    functionName: 'allowlistPrice',
  });

  const { data: publicPrice } = useContractRead({
    address: CONTRACT_ADDRESS_CHECKSUM,
    abi: MyNFTABI as any,
    functionName: 'publicPrice',
  });

  useEffect(() => {
    setState({
      phase: phase ? Number(phase) : null,
      totalSupply: totalSupply ? Number(totalSupply) : null,
      maxSupply: maxSupply ? Number(maxSupply) : null,
      prices: allowlistPrice && publicPrice
        ? {
          allowlist: (Number(allowlistPrice) / 1e18).toFixed(4),
          public: (Number(publicPrice) / 1e18).toFixed(4),
        }
        : null,
    });
  }, [phase, totalSupply, maxSupply, allowlistPrice, publicPrice]);

  return state;
}
