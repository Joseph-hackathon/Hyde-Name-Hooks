import { createContext, useContext, ReactNode } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { useState } from 'react';

interface WalletContextType {
    address: string | undefined;
    isConnected: boolean;
    isConnecting: boolean;
    network: string | null;
    balance: string | null;
    ensName: string | null;
    contextScore: number | null;
    disconnect: () => void;
    setContextScore: (score: number) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const { address, isConnected, isConnecting, chainId } = useAccount();
    const { data: balanceData } = useBalance({
        address,
        chainId: sepolia.id,
    });
    const { disconnect: wagmiDisconnect } = useDisconnect();

    const [contextScore, setContextScore] = useState<number | null>(null);

    const balance = balanceData
        ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`
        : null;

    const networkName = chainId === sepolia.id ? 'Sepolia Testnet' :
        chainId === 1 ? 'Ethereum Mainnet' :
            chainId ? `Chain ID ${chainId}` : null;

    const disconnect = () => {
        wagmiDisconnect();
        setContextScore(null);
    };

    return (
        <WalletContext.Provider
            value={{
                address,
                isConnected,
                isConnecting,
                network: isConnected && networkName ? networkName : null,
                balance,
                ensName: null, // ENS 조회는 mainnet 필요, 일단 비활성화
                contextScore,
                disconnect,
                setContextScore
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}
