import { BridgeKit } from '@circle-fin/bridge-kit';
import type { BridgeConfig, BridgeParams, BridgeResult, ChainDefinition, EstimateResult } from '@circle-fin/bridge-kit';
import type { BridgeChainIdentifier } from '@circle-fin/bridge-kit';
import { createCircleWalletsAdapter } from '@circle-fin/adapter-circle-wallets';

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

    private getKit(): BridgeKit {
        if (!this.kit) {
            this.kit = new BridgeKit();
        }
        return this.kit;
    }

    private buildParams(request: BridgeKitTransferRequest): BridgeParams {
        const apiKey = process.env.CIRCLE_API_KEY;
        const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
        if (!apiKey || !entitySecret) {
            throw new Error('CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET are required for Bridge Kit');
        }
        const adapter = createCircleWalletsAdapter({
            apiKey,
            entitySecret,
        });

        const fromChain = request.fromChain as BridgeChainIdentifier;
        const toChain = request.toChain as BridgeChainIdentifier;
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
}
