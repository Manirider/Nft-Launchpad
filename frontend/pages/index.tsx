import React from 'react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import MintCard from '../components/MintCard';
import Footer from '../components/Footer';
import AdminPanel from '../components/AdminPanel';

export default function Home() {
    return (
        <Layout>
            <Navbar />

            <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 relative">
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 gap-12">

                    <div className="text-center space-y-4 mb-2">
                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight">
                            GENESIS COLLECTION
                        </h1>
                        <p className="text-lg text-gray-400 max-w-xl mx-auto">
                            A collection of 10,000 unique generative artworks living on the Ethereum blockchain. Mint yours today.
                        </p>
                    </div>

                    <MintCard />

                    <div className="max-w-xl mx-auto w-full opacity-80 hover:opacity-100 transition-opacity">
                        <AdminPanel />
                    </div>

                </div>
            </main>

            <Footer />
        </Layout>
    );
}
