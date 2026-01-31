import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Repeat, Activity, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChainId } from 'wagmi';
import { useWallet } from '../contexts/WalletContext';
import Button from '../components/ui/Button';
import { CHAINS } from '../config/contracts';
import { createArcSettlement, getArcSettlementStatus } from '../lib/api';
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
    const [swapTxHash, setSwapTxHash] = useState('');
    const [settlementStatus, setSettlementStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [settlementError, setSettlementError] = useState<string | null>(null);
    const [settlementResult, setSettlementResult] = useState<{
        settlementId: string;
        network: string;
        usdcAmount: string;
        status: 'ready' | 'submitted';
        settlementAsset: 'USDC';
        createdAt: string;
        circleTransactionId?: string;
        circleTransactionState?: string;
    } | null>(null);
    const [circleStatus, setCircleStatus] = useState<{
        id: string;
        state: string;
        txHash?: string;
        updateDate?: string;
        errorReason?: string;
    } | null>(null);
    const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
    const [autoCheckCount, setAutoCheckCount] = useState(0);
    const terminalStates = ['COMPLETE', 'FAILED', 'DENIED', 'CANCELLED'];
    const arcExplorerBase = (import.meta.env.VITE_ARC_EXPLORER_BASE || '').trim();

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
                opacity: 0,
                duration: 0.7,
                ease: 'power3.out',
                stagger: 0.08,
                immediateRender: false,
                clearProps: 'transform,opacity',
            });

            gsap.utils.toArray<HTMLElement>('.gsap-reveal').forEach((card) => {
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
        setSettlementStatus('idle');
        setSettlementError(null);
        setSettlementResult(null);
        setCircleStatus(null);
        setAutoCheckCount(0);

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

    const handleArcSettlement = async () => {
        setSettlementError(null);
        setSettlementStatus('submitting');
        setSettlementResult(null);
        setCircleStatus(null);
        setAutoCheckCount(0);

        if (!address) {
            setSettlementStatus('error');
            setSettlementError('Connect your wallet to settle on Arc.');
            return;
        }
        if (!receiveAmount || Number.isNaN(Number(receiveAmount))) {
            setSettlementStatus('error');
            setSettlementError('Enter a valid swap amount first.');
            return;
        }
        if (receiveToken !== 'USDC') {
            setSettlementStatus('error');
            setSettlementError('Arc settlement requires USDC output.');
            return;
        }

        try {
            const result = await createArcSettlement({
                userAddress: address,
                swapTxHash: swapTxHash.trim() || undefined,
                inputToken: payToken,
                outputToken: receiveToken,
                inputAmount: payAmount,
                outputAmount: receiveAmount,
                sourceChainId: chainId || CHAINS.sepolia.id,
            });
            setSettlementResult(result);
            if (result.circleTransactionId) {
                setCircleStatus({
                    id: result.circleTransactionId,
                    state: result.circleTransactionState || 'INITIATED',
                });
            }
            setSettlementStatus('success');
        } catch (error: any) {
            setSettlementStatus('error');
            setSettlementError(error?.message || 'Arc settlement failed.');
        }
    };

    const handleCheckSettlement = async () => {
        if (!settlementResult?.circleTransactionId) return;
        setSettlementError(null);
        setSettlementStatus('submitting');
        try {
            const status = await getArcSettlementStatus(settlementResult.circleTransactionId);
            setCircleStatus(status);
            setAutoCheckCount((count) => count + 1);
            setSettlementStatus('success');
        } catch (error: any) {
            setSettlementStatus('error');
            setSettlementError(error?.message || 'Failed to fetch settlement status.');
        }
    };

    const getFailureResolution = (reason?: string) => {
        const normalized = (reason || '').toLowerCase();
        if (normalized.includes('insufficient') || normalized.includes('balance') || normalized.includes('fund')) {
            return {
                title: '잔액 부족',
                detail: 'Arc 지갑의 USDC 또는 가스 잔액을 확인하세요.',
                actionLabel: '재시도',
                action: 'retry' as const,
            };
        }
        if (normalized.includes('denied') || normalized.includes('compliance') || normalized.includes('screen')) {
            return {
                title: '규정/정책 거절',
                detail: '컴플라이언스 이슈가 의심됩니다. 지원팀에 문의하세요.',
                actionLabel: '문의하기',
                action: 'support' as const,
                href: 'mailto:customer-support@circle.com',
            };
        }
        return {
            title: '일시 오류',
            detail: '네트워크 지연 또는 처리 실패입니다. 잠시 후 재시도하세요.',
            actionLabel: '재시도',
            action: 'retry' as const,
        };
    };

    useEffect(() => {
        if (!autoCheckEnabled) return;
        if (!settlementResult?.circleTransactionId) return;
        if (!circleStatus) return;

        if (terminalStates.includes(circleStatus.state)) return;
        if (autoCheckCount >= 12) return;

        const timeout = setTimeout(() => {
            handleCheckSettlement();
        }, 5000);

        return () => clearTimeout(timeout);
    }, [autoCheckEnabled, settlementResult?.circleTransactionId, circleStatus, autoCheckCount]);

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

                    <div className="mt-6 rounded-2xl border border-slate-100 bg-white/70 p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-400">
                                    Post-swap settlement
                                </p>
                                <h3 className="text-lg font-semibold text-brand-dark mt-2">
                                    Arc USDC Settlement (Testnet)
                                </h3>
                                <p className="text-xs text-slate-600 mt-2">
                                    Swap executes on Uniswap, then Arc finalizes the result into payment-ready USDC.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-slate-500">Swap tx hash (optional)</label>
                                <input
                                    type="text"
                                    value={swapTxHash}
                                    onChange={(event) => setSwapTxHash(event.target.value)}
                                    placeholder="0x..."
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-brand-dark outline-none focus:border-brand-blue"
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Arc output</span>
                                <span className="font-semibold text-brand-dark">
                                    {receiveToken === 'USDC' && receiveAmount ? `${receiveAmount} USDC` : 'USDC required'}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleArcSettlement}
                                disabled={settlementStatus === 'submitting'}
                            >
                                {settlementStatus === 'submitting' ? 'Settling...' : 'Settle on Arc'}
                            </Button>
                        </div>

                        {settlementStatus === 'error' && settlementError && (
                            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                                {settlementError}
                            </div>
                        )}

                        {settlementStatus === 'success' && settlementResult && (
                            <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                                Settlement ready • {settlementResult.usdcAmount} {settlementResult.settlementAsset} •
                                ID {settlementResult.settlementId}
                                {settlementResult.circleTransactionState && (
                                    <span className="ml-2 text-[0.65rem] uppercase tracking-[0.2em] text-emerald-600">
                                        {settlementResult.circleTransactionState}
                                    </span>
                                )}
                                {circleStatus?.txHash && arcExplorerBase && (
                                    <a
                                        href={`${arcExplorerBase.replace(/\/$/, '')}/tx/${circleStatus.txHash}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="ml-2 text-[0.65rem] font-semibold text-emerald-700 underline"
                                    >
                                        Arc Explorer
                                    </a>
                                )}
                            </div>
                        )}

                        {settlementResult?.circleTransactionId && (
                            <div className="mt-3 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs text-slate-600">
                                <div className="flex items-center justify-between gap-3">
                                    <span>Circle tx</span>
                                    <span className="font-mono text-[0.65rem] text-brand-dark">
                                        {settlementResult.circleTransactionId}
                                    </span>
                                </div>
                                {circleStatus && (
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <span>Status</span>
                                        <span className="font-semibold text-brand-dark">{circleStatus.state}</span>
                                    </div>
                                )}
                                {circleStatus?.txHash && (
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <span>Tx hash</span>
                                        {arcExplorerBase ? (
                                            <a
                                                href={`${arcExplorerBase.replace(/\/$/, '')}/tx/${circleStatus.txHash}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-mono text-[0.65rem] text-brand-dark underline"
                                            >
                                                {circleStatus.txHash.slice(0, 10)}...{circleStatus.txHash.slice(-6)}
                                            </a>
                                        ) : (
                                            <span className="font-mono text-[0.65rem] text-brand-dark">
                                                {circleStatus.txHash.slice(0, 10)}...{circleStatus.txHash.slice(-6)}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {circleStatus?.errorReason && (
                                    <div className="mt-2 rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-[0.65rem] text-red-700">
                                        실패 사유: {circleStatus.errorReason}
                                    </div>
                                )}
                                <div className="mt-2 flex items-center justify-between gap-3">
                                    <span>자동 갱신</span>
                                    <button
                                        type="button"
                                        onClick={() => setAutoCheckEnabled((value) => !value)}
                                        className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold transition-colors ${autoCheckEnabled
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-slate-100 text-slate-500'
                                            }`}
                                    >
                                        {autoCheckEnabled ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2"
                                    onClick={handleCheckSettlement}
                                    disabled={settlementStatus === 'submitting'}
                                >
                                    상태 갱신
                                </Button>
                                {circleStatus && terminalStates.includes(circleStatus.state) && (
                                    <div className="mt-2 text-[0.65rem] text-slate-500">
                                        {circleStatus.state === 'COMPLETE'
                                            ? '정산 완료: USDC가 Arc 지갑에 반영되었습니다.'
                                            : '정산 실패: 상태를 확인하고 재시도하세요.'}
                                    </div>
                                )}
                                {circleStatus &&
                                    terminalStates.includes(circleStatus.state) &&
                                    circleStatus.state !== 'COMPLETE' && (
                                        <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[0.65rem] text-slate-600">
                                            {(() => {
                                                const resolution = getFailureResolution(circleStatus.errorReason);
                                                return (
                                                    <>
                                                        <div className="font-semibold text-brand-dark">{resolution.title}</div>
                                                        <div className="mt-1">{resolution.detail}</div>
                                                        <div className="mt-2">
                                                            {resolution.action === 'support' && resolution.href ? (
                                                                <a
                                                                    href={resolution.href}
                                                                    className="font-semibold text-brand-blue underline"
                                                                >
                                                                    {resolution.actionLabel}
                                                                </a>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={handleArcSettlement}
                                                                    className="font-semibold text-brand-blue underline"
                                                                >
                                                                    {resolution.actionLabel}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                            </div>
                        )}
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
                            <li>5. Arc settles swap output into USDC for payment-ready balance.</li>
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
