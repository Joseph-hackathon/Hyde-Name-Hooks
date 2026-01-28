import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Shield, TrendingUp, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import Button from '../components/ui/Button';
import { verifyEns } from '../lib/api';

export default function VerifyPage() {
    const { isConnected, contextScore, setContextScore, address, setEnsName, ensName, tierName } = useWallet();
    const [searchName, setSearchName] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const tabs = [
        { label: 'Swap', to: '/app' },
        { label: 'Verify', to: '/verify' },
        { label: 'Pools', to: '/pools' },
    ];

    const handleVerify = async () => {
        if (!searchName || !address) return;

        setIsVerifying(true);
        setVerificationStatus('idle');
        setErrorMessage(null);

        try {
            const result = await verifyEns(searchName.trim(), address);
            const score =
                result.tierName === 'Elite' ? 920 :
                    result.tierName === 'Trusted' ? 850 : 720;
            setContextScore(score);
            setEnsName(result.ensName);
            setVerificationStatus('success');
        } catch (error: any) {
            setVerificationStatus('error');
            setErrorMessage(error?.message || 'Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

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
                        Connect to Claim Context
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
        <div className="bg-background min-h-screen p-6">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 space-y-2"
                >
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Verify</p>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-dark">
                        Claim Your Context
                    </h1>
                    <p className="text-lg text-slate-600">
                        Your ENS name unlocks selective disclosure privacy. <strong>Prove you're eligible — without revealing everything.</strong>
                    </p>
                </motion.div>

                <div className="mb-8 flex flex-wrap items-center gap-3">
                    <div className="ens-chip">
                        {ensName || 'Unnamed'} {tierName ? `• ${tierName}` : ''}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <Link key={tab.to} to={tab.to} className="inline-flex">
                                <Button variant={tab.to === '/verify' ? 'primary' : 'ghost'} size="sm">
                                    {tab.label}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Main Verification Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-2 ens-card p-8"
                    >
                        <h2 className="text-2xl font-display font-bold text-brand-dark mb-6">
                            Enter Your ENS Name
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
                                        <h3 className="font-bold text-brand-dark mb-2">Context Claimed!</h3>
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
                        {verificationStatus === 'error' && errorMessage && (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-700 mb-6">
                                {errorMessage}
                            </div>
                        )}

                        {/* How Selective Disclosure Works */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-brand-dark mb-4">How Selective Disclosure Works</h3>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Lock className="w-5 h-5 text-brand-blue" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-dark mb-1">Prove Tier, Hide Score</h4>
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
                                    <h4 className="font-bold text-brand-dark mb-1">Onchain Verification</h4>
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
                                    <h4 className="font-bold text-brand-dark mb-1">Access Privacy Pools</h4>
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
                                className="ens-card p-6 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <TrendingUp className="w-32 h-32" />
                                </div>
                                <h3 className="text-lg font-bold text-brand-dark mb-1">Your Context</h3>
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

                        {/* Privacy Benefits */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="ens-card p-6"
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
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-10 ens-card p-8"
                >
                    <div className="flex flex-col gap-2 mb-6">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Tier Scoring</p>
                        <h2 className="text-2xl font-display font-bold text-brand-dark">
                            온체인 검증 &amp; 티어 구분 기준
                        </h2>
                        <p className="text-sm text-slate-600">
                            거래 이력, 보유 자산, DeFi 참여도 등 온체인 데이터를 합산해 0-1000 점수로 산정하고,
                            점수 구간에 따라 Standard/Trusted/Elite로 분류합니다.
                        </p>
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
