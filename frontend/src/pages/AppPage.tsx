import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Repeat, Activity, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChainId } from 'wagmi';
import { useWallet } from '../contexts/WalletContext';
import Button from '../components/ui/Button';
import { CHAINS } from '../config/contracts';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function AppPage() {
    const rootRef = useRef<HTMLDivElement>(null);
    const { isConnected, ensName, contextScore, balance, address, tierName } = useWallet();
    const chainId = useChainId();
    const [payAmount, setPayAmount] = useState('');
    const [swapError, setSwapError] = useState<string | null>(null);
    const [swapMessage, setSwapMessage] = useState<string | null>(null);
    const [payToken, setPayToken] = useState('ETH');
    const [receiveToken, setReceiveToken] = useState('USDC');

    const swapConfig = useMemo(() => {
        if (chainId === CHAINS.sepolia.id) {
            return {
                chainParam: 'sepolia',
                tokens: [
                    { symbol: 'ETH', address: 'ETH', label: 'ETH' },
                    { symbol: 'USDC', address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', label: 'USDC' },
                ],
            };
        }
        return null;
    }, [chainId]);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
            gsap.from('.gsap-enter', {
                y: 22,
                autoAlpha: 0,
                duration: 0.7,
                ease: 'power3.out',
                stagger: 0.08,
                clearProps: 'transform,opacity',
            });

            gsap.utils.toArray<HTMLElement>('.gsap-reveal').forEach((card) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 80%',
                    },
                    y: 22,
                    autoAlpha: 0,
                    duration: 0.7,
                    ease: 'power2.out',
                    clearProps: 'transform,opacity',
                });
            });
        }, rootRef);

        return () => ctx.revert();
    }, []);

    if (!isConnected) {
        return (
            <div className="ens-page flex items-center justify-center p-6">
                <div className="pointer-events-none absolute inset-0 ens-grid" />
                <div className="pointer-events-none absolute inset-0 ens-noise" />
                <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-blue-100 blur-3xl opacity-70" />
                <div className="pointer-events-none absolute top-48 left-0 h-72 w-72 rounded-full bg-indigo-100 blur-3xl opacity-70" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 text-center max-w-md ens-card ens-glass border border-slate-100 rounded-[2rem] p-10 shadow-soft"
                >
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Activity className="w-10 h-10 text-brand-blue" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-brand-dark mb-3">
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

    const tier = tierName || (contextScore && contextScore > 900 ? 'Elite' :
        contextScore && contextScore > 800 ? 'Trusted' : 'Standard');
    const tabs = [
        { label: 'Swap', to: '/app' },
        { label: 'Verify', to: '/verify' },
        { label: 'Pools', to: '/pools' },
    ];

    const tokens = swapConfig?.tokens ?? [
        { symbol: 'ETH', address: 'ETH', label: 'ETH' },
        { symbol: 'USDC', address: 'USDC', label: 'USDC' },
    ];

    const getRate = (fromToken: string, toToken: string) => {
        if (fromToken === toToken) return 1;
        if (fromToken === 'ETH' && toToken === 'USDC') return 3200;
        if (fromToken === 'USDC' && toToken === 'ETH') return 1 / 3200;
        return null;
    };

    const receiveAmount = useMemo(() => {
        const amount = Number(payAmount);
        if (!payAmount || Number.isNaN(amount)) return '';
        const rate = getRate(payToken, receiveToken);
        if (!rate) return '';
        const value = amount * rate;
        return receiveToken === 'USDC'
            ? value.toFixed(2)
            : value.toFixed(6);
    }, [payAmount, payToken, receiveToken]);

    const handleSwitch = () => {
        setPayToken(receiveToken);
        setReceiveToken(payToken);
    };

    const handlePayTokenChange = (value: string) => {
        if (value === receiveToken) {
            setReceiveToken(payToken);
        }
        setPayToken(value);
    };

    const handleReceiveTokenChange = (value: string) => {
        if (value === payToken) {
            setPayToken(receiveToken);
        }
        setReceiveToken(value);
    };

    const handleSwap = () => {
        setSwapError(null);
        setSwapMessage(null);

        if (!tierName && !contextScore) {
            setSwapError('Claim your ENS context before swapping.');
            return;
        }
        if (!swapConfig) {
            setSwapError('Swap is available on Sepolia testnet.');
            return;
        }
        const amount = Number(payAmount);
        if (!payAmount || Number.isNaN(amount) || amount <= 0) {
            setSwapError('Enter a valid amount to swap.');
            return;
        }

        const inputToken = tokens.find((token) => token.symbol === payToken) ?? tokens[0];
        const outputToken = tokens.find((token) => token.symbol === receiveToken) ?? tokens[1];
        const url = `https://app.uniswap.org/#/swap?inputCurrency=${inputToken.address}&outputCurrency=${outputToken.address}&exactAmount=${amount}&exactField=input&chain=${swapConfig.chainParam}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setSwapMessage('Swap opened on Uniswap with Hyde context gating.');
    };

    return (
        <div ref={rootRef} className="ens-page p-6">
            <div className="pointer-events-none absolute inset-0 ens-grid" />
            <div className="pointer-events-none absolute inset-0 ens-noise" />
            <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-blue-100 blur-3xl opacity-70" />
            <div className="pointer-events-none absolute top-48 left-0 h-72 w-72 rounded-full bg-indigo-100 blur-3xl opacity-70" />

            <div className="relative z-10">
                {/* App Header */}
                <header className="max-w-6xl mx-auto flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-6">
                    <div className="space-y-2">
                        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-blue transition-colors text-sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    <h1 className="gsap-enter text-3xl md:text-4xl font-black text-brand-dark">Private Swap</h1>
                        <p className="gsap-enter text-slate-600">
                            Trade with selective disclosure while keeping your intent private.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {ensName && (
                            <div className="ens-chip">
                                {ensName} {contextScore && `(${contextScore})`}
                            </div>
                        )}
                        <div className="ens-chip bg-brand-dark text-white border-brand-dark">
                            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
                        </div>
                    </div>
                </header>

                <div className="max-w-6xl mx-auto mb-8 flex flex-wrap items-center gap-3">
                    <div className="ens-chip">
                        {ensName || 'Unnamed'} {tier ? `• ${tier}` : ''}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <Link key={tab.to} to={tab.to} className="inline-flex">
                                <Button variant={tab.to === '/app' ? 'primary' : 'ghost'} size="sm">
                                    {tab.label}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Swap Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="gsap-reveal md:col-span-2 ens-card ens-glass p-8 relative overflow-hidden"
                >
                    <h2 className="text-2xl font-display font-bold text-brand-dark mb-2">Swap, quietly</h2>
                    <p className="text-sm text-slate-600 mb-6">
                        Selective disclosure execution • Hide your intent • Anchor your name
                    </p>

                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-colors">
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-500 text-sm font-bold">Pay</span>
                                <span className="text-brand-dark font-bold">Balance: {balance || '0.0'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <input
                                    type="text"
                                    value={payAmount}
                                    onChange={(event) => setPayAmount(event.target.value)}
                                    placeholder="0.0"
                                    className="bg-transparent text-4xl font-display font-bold text-brand-dark outline-none w-full"
                                />
                                <select
                                    value={payToken}
                                    onChange={(event) => handlePayTokenChange(event.target.value)}
                                    className="bg-white hover:bg-slate-50 px-3 py-1 rounded-full font-semibold text-brand-dark flex items-center gap-2 mx-2 shadow-sm border border-slate-200"
                                >
                                    {tokens.map((token) => (
                                        <option key={`pay-${token.symbol}`} value={token.symbol}>
                                            {token.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-center -my-2 relative z-10">
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={handleSwitch}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        handleSwitch();
                                    }
                                }}
                                className="bg-white border border-slate-200 p-2 rounded-xl shadow-sm cursor-pointer hover:scale-105 transition-transform"
                            >
                                <Repeat className="w-5 h-5 text-brand-blue" />
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-colors">
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-500 text-sm font-bold">Receive</span>
                                <span className="text-brand-dark font-bold">Balance: 0.0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <input
                                    type="text"
                                    value={receiveAmount}
                                    placeholder="Quoted on Uniswap"
                                    className="bg-transparent text-4xl font-display font-bold text-brand-dark outline-none w-full"
                                    disabled
                                />
                                <select
                                    value={receiveToken}
                                    onChange={(event) => handleReceiveTokenChange(event.target.value)}
                                    className="bg-brand-blue text-white px-3 py-1 rounded-full font-semibold flex items-center gap-2 mx-2 shadow-lg shadow-brand-blue/20"
                                >
                                    {tokens.map((token) => (
                                        <option key={`receive-${token.symbol}`} value={token.symbol}>
                                            {token.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {contextScore && contextScore >= 800 && (
                        <div className="bg-emerald-50 p-4 rounded-xl mt-4 flex items-center gap-3 border border-emerald-100">
                            <Shield className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                                <div className="font-bold text-brand-dark text-sm">Privacy-Enhanced Execution</div>
                                <div className="text-xs text-slate-600">Your {tier} tier unlocks selective disclosure</div>
                            </div>
                        </div>
                    )}

                    {swapError && (
                        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {swapError}
                        </div>
                    )}
                    {swapMessage && (
                        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {swapMessage}
                        </div>
                    )}

                    <Button className="w-full mt-6" size="lg" onClick={handleSwap}>
                        Swap on Uniswap
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
                        className="gsap-reveal ens-card p-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Activity className="w-32 h-32" />
                        </div>
                        <h3 className="text-lg font-bold text-brand-dark mb-1">Your tier</h3>
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
                        className="gsap-reveal ens-card p-6"
                    >
                        <h3 className="text-lg font-bold text-brand-dark mb-4">Privacy perks</h3>
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

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="gsap-reveal max-w-6xl mx-auto mt-10 ens-card ens-glass p-8"
            >
                <div className="flex flex-col gap-2 mb-6">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Hook Notes</p>
                    <h2 className="text-2xl font-display font-bold text-brand-dark">
                        How the hook works
                    </h2>
                    <p className="text-sm text-slate-600">
                        Hyde plugs into swap execution as a v4 Hook so DeFi integrators can add tier-gated privacy
                        without changing their frontends or liquidity sources.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <h4 className="font-semibold text-brand-dark mb-3">Flow</h4>
                        <ul className="space-y-2">
                            <li>1. ENS ownership verified by backend scoring.</li>
                            <li>2. Tier registered onchain in the registry contract.</li>
                            <li>3. Hook checks tier + cooldown before swap execution.</li>
                            <li>4. Swap routes through existing pools with privacy gates.</li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-100">
                        <h4 className="font-semibold text-brand-dark mb-3">Integrator wins</h4>
                        <ul className="space-y-2">
                            <li>Lower MEV exposure via tier gating and cooldowns.</li>
                            <li>Portable ENS identity across chains and apps.</li>
                            <li>No new liquidity bootstrap—use existing Uniswap pools.</li>
                            <li>Composable with wallet, router, and analytics layers.</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
            </div>
        </div>
    );
}
