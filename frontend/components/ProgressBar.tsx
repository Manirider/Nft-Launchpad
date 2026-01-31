import React from 'react';

interface ProgressBarProps {
    current: string;
    total: string;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
    const percentage = Math.min(100, (Number(current) / Math.max(1, Number(total))) * 100);

    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                <span>Total Minted</span>
                <span>
                    <span className="text-white" data-testid="mint-count">{current}</span>
                    {' / '}
                    <span data-testid="total-supply">{total}</span>
                </span>
            </div>

            <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                <div
                    className="absolute top-0 left-0 h-full bg-sky-500/20 blur-md"
                    style={{ width: `${percentage}%` }}
                />

                <div
                    className="h-full bg-sky-500 transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
