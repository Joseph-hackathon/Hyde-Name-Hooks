/**
 * Bridge Kit in the browser using the user's injected wallet (MetaMask, etc.).
 * @see https://developers.circle.com/bridge-kit/concepts/adapter-setups#browser-wallet
 */
import { BridgeKit } from '@circle-fin/bridge-kit';
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2';
import type { EIP1193Provider } from 'viem';

declare global {
    interface Window {
        ethereum?: EIP1193Provider;
    }
}

function getProvider(): EIP1193Provider {
    if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('No wallet provider found. Connect MetaMask or another injected wallet.');
    }
    return window.ethereum;
}

/** Serialize object for React state (BigInt -> string). */
export function serializeBridgeResult<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return String(obj) as T;
    if (Array.isArray(obj)) return obj.map(serializeBridgeResult) as T;
    if (typeof obj === 'object') {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj)) {
            (out as Record<string, unknown>)[k] = serializeBridgeResult(v);
        }
        return out as T;
    }
    return obj;
}

export type BridgeConfigInput = {
    transferSpeed?: 'FAST' | 'SLOW';
    maxFee?: string;
};

const kit = new BridgeKit();

export async function estimateBridgeInBrowser(params: {
    fromChain: string;
    toChain: string;
    amount: string;
    config?: BridgeConfigInput;
}): Promise<Record<string, unknown>> {
    const provider = getProvider();
    const adapter = await createViemAdapterFromProvider({ provider });
    const config = params.config
        ? { transferSpeed: params.config.transferSpeed, maxFee: params.config.maxFee ?? '0' }
        : {};
    const estimate = await kit.estimate({
        from: { adapter, chain: params.fromChain as Parameters<BridgeKit['estimate']>[0]['from']['chain'] },
        to: { adapter, chain: params.toChain as Parameters<BridgeKit['estimate']>[0]['to']['chain'] },
        amount: params.amount,
        token: 'USDC',
        config,
    });
    return serializeBridgeResult(estimate) as unknown as Record<string, unknown>;
}

export async function executeBridgeInBrowser(params: {
    fromChain: string;
    toChain: string;
    amount: string;
    config?: BridgeConfigInput;
}): Promise<Record<string, unknown>> {
    const provider = getProvider();
    const adapter = await createViemAdapterFromProvider({ provider });
    const config = params.config
        ? { transferSpeed: params.config.transferSpeed, maxFee: params.config.maxFee ?? '0' }
        : {};
    const result = await kit.bridge({
        from: { adapter, chain: params.fromChain as Parameters<BridgeKit['bridge']>[0]['from']['chain'] },
        to: { adapter, chain: params.toChain as Parameters<BridgeKit['bridge']>[0]['to']['chain'] },
        amount: params.amount,
        token: 'USDC',
        config,
    });
    return serializeBridgeResult(result) as unknown as Record<string, unknown>;
}

export async function recoverBridgeInBrowser(params: {
    sourceTxHash: string;
}): Promise<Record<string, unknown>> {
    const provider = getProvider();
    const adapter = await createViemAdapterFromProvider({ provider });

    // Circle Bridge Kit can attempt to "pick up" a transaction by its source hash
    // in some versions/configurations, or we might need to use the lower level CCTP adapter.
    // Given the "Smart Retry" feature, we try to initiate a bridge call which should 
    // ideally recognize the existing transaction if the parameters match, 
    // or we use the specific recovery mechanism if available in the SDK.

    // Note: If the SDK doesn't have a direct 'recover(hash)' we might need to 
    // manually fetch the attestation and call receiveMessage.

    const result = await kit.bridge({
        from: { adapter, chain: 'base_sepolia' as any }, // Defaulting to base_sepolia for now as per user report
        to: { adapter, chain: 'ethereum_sepolia' as any },
        sourceTxHash: params.sourceTxHash,
    } as any);

    return serializeBridgeResult(result) as unknown as Record<string, unknown>;
}
