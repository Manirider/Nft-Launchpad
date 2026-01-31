import React from 'react';
import Head from 'next/head';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-gray-200 font-sans selection:bg-violet-500/30 selection:text-white">
            <Head>
                <title>Genesis Collection | Premium NFT Launch</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="fixed inset-0 pointer-events-none z-[-1] bg-black" />

            <div className="relative z-10 flex flex-col min-h-screen">
                {children}
            </div>
        </div>
    );
}
