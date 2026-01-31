import crypto from 'crypto';

export type ArcSettlementRequest = {
    userAddress: string;
    swapTxHash?: string;
    inputToken: string;
    outputToken: string;
    inputAmount: string;
    outputAmount: string;
    sourceChainId: number;
};

export type ArcSettlementResult = {
    settlementId: string;
    network: string;
    usdcAmount: string;
    status: 'ready' | 'submitted';
    settlementAsset: 'USDC';
    createdAt: string;
    circleTransactionId?: string;
    circleTransactionState?: string;
    metadata: {
        swapTxHash?: string;
        sourceChainId: number;
        inputToken: string;
        outputToken: string;
        inputAmount: string;
        outputAmount: string;
    };
};

export type ArcSettlementStatus = {
    id: string;
    state: string;
    txHash?: string;
    updateDate?: string;
    errorReason?: string;
};

export class ArcSettlementService {
    private network: string;
    private mode: 'mock' | 'circle';
    private apiBase: string;
    private apiKey: string | undefined;
    private walletId: string | undefined;
    private entitySecretCiphertext: string | undefined;
    private tokenAddress: string | undefined;
    private blockchain: string;
    private feeLevel: string;

    constructor() {
        this.network = process.env.ARC_NETWORK || 'arc-testnet';
        this.mode = (process.env.ARC_SETTLEMENT_MODE as 'mock' | 'circle') || 'mock';
        this.apiBase = process.env.CIRCLE_API_BASE || 'https://api.circle.com';
        this.apiKey = process.env.CIRCLE_API_KEY;
        this.walletId = process.env.CIRCLE_WALLET_ID;
        this.entitySecretCiphertext = process.env.CIRCLE_ENTITY_SECRET_CIPHERTEXT;
        this.tokenAddress = process.env.ARC_USDC_TOKEN_ADDRESS;
        this.blockchain = process.env.ARC_BLOCKCHAIN || 'ARC-TESTNET';
        this.feeLevel = process.env.ARC_TRANSFER_FEE_LEVEL || 'MEDIUM';
    }

    async createSettlement(payload: ArcSettlementRequest): Promise<ArcSettlementResult> {
        if (payload.outputToken !== 'USDC') {
            throw new Error('Arc settlement requires USDC output');
        }

        const settlementId = crypto
            .createHash('sha256')
            .update(`${payload.userAddress}:${payload.outputAmount}:${Date.now()}`)
            .digest('hex')
            .slice(0, 24);

        const result: ArcSettlementResult = {
            settlementId,
            network: this.network,
            usdcAmount: payload.outputAmount,
            status: this.mode === 'mock' ? 'ready' : 'submitted',
            settlementAsset: 'USDC',
            createdAt: new Date().toISOString(),
            metadata: {
                swapTxHash: payload.swapTxHash,
                sourceChainId: payload.sourceChainId,
                inputToken: payload.inputToken,
                outputToken: payload.outputToken,
                inputAmount: payload.inputAmount,
                outputAmount: payload.outputAmount,
            },
        };

        if (this.mode === 'circle') {
            if (!this.apiKey || !this.walletId || !this.entitySecretCiphertext || !this.tokenAddress) {
                throw new Error('Circle settlement missing env: CIRCLE_API_KEY, CIRCLE_WALLET_ID, CIRCLE_ENTITY_SECRET_CIPHERTEXT, ARC_USDC_TOKEN_ADDRESS');
            }

            const idempotencyKey = crypto.randomUUID();
            const response = await fetch(`${this.apiBase}/v1/w3s/developer/transactions/transfer`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'X-Request-Id': crypto.randomUUID(),
                },
                body: JSON.stringify({
                    idempotencyKey,
                    walletId: this.walletId,
                    destinationAddress: payload.userAddress,
                    amounts: [payload.outputAmount],
                    tokenAddress: this.tokenAddress,
                    blockchain: this.blockchain,
                    feeLevel: this.feeLevel,
                    entitySecretCiphertext: this.entitySecretCiphertext,
                    refId: payload.swapTxHash || settlementId,
                }),
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(responseText || 'Circle transfer request failed');
            }

            try {
                const parsed = JSON.parse(responseText) as { data?: { id?: string; state?: string } };
                result.circleTransactionId = parsed?.data?.id;
                result.circleTransactionState = parsed?.data?.state;
            } catch {
                // ignore response parse errors; settlement result still valid
            }
        }

        return result;
    }

    async getSettlementStatus(transactionId: string): Promise<ArcSettlementStatus> {
        if (this.mode !== 'circle') {
            throw new Error('Circle settlement status is unavailable in mock mode');
        }
        if (!this.apiKey) {
            throw new Error('Circle settlement missing env: CIRCLE_API_KEY');
        }

        const response = await fetch(`${this.apiBase}/v1/w3s/transactions/${transactionId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'X-Request-Id': crypto.randomUUID(),
            },
        });

        const responseText = await response.text();
        if (!response.ok) {
            throw new Error(responseText || 'Circle status request failed');
        }

        const parsed = JSON.parse(responseText) as {
            data?: {
                transaction?: {
                    id?: string;
                    state?: string;
                    txHash?: string;
                    updateDate?: string;
                    errorReason?: string;
                };
            };
        };

        const tx = parsed?.data?.transaction;
        if (!tx?.id || !tx?.state) {
            throw new Error('Invalid Circle status response');
        }

        return {
            id: tx.id,
            state: tx.state,
            txHash: tx.txHash,
            updateDate: tx.updateDate,
            errorReason: tx.errorReason,
        };
    }
}
