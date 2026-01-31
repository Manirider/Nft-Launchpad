import { getContract } from 'wagmi/actions';
import { wagmiConfig as config } from './wagmi';
import MyNFTABI from '../contracts/MyNFT.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

export const getContractInstance = (chainId?: number) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }

  return getContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: MyNFTABI as any,
  });
};

export const CONTRACT_ADDRESS_CHECKSUM = CONTRACT_ADDRESS.toLowerCase() as `0x${string}`;
