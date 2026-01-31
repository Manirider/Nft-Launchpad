import React from 'react';

interface QuantitySelectorProps {
    quantity: number;
    setQuantity: (val: number) => void;
    disabled?: boolean;
}

export default function QuantitySelector({ quantity, setQuantity, disabled }: QuantitySelectorProps) {
    const handleDecrement = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const handleIncrement = () => {
        if (quantity < 10) setQuantity(quantity + 1);
    };

    return (
        <div className="flex items-center bg-black/30 border border-white/10 rounded-xl p-1">
            <button
                onClick={handleDecrement}
                disabled={disabled || quantity <= 1}
                className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>

            <div className="flex-1 text-center font-mono text-lg font-extrabold text-white relative">
                <input
                    type="number"
                    value={quantity}
                    readOnly
                    data-testid="quantity-input"
                    className="bg-transparent text-center w-full focus:outline-none appearance-none m-0"
                />
            </div>

            <button
                onClick={handleIncrement}
                disabled={disabled || quantity >= 10}
                className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
        </div>
    );
}
