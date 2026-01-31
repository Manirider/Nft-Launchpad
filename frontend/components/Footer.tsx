import React from 'react';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x...';

export default function Footer() {
    return (
        <footer className="py-8 text-center border-t border-gray-900 bg-black text-white text-sm">
            <div className="container mx-auto px-6 flex flex-col items-center gap-2">
                <p>Powered by Ethereum & Next.js</p>
                <p className="font-mono text-xs opacity-50 bg-white/5 px-2 py-1 rounded">
                    Contract: {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
                </p>
            </div>
        </footer>
    );
}
