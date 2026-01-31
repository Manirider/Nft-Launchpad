import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, usePrepareContractWrite, useAccount, useWaitForTransaction } from 'wagmi';
import MyNFTAbi from '../contracts/MyNFT.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function AdminPanel() {
    const { address } = useAccount();
    const [mounted, setMounted] = useState(false);
    const [revealedURI, setRevealedURI] = useState('');

    useEffect(() => setMounted(true), []);

    const { data: owner } = useContractRead({
        address: CONTRACT_ADDRESS,
        abi: MyNFTAbi,
        functionName: 'owner',
    });

    const isOwner = address && owner && address === owner;

    // Reveal
    const { config: revealConfig } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS,
        abi: MyNFTAbi,
        functionName: 'reveal',
        args: [revealedURI],
        enabled: Boolean(isOwner && revealedURI),
    });
    const { write: reveal, data: revealData } = useContractWrite(revealConfig);

    // Set States
    const { config: setPausedConfig } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS,
        abi: MyNFTAbi,
        functionName: 'setSaleState',
        args: [BigInt(0)], // Paused
    });
    const { write: setPaused } = useContractWrite(setPausedConfig);

    const { config: setAllowlistConfig } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS,
        abi: MyNFTAbi,
        functionName: 'setSaleState',
        args: [BigInt(1)], // Allowlist
    });
    const { write: setAllowlist } = useContractWrite(setAllowlistConfig);

    const { config: setPublicConfig } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS,
        abi: MyNFTAbi,
        functionName: 'setSaleState',
        args: [BigInt(2)], // Public
    });
    const { write: setPublic } = useContractWrite(setPublicConfig);

    // Withdraw
    const { config: withdrawConfig } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS,
        abi: MyNFTAbi,
        functionName: 'withdraw',
    });
    const { write: withdraw } = useContractWrite(withdrawConfig);

    if (!mounted || !isOwner) return null;

    return (
        <div className="bg-black/30 backdrop-blur-lg p-6 rounded-3xl mt-8 mb-8 border border-white/10">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Admin Dashboard
            </h2>

            <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sale Controls</h3>
                    <div className="flex gap-2 p-1 bg-black/20 rounded-xl overflow-hidden">
                        <button onClick={() => setPaused?.()} className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:bg-red-500/20 text-red-400 hover:text-red-300">Pause</button>
                        <button onClick={() => setAllowlist?.()} className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300">Allowlist</button>
                        <button onClick={() => setPublic?.()} className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:bg-green-500/20 text-green-400 hover:text-green-300">Public</button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Contract Actions</h3>
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="ipfs://..."
                                value={revealedURI}
                                onChange={(e) => setRevealedURI(e.target.value)}
                                className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-purple-500 outline-none"
                            />
                            <button onClick={() => reveal?.()} className="px-6 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-sm transition-all">Reveal</button>
                        </div>
                        <button onClick={() => withdraw?.()} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-gray-300 transition-all">
                            Withdraw ETH Funds
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
