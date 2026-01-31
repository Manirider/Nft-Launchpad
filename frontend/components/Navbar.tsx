import React from 'react';
import ConnectWallet from './ConnectWallet';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-900 bg-black">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3 animate-fade-in">
                    <span className="font-extrabold text-xl tracking-tight text-white hover:text-sky-400 transition-colors">
                        Generative NFT <span className="text-gray-500 font-bold">Launchpad</span>
                    </span>
                </div>

                <ConnectWallet />
            </div>
        </nav>
    );
}
