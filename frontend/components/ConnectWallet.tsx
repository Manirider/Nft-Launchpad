import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function ConnectWallet() {
    return (
        <div data-testid="connect-wallet-button">
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="full" />
        </div>
    );
}
