import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, TrendingUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import Button from '../components/ui/Button';

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
        tvl: '$12.5M',
        apr: '15.2%',
        minScore: 800,
        isGated: true,
        volume24h: '$2.1M',
        tier: 'Trusted'
    },
    {
        id: '2',
        name: 'WBTC/ETH',
        token0: 'WBTC',
        token1: 'ETH',
        tvl: '$8.3M',
        apr: '18.9%',
        minScore: 900,
        isGated: true,
        volume24h: '$1.5M',
        tier: 'Elite'
    },
    {
        id: '3',
        name: 'USDC/DAI',
        token0: 'USDC',
        token1: 'DAI',
        tvl: '$18.2M',
        apr: '8.5%',
        minScore: 0,
        isGated: false,
        volume24h: '$5.2M',
        tier: 'Standard'
    },
    {
        id: '4',
        name: 'UNI/ETH',
        token0: 'UNI',
        token1: 'ETH',
        tvl: '$6.1M',
        apr: '16.3%',
        minScore: 800,
        isGated: true,
        volume24h: '$980K',
        tier: 'Trusted'
    }
];

export default function PoolsPage() {
    const { contextScore } = useWallet();
    const [filter, setFilter] = React.useState<'all' | 'privacy' | 'open'>('all');

    const filteredPools = MOCK_POOLS.filter(pool => {
        if (filter === 'privacy') return pool.isGated;
        if (filter === 'open') return !pool.isGated;
        return true;
    });

    return (
        <div className="bg-background min-h-screen p-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 space-y-2"
                >
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Pools</p>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-dark">
                        Privacy-Enhanced Pools
                    </h1>
                    <p className="text-lg text-slate-600">
                        Browse ENS context-gated pools. <strong>Prove your tier, keep your privacy, access better execution.</strong>
                    </p>
                </motion.div>

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
                        All Pools
                    </button>
                    <button
                        onClick={() => setFilter('privacy')}
                        className={`px-5 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${filter === 'privacy'
                                ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                                : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-blue hover:text-brand-blue'
                            }`}
                    >
                        <Lock className="w-4 h-4" />
                        Privacy-Enhanced
                    </button>
                    <button
                        onClick={() => setFilter('open')}
                        className={`px-5 py-2 rounded-full font-semibold transition-all ${filter === 'open'
                                ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                                : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-blue hover:text-brand-blue'
                            }`}
                    >
                        Open Access
                    </button>
                </motion.div>

                {/* Pools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPools.map((pool, index) => {
                        const hasAccess = !pool.isGated || (contextScore && contextScore >= pool.minScore);

                        return (
                            <motion.div
                                key={pool.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className={`ens-card p-6 hover:shadow-lg ${hasAccess ? 'border-slate-100' : 'border-red-200 opacity-75'
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
                                        <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-semibold border border-red-100">
                                            Locked
                                        </div>
                                    )}
                                    {hasAccess && pool.isGated && (
                                        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-100">
                                            ✓ Access
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
                                    <div className="bg-indigo-50 p-3 rounded-xl mb-4 text-sm border border-indigo-100">
                                        <span className="text-slate-700">
                                            <Shield className="w-4 h-4 inline mr-2 text-brand-blue" />
                                            <strong>Privacy-Enhanced:</strong> Selective disclosure enforced
                                        </span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    {hasAccess ? (
                                        <>
                                            <Link to="/app" className="flex-1">
                                                <Button className="w-full" size="sm">
                                                    Trade with Privacy
                                                </Button>
                                            </Link>
                                            <Button variant="outline" size="sm" className="flex-shrink-0">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <Link to="/verify" className="flex-1">
                                            <Button variant="outline" className="w-full" size="sm">
                                                Claim Tier to Unlock
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
                        Why Privacy-Enhanced Pools?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm">
                                <Lock className="w-6 h-6 text-brand-blue" />
                            </div>
                            <h3 className="font-bold text-brand-dark mb-2">Selective Disclosure</h3>
                            <p className="text-sm text-slate-700">
                                Only verified tier members can trade. Prove eligibility without revealing your full history.
                            </p>
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm">
                                <Shield className="w-6 h-6 text-brand-blue" />
                            </div>
                            <h3 className="font-bold text-brand-dark mb-2">MEV Resistance</h3>
                            <p className="text-sm text-slate-700">
                                Tier gating and execution privacy drastically reduce sandwich attacks and toxic flow.
                            </p>
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm">
                                <TrendingUp className="w-6 h-6 text-brand-blue" />
                            </div>
                            <h3 className="font-bold text-brand-dark mb-2">Better LP Returns</h3>
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
