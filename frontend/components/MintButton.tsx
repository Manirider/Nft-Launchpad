import React from 'react';

interface MintButtonProps {
    onMint: () => void;
    disabled: boolean;
    loading: boolean;
    label: string;
    isConnectMode?: boolean;
}

export default function MintButton({ onMint, disabled, loading, label, isConnectMode }: MintButtonProps) {
    const isClickable = !disabled || isConnectMode;

    return (
        <button
            onClick={onMint}
            disabled={!isClickable}
            data-testid="mint-button"
            className={`
        w-full relative group overflow-hidden rounded-xl py-4 font-extrabold text-lg tracking-wide transition-all duration-300
        ${!isClickable
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                    : 'text-white border border-transparent shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transform hover:scale-[1.01] active:scale-[0.99]'}
      `}
        >
            {isClickable && (
                <div className="absolute inset-0 bg-sky-500 hover:bg-sky-400 transition-colors" />
            )}

            {isClickable && !loading && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-shimmer" />
            )}

            {isClickable && (
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-1/4 left-1/4 w-0.5 h-0.5 bg-white rounded-full animate-twinkle shadow-[0_0_2px_white]" style={{ animationDelay: '0.2s' }} />
                    <div className="absolute bottom-1/3 right-1/4 w-0.5 h-0.5 bg-white rounded-full animate-twinkle shadow-[0_0_2px_white]" style={{ animationDelay: '0.7s' }} />
                </div>
            )}

            <span className="relative flex items-center justify-center gap-3">
                {loading && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {label}
            </span>
        </button>
    );
}
