import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Repeat, Activity, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBalance, useChainId, useReadContract, useSignTypedData } from 'wagmi';
import { formatUnits, isAddress } from 'viem';
import { useWallet } from '../contexts/WalletContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { CHAINS } from '../config/contracts';
import {
    createArcSettlement,
    getArcSettlementStatus,
    getGatewayBalances,
    getGatewayDomains,
    buildBurnIntent,
    transferGatewayBalance,
    getBridgeChains,
    getBridgeSourceBalance,
} from '../lib/api';
import { estimateBridgeInBrowser, executeBridgeInBrowser, recoverBridgeInBrowser } from '../lib/bridgeKitBrowser';
import type { BurnIntentMessage } from '../lib/api';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const GATEWAY_EIP712_DOMAIN = { name: 'GatewayWallet', version: '1' } as const;
const GATEWAY_EIP712_TYPES = {
    TransferSpec: [
        { name: 'version', type: 'uint32' },
        { name: 'sourceDomain', type: 'uint32' },
        { name: 'destinationDomain', type: 'uint32' },
        { name: 'sourceContract', type: 'bytes32' },
        { name: 'destinationContract', type: 'bytes32' },
        { name: 'sourceToken', type: 'bytes32' },
        { name: 'destinationToken', type: 'bytes32' },
        { name: 'sourceDepositor', type: 'bytes32' },
        { name: 'destinationRecipient', type: 'bytes32' },
        { name: 'sourceSigner', type: 'bytes32' },
        { name: 'destinationCaller', type: 'bytes32' },
        { name: 'value', type: 'uint256' },
        { name: 'salt', type: 'bytes32' },
        { name: 'hookData', type: 'bytes' },
    ],
    BurnIntent: [
        { name: 'maxBlockHeight', type: 'uint256' },
        { name: 'maxFee', type: 'uint256' },
        { name: 'spec', type: 'TransferSpec' },
    ],
} as const;

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
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [helpTopic, setHelpTopic] = useState<'swap-hash' | 'settlement-id' | 'settlement-hash' | null>(null);
    const [gatewayStatus, setGatewayStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [gatewayError, setGatewayError] = useState<string | null>(null);
    const [gatewayBalances, setGatewayBalances] = useState<Array<{ domain: number; balance: string }> | null>(null);
    const [bridgeChains, setBridgeChains] = useState<Array<{ chain: string; name: string; type: string }>>([]);
    const [bridgeFromChain, setBridgeFromChain] = useState('');
    const [bridgeToChain, setBridgeToChain] = useState('');
    const [bridgeAmount, setBridgeAmount] = useState('');
    const [bridgeSpeed, setBridgeSpeed] = useState<'FAST' | 'SLOW'>('FAST');
    const [bridgeMaxFee, setBridgeMaxFee] = useState('');
    const [bridgeStatus, setBridgeStatus] = useState<'idle' | 'estimating' | 'bridging' | 'success' | 'error'>('idle');
    const [bridgeError, setBridgeError] = useState<string | null>(null);
    const [bridgeEstimate, setBridgeEstimate] = useState<Record<string, unknown> | null>(null);
    const [bridgeResult, setBridgeResult] = useState<Record<string, unknown> | null>(null);
    const [bridgeStartTime, setBridgeStartTime] = useState<number | null>(null);
    const [sourceBalance, setSourceBalance] = useState<string | null>(null);
    const [sourceBalanceLoading, setSourceBalanceLoading] = useState(false);

    const [recoveryTxHash, setRecoveryTxHash] = useState('');
    const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'recovering' | 'success' | 'error'>('idle');
    const [recoveryError, setRecoveryError] = useState<string | null>(null);

    const [gatewayDomains, setGatewayDomains] = useState<Array<{ domain: number; name: string }>>([]);
    const [gatewaySourceDomain, setGatewaySourceDomain] = useState<number>(0);
    const [gatewayDestDomain, setGatewayDestDomain] = useState<number>(1);
    const [gatewayAmount, setGatewayAmount] = useState('');
    const [gatewayBurnIntent, setGatewayBurnIntent] = useState<BurnIntentMessage | null>(null);
    const [gatewayTransferStatus, setGatewayTransferStatus] = useState<'idle' | 'building' | 'signing' | 'submitting' | 'success' | 'error'>('idle');
    const [gatewayTransferResult, setGatewayTransferResult] = useState<{
        transferId?: string;
        attestation?: string;
        signature?: string;
        fees?: { total?: string; token?: string };
        expirationBlock?: string;
    } | null>(null);
    const [gatewayTransferError, setGatewayTransferError] = useState<string | null>(null);

    const { signTypedDataAsync } = useSignTypedData();

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

    const [expectedReceiveAmount, setExpectedReceiveAmount] = useState('');
    const receiveAmount = expectedReceiveAmount.trim();
    const receivePlaceholder = 'Enter expected amount (e.g. from Uniswap)';

    useEffect(() => {
        let active = true;
        const loadChains = async () => {
            try {
                const chains = await getBridgeChains();
                if (!active) return;
                setBridgeChains(chains);
                const arcChain = chains.find((chain) => chain.chain.toLowerCase().includes('arc'))?.chain;
                const baseChain = chains.find((chain) => chain.chain.toLowerCase().includes('base'))?.chain;
                setBridgeFromChain(arcChain || chains[0]?.chain || '');
                setBridgeToChain(baseChain || chains[1]?.chain || chains[0]?.chain || '');
            } catch (error: any) {
                if (!active) return;
                setBridgeError(error?.message || 'Failed to load Bridge Kit chains.');
            }
        };
        loadChains();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const list = await getGatewayDomains();
                if (active) setGatewayDomains(Array.isArray(list) ? list : []);
            } catch {
                if (active) setGatewayDomains([{ domain: 0, name: 'Ethereum Sepolia' }, { domain: 1, name: 'Avalanche Fuji' }, { domain: 6, name: 'Base Sepolia' }]);
            }
        };
        load();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (settlementResult?.usdcAmount) {
            setBridgeAmount(settlementResult.usdcAmount);
        } else if (receiveAmount && receiveToken === 'USDC') {
            setBridgeAmount(receiveAmount);
        }
    }, [settlementResult?.usdcAmount, receiveAmount, receiveToken]);

    useEffect(() => {
        if (!address || !bridgeFromChain || !/Ethereum_Sepolia|Ethereum Sepolia/i.test(bridgeFromChain)) {
            setSourceBalance(null);
            return;
        }
        let active = true;
        setSourceBalanceLoading(true);
        getBridgeSourceBalance(bridgeFromChain, address)
            .then((data) => {
                if (active) setSourceBalance(data.balance);
            })
            .catch(() => {
                if (active) setSourceBalance(null);
            })
            .finally(() => {
                if (active) setSourceBalanceLoading(false);
            });
        return () => {
            active = false;
        };
    }, [address, bridgeFromChain]);

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
        // Arc settlement finalizes the USDC you *receive* from the swap (output = USDC only).
        if (receiveToken !== 'USDC') {
            setSettlementStatus('error');
            setSettlementError(
                'Arc settlement finalizes the USDC you receive from the swap. Your swap currently receives ' +
                receiveToken +
                ', not USDC. Set Receive to USDC (e.g. swap ETH → USDC) to use Arc settlement.'
            );
            return;
        }
        const usdcOutputAmount = receiveAmount;
        const isValidUsdc = usdcOutputAmount && !Number.isNaN(Number(usdcOutputAmount)) && Number(usdcOutputAmount) > 0;
        if (!isValidUsdc) {
            setSettlementStatus('error');
            setSettlementError('Enter expected USDC amount (the amount you receive from the swap).');
            return;
        }

        try {
            const result = await createArcSettlement({
                userAddress: address,
                swapTxHash: swapTxHash.trim() || undefined,
                inputToken: payToken,
                outputToken: receiveToken,
                inputAmount: (payAmount?.trim() || '0'),
                outputAmount: usdcOutputAmount,
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

    const handleGatewayBalances = async () => {
        if (!address) return;
        setGatewayStatus('loading');
        setGatewayError(null);
        try {
            const result = await getGatewayBalances({
                token: 'USDC',
                depositor: address,
            });
            setGatewayBalances(result.balances || []);
            setGatewayStatus('success');
        } catch (error: any) {
            setGatewayStatus('error');
            setGatewayError(error?.message || 'Failed to load Gateway balances.');
        }
    };

    const handleBridgeEstimate = async () => {
        if (!address) {
            setBridgeError('Connect your wallet first.');
            return;
        }
        if (!bridgeFromChain || !bridgeToChain || !bridgeAmount) {
            setBridgeError('Select chains and amount first.');
            return;
        }
        setBridgeStatus('estimating');
        setBridgeError(null);
        try {
            const result = await estimateBridgeInBrowser({
                fromChain: bridgeFromChain,
                toChain: bridgeToChain,
                amount: bridgeAmount,
                config: {
                    transferSpeed: bridgeSpeed,
                    maxFee: bridgeMaxFee || undefined,
                },
            });
            setBridgeEstimate(result);
            setBridgeStatus('idle');
        } catch (error: unknown) {
            setBridgeStatus('error');
            setBridgeError(error instanceof Error ? error.message : 'Failed to estimate bridge transfer.');
        }
    };

    const handleRecoverBridge = async () => {
        if (!recoveryTxHash) {
            setRecoveryError('Enter a transaction hash.');
            return;
        }
        setRecoveryStatus('recovering');
        setRecoveryError(null);
        try {
            const result = await recoverBridgeInBrowser({
                sourceTxHash: recoveryTxHash.trim(),
            });
            console.log('Recovery result:', result);
            setRecoveryStatus('success');
            setBridgeStatus('success');
            setBridgeResult(result);
        } catch (error: unknown) {
            setRecoveryStatus('error');
            setRecoveryError(error instanceof Error ? error.message : 'Bridge recovery failed.');
        }
    };

    const handleBridgeTransfer = async () => {
        if (!address) {
            setBridgeError('Connect your wallet first.');
            return;
        }
        if (!bridgeFromChain || !bridgeToChain || !bridgeAmount) {
            setBridgeError('Select chains and amount first.');
            return;
        }
        setBridgeStatus('bridging');
        setBridgeError(null);
        setBridgeStartTime(Date.now());
        try {
            const result = await executeBridgeInBrowser({
                fromChain: bridgeFromChain,
                toChain: bridgeToChain,
                amount: bridgeAmount,
                config: {
                    transferSpeed: bridgeSpeed,
                    maxFee: bridgeMaxFee || undefined,
                },
            });
            setBridgeResult(result);
            setBridgeStatus('success');
        } catch (error: unknown) {
            setBridgeStatus('error');
            setBridgeError(error instanceof Error ? error.message : 'Bridge transfer failed.');
            setBridgeStartTime(null);
        }
    };

    const handleBuildBurnIntent = async () => {
        if (!address || !gatewayAmount) {
            setGatewayTransferError('Enter amount and connect wallet.');
            return;
        }
        setGatewayTransferStatus('building');
        setGatewayTransferError(null);
        setGatewayTransferResult(null);
        setGatewayBurnIntent(null);
        try {
            const { burnIntent } = await buildBurnIntent({
                sourceDomain: gatewaySourceDomain,
                destinationDomain: gatewayDestDomain,
                amount: gatewayAmount,
                sourceDepositor: address,
                destinationRecipient: address,
            });
            setGatewayBurnIntent(burnIntent);
            setGatewayTransferStatus('idle');
        } catch (error: any) {
            setGatewayTransferStatus('error');
            setGatewayTransferError(error?.message || 'Failed to build burn intent.');
        }
    };

    const handleSignAndSubmitGateway = async () => {
        if (!gatewayBurnIntent) {
            setGatewayTransferError('Build burn intent first.');
            return;
        }
        setGatewayTransferStatus('signing');
        setGatewayTransferError(null);
        try {
            const message = {
                ...gatewayBurnIntent,
                maxBlockHeight: BigInt(gatewayBurnIntent.maxBlockHeight),
                maxFee: BigInt(gatewayBurnIntent.maxFee),
                spec: {
                    ...gatewayBurnIntent.spec,
                    value: BigInt(gatewayBurnIntent.spec.value),
                    sourceContract: gatewayBurnIntent.spec.sourceContract as `0x${string}`,
                    destinationContract: gatewayBurnIntent.spec.destinationContract as `0x${string}`,
                    sourceToken: gatewayBurnIntent.spec.sourceToken as `0x${string}`,
                    destinationToken: gatewayBurnIntent.spec.destinationToken as `0x${string}`,
                    sourceDepositor: gatewayBurnIntent.spec.sourceDepositor as `0x${string}`,
                    destinationRecipient: gatewayBurnIntent.spec.destinationRecipient as `0x${string}`,
                    sourceSigner: gatewayBurnIntent.spec.sourceSigner as `0x${string}`,
                    destinationCaller: gatewayBurnIntent.spec.destinationCaller as `0x${string}`,
                    salt: gatewayBurnIntent.spec.salt as `0x${string}`,
                    hookData: gatewayBurnIntent.spec.hookData as `0x${string}`,
                },
            };
            const signature = await signTypedDataAsync({
                domain: GATEWAY_EIP712_DOMAIN,
                types: GATEWAY_EIP712_TYPES,
                primaryType: 'BurnIntent',
                message,
            });
            setGatewayTransferStatus('submitting');
            const data = await transferGatewayBalance([{ burnIntent: gatewayBurnIntent, signature }]);
            setGatewayTransferResult(data ?? null);
            setGatewayTransferStatus('success');
        } catch (error: any) {
            setGatewayTransferStatus('error');
            setGatewayTransferError(error?.message || 'Sign or submit failed.');
        }
    };

    const openHelp = (topic: 'swap-hash' | 'settlement-id' | 'settlement-hash') => {
        setHelpTopic(topic);
        setIsHelpOpen(true);
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
                            <p className="text-sm text-slate-600 mb-2">
                                Selective disclosure execution • Hide your intent • Anchor your name
                            </p>
                            <p className="text-xs text-slate-500 mb-6">
                                <strong>Step 1.</strong> Execute the trade on Uniswap (Pay → Receive). Then use Step 2 to settle the USDC you receive into payment-ready balance.
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
                                            value={expectedReceiveAmount}
                                            onChange={(e) => setExpectedReceiveAmount(e.target.value)}
                                            placeholder={receivePlaceholder}
                                            className="bg-transparent text-4xl font-display font-bold text-brand-dark outline-none w-full"
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
                                            Step 2 — After you swap
                                        </p>
                                        <h3 className="text-lg font-semibold text-brand-dark mt-2">
                                            Arc USDC Settlement (Testnet)
                                        </h3>
                                        <p className="text-xs text-slate-600 mt-2">
                                            Settlement does <strong>not</strong> perform a swap. It takes the USDC you already received in Step 1 and finalizes it into payment-ready balance (Arc/Circle). So: swap first, then enter the USDC amount you received and click Settle.
                                        </p>
                                        <div className="mt-3 text-[0.7rem] text-slate-500 space-y-1">
                                            <div>• <strong>Swap</strong> = on-chain trade (Uniswap). <strong>Settle</strong> = turn that USDC into payment-ready balance.</div>
                                            <div>• When Receive is USDC above, this amount is synced from Step 1. Otherwise type the USDC you expect from the swap.</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs text-slate-500">
                                            Expected USDC amount (required) {receiveToken === 'USDC' && expectedReceiveAmount && (
                                                <span className="text-brand-blue font-normal">— from Receive above</span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            value={receiveToken === 'USDC' ? expectedReceiveAmount : (payToken === 'USDC' ? payAmount : expectedReceiveAmount)}
                                            onChange={(e) => receiveToken === 'USDC' ? setExpectedReceiveAmount(e.target.value) : (payToken === 'USDC' ? setPayAmount(e.target.value) : setExpectedReceiveAmount(e.target.value))}
                                            placeholder={receiveToken === 'USDC' ? 'Same as Receive amount above' : (payToken === 'USDC' ? 'e.g. 10.50 (USDC you pay)' : 'e.g. 10.50 (USDC you expect from swap)')}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-brand-dark outline-none focus:border-brand-blue"
                                        />
                                        <p className="text-[0.65rem] text-slate-400">
                                            {receiveToken === 'USDC'
                                                ? 'Synced with Receive amount above. Change it there or here.'
                                                : payToken === 'USDC'
                                                    ? 'USDC you pay in the swap (settle that amount).'
                                                    : 'USDC amount you expect to receive from the swap. Settlement will use this.'}
                                        </p>
                                    </div>
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
                                    {receiveToken !== 'USDC' && (
                                        <p className="text-[0.65rem] text-amber-700">
                                            Arc settlement finalizes the USDC you <strong>receive</strong> from the swap. Set Receive to USDC (e.g. swap ETH → USDC) to use it.
                                        </p>
                                    )}
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

                                {!settlementResult && (
                                    <p className="mt-3 text-[0.65rem] text-slate-400">
                                        After settlement succeeds, Gateway (unified balance, burn intent transfer) and Bridge Kit transfer appear below.
                                    </p>
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
                                {settlementStatus === 'success' && settlementResult && (
                                    <div className="mt-4 rounded-xl border border-slate-100 bg-white/70 px-4 py-3 text-xs text-slate-600">
                                        <div className="flex items-center justify-between">
                                            <span className="uppercase tracking-[0.25em] text-[0.6rem] text-slate-400">
                                                Post-settlement mobility
                                            </span>
                                        </div>
                                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                                            <div className="rounded-lg border border-slate-100 bg-white px-3 py-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-brand-dark">Gateway unified balance</span>
                                                    <button
                                                        type="button"
                                                        onClick={handleGatewayBalances}
                                                        className="text-[0.65rem] font-semibold text-brand-blue underline"
                                                    >
                                                        {gatewayStatus === 'loading' ? 'Loading...' : 'Refresh'}
                                                    </button>
                                                </div>
                                                <p className="mt-1 text-[0.65rem] text-slate-500">
                                                    Check unified USDC balances after settlement.
                                                </p>
                                                {gatewayBalances && (
                                                    <div className="mt-2 space-y-1 text-[0.65rem] text-slate-600">
                                                        {gatewayBalances.length === 0 && <div>No balances yet.</div>}
                                                        {gatewayBalances.map((entry) => (
                                                            <div key={`${entry.domain}-${entry.balance}`} className="flex justify-between">
                                                                <span>Domain {entry.domain}</span>
                                                                <span className="font-semibold text-brand-dark">{entry.balance} USDC</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {gatewayError && (
                                                    <div className="mt-2 text-[0.65rem] text-amber-700">
                                                        {gatewayError}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="rounded-lg border border-slate-100 bg-white px-3 py-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-brand-dark">Gateway transfer (burn intent)</span>
                                                </div>
                                                <p className="mt-1 text-[0.65rem] text-slate-500">
                                                    Build burn intent, sign with wallet, submit to Gateway.
                                                </p>
                                                <div className="mt-2 grid gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={gatewaySourceDomain}
                                                            onChange={(e) => setGatewaySourceDomain(Number(e.target.value))}
                                                            className="w-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[0.65rem]"
                                                        >
                                                            {gatewayDomains.map((d) => (
                                                                <option key={d.domain} value={d.domain}>{d.name}</option>
                                                            ))}
                                                        </select>
                                                        <select
                                                            value={gatewayDestDomain}
                                                            onChange={(e) => setGatewayDestDomain(Number(e.target.value))}
                                                            className="w-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[0.65rem]"
                                                        >
                                                            {gatewayDomains.map((d) => (
                                                                <option key={d.domain} value={d.domain}>{d.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={gatewayAmount}
                                                        onChange={(e) => setGatewayAmount(e.target.value)}
                                                        placeholder="USDC amount"
                                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[0.65rem]"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleBuildBurnIntent}
                                                            className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-[0.65rem] font-semibold text-slate-700"
                                                            disabled={gatewayTransferStatus === 'building' || gatewayTransferStatus === 'submitting'}
                                                        >
                                                            {gatewayTransferStatus === 'building' ? 'Building...' : 'Build burn intent'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleSignAndSubmitGateway}
                                                            className="flex-1 rounded-lg bg-brand-blue px-2 py-1 text-[0.65rem] font-semibold text-white"
                                                            disabled={!gatewayBurnIntent || gatewayTransferStatus === 'signing' || gatewayTransferStatus === 'submitting'}
                                                        >
                                                            {gatewayTransferStatus === 'signing' ? 'Signing...' : gatewayTransferStatus === 'submitting' ? 'Submitting...' : 'Sign & submit'}
                                                        </button>
                                                    </div>
                                                    {gatewayBurnIntent && (
                                                        <div className="text-[0.65rem] text-slate-500">
                                                            Burn intent ready. Sign & submit to Gateway.
                                                        </div>
                                                    )}
                                                    {gatewayTransferResult && (
                                                        <div className="mt-2 space-y-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-2 text-[0.65rem] text-emerald-800">
                                                            {gatewayTransferResult.transferId && <div>Transfer ID: {gatewayTransferResult.transferId}</div>}
                                                            {gatewayTransferResult.fees?.total != null && <div>Fees: {gatewayTransferResult.fees.total} {gatewayTransferResult.fees.token ?? 'USDC'}</div>}
                                                            {gatewayTransferResult.expirationBlock && <div>Expires at block: {gatewayTransferResult.expirationBlock}</div>}
                                                        </div>
                                                    )}
                                                    {gatewayTransferError && (
                                                        <div className="text-[0.65rem] text-amber-700">{gatewayTransferError}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid gap-4 md:grid-cols-1">
                                            <div className="rounded-lg border border-slate-100 bg-white px-3 py-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-brand-dark">Bridge Kit transfer</span>
                                                </div>
                                                <p className="mt-1 text-[0.65rem] text-slate-500">
                                                    Backend must have CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET set. Use as <strong>source</strong> the chain where your wallet has native token for gas (e.g. Ethereum Sepolia if you have Sepolia ETH). Balance is checked on the source chain only.
                                                </p>
                                                {address && /Ethereum_Sepolia|Ethereum Sepolia/i.test(bridgeFromChain) && (
                                                    <div className="mt-2 text-[0.65rem]">
                                                        {sourceBalanceLoading ? (
                                                            <span className="text-slate-500">Checking source balance…</span>
                                                        ) : sourceBalance !== null ? (
                                                            <>
                                                                <span className="text-slate-600">Source balance: <strong>{Number(sourceBalance).toFixed(4)} ETH</strong></span>
                                                                {Number(sourceBalance) < 0.001 && (
                                                                    <div className="mt-1 text-amber-700">
                                                                        No gas on source chain. Get Sepolia ETH from a faucet first:{' '}
                                                                        <a href="https://www.alchemy.com/faucets/ethereum-sepolia" target="_blank" rel="noopener noreferrer" className="underline">Alchemy</a>
                                                                        {' · '}
                                                                        <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="underline">sepoliafaucet.com</a>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : null}
                                                    </div>
                                                )}
                                                <div className="mt-2 grid gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={bridgeFromChain}
                                                            onChange={(event) => setBridgeFromChain(event.target.value)}
                                                            className="w-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[0.65rem]"
                                                        >
                                                            {bridgeChains.map((chain) => (
                                                                <option key={`from-${chain.chain}`} value={chain.chain}>
                                                                    {chain.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <select
                                                            value={bridgeToChain}
                                                            onChange={(event) => setBridgeToChain(event.target.value)}
                                                            className="w-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[0.65rem]"
                                                        >
                                                            {bridgeChains.map((chain) => (
                                                                <option key={`to-${chain.chain}`} value={chain.chain}>
                                                                    {chain.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={bridgeAmount}
                                                            onChange={(event) => setBridgeAmount(event.target.value)}
                                                            placeholder="USDC amount"
                                                            className="w-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[0.65rem]"
                                                        />
                                                        <select
                                                            value={bridgeSpeed}
                                                            onChange={(event) => setBridgeSpeed(event.target.value as 'FAST' | 'SLOW')}
                                                            className="w-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[0.65rem]"
                                                        >
                                                            <option value="FAST">FAST</option>
                                                            <option value="SLOW">SLOW</option>
                                                        </select>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={bridgeMaxFee}
                                                        onChange={(event) => setBridgeMaxFee(event.target.value)}
                                                        placeholder="Max fee (optional)"
                                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[0.65rem]"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleBridgeEstimate}
                                                            className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-[0.65rem] font-semibold text-slate-700"
                                                            disabled={bridgeStatus === 'estimating' || bridgeStatus === 'bridging'}
                                                        >
                                                            {bridgeStatus === 'estimating' ? 'Estimating...' : 'Estimate'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleBridgeTransfer}
                                                            className="flex-1 rounded-lg bg-brand-blue px-2 py-1 text-[0.65rem] font-semibold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all active:scale-95"
                                                            disabled={bridgeStatus === 'bridging'}
                                                        >
                                                            {bridgeStatus === 'bridging' ? 'Bridging (est. 20m)...' : 'Bridge Assets'}
                                                        </button>
                                                    </div>

                                                    {bridgeStatus === 'bridging' && (
                                                        <div className="mt-2 p-3 rounded-lg border border-amber-100 bg-amber-50 space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                                                                <span className="text-[0.65rem] font-bold text-amber-800">Bridge in Progress</span>
                                                            </div>
                                                            <p className="text-[0.6rem] text-amber-700 leading-relaxed">
                                                                Circle CCTP requires approximately <strong>20 minutes</strong> for attestation when moving from {bridgeFromChain.replace('_', ' ')} to {bridgeToChain.replace('_', ' ')}.
                                                                Please do not close this window until the transaction is confirmed in your wallet.
                                                            </p>
                                                            <div className="text-[0.55rem] text-amber-600">
                                                                Started at: {new Date(bridgeStartTime!).toLocaleTimeString()}
                                                            </div>
                                                            <a
                                                                href="https://www.cctpscan.xyz/"
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-block text-[0.6rem] font-semibold text-amber-900 underline underline-offset-2"
                                                            >
                                                                Track on Circle Iris Explorer
                                                            </a>
                                                        </div>
                                                    )}
                                                    {bridgeEstimate && (
                                                        <div className="space-y-1 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[0.65rem] mt-3">
                                                            <div className="font-semibold text-slate-700">
                                                                Estimate: {(bridgeEstimate as { amount?: string }).amount ?? '—'} {(bridgeEstimate as { token?: string }).token ?? 'USDC'}
                                                            </div>
                                                            {Array.isArray((bridgeEstimate as { gasFees?: unknown[] }).gasFees) && (
                                                                <div className="text-slate-600">
                                                                    Gas: {((bridgeEstimate as { gasFees: Array<{ token?: string; fees?: { fee?: string } | null }> }).gasFees)
                                                                        .map((g) => (g.fees?.fee ? `${g.fees.fee} ${g.token ?? ''}` : g.token)).filter(Boolean).join(', ') || '—'}
                                                                </div>
                                                            )}
                                                            {Array.isArray((bridgeEstimate as { fees?: Array<{ amount?: string | null }> }).fees) && (
                                                                <div className="text-slate-600">
                                                                    Fees: {((bridgeEstimate as { fees: Array<{ amount?: string | null }> }).fees)
                                                                        .map((f) => f.amount ?? '0').join(', ')}
                                                                </div>
                                                            )}
                                                            <div className="text-slate-500">Review above, then click Bridge.</div>
                                                        </div>
                                                    )}

                                                    {/* Bridge Recovery Section */}
                                                    <div className="mt-6 border-t border-slate-100 pt-4">
                                                        <details className="group">
                                                            <summary className="flex items-center justify-between cursor-pointer list-none">
                                                                <span className="text-[0.65rem] font-bold text-slate-500 group-open:text-brand-blue transition-colors">
                                                                    Support: Resume Pending Bridge
                                                                </span>
                                                                <ArrowLeft className="w-3 h-3 text-slate-400 group-open:rotate-90 transition-transform" />
                                                            </summary>
                                                            <div className="mt-3 space-y-3">
                                                                <p className="text-[0.6rem] text-slate-500">
                                                                    If your bridge was interrupted or is waiting for attestation, enter the <strong>Source Transaction Hash</strong> to complete the mint.
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={recoveryTxHash}
                                                                        onChange={(e) => setRecoveryTxHash(e.target.value)}
                                                                        placeholder="0x..."
                                                                        className="flex-1 px-2 py-1 text-[0.65rem] border border-slate-200 rounded outline-none focus:border-brand-blue"
                                                                    />
                                                                    <button
                                                                        onClick={handleRecoverBridge}
                                                                        disabled={recoveryStatus === 'recovering'}
                                                                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[0.65rem] font-bold transition-colors disabled:opacity-50"
                                                                    >
                                                                        {recoveryStatus === 'recovering' ? 'Resuming...' : 'Resume'}
                                                                    </button>
                                                                </div>
                                                                {recoveryStatus === 'success' && (
                                                                    <p className="text-[0.6rem] text-emerald-600 font-bold">
                                                                        Bridge resumed! Checking finalization...
                                                                    </p>
                                                                )}
                                                                {recoveryStatus === 'error' && recoveryError && (
                                                                    <p className="text-[0.6rem] text-red-600">
                                                                        {recoveryError}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </details>
                                                    </div>
                                                    {bridgeResult && (
                                                        <div className="mt-2 space-y-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[0.65rem]">
                                                            <div className="font-semibold text-brand-dark">
                                                                Bridge result: {(bridgeResult as { state?: string }).state ?? 'submitted'} · {(bridgeResult as { amount?: string }).amount ?? '—'} {(bridgeResult as { token?: string }).token ?? 'USDC'}
                                                            </div>
                                                            {Array.isArray((bridgeResult as { steps?: unknown[] }).steps) && (
                                                                <div className="space-y-1.5">
                                                                    <span className="font-semibold text-slate-600">Steps</span>
                                                                    {((bridgeResult as { steps: Array<{ name?: string; state?: string; txHash?: string; explorerUrl?: string; errorMessage?: string }> }).steps).map((step, i) => (
                                                                        <div key={i} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded border border-slate-100 bg-white px-2 py-1">
                                                                            <span className="font-medium text-slate-700">{step.name ?? `Step ${i + 1}`}</span>
                                                                            <span className={`rounded px-1 font-medium ${step.state === 'success' ? 'bg-emerald-100 text-emerald-700' : step.state === 'error' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                                {step.state ?? 'pending'}
                                                                            </span>
                                                                            {step.txHash && (
                                                                                <a href={step.explorerUrl ?? `https://etherscan.io/tx/${step.txHash}`} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">
                                                                                    tx: {step.txHash.slice(0, 10)}…{step.txHash.slice(-8)}
                                                                                </a>
                                                                            )}
                                                                            {step.errorMessage && <span className="text-amber-700">{step.errorMessage}</span>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {bridgeError && (
                                                        <div className="space-y-1 text-[0.65rem] text-amber-700">
                                                            <div>{bridgeError}</div>
                                                            {/No wallet provider|MetaMask|injected/i.test(bridgeError) && (
                                                                <div className="text-slate-600">Connect MetaMask or another injected wallet to use Bridge Kit.</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
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
