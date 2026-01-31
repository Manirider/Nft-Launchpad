import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { formatEther, parseEther } from 'viem';
import MyNFTAbi from '../contracts/MyNFT.json';
import { useMerkle } from '../hooks/useMerkle';
import SaleBadge from './SaleBadge';
import ProgressBar from './ProgressBar';
import QuantitySelector from './QuantitySelector';
import MintButton from './MintButton';
import NFTPreview from './NFTPreview';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function MintCard() {
    const { address, isConnected } = useAccount();
    const { proof, isAllowlisted } = useMerkle();
    const { openConnectModal } = useConnectModal();
    const [quantity, setQuantity] = useState(1);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const { data: saleStateRaw } = useContractRead({
        address: CONTRACT_ADDRESS,
        abi: MyNFTAbi,
        functionName: 'saleState',
        watch: true,
    });
    const saleState = Number(saleStateRaw);

    const { data: totalSupply } = useContractRead({
        address: CONTRACT_ADDRESS,
        abi: MyNFTAbi,
        functionName: 'totalSupply',
        watch: true,
    });

    const { data: maxSupply } = useContractRead({
        address: CONTRACT_ADDRESS,
        abi: MyNFTAbi,
        functionName: 'maxSupply',
    });

    const { data: allowlistPrice } = useContractRead({
        address: CONTRACT_ADDRESS,
        abi: MyNFTAbi,
        functionName: 'allowlistPrice',
    });

    const { data: publicPrice } = useContractRead({
        address: CONTRACT_ADDRESS,
        abi: MyNFTAbi,
        functionName: 'publicPrice',
    });

    const isAllowlist = saleState === 1;
    const isPublic = saleState === 2;
    const price = isAllowlist ? allowlistPrice : publicPrice;
    const totalValue = price ? BigInt(quantity) * (price as bigint) : BigInt(0);

    const { config, error: prepareError } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS,
        abi: MyNFTAbi,
        functionName: isAllowlist ? 'allowlistMint' : 'publicMint',
        args: isAllowlist ? [proof, BigInt(quantity)] : [BigInt(quantity)],
        value: totalValue,
        enabled: Boolean(address) && (isAllowlist || isPublic) && quantity > 0,
    });

    const { data: mintData, write: mint, isLoading: isMintLoading } = useContractWrite(config);

    const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransaction({
        hash: mintData?.hash,
    });

    if (!mounted) return null;

    const getButtonLabel = () => {
        if (!isConnected) return "Connect Wallet to Mint";
        if (isTxLoading || isMintLoading) return "Minting in Progress...";
        if (isTxSuccess) return "Mint Successful!";
        if (saleState === 0) return "Sale Paused";
        if (isAllowlist && !isAllowlisted) return "Not Eligible for Allowlist";
        return `Mint ${quantity} NFT${quantity > 1 ? 's' : ''} for ${price ? formatEther(totalValue) : '...'} ETH`;
    };

    const isButtonDisabled = !isConnected || !mint || isMintLoading || isTxLoading || (isAllowlist && !isAllowlisted);

    return (
        <div className="w-full max-w-[420px] mx-auto relative group animate-slide-up">
            <div className="absolute -inset-1 bg-gradient-to-b from-brand-cyan/20 to-brand-sky/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-[#0a0a0a] border border-gray-800 hover:border-sky-500 rounded-[1rem] p-6 transition-all duration-500 ease-out transform group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(14,165,233,0.2)] overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-twinkle shadow-[0_0_5px_white]" style={{ animationDelay: '0.1s' }} />
                    <div className="absolute top-20 right-10 w-1.5 h-1.5 bg-sky-200 rounded-full animate-twinkle shadow-[0_0_5px_cyan]" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute bottom-10 left-1/3 w-1 h-1 bg-white rounded-full animate-twinkle shadow-[0_0_5px_white]" style={{ animationDelay: '1.2s' }} />
                    <div className="absolute bottom-20 right-1/4 w-0.5 h-0.5 bg-sky-400 rounded-full animate-twinkle" style={{ animationDelay: '0.8s' }} />
                </div>

                <div className="flex justify-between items-start mb-6">
                    <SaleBadge state={saleState} />
                    {isConnected && (
                        <div className="text-[10px] font-mono text-cyan-400 bg-cyan-900/20 border border-cyan-500/20 px-2 py-1 rounded full" data-testid="connected-address">
                            {address?.slice(0, 6)}...{address?.slice(-4)}
                        </div>
                    )}
                </div>

                <div className="mb-8 shadow-2xl shadow-black/50 rounded-2xl">
                    <NFTPreview />
                </div>

                <div className="mb-6">
                    <ProgressBar
                        current={totalSupply?.toString() || '0'}
                        total={maxSupply?.toString() || '10000'}
                    />
                </div>

                <div className="space-y-6">
                    <div className="flex items-end justify-between">
                        <div>
                            <label className="text-xs text-gray-500 uppercase tracking-widest font-extrabold">Quantity</label>
                            <div className="mt-2 w-32">
                                <QuantitySelector quantity={quantity} setQuantity={setQuantity} disabled={isTxLoading} />
                            </div>
                        </div>
                        <div className="text-right">
                            <label className="text-xs text-gray-500 uppercase tracking-widest font-extrabold">Total Price</label>
                            <div className="text-2xl font-black font-mono text-white mt-1">
                                {price ? parseFloat(formatEther(totalValue)).toFixed(4) : '0.00'} <span className="text-sm font-bold text-gray-500">ETH</span>
                            </div>
                        </div>
                    </div>

                    <MintButton
                        onMint={() => {
                            if (!isConnected) {
                                openConnectModal?.();
                            } else {
                                mint?.();
                            }
                        }}
                        disabled={isButtonDisabled}
                        loading={isMintLoading || isTxLoading}
                        label={getButtonLabel()}
                        isConnectMode={!isConnected}
                    />
                </div>

                {isTxSuccess && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center rounded-lg animate-fade-in">
                        Transaction Confirmed! View on Etherscan
                    </div>
                )}
                {prepareError && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center rounded-lg break-all">
                        {prepareError.message.includes('allowlist') ? 'You are not on the Allowlist.' : prepareError.message.slice(0, 80) + '...'}
                    </div>
                )}

            </div>
        </div>
    );
}
