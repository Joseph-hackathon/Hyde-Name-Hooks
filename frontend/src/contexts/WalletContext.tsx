import { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { sepolia, baseSepolia } from 'wagmi/chains';
import { formatUnits } from 'viem';
import { useState } from 'react';
import { getTier } from '../lib/api';
import { CHAINS } from '../config/contracts';

interface WalletContextType {
    address: string | undefined;
    isConnected: boolean;
    isConnecting: boolean;
    network: string | null;
    balance: string | null;
    ensName: string | null;
    contextScore: number | null;
    tierName: string | null;
    disconnect: () => void;
    setContextScore: (score: number) => void;
    setEnsName: (ens: string | null) => void;
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
    const [ensName, setEnsName] = useState<string | null>(null);
    const [tierName, setTierName] = useState<string | null>(null);

    const balance = balanceData
        ? `${parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)} ${balanceData.symbol}`
        : null;

    const networkName =
        chainId === sepolia.id ? 'Sepolia Testnet' :
            chainId === baseSepolia.id ? 'Base Sepolia' :
                chainId === CHAINS.unichainSepolia.id ? 'Unichain Sepolia' :
                    chainId === 1 ? 'Ethereum Mainnet' :
                        chainId ? `Chain ID ${chainId}` : null;

    const disconnect = () => {
        wagmiDisconnect();
        setContextScore(null);
        setEnsName(null);
        setTierName(null);
    };

    useEffect(() => {
        if (!address) {
            setContextScore(null);
            setTierName(null);
            return;
        }

        const loadTier = async () => {
            try {
                const result = await getTier(address);
                if (result?.tierName) {
                    setTierName(result.tierName);
                    const score =
                        result.tierName === 'Elite' ? 920 :
                            result.tierName === 'Trusted' ? 850 : 720;
                    setContextScore(score);
                } else {
                    setTierName(null);
                    setContextScore(null);
                }
            } catch {
                setTierName(null);
            }
        };

        loadTier();
    }, [address]);

    return (
        <WalletContext.Provider
            value={{
                address,
                isConnected,
                isConnecting,
                network: isConnected && networkName ? networkName : null,
                balance,
                ensName,
                contextScore,
                tierName,
                disconnect,
                setContextScore,
                setEnsName
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
