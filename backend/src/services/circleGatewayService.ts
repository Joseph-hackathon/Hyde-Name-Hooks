import { randomBytes } from 'node:crypto';

type GatewayBalancesRequest = {
    token: string;
    depositor: string;
    domains?: number[];
};

export type GatewayBalancesResponse = {
    balances: Array<{
        domain: number;
        balance: string;
    }>;
};

/** Gateway testnet contract addresses (same across supported chains) */
const GATEWAY_WALLET_ADDRESS = '0x0077777d7EBA4688BDeF3E311b846F25870A19B9';
const GATEWAY_MINTER_ADDRESS = '0x0022222ABE238Cc2C7Bb1f21003F0a260052475B';

/** Domain ID → USDC token address (testnet) */
const DOMAIN_USDC: Record<number, string> = {
    0: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',   // Ethereum Sepolia
    1: '0x5425890298aed601595a70ab815c96711a31bc65',   // Avalanche Fuji
    6: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',   // Base Sepolia
};

function addressToBytes32(address: string): string {
    const hex = address.toLowerCase().replace(/^0x/, '').padStart(64, '0');
    return '0x' + hex;
}

export type BuildBurnIntentRequest = {
    sourceDomain: number;
    destinationDomain: number;
    amount: string;           // USDC amount (e.g. "10" for 10 USDC)
    sourceDepositor: string;
    destinationRecipient: string;
    maxFee?: string;          // optional, default 1_010000 (1.01 USDC in 6 decimals)
};

export type BurnIntentMessage = {
    maxBlockHeight: string;
    maxFee: string;
    spec: {
        version: number;
        sourceDomain: number;
        destinationDomain: number;
        sourceContract: string;
        destinationContract: string;
        sourceToken: string;
        destinationToken: string;
        sourceDepositor: string;
        destinationRecipient: string;
        sourceSigner: string;
        destinationCaller: string;
        value: string;
        salt: string;
        hookData: string;
    };
};

export class CircleGatewayService {
    private readonly apiBase: string;

    constructor() {
        this.apiBase = (process.env.CIRCLE_GATEWAY_API_BASE || 'https://gateway-api-testnet.circle.com/v1').replace(/\/$/, '');
    }

    async getInfo() {
        return this.request('/info', { method: 'GET' });
    }

    async getBalances({ token, depositor, domains }: GatewayBalancesRequest): Promise<GatewayBalancesResponse> {
        const payload = {
            token,
            sources: (domains && domains.length > 0 ? domains : undefined)?.map((domain) => ({
                depositor,
                domain,
            })),
        };
        return this.request('/balances', {
            method: 'POST',
            body: payload,
        });
    }

    async transfer(payload: unknown) {
        return this.request('/transfer', {
            method: 'POST',
            body: payload,
        });
    }

    /**
     * Build a single burn intent message for EIP-712 signing.
     * Frontend signs this and submits [ { burnIntent: message, signature } ] to /transfer.
     */
    buildBurnIntent(params: BuildBurnIntentRequest): BurnIntentMessage {
        const { sourceDomain, destinationDomain, amount, sourceDepositor, destinationRecipient, maxFee } = params;
        const sourceToken = DOMAIN_USDC[sourceDomain];
        const destToken = DOMAIN_USDC[destinationDomain];
        if (!sourceToken || !destToken) {
            throw new Error(`Unsupported domain: source ${sourceDomain} or destination ${destinationDomain}`);
        }
        // USDC 6 decimals: "10" -> 10_000_000
        const value = BigInt(Math.floor(parseFloat(amount) * 1_000_000)).toString();
        const salt = '0x' + randomBytes(32).toString('hex');
        const zeroAddress = '0x0000000000000000000000000000000000000000';
        const maxBlockHeight = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
        const fee = maxFee ?? '1010000'; // 1.01 USDC

        return {
            maxBlockHeight,
            maxFee: fee,
            spec: {
                version: 1,
                sourceDomain,
                destinationDomain,
                sourceContract: addressToBytes32(GATEWAY_WALLET_ADDRESS),
                destinationContract: addressToBytes32(GATEWAY_MINTER_ADDRESS),
                sourceToken: addressToBytes32(sourceToken),
                destinationToken: addressToBytes32(destToken),
                sourceDepositor: addressToBytes32(sourceDepositor),
                destinationRecipient: addressToBytes32(destinationRecipient),
                sourceSigner: addressToBytes32(sourceDepositor),
                destinationCaller: addressToBytes32(zeroAddress),
                value,
                salt,
                hookData: '0x',
            },
        };
    }

    /** Return supported domain IDs and labels for UI */
    getDomainConfig(): { domain: number; name: string }[] {
        return [
            { domain: 0, name: 'Ethereum Sepolia' },
            { domain: 1, name: 'Avalanche Fuji' },
            { domain: 6, name: 'Base Sepolia' },
        ];
    }

    private async request(path: string, options: { method: 'GET' | 'POST'; body?: unknown }) {
        const response = await fetch(`${this.apiBase}${path}`, {
            method: options.method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: options.body ? JSON.stringify(options.body, (_key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ) : undefined,
        });

        const data = await response.json();
        if (!response.ok) {
            const message = data?.message || data?.error || 'Gateway request failed';
            throw new Error(message);
        }
        return data;
    }
}
