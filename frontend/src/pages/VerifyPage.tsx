import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Shield, TrendingUp, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChainId } from 'wagmi';
import { useWallet } from '../contexts/WalletContext';
import Button from '../components/ui/Button';
import { getEnsName, verifyEns } from '../lib/api';
import { CHAINS } from '../config/contracts';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function VerifyPage() {
    const rootRef = useRef<HTMLDivElement>(null);
    const { isConnected, contextScore, setContextScore, address, setEnsName, ensName, tierName } = useWallet();
    const [searchName, setSearchName] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [claimResult, setClaimResult] = useState<{
        ensName: string;
        address: string;
        tier: number;
        tierName: string;
        totalScore?: number;
        breakdown?: {
            transactionHistory: number;
            tokenHoldings: number;
            defiActivity: number;
            daoParticipation: number;
        };
        txHash: string;
    } | null>(null);
    const chainId = useChainId();
    const chainConfig = useMemo(() => {
        return (
            Object.values(CHAINS).find((chain) => chain.id === chainId) || CHAINS.sepolia
        );
    }, [chainId]);
    const registryAddress = chainConfig.contracts.registry;
    const explorerBase = chainConfig.blockExplorer;
    const claimStorageKey = address ? `hyde_claim_result_${address.toLowerCase()}` : null;
    const isClaimed = Boolean(tierName || claimResult);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
            gsap.from('.gsap-verify-header', {
                y: 20,
                opacity: 0,
                duration: 0.7,
                ease: 'power3.out',
                stagger: 0.1,
                immediateRender: false,
                clearProps: 'transform,opacity',
            });

            gsap.utils.toArray<HTMLElement>('.gsap-verify-card').forEach((card) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 80%',
                    },
                    y: 22,
                    opacity: 0,
                    duration: 0.7,
                    ease: 'power2.out',
                    immediateRender: false,
                    clearProps: 'transform,opacity',
                });
            });
        }, rootRef);

        return () => ctx.revert();
    }, []);

    const handleVerify = async () => {
        if (!searchName || !address) return;

        setIsVerifying(true);
        setVerificationStatus('idle');
        setErrorMessage(null);
        setClaimResult(null);

        try {
            const result = await verifyEns(searchName.trim(), address);
            const score =
                result.totalScore ??
                (result.tierName === 'Elite' ? 920 :
                    result.tierName === 'Trusted' ? 850 : 720);
            setContextScore(score);
            setEnsName(result.ensName);
            setClaimResult(result);
            if (claimStorageKey) {
                localStorage.setItem(
                    claimStorageKey,
                    JSON.stringify({
                        ...result,
                        storedAt: new Date().toISOString(),
                    })
                );
            }
            setVerificationStatus('success');
        } catch (error: any) {
            setVerificationStatus('error');
            setErrorMessage(error?.message || 'Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    useEffect(() => {
        if (!claimStorageKey) {
            setClaimResult(null);
            return;
        }
        const stored = localStorage.getItem(claimStorageKey);
        if (!stored) return;
        try {
            const parsed = JSON.parse(stored);
            if (parsed?.ensName && parsed?.txHash) {
                setClaimResult(parsed);
                setEnsName(parsed.ensName);
            }
        } catch {
            // ignore invalid cached data
        }
    }, [claimStorageKey]);

    useEffect(() => {
        if (!address || !tierName || claimResult) return;

        const loadEnsName = async () => {
            try {
                const result = await getEnsName(address);
                if (result?.ensName) {
                    setEnsName(result.ensName);
                    setClaimResult({
                        ensName: result.ensName,
                        address,
                        tierName,
                        tier: tierName === 'Elite' ? 2 : tierName === 'Trusted' ? 1 : 0,
                        totalScore: contextScore ?? undefined,
                        txHash: '',
                    });
                }
            } catch {
                // ignore lookup failures
            }
        };

        loadEnsName();
    }, [address, tierName, claimResult, contextScore, setEnsName]);

    if (!isConnected) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md bg-white border border-slate-100 rounded-[2rem] p-10 shadow-soft"
                >
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-10 h-10 text-brand-blue" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-brand-dark mb-4">
                        Connect to claim
                    </h2>
                    <p className="text-slate-600 mb-8">
                        Connect your wallet to register your ENS name and unlock selective disclosure privacy.
                    </p>
                    <Link to="/">
                        <Button variant="outline">Back to Home</Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div ref={rootRef} className="ens-page p-6">
            <div className="pointer-events-none absolute inset-0 ens-grid" />
            <div className="pointer-events-none absolute inset-0 ens-noise" />
            <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-indigo-100 blur-3xl opacity-70" />
            <div className="pointer-events-none absolute top-48 left-0 h-72 w-72 rounded-full bg-blue-100 blur-3xl opacity-70" />

            <div className="relative z-10 max-w-5xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 space-y-2"
                >
                    <p className="gsap-verify-header text-xs uppercase tracking-[0.35em] text-slate-400">Verify</p>
                    <h1 className="gsap-verify-header text-4xl md:text-5xl font-display font-bold text-brand-dark">
                        Claim your tier
                    </h1>
                    <p className="gsap-verify-header text-lg text-slate-600">
                        Your ENS name unlocks selective disclosure privacy. <strong>Prove you're eligible — without revealing everything.</strong>
                    </p>
                </motion.div>

                <div className="mb-8 flex flex-wrap items-center gap-3">
                    <div className="ens-chip">
                        {ensName || 'Unnamed'} {tierName ? `• ${tierName}` : ''}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Main Verification Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="gsap-verify-card md:col-span-2 ens-card ens-glass p-8"
                    >
                        <h2 className="text-2xl font-display font-bold text-brand-dark mb-6">
                            Enter ENS
                        </h2>

                        {/* Search Input */}
                        <div className="mb-6 flex flex-wrap items-center gap-3">
                            <input
                                type="text"
                                value={searchName}
                                onChange={(event) => setSearchName(event.target.value)}
                                placeholder="alice.eth"
                                className="flex-1 min-w-[220px] px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-base font-semibold text-brand-dark outline-none focus:border-brand-blue focus:bg-white transition-colors"
                            />
                            <Button
                                onClick={handleVerify}
                                disabled={!searchName || isVerifying}
                            >
                                <Search className="w-4 h-4" />
                                {isVerifying ? 'Verifying...' : 'Claim'}
                            </Button>
                        </div>

                        {/* Verification Status */}
                        {verificationStatus === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-6"
                            >
                                <div className="flex items-start gap-4">
                                    <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-brand-dark mb-2">Claimed!</h3>
                                        <p className="text-slate-600 mb-4">
                                            Your ENS context has been registered. You can now access privacy-enhanced execution on Uniswap v4.
                                        </p>
                                        <Link to="/app">
                                            <Button size="sm">Start Trading</Button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {(verificationStatus === 'success' || isClaimed) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="ens-card p-6 border border-emerald-100/80 mb-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                                            Claim
                                        </p>
                                        <h3 className="text-xl font-display font-bold text-brand-dark">
                                            {claimResult?.ensName || ensName || searchName || 'Unnamed'}
                                        </h3>
                                    </div>
                                    <span className="ens-chip">Claimed</span>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <span className="text-slate-500">Wallet</span>
                                        <span className="font-mono text-xs text-brand-dark">
                                            {claimResult?.address || address}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <span className="text-slate-500">Tier</span>
                                        <span className="font-semibold text-brand-dark">
                                            {claimResult?.tierName || tierName || 'Standard'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <span className="text-slate-500">Context Score</span>
                                        <span className="font-semibold text-brand-dark">
                                            {claimResult?.totalScore ?? contextScore ?? 0}
                                        </span>
                                    </div>
                                    {isClaimed && (
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <span className="text-slate-500">Claim Contract</span>
                                            <a
                                                href={`${explorerBase}/address/${registryAddress}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-mono text-xs text-brand-dark hover:text-brand-blue transition-colors"
                                            >
                                                {registryAddress}
                                            </a>
                                        </div>
                                    )}
                                    {claimResult?.txHash && (
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <span className="text-slate-500">Tx Hash</span>
                                            <span className="font-mono text-xs text-brand-dark">{claimResult.txHash}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                        {verificationStatus === 'error' && errorMessage && (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-700 mb-6">
                                {errorMessage}
                            </div>
                        )}

                        {/* How Selective Disclosure Works */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-brand-dark mb-4">How it works</h3>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Lock className="w-5 h-5 text-brand-blue" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-dark mb-1">Prove tier</h4>
                                    <p className="text-sm text-slate-600">
                                        You only reveal your tier level (Standard/Trusted/Elite), never your exact score or transaction history.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-pink-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-dark mb-1">Onchain proof</h4>
                                    <p className="text-sm text-slate-600">
                                        Your ENS context is calculated from public blockchain data: holdings, DAO votes, DeFi activity.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-dark mb-1">Unlock pools</h4>
                                    <p className="text-sm text-slate-600">
                                        High-tier users unlock access to privacy-enhanced pools with reduced MEV exposure.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Current Score Card */}
                        {contextScore && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="gsap-verify-card ens-card p-6 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <TrendingUp className="w-32 h-32" />
                                </div>
                                <h3 className="text-lg font-bold text-brand-dark mb-1">Your score</h3>
                                <div className="text-5xl font-display font-black text-brand-dark mb-3">
                                    {contextScore}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Tier</span>
                                        <span className="font-bold text-brand-dark">
                                            {contextScore > 900 ? '🥇 Elite' : contextScore > 800 ? '🥈 Trusted' : '🥉 Standard'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/50 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-pink-400 to-pink-600 h-2 rounded-full transition-all duration-1000"
                                            style={{ width: `${(contextScore / 1000) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {claimResult?.breakdown && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 }}
                                className="ens-card p-6"
                            >
                                <h3 className="text-lg font-bold text-brand-dark mb-4">Score Breakdown</h3>
                                <div className="space-y-3 text-sm text-slate-600">
                                    {[
                                        { label: 'Wallet activity', value: claimResult.breakdown.transactionHistory, max: 300 },
                                        { label: 'Token holdings', value: claimResult.breakdown.tokenHoldings, max: 300 },
                                        { label: 'DeFi activity', value: claimResult.breakdown.defiActivity, max: 200 },
                                        { label: 'DAO participation', value: claimResult.breakdown.daoParticipation, max: 200 },
                                    ].map((item) => (
                                        <div key={item.label} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span>{item.label}</span>
                                                <span className="font-semibold text-brand-dark">{item.value}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div
                                                    className="bg-brand-blue h-2 rounded-full"
                                                    style={{ width: `${Math.min(item.value / item.max, 1) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Privacy Benefits */}
                            <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                                className="gsap-verify-card ens-card p-6"
                        >
                            <h3 className="text-lg font-bold text-brand-dark mb-4">Privacy Benefits</h3>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Lock className="w-5 h-5 text-brand-blue" />
                                    <span className="text-sm font-medium text-brand-dark">Selective Disclosure</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-brand-blue" />
                                    <span className="text-sm font-medium text-brand-dark">MEV Protection</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-brand-blue" />
                                    <span className="text-sm font-medium text-brand-dark">Tier-Gated Access</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-brand-blue" />
                                    <span className="text-sm font-medium text-brand-dark">Better Execution</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                            className="gsap-verify-card ens-card p-6"
                        >
                            <h3 className="text-lg font-bold text-brand-dark mb-4">Onchain Verification Flow</h3>
                            <div className="space-y-3 text-sm text-slate-600">
                                <div className="flex items-start gap-3">
                                    <div className="h-7 w-7 rounded-full bg-indigo-50 text-brand-blue font-semibold flex items-center justify-center">
                                        1
                                    </div>
                                    <span>Verify ENS ownership against the connected wallet.</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-7 w-7 rounded-full bg-indigo-50 text-brand-blue font-semibold flex items-center justify-center">
                                        2
                                    </div>
                                    <span>Compute score from onchain activity and normalize to 0-1000.</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-7 w-7 rounded-full bg-indigo-50 text-brand-blue font-semibold flex items-center justify-center">
                                        3
                                    </div>
                                    <span>Register tier onchain, then gates pools via the registry.</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="gsap-verify-card mt-10 ens-card ens-glass p-8"
                >
                    <div className="flex flex-col gap-2 mb-6">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Tier Scoring</p>
                        <h2 className="text-2xl font-display font-bold text-brand-dark">
                            Onchain Verification &amp; Tier Scoring
                        </h2>
                        <p className="text-sm text-slate-600">
                            We aggregate normalized onchain signals into a 0-1000 score and map the result to
                            Standard/Trusted/Elite tiers.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <h4 className="font-semibold text-brand-dark mb-3">Score mix</h4>
                            <div className="space-y-3 text-sm text-slate-600">
                                <div className="flex items-center justify-between">
                                    <span>Wallet age &amp; activity</span>
                                    <span className="font-semibold text-slate-700">20%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Holdings &amp; liquidity</span>
                                    <span className="font-semibold text-slate-700">30%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>DeFi usage</span>
                                    <span className="font-semibold text-slate-700">30%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>DAO participation</span>
                                    <span className="font-semibold text-slate-700">20%</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-slate-100">
                            <h4 className="font-semibold text-brand-dark mb-3">Formula</h4>
                            <p className="text-sm text-slate-600">
                                score = 1000 × (0.20 × wallet_age + 0.30 × holdings + 0.30 × defi_activity + 0.20 × dao_participation)
                            </p>
                            <p className="text-xs text-slate-500 mt-3">
                                Each component is normalized to 0-1 using chain-specific ranges and decay windows.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                    <th className="px-4 py-2">Tier</th>
                                    <th className="px-4 py-2">Score Range</th>
                                    <th className="px-4 py-2">Verification Inputs</th>
                                    <th className="px-4 py-2 text-right">Eligibility</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-slate-50 rounded-2xl">
                                    <td className="px-4 py-3 font-semibold text-brand-dark">Standard</td>
                                    <td className="px-4 py-3 text-slate-600">0 - 799</td>
                                    <td className="px-4 py-3 text-slate-600">
                                        Wallet age, basic holdings, tx activity
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-500">Open pools</td>
                                </tr>
                                <tr className="bg-indigo-50 rounded-2xl">
                                    <td className="px-4 py-3 font-semibold text-brand-dark">Trusted</td>
                                    <td className="px-4 py-3 text-slate-600">800 - 899</td>
                                    <td className="px-4 py-3 text-slate-600">
                                        DeFi usage, DAO participation, consistent volume
                                    </td>
                                    <td className="px-4 py-3 text-right text-indigo-600 font-semibold">Privacy pools</td>
                                </tr>
                                <tr className="bg-fuchsia-50 rounded-2xl">
                                    <td className="px-4 py-3 font-semibold text-brand-dark">Elite</td>
                                    <td className="px-4 py-3 text-slate-600">900 - 1000</td>
                                    <td className="px-4 py-3 text-slate-600">
                                        High value holdings, sustained onchain reputation
                                    </td>
                                    <td className="px-4 py-3 text-right text-fuchsia-600 font-semibold">Premium pools</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
