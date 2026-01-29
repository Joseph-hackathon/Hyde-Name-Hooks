import { Link, Outlet } from 'react-router-dom';
import { useChainId, useSwitchChain } from 'wagmi';
import ConnectButton from '../components/wallet/ConnectButton';
import { useWallet } from '../contexts/WalletContext';
import { CHAINS } from '../config/contracts';

export default function RootLayout() {
    const { ensName } = useWallet();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const chainOptions = Object.values(CHAINS);

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
                        <select
                            value={chainId ?? ''}
                            onChange={(event) => {
                                const targetId = Number(event.target.value);
                                if (!Number.isNaN(targetId)) {
                                    switchChain({ chainId: targetId });
                                }
                            }}
                            className="bg-white border border-slate-200 text-sm font-semibold text-slate-700 rounded-full px-3 py-1 hover:border-indigo-200 transition-colors"
                        >
                            {chainOptions.map((chain) => (
                                <option key={chain.id} value={chain.id}>
                                    {chain.name}
                                </option>
                            ))}
                        </select>
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
