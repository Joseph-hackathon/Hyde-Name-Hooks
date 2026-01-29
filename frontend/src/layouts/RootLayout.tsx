import { useEffect, useRef, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useChainId, useSwitchChain } from 'wagmi';
import { ChevronDown } from 'lucide-react';
import ConnectButton from '../components/wallet/ConnectButton';
import { useWallet } from '../contexts/WalletContext';
import { CHAINS } from '../config/contracts';

export default function RootLayout() {
    const { ensName } = useWallet();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const chainOptions = Object.values(CHAINS);
    type ChainId = typeof chainOptions[number]['id'];
    const [isChainOpen, setIsChainOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const renderChainIcon = (id: number) => {
        if (id === CHAINS.sepolia.id) {
            return (
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                    <polygon points="12,2 3,12 12,17 21,12" fill="#8b8b8b" />
                    <polygon points="12,2 12,17 21,12" fill="#5f5f5f" />
                    <polygon points="12,22 3,12 12,17 21,12" fill="#4a4a4a" />
                </svg>
            );
        }
        if (id === CHAINS.unichainSepolia.id) {
            return (
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                    <defs>
                        <linearGradient id="uniGlow" x1="0" x2="1" y1="0" y2="1">
                            <stop offset="0%" stopColor="#ff6bd5" />
                            <stop offset="100%" stopColor="#ff1fa5" />
                        </linearGradient>
                    </defs>
                    <circle cx="12" cy="12" r="10" fill="url(#uniGlow)" />
                    <path d="M12 6 L13.8 10.2 L18 12 L13.8 13.8 L12 18 L10.2 13.8 L6 12 L10.2 10.2 Z" fill="#ffffff" />
                </svg>
            );
        }
        if (id === CHAINS.baseSepolia.id) {
            return (
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                    <rect x="3" y="3" width="18" height="18" rx="4" fill="#0b19ff" />
                </svg>
            );
        }
        return <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />;
    };

    const activeChain = chainOptions.find((chain) => chain.id === chainId) || CHAINS.sepolia;
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (!dropdownRef.current) return;
            if (!dropdownRef.current.contains(event.target as Node)) {
                setIsChainOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo Area */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-brand-dark rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 border-2 border-white rounded-full"></div>
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            Hyde
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/app" className="text-sm font-semibold text-slate-600 hover:text-brand-blue transition-colors">
                            Swap
                        </Link>
                        <Link to="/verify" className="text-sm font-semibold text-slate-600 hover:text-brand-blue transition-colors">
                            Verify
                        </Link>
                        <Link to="/pools" className="text-sm font-semibold text-slate-600 hover:text-brand-blue transition-colors">
                            Pools
                        </Link>
                        <a href="#" className="text-sm font-semibold text-slate-600 hover:text-brand-blue transition-colors">
                            Docs
                        </a>
                    </nav>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {ensName && (
                            <div className="ens-chip">
                                {ensName}
                            </div>
                        )}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsChainOpen((prev) => !prev)}
                                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm hover:border-indigo-200 transition-colors"
                            >
                                {renderChainIcon(activeChain.id)}
                                <span>{activeChain.name}</span>
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            </button>
                            {isChainOpen && (
                                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-100 bg-white p-2 shadow-lg">
                                    {chainOptions.map((chain) => {
                                        return (
                                            <button
                                                key={chain.id}
                                                type="button"
                                                onClick={() => {
                                                    switchChain({ chainId: chain.id as ChainId });
                                                    setIsChainOpen(false);
                                                }}
                                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                {renderChainIcon(chain.id)}
                                                <span>{chain.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <ConnectButton />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-20">
                <Outlet />
            </main>
        </div>
    );
}
