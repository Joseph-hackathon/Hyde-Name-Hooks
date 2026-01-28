import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Shield, TrendingUp, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import Button from '../components/ui/Button';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/button/filled-button.js';

export default function VerifyPage() {
    const { isConnected, contextScore, setContextScore } = useWallet();
    const [searchName, setSearchName] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleVerify = async () => {
        if (!searchName) return;

        setIsVerifying(true);
        setVerificationStatus('idle');

        // Simulate verification
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock: Generate a score based on name length (just for demo)
        const mockScore = 700 + Math.floor(Math.random() * 300);
        setContextScore(mockScore);
        setVerificationStatus('success');
        setIsVerifying(false);
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
                    className="mb-10 space-y-2"
                >
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Verify</p>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-dark">
                        Claim Your Context
                    </h1>
                    <p className="text-lg text-slate-600">
                        Your ENS name unlocks selective disclosure privacy. <strong>Prove you're eligible — without revealing everything.</strong>
                    </p>
                </motion.div>

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
                            <md-filled-text-field
                                label="ENS name"
                                placeholder="alice.eth"
                                className="flex-1"
                                value={searchName}
                                onInput={(event: FormEvent<HTMLElement>) => {
                                    const target = event.currentTarget as HTMLInputElement;
                                    setSearchName(target.value);
                                }}
                            />
                            <md-filled-button
                                onClick={handleVerify}
                                disabled={!searchName || isVerifying}
                            >
                                <span className="flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    {isVerifying ? 'Verifying...' : 'Claim'}
                                </span>
                            </md-filled-button>
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
            </div>
        </div>
    );
}
