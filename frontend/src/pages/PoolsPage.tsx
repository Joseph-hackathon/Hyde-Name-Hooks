import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, TrendingUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import Button from '../components/ui/Button';
import { checkAccess } from '../lib/api';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface Pool {
    id: string;
    name: string;
    token0: string;
    token1: string;
    tvl: string;
    apr: string;
    minScore: number;
    isGated: boolean;
    volume24h: string;
    tier: 'Standard' | 'Trusted' | 'Elite';
}

const MOCK_POOLS: Pool[] = [
    {
        id: '1',
        name: 'ETH/USDC',
        token0: 'ETH',
        token1: 'USDC',
        tvl: '$42.5M',
        apr: '18.4%',
        minScore: 800,
        isGated: true,
        volume24h: '$5.2M',
        tier: 'Trusted'
    },
    {
        id: '2',
        name: 'WBTC/USDC',
        token0: 'WBTC',
        token1: 'USDC',
        tvl: '$28.3M',
        apr: '22.1%',
        minScore: 900,
        isGated: true,
        volume24h: '$3.5M',
        tier: 'Elite'
    },
    {
        id: '3',
        name: 'USDC/USDT',
        token0: 'USDC',
        token1: 'USDT',
        tvl: '$15.2M',
        apr: '4.5%',
        minScore: 0,
        isGated: false,
        volume24h: '$12.2M',
        tier: 'Standard'
    },
    {
        id: '4',
        name: 'cbBTC/ETH',
        token0: 'cbBTC',
        token1: 'ETH',
        tvl: '$12.1M',
        apr: '19.3%',
        minScore: 800,
        isGated: true,
        volume24h: '$1.8M',
        tier: 'Trusted'
    }
];

export default function PoolsPage() {
    const rootRef = useRef<HTMLDivElement>(null);
    const { contextScore, address, isConnected, ensName, tierName } = useWallet();
    const [filter, setFilter] = React.useState<'all' | 'privacy' | 'open'>('all');
    const [accessMap, setAccessMap] = React.useState<Record<string, boolean>>({});

    const filteredPools = MOCK_POOLS.filter(pool => {
        if (filter === 'privacy') return pool.isGated;
        if (filter === 'open') return !pool.isGated;
        return true;
    });

    React.useEffect(() => {
        if (!isConnected || !address) {
            setAccessMap({});
            return;
        }

        const loadAccess = async () => {
            const entries = await Promise.all(
                MOCK_POOLS.map(async (pool) => {
                    if (!pool.isGated) return [pool.id, true] as const;
                    try {
                        const result = await checkAccess(address, pool.minScore >= 900 ? 2 : pool.minScore >= 800 ? 1 : 0);
                        return [pool.id, result.hasAccess] as const;
                    } catch {
                        return [pool.id, contextScore ? contextScore >= pool.minScore : false] as const;
                    }
                })
            );
            setAccessMap(Object.fromEntries(entries));
        };

        loadAccess();
    }, [address, isConnected, contextScore]);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
            gsap.from('.gsap-pools-header', {
                y: 20,
                opacity: 0,
                duration: 0.7,
                ease: 'power3.out',
                stagger: 0.1,
                immediateRender: false,
                clearProps: 'transform,opacity',
            });

            gsap.utils.toArray<HTMLElement>('.gsap-pool-card').forEach((card, index) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 80%',
                    },
                    y: 24,
                    opacity: 0,
                    duration: 0.7,
                    ease: 'power2.out',
                    immediateRender: false,
                    delay: index * 0.04,
                    clearProps: 'transform,opacity',
                });
            });
        }, rootRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={rootRef} className="ens-page p-6">
            <div className="pointer-events-none absolute inset-0 ens-grid" />
            <div className="pointer-events-none absolute inset-0 ens-noise" />
            <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-indigo-100 blur-3xl opacity-70" />
            <div className="pointer-events-none absolute top-48 left-0 h-72 w-72 rounded-full bg-blue-100 blur-3xl opacity-70" />

            <div className="relative z-10 max-w-6xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 space-y-2"
                >
                    <p className="gsap-pools-header text-xs uppercase tracking-[0.35em] text-slate-400">Pools</p>
                    <h1 className="gsap-pools-header text-4xl md:text-5xl font-display font-bold text-brand-dark">
                        Private pools
                    </h1>
                    <p className="gsap-pools-header text-lg text-slate-600">
                        Access exclusive Uniswap liquidity through ENS selective disclosure.
                        <strong> Prove your tier without revealing your score. Hide your intent.</strong>
                    </p>
                </motion.div>

                <div className="mb-8 flex flex-wrap items-center gap-3">
                    <div className="ens-chip">
                        {ensName || 'Unnamed'} {tierName ? `• ${tierName}` : ''}
                    </div>
                </div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap gap-3 mb-8"
                >
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-5 py-2 rounded-full font-semibold transition-all ${filter === 'all'
                            ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-blue hover:text-brand-blue'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('privacy')}
                        className={`px-5 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${filter === 'privacy'
                            ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-blue hover:text-brand-blue'
                            }`}
                    >
                        <Lock className="w-4 h-4" />
                        Private
                    </button>
                    <button
                        onClick={() => setFilter('open')}
                        className={`px-5 py-2 rounded-full font-semibold transition-all ${filter === 'open'
                            ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-blue hover:text-brand-blue'
                            }`}
                    >
                        Open
                    </button>
                </motion.div>

                {/* Pools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPools.map((pool, index) => {
                        const hasAccess = accessMap[pool.id] ?? (!pool.isGated || (contextScore && contextScore >= pool.minScore));

                        return (
                            <motion.div
                                key={pool.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className={`gsap-pool-card ens-card ens-glass p-6 hover:shadow-lg ${hasAccess ? 'border-slate-100' : 'border-red-200 opacity-75'
                                    }`}
                            >
                                {/* Pool Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white" />
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-bold text-xl text-brand-dark">
                                                {pool.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm">
                                                {pool.isGated ? (
                                                    <span className="flex items-center gap-1 text-brand-blue">
                                                        <Lock className="w-3 h-3" />
                                                        {pool.tier}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500">Open</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {!hasAccess && (
                                        <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1.5">
                                            <Lock className="w-3 h-3" />
                                            Locked
                                        </div>
                                    )}
                                    {hasAccess && pool.isGated && (
                                        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5">
                                            <Shield className="w-3 h-3" />
                                            Unlocked
                                        </div>
                                    )}
                                </div>

                                {/* Pool Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-xs text-slate-500 mb-1">TVL</div>
                                        <div className="font-bold text-lg text-brand-dark">{pool.tvl}</div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-xs text-slate-500 mb-1">APR</div>
                                        <div className="font-bold text-lg text-emerald-600">{pool.apr}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-slate-100">
                                    <span className="text-slate-500">24h Volume</span>
                                    <span className="font-bold text-brand-dark">{pool.volume24h}</span>
                                </div>

                                {pool.isGated && (
                                    <div className="bg-indigo-50/50 p-3 rounded-xl mb-4 text-xs border border-indigo-100/50">
                                        <div className="flex items-start gap-2">
                                            <Shield className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="text-brand-dark block">Selective Disclosure Active</strong>
                                                <span className="text-slate-600">Your ENS {pool.tier} status is checked by the Hyde v4 Hook. No score leakage.</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    {hasAccess ? (
                                        <>
                                            <Link to="/app" className="flex-1">
                                                <Button className="w-full" size="sm">
                                                    Trade
                                                </Button>
                                            </Link>
                                            <Button variant="outline" size="sm" className="flex-shrink-0">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <Link to="/verify" className="flex-1">
                                            <Button variant="outline" className="w-full" size="sm">
                                                Claim to unlock
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Info Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] p-8 border border-slate-100"
                >
                    <h2 className="text-2xl font-display font-bold text-brand-dark mb-4">
                        Why private pools?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm">
                                <Lock className="w-6 h-6 text-brand-blue" />
                            </div>
                            <h3 className="font-bold text-brand-dark mb-2">Selective proof</h3>
                            <p className="text-sm text-slate-700">
                                Only verified tier members can trade. Prove eligibility without revealing your full history.
                            </p>
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm">
                                <Shield className="w-6 h-6 text-brand-blue" />
                            </div>
                            <h3 className="font-bold text-brand-dark mb-2">MEV shield</h3>
                            <p className="text-sm text-slate-700">
                                Tier gating and execution privacy drastically reduce sandwich attacks and toxic flow.
                            </p>
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm">
                                <TrendingUp className="w-6 h-6 text-brand-blue" />
                            </div>
                            <h3 className="font-bold text-brand-dark mb-2">LP upside</h3>
                            <p className="text-sm text-slate-700">
                                LPs earn more from reduced adverse selection and consistent volume from trusted traders.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
