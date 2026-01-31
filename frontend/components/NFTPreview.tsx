import React from 'react';

export default function NFTPreview() {
    return (
        <div className="relative aspect-square w-full bg-black rounded-xl overflow-hidden animate-float">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black">
                <div className="absolute inset-0 opacity-60 mix-blend-overlay">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-tr from-sky-500/30 via-blue-500/30 to-green-500/30 rounded-full blur-3xl animate-pulse" />
                </div>

                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-sm bg-white/5 group-hover:scale-110 transition-transform duration-500">
                        <span className="text-4xl">💎</span>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pt-12">
                <h3 className="text-white font-bold text-lg">Unrevealed Metadata</h3>
                <p className="text-xs text-gray-400">Reveal happens after sellout</p>
            </div>
        </div>
    );
}
