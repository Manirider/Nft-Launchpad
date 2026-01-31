import React from 'react';

interface SaleBadgeProps {
    state: number;
}

export default function SaleBadge({ state }: SaleBadgeProps) {
    const getStatusConfig = (s: number) => {
        switch (s) {
            case 0: return { label: 'Sale Paused', color: 'bg-red-900 text-red-100 border-red-800' };
            case 1: return { label: 'Allowlist Only', color: 'bg-blue-900 text-blue-100 border-blue-800' };
            case 2: return { label: 'Public Mint Live', color: 'bg-green-900 text-green-100 border-green-800' };
            default: return { label: 'Loading...', color: 'bg-gray-900 text-gray-300 border-gray-800' };
        }
    };

    const config = getStatusConfig(state);

    return (
        <div
            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${config.color} backdrop-blur-md inline-flex items-center gap-2`}
            data-testid="sale-status"
        >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]" />
            {config.label}
        </div>
    );
}
