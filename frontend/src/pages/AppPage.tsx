import { motion } from 'framer-motion';
import { ArrowLeft, Repeat, Activity, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import Button from '../components/ui/Button';

export default function AppPage() {
    const { isConnected, ensName, contextScore, balance, address } = useWallet();

    if (!isConnected) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <div className="w-20 h-20 bg-pastel-blue rounded-full flex items-center justify-center mx-auto mb-6">
                        <Activity className="w-10 h-10 text-brand-blue" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-brand-dark mb-4">
                        Connect Your Wallet
                    </h2>
                    <p className="text-slate-600 mb-8">
                        Connect MetaMask to access privacy-enhanced execution on Uniswap v4.
                    </p>
                    <Link to="/">
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    const tier = contextScore && contextScore > 900 ? 'Elite' :
        contextScore && contextScore > 800 ? 'Trusted' : 'Standard';

    return (
        <div className="bg-background min-h-screen p-6">
            {/* App Header */}
            <header className="flex justify-between items-center mb-8">
                <Link to="/" className="flex items-center gap-2 text-brand-dark hover:text-brand-blue transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-bold">Back to Home</span>
                </Link>
                <div className="flex items-center gap-4">
                    {ensName && (
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm text-sm font-bold text-slate-500 border border-slate-100">
                            {ensName} {contextScore && `(${contextScore})`}
                        </div>
                    )}
                    <div className="bg-brand-dark text-white px-4 py-2 rounded-xl font-bold text-sm">
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Swap Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 bg-white rounded-[2rem] p-8 shadow-soft border border-slate-100 relative overflow-hidden"
                >
                    <h2 className="text-2xl font-display font-bold text-brand-dark mb-2">Privacy Swap</h2>
                    <p className="text-sm text-slate-600 mb-6">
                        Selective disclosure execution • Hide your intent • Anchor your name
                    </p>

                    <div className="space-y-4">
                        <div className="bg-pastel-blue p-4 rounded-2xl border border-brand-blue/10 hover:border-brand-blue/30 transition-colors">
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-500 text-sm font-bold">Pay</span>
                                <span className="text-brand-dark font-bold">Balance: {balance || '0.0'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <input type="text" placeholder="0.0" className="bg-transparent text-4xl font-display font-bold text-brand-dark outline-none w-full" />
                                <button className="bg-white hover:bg-slate-50 px-3 py-1 rounded-lg font-bold text-brand-dark flex items-center gap-2 mx-2 shadow-sm">
                                    ETH <span className="text-xs">▼</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-center -my-2 relative z-10">
                            <div className="bg-white border border-slate-100 p-2 rounded-xl shadow-sm cursor-pointer hover:scale-110 transition-transform">
                                <Repeat className="w-5 h-5 text-brand-blue" />
                            </div>
                        </div>

                        <div className="bg-pastel-pink p-4 rounded-2xl border border-pink-200/30 hover:border-pink-300/50 transition-colors">
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-500 text-sm font-bold">Receive</span>
                                <span className="text-brand-dark font-bold">Balance: 0.0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <input type="text" placeholder="0.0" className="bg-transparent text-4xl font-display font-bold text-brand-dark outline-none w-full" />
                                <button className="bg-brand-blue text-white px-3 py-1 rounded-lg font-bold flex items-center gap-2 mx-2 shadow-lg shadow-brand-blue/20">
                                    USDC <span className="text-xs">▼</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {contextScore && contextScore >= 800 && (
                        <div className="bg-pastel-green p-4 rounded-xl mt-4 flex items-center gap-3">
                            <Shield className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                                <div className="font-bold text-brand-dark text-sm">Privacy-Enhanced Execution</div>
                                <div className="text-xs text-slate-600">Your {tier} tier unlocks selective disclosure</div>
                            </div>
                        </div>
                    )}

                    <Button className="w-full mt-6" size="lg">
                        Execute Private Swap
                    </Button>

                    <div className="mt-4 text-center text-xs text-slate-500">
                        Powered by Uniswap v4 Hook • ENS Context Gated
                    </div>
                </motion.div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Context Score Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-pastel-pink rounded-[2rem] p-6 shadow-soft relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Activity className="w-32 h-32" />
                        </div>
                        <h3 className="text-lg font-bold text-brand-dark mb-1">Your Tier</h3>
                        <div className="text-4xl font-display font-black text-brand-dark mb-2">
                            {contextScore ? tier : 'Not Claimed'}
                        </div>
                        {contextScore ? (
                            <div className="inline-block bg-white/50 px-3 py-1 rounded-full text-xs font-bold text-brand-dark">
                                Score: {contextScore}
                            </div>
                        ) : (
                            <Link to="/verify">
                                <Button size="sm" className="mt-2">Claim Context</Button>
                            </Link>
                        )}
                    </motion.div>

                    {/* Privacy Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-pastel-blue rounded-[2rem] p-6 shadow-soft"
                    >
                        <h3 className="text-lg font-bold text-brand-dark mb-4">Privacy Features</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                                <Shield className="w-4 h-4 text-brand-blue mt-0.5" />
                                <div>
                                    <strong className="text-brand-dark">Selective Disclosure</strong>
                                    <div className="text-slate-600 text-xs">Prove tier without revealing score</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Activity className="w-4 h-4 text-brand-blue mt-0.5" />
                                <div>
                                    <strong className="text-brand-dark">Hidden Intent</strong>
                                    <div className="text-slate-600 text-xs">Transaction details stay private</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
