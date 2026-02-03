import { BridgeKit } from '@circle-fin/bridge-kit';
import type { BridgeConfig, BridgeParams, BridgeResult, ChainDefinition, EstimateResult } from '@circle-fin/bridge-kit';
import type { BridgeChainIdentifier } from '@circle-fin/bridge-kit';
import { createCircleWalletsAdapter } from '@circle-fin/adapter-circle-wallets';
import { createViemAdapterFromPrivateKey } from '@circle-fin/adapter-viem-v2';
import { createPublicClient, createWalletClient, http, getAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export type BridgeKitTransferRequest = {
    fromChain: string;
    toChain: string;
    amount: string;
    /** Source chain wallet address (required for developer-controlled adapters). */
    address?: string;
    /** Destination chain recipient; defaults to same as address if omitted. */
    recipientAddress?: string;
    config?: BridgeConfig;
};

/** Chain display name (from bridge-kit chain def) -> env RPC URL key or URL. */
const RPC_BY_CHAIN_NAME: Record<string, string | undefined> = {
    'Ethereum Sepolia': process.env.SEPOLIA_RPC_URL,
    'Base Sepolia': process.env.BASE_SEPOLIA_RPC_URL,
    'Arc Testnet': process.env.ARC_TESTNET_RPC_URL,
};

export class BridgeKitService {
    private kit: BridgeKit | null = null;

    getSupportedChains(): ChainDefinition[] {
        return this.getKit().getSupportedChains();
    }

    async estimateTransfer(request: BridgeKitTransferRequest): Promise<EstimateResult> {
        const params = this.buildParams(request);
        return this.getKit().estimate(params);
    }

    async bridgeTransfer(request: BridgeKitTransferRequest): Promise<BridgeResult> {
        const params = this.buildParams(request);
        return this.getKit().bridge(params);
    }

    /** Run a bridge operation with one retry on RPC/balance errors (often transient). */
    private static isRpcBalanceError(e: unknown): boolean {
        const msg = e instanceof Error ? e.message : String(e);
        return /native balance|RPC error|unknown RPC error/i.test(msg);
    }

    async estimateTransferWithRetry(request: BridgeKitTransferRequest): Promise<EstimateResult> {
        const maxAttempts = 4;
        const delayMs = 3000;
        let lastError: unknown;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await this.estimateTransfer(request);
            } catch (e) {
                lastError = e;
                if (!BridgeKitService.isRpcBalanceError(e) || attempt === maxAttempts) throw e;
                await new Promise((r) => setTimeout(r, delayMs));
            }
        }
        throw lastError;
    }

    async bridgeTransferWithRetry(request: BridgeKitTransferRequest): Promise<BridgeResult> {
        const maxAttempts = 4;
        const delayMs = 3000;
        let lastError: unknown;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await this.bridgeTransfer(request);
            } catch (e) {
                lastError = e;
                if (!BridgeKitService.isRpcBalanceError(e) || attempt === maxAttempts) throw e;
                await new Promise((r) => setTimeout(r, delayMs));
            }
        }
        throw lastError;
    }

    private getKit(): BridgeKit {
        if (!this.kit) {
            this.kit = new BridgeKit();
        }
        return this.kit;
    }

    private buildParams(request: BridgeKitTransferRequest): BridgeParams {
        const fromChain = request.fromChain as BridgeChainIdentifier;
        const toChain = request.toChain as BridgeChainIdentifier;

        const useViem = process.env.BRIDGE_USE_VIEM_ADAPTER === 'true' || process.env.BRIDGE_USE_VIEM_ADAPTER === '1';
        const privateKey = process.env.BRIDGE_PRIVATE_KEY || process.env.BACKEND_PRIVATE_KEY;

        if (useViem && privateKey) {
            return this.buildParamsWithViemAdapter(request, fromChain, toChain, privateKey);
        }

        const apiKey = process.env.CIRCLE_API_KEY;
        const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
        if (!apiKey || !entitySecret) {
            throw new Error('CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET are required for Bridge Kit');
        }
        const adapter = createCircleWalletsAdapter({
            apiKey,
            entitySecret,
        });

        const sourceAddress = request.address || request.recipientAddress;
        if (!sourceAddress || !sourceAddress.startsWith('0x')) {
            throw new Error('Address is required in context for developer-controlled adapters. Please provide: { adapter, chain, address: "0x..." }');
        }
        const destAddress = request.recipientAddress || sourceAddress;

        return {
            from: { adapter, chain: fromChain, address: sourceAddress },
            to: { adapter, chain: toChain, address: destAddress },
            amount: request.amount,
            token: 'USDC',
            config: request.config,
        };
    }

    private buildParamsWithViemAdapter(
        request: BridgeKitTransferRequest,
        fromChain: BridgeChainIdentifier,
        toChain: BridgeChainIdentifier,
        privateKey: string,
    ): BridgeParams {
        const key = privateKey.startsWith('0x') ? (privateKey as `0x${string}`) : (`0x${privateKey}` as `0x${string}`);
        const account = privateKeyToAccount(key);
        const address = getAddress(account.address);

        const getRpcUrl = (chainName: string): string => {
            const url = RPC_BY_CHAIN_NAME[chainName];
            if (url) return url;
            throw new Error(`No RPC configured for chain "${chainName}". Set SEPOLIA_RPC_URL, BASE_SEPOLIA_RPC_URL, or ARC_TESTNET_RPC_URL for Viem adapter.`);
        };

        const adapter = createViemAdapterFromPrivateKey({
            privateKey: key,
            capabilities: { addressContext: 'developer-controlled' as const },
            getPublicClient: ({ chain }) => {
                const rpcUrl = getRpcUrl(chain.name);
                return createPublicClient({
                    chain,
                    transport: http(rpcUrl, { retryCount: 3, timeout: 10_000 }),
                });
            },
            getWalletClient: ({ chain, account: adapterAccount }) =>
                createWalletClient({
                    account: adapterAccount,
                    chain,
                    transport: http(getRpcUrl(chain.name), { retryCount: 3, timeout: 10_000 }),
                }),
        });

        return {
            from: { adapter, chain: fromChain, address },
            to: { adapter, chain: toChain, address },
            amount: request.amount,
            token: 'USDC',
            config: request.config,
        };
    }
}
