import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Repeat, Activity, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBalance, useChainId, useReadContract } from 'wagmi';
import { formatUnits, isAddress } from 'viem';
import { useWallet } from '../contexts/WalletContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { CHAINS } from '../config/contracts';
import { createArcSettlement, getArcSettlementStatus } from '../lib/api';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function AppPage() {
    const rootRef = useRef<HTMLDivElement>(null);
    const { isConnected, ensName, contextScore, address, tierName } = useWallet();
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
    const rawApiBase = import.meta.env.VITE_API_URL;
    const fallbackBase = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
    const apiBase = rawApiBase
        ? (rawApiBase.startsWith('http') ? rawApiBase : `https://${rawApiBase}`)
        : fallbackBase;
    const storkStreamUrl = `${apiBase.replace(/\/$/, '')}/api/stork/stream`;
    const [storkPrices, setStorkPrices] = useState<{
        ethUsd?: number;
        usdcUsd?: number;
        updatedAt?: number;
    }>({});
    const [storkError, setStorkError] = useState<string | null>(null);
    const [storkStatus, setStorkStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
    const [storkSource, setStorkSource] = useState('Stork WS');
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [helpTopic, setHelpTopic] = useState<'swap-hash' | 'settlement-id' | 'settlement-hash' | null>(null);

    const getStorkBadge = () => {
        if (storkStatus === 'connected') return { label: 'LIVE', className: 'bg-emerald-100 text-emerald-700' };
        if (storkStatus === 'connecting') return { label: 'CONNECTING', className: 'bg-amber-100 text-amber-700' };
        if (storkStatus === 'disconnected') return { label: 'DISCONNECTED', className: 'bg-slate-100 text-slate-500' };
        return { label: 'ERROR', className: 'bg-red-100 text-red-700' };
    };

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

    const tokens = swapConfig?.tokens ?? [
        { symbol: 'ETH', address: 'ETH', label: 'ETH' },
        { symbol: 'USDC', address: 'USDC', label: 'USDC' },
    ];
    const rawUsdcAddress = swapConfig?.tokens.find((token) => token.symbol === 'USDC')?.address;
    const usdcAddress = rawUsdcAddress && isAddress(rawUsdcAddress) ? rawUsdcAddress : undefined;
    const activeChainId = chainId || CHAINS.sepolia.id;
    const walletAddress = address && isAddress(address) ? address : undefined;
    const { data: ethBalanceData } = useBalance({
        address: walletAddress,
        chainId: activeChainId,
        query: {
            enabled: Boolean(walletAddress),
        },
    });
    const usdcBalanceResult = useReadContract({
        address: usdcAddress,
        abi: [
            {
                type: 'function',
                name: 'balanceOf',
                stateMutability: 'view',
                inputs: [{ name: 'account', type: 'address' }],
                outputs: [{ name: 'balance', type: 'uint256' }],
            },
        ],
        functionName: 'balanceOf',
        args: walletAddress ? [walletAddress] : undefined,
        chainId: activeChainId,
        query: {
            enabled: Boolean(walletAddress && usdcAddress),
        },
    });
    const formatTokenBalance = (value: typeof ethBalanceData, decimals: number, symbol: string) => {
        if (!value) return `0.0 ${symbol}`;
        const parsed = parseFloat(formatUnits(value.value, value.decimals));
        return `${parsed.toFixed(decimals)} ${symbol}`;
    };
    const usdcBalanceValue = usdcBalanceResult.data as bigint | undefined;
    const balanceByToken = {
        ETH: formatTokenBalance(ethBalanceData, 4, 'ETH'),
        USDC: usdcBalanceValue !== undefined
            ? `${parseFloat(formatUnits(usdcBalanceValue, 6)).toFixed(2)} USDC`
            : '0.0 USDC',
    };
    const getBalanceLabel = (token: string) =>
        token === 'USDC' ? balanceByToken.USDC : balanceByToken.ETH;

    const isStorkReady = storkStatus === 'connected' && Boolean(storkPrices.ethUsd);
    const getRate = (fromToken: string, toToken: string) => {
        if (fromToken === toToken) return 1;
        if (!isStorkReady) return null;
        if (fromToken === 'ETH' && toToken === 'USDC') {
            const usdcUsd = storkPrices.usdcUsd || 1;
            return storkPrices.ethUsd! / usdcUsd;
        }
        if (fromToken === 'USDC' && toToken === 'ETH') {
            const usdcUsd = storkPrices.usdcUsd || 1;
            return usdcUsd / storkPrices.ethUsd!;
        }
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
    const receivePlaceholder = isStorkReady ? 'Quoted on Uniswap' : 'Waiting for live price';

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

    const openHelp = (topic: 'swap-hash' | 'settlement-id' | 'settlement-hash') => {
        setHelpTopic(topic);
        setIsHelpOpen(true);
    };

    const parseStorkPrice = (raw: string) => {
        try {
            const value = BigInt(raw);
            const base = 10n ** 18n;
            const whole = value / base;
            const fraction = value % base;
            const fractionText = fraction.toString().padStart(18, '0').slice(0, 6);
            return Number(`${whole.toString()}.${fractionText}`);
        } catch {
            return null;
        }
    };

    const applyStorkUpdate = (data: any) => {
        const values = data || {};
        const eth = values?.ETHUSD?.price;
        const usdc = values?.USDCUSD?.price;
        const timestamp = values?.ETHUSD?.timestamp || values?.USDCUSD?.timestamp;
        const ethUsd = eth ? parseStorkPrice(eth) : null;
        const usdcUsd = usdc ? parseStorkPrice(usdc) : null;
        if (!ethUsd && !usdcUsd) return;
        setStorkPrices((prev) => ({
            ethUsd: ethUsd ?? prev.ethUsd,
            usdcUsd: usdcUsd ?? prev.usdcUsd,
            updatedAt: timestamp ? Math.floor(Number(timestamp) / 1e9) : Math.floor(Date.now() / 1000),
        }));
        setStorkSource('Stork WS');
    };

    const getFailureResolution = (reason?: string) => {
        const normalized = (reason || '').toLowerCase();
        if (normalized.includes('insufficient') || normalized.includes('balance') || normalized.includes('fund')) {
            return {
                title: 'Insufficient balance',
                detail: 'Check the Arc wallet USDC or gas balance.',
                actionLabel: 'Retry',
                action: 'retry' as const,
            };
        }
        if (normalized.includes('denied') || normalized.includes('compliance') || normalized.includes('screen')) {
            return {
                title: 'Compliance rejection',
                detail: 'A compliance issue is suspected. Contact support.',
                actionLabel: 'Contact support',
                action: 'support' as const,
                href: 'mailto:customer-support@circle.com',
            };
        }
        return {
            title: 'Temporary error',
            detail: 'Network delay or processing failure. Please retry shortly.',
            actionLabel: 'Retry',
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

    useEffect(() => {
        setStorkStatus('connecting');
        setStorkError(null);

        const source = new EventSource(storkStreamUrl);

        const handlePrice = (event: MessageEvent) => {
            try {
                const payload = JSON.parse(event.data);
                applyStorkUpdate(payload?.data || {});
                setStorkStatus('connected');
            } catch {
            setStorkError('Failed to parse Stork price data.');
            }
        };

        const handleStatus = (event: MessageEvent) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload?.state === 'error') {
                    setStorkStatus('error');
                    setStorkError(payload?.message || 'Stork stream error.');
                    return;
                }
                if (payload?.state === 'connected') {
                    setStorkStatus('connected');
                    setStorkError(null);
                    return;
                }
                if (payload?.state === 'disconnected') {
                    setStorkStatus('disconnected');
                    return;
                }
            } catch {
                setStorkStatus('error');
                setStorkError('Failed to handle Stork status.');
            }
        };

        source.addEventListener('price', handlePrice as EventListener);
        source.addEventListener('status', handleStatus as EventListener);

        source.onerror = () => {
            setStorkStatus('error');
            setStorkError('Stork stream connection failed.');
        };

        return () => {
            source.removeEventListener('price', handlePrice as EventListener);
            source.removeEventListener('status', handleStatus as EventListener);
            source.close();
        };
    }, [storkStreamUrl]);

    return (
        <>
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
                    </div>
                </header>

            <div className="max-w-6xl mx-auto mb-8 flex flex-wrap items-center gap-3">
                <div className="ens-chip">
                    {ensName || 'Unnamed'} {tier ? `• ${tier}` : ''}
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
                                <span className="text-brand-dark font-bold">Balance: {getBalanceLabel(payToken)}</span>
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
                                <span className="text-brand-dark font-bold">Balance: {getBalanceLabel(receiveToken)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <input
                                    type="text"
                                    value={receiveAmount}
                                    placeholder={receivePlaceholder}
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
                    <div className="mt-3 rounded-xl border border-slate-100 bg-white/70 px-4 py-3 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-brand-blue" />
                                <span>Stork Live Price</span>
                                <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold ${getStorkBadge().className}`}>
                                    {getStorkBadge().label}
                                </span>
                            </div>
                            <span className="font-semibold text-brand-dark">
                                {storkPrices.ethUsd ? `ETH ${storkPrices.ethUsd.toFixed(2)} USD` : 'Waiting'}
                            </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                            <span>USDC</span>
                            <span className="font-semibold text-brand-dark">
                                {storkPrices.usdcUsd ? `${storkPrices.usdcUsd.toFixed(4)} USD` : 'Waiting'}
                            </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[0.65rem] text-slate-400">
                            <span>Source</span>
                            <span>{storkSource}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[0.65rem] text-slate-400">
                            <span>Status</span>
                            <span>{storkStatus}</span>
                        </div>
                        <div className="mt-1 text-[0.65rem] text-slate-400">
                            {storkPrices.updatedAt
                                ? `Last update: ${new Date(storkPrices.updatedAt * 1000).toLocaleTimeString()}`
                                : 'Waiting for updates'}
                        </div>
                        {storkError && (
                            <div className="mt-1 text-[0.65rem] text-amber-700">
                                {storkError}
                            </div>
                        )}
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
                                <div className="mt-3 text-[0.7rem] text-slate-500 space-y-1">
                                    <div>• Purpose: settle swap output in USDC for payment-ready balance.</div>
                                    <div>• Why: turns private swaps into real-world usable stable settlement.</div>
                                    <div>• Hash: links the swap transaction to settlement tracking.</div>
                                    <div>• ID: internal reference for the settlement request.</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-slate-500">Swap tx hash (optional)</label>
                                    <button
                                        type="button"
                                        onClick={() => openHelp('swap-hash')}
                                        className="text-[0.65rem] font-semibold text-brand-blue underline"
                                    >
                                        Help
                                    </button>
                                </div>
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
                                Settlement ready • {settlementResult.usdcAmount} {settlementResult.settlementAsset} •{' '}
                                <button
                                    type="button"
                                    onClick={() => openHelp('settlement-id')}
                                    className="font-semibold underline"
                                >
                                    ID {settlementResult.settlementId}
                                </button>
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
                                        <div className="flex items-center gap-2">
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
                                            <button
                                                type="button"
                                                onClick={() => openHelp('settlement-hash')}
                                                className="text-[0.65rem] font-semibold text-brand-blue underline"
                                            >
                                                Help
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {circleStatus?.errorReason && (
                                    <div className="mt-2 rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-[0.65rem] text-red-700">
                                        Failure reason: {circleStatus.errorReason}
                                    </div>
                                )}
                                <div className="mt-2 flex items-center justify-between gap-3">
                                    <span>Auto refresh</span>
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
                                    Refresh status
                                </Button>
                                {circleStatus && terminalStates.includes(circleStatus.state) && (
                                    <div className="mt-2 text-[0.65rem] text-slate-500">
                                        {circleStatus.state === 'COMPLETE'
                                            ? 'Settlement complete: USDC is reflected on Arc.'
                                            : 'Settlement failed: review status and retry.'}
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
        <Modal
            isOpen={isHelpOpen}
            onClose={() => setIsHelpOpen(false)}
            title={
                helpTopic === 'swap-hash'
                    ? 'Swap Hash Help'
                    : helpTopic === 'settlement-hash'
                        ? 'Settlement Tx Hash Help'
                        : 'Settlement ID Help'
            }
        >
            {helpTopic === 'swap-hash' && (
                <div className="space-y-3 text-sm text-slate-600">
                    <p>
                        The swap hash tracks the Uniswap transaction. It links your swap to the Arc settlement
                        for monitoring and support.
                    </p>
                    <p className="text-xs text-slate-500">
                        Tip: copy the transaction hash from your wallet or explorer after the swap.
                    </p>
                    <a
                        href="https://developers.circle.com/build-onchain"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-brand-blue underline"
                    >
                        Arc settlement overview
                    </a>
                </div>
            )}
            {helpTopic === 'settlement-hash' && (
                <div className="space-y-3 text-sm text-slate-600">
                    <p>
                        The settlement hash is the Arc on-chain transfer tx hash. Use it to verify the settlement
                        directly in the Arc explorer.
                    </p>
                    <p className="text-xs text-slate-500">
                        Follow the Arc Explorer link to inspect details.
                    </p>
                    <a
                        href="https://developers.circle.com/wallets"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-brand-blue underline"
                    >
                        Circle Wallets docs
                    </a>
                </div>
            )}
            {helpTopic === 'settlement-id' && (
                <div className="space-y-3 text-sm text-slate-600">
                    <p>
                        The settlement ID is an internal reference for this Arc settlement request. It helps track
                        the request across logs and Circle transaction checks.
                    </p>
                    <p className="text-xs text-slate-500">
                        This is metadata that ties swap output to the settlement flow.
                    </p>
                    <a
                        href="https://developers.circle.com/wallets"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-brand-blue underline"
                    >
                        Circle Wallets docs
                    </a>
                </div>
            )}
        </Modal>
        </>
    );
}
