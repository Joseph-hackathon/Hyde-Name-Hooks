import { Router, Request, Response } from 'express';
import { ENSContextService } from '../services/ensContextService';
import { ContractService } from '../services/contractService';
import { ArcSettlementService } from '../services/arcSettlementService';
import { CircleGatewayService } from '../services/circleGatewayService';
import { BridgeKitService } from '../services/bridgeKitService';
import { serializeForJson } from '../utils/json';

const router = Router();

let ensService: ENSContextService;
let contractService: ContractService;
const arcSettlementService = new ArcSettlementService();
const circleGatewayService = new CircleGatewayService();
const bridgeKitService = new BridgeKitService();

function requireServices(res: Response): boolean {
    if (!ensService || !contractService) {
        const missing = [
            !process.env.SEPOLIA_RPC_URL && !process.env.MAINNET_RPC_URL ? 'SEPOLIA_RPC_URL' : null,
            !process.env.BACKEND_PRIVATE_KEY ? 'BACKEND_PRIVATE_KEY' : null,
            !process.env.REGISTRY_CONTRACT_ADDRESS ? 'REGISTRY_CONTRACT_ADDRESS' : null,
        ].filter(Boolean);

        res.status(503).json({
            error: 'Backend not configured',
            missing,
        });
        return false;
    }
    return true;
}

/**
 * Initialize services
 */
export function initializeServices(
    rpcUrl: string,
    privateKey: string,
    registryAddress: string
) {
    ensService = new ENSContextService(rpcUrl);
    contractService = new ContractService(rpcUrl, privateKey, registryAddress);
}

/**
 * POST /api/verify-ens
 * Verify ENS name and calculate context score
 */
router.post('/verify-ens', async (req: Request, res: Response) => {
    try {
        if (!requireServices(res)) return;

        const { ensName, address } = req.body;

        if (!ensName || !address) {
            return res.status(400).json({
                error: 'Missing required fields: ensName, address',
            });
        }

        // Verify ENS ownership
        const isOwner = await ensService.verifyENSOwnership(ensName, address);
        if (!isOwner) {
            return res.status(403).json({
                error: 'ENS name does not belong to this address',
            });
        }

        // Calculate context score
        const contextScore = await ensService.calculateContextScore(address);

        // Register context in smart contract
        const txHash = await contractService.registerUserContext(
            address,
            ensName,
            contextScore.tier
        );

        res.json({
            success: true,
            data: {
                ensName,
                address,
                tier: contextScore.tier,
                tierName: ['Standard', 'Trusted', 'Elite'][contextScore.tier],
                totalScore: contextScore.totalScore,
                breakdown: contextScore.breakdown,
                txHash,
            },
        });
    } catch (error: any) {
        console.error('Error in verify-ens:', error);
        res.status(500).json({
            error: error.message || 'Failed to verify ENS',
        });
    }
});

/**
 * GET /api/context-score/:address
 * Get context score for an address (returns tier only, not raw score)
 */
router.get('/context-score/:address', async (req: Request, res: Response) => {
    try {
        if (!requireServices(res)) return;

        const { address } = req.params;

        if (!address) {
            return res.status(400).json({ error: 'Address required' });
        }

        // Calculate fresh score
        const contextScore = await ensService.calculateContextScore(address);

        res.json({
            success: true,
            data: {
                address,
                tier: contextScore.tier,
                tierName: ['Standard', 'Trusted', 'Elite'][contextScore.tier],
                // Selective disclosure: only return tier, not breakdown
            },
        });
    } catch (error: any) {
        console.error('Error in context-score:', error);
        res.status(500).json({
            error: error.message || 'Failed to get context score',
        });
    }
});

/**
 * GET /api/tier/:address
 * Get tier from on-chain registry
 */
router.get('/tier/:address', async (req: Request, res: Response) => {
    try {
        if (!requireServices(res)) return;

        const { address } = req.params;

        if (!address) {
            return res.status(400).json({ error: 'Address required' });
        }

        // Check if registered
        const isRegistered = await contractService.isUserRegistered(address);
        if (!isRegistered) {
            return res.status(404).json({
                error: 'User not registered',
            });
        }

        // Get tier from contract
        const tier = await contractService.getUserTier(address);

        res.json({
            success: true,
            data: {
                address,
                tier,
                tierName: ['Standard', 'Trusted', 'Elite'][tier],
            },
        });
    } catch (error: any) {
        console.error('Error in tier:', error);
        res.status(500).json({
            error: error.message || 'Failed to get tier',
        });
    }
});

/**
 * GET /api/check-access/:address/:poolId
 * Check if user can access a specific pool
 */
router.get('/check-access/:address/:minTier', async (req: Request, res: Response) => {
    try {
        if (!requireServices(res)) return;

        const { address, minTier } = req.params;

        if (!address || minTier === undefined) {
            return res.status(400).json({ error: 'Address and minTier required' });
        }

        const hasAccess = await contractService.hasMinimumTier(
            address,
            parseInt(minTier)
        );

        res.json({
            success: true,
            data: {
                address,
                minTier: parseInt(minTier),
                hasAccess,
            },
        });
    } catch (error: any) {
        console.error('Error in check-access:', error);
        res.status(500).json({
            error: error.message || 'Failed to check access',
        });
    }
});

/**
 * GET /api/ens-name/:address
 * Get ENS name from reverse lookup
 */
router.get('/ens-name/:address', async (req: Request, res: Response) => {
    try {
        if (!requireServices(res)) return;

        const { address } = req.params;
        if (!address) {
            return res.status(400).json({ error: 'Address required' });
        }

        const ensName = await ensService.getENSName(address);
        res.json({
            success: true,
            data: {
                address,
                ensName,
            },
        });
    } catch (error: any) {
        console.error('Error in ens-name:', error);
        res.status(500).json({
            error: error.message || 'Failed to resolve ENS name',
        });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

/**
 * POST /api/arc/settlement
 * Post-swap settlement into Arc USDC (testnet).
 */
router.post('/arc/settlement', async (req: Request, res: Response) => {
    try {
        const {
            userAddress,
            swapTxHash,
            inputToken,
            outputToken,
            inputAmount,
            outputAmount,
            sourceChainId,
        } = req.body || {};

        if (!userAddress || !inputToken || !outputToken || !inputAmount || !outputAmount || !sourceChainId) {
            return res.status(400).json({
                error: 'Missing required fields: userAddress, inputToken, outputToken, inputAmount, outputAmount, sourceChainId',
            });
        }

        const settlement = await arcSettlementService.createSettlement({
            userAddress,
            swapTxHash,
            inputToken,
            outputToken,
            inputAmount,
            outputAmount,
            sourceChainId: Number(sourceChainId),
        });

        res.json({
            success: true,
            data: settlement,
        });
    } catch (error: any) {
        res.status(400).json({
            error: error.message || 'Failed to create Arc settlement',
        });
    }
});

/**
 * GET /api/arc/settlement/:transactionId
 * Retrieve Circle transaction status for Arc settlement.
 */
router.get('/arc/settlement/:transactionId', async (req: Request, res: Response) => {
    try {
        const { transactionId } = req.params;
        if (!transactionId) {
            return res.status(400).json({ error: 'Transaction ID required' });
        }

        const status = await arcSettlementService.getSettlementStatus(transactionId);
        res.json({
            success: true,
            data: status,
        });
    } catch (error: any) {
        res.status(400).json({
            error: error.message || 'Failed to fetch Arc settlement status',
        });
    }
});

/**
 * GET /api/gateway/info
 */
router.get('/gateway/info', async (_req: Request, res: Response) => {
    try {
        const info = await circleGatewayService.getInfo();
        res.json({ success: true, data: info });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Failed to fetch Gateway info' });
    }
});

/**
 * POST /api/gateway/balances
 */
router.post('/gateway/balances', async (req: Request, res: Response) => {
    try {
        const { token, depositor, domains } = req.body;
        if (!token || !depositor) {
            return res.status(400).json({ error: 'Missing required fields: token, depositor' });
        }
        const balances = await circleGatewayService.getBalances({ token, depositor, domains });
        res.json({ success: true, data: balances });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Failed to fetch Gateway balances' });
    }
});

/**
 * GET /api/gateway/domains
 * Returns supported domain IDs and names for burn intent UI.
 */
router.get('/gateway/domains', async (_req: Request, res: Response) => {
    try {
        const domains = circleGatewayService.getDomainConfig();
        res.json({ success: true, data: domains });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Failed to fetch Gateway domains' });
    }
});

/**
 * POST /api/gateway/build-burn-intent
 * Builds a single burn intent message for EIP-712 signing (Gateway transfer).
 */
router.post('/gateway/build-burn-intent', async (req: Request, res: Response) => {
    try {
        const { sourceDomain, destinationDomain, amount, sourceDepositor, destinationRecipient, maxFee } = req.body;
        if (
            sourceDomain === undefined ||
            destinationDomain === undefined ||
            !amount ||
            !sourceDepositor ||
            !destinationRecipient
        ) {
            return res.status(400).json({
                error: 'Missing required fields: sourceDomain, destinationDomain, amount, sourceDepositor, destinationRecipient',
            });
        }
        const burnIntent = circleGatewayService.buildBurnIntent({
            sourceDomain: Number(sourceDomain),
            destinationDomain: Number(destinationDomain),
            amount: String(amount),
            sourceDepositor: String(sourceDepositor),
            destinationRecipient: String(destinationRecipient),
            maxFee: maxFee != null ? String(maxFee) : undefined,
        });
        res.json({ success: true, data: { burnIntent } });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Failed to build burn intent' });
    }
});

/**
 * POST /api/gateway/transfer
 * Body: array of { burnIntent, signature } (signed burn intents).
 */
router.post('/gateway/transfer', async (req: Request, res: Response) => {
    try {
        const body = Array.isArray(req.body) ? req.body : [req.body];
        const response = await circleGatewayService.transfer(body);
        res.json({ success: true, data: response });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Failed to transfer via Gateway' });
    }
});

/**
 * GET /api/bridge/chains
 */
router.get('/bridge/chains', async (_req: Request, res: Response) => {
    try {
        const chains = bridgeKitService.getSupportedChains();
        res.json({ success: true, data: chains });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Failed to load Bridge Kit chains' });
    }
});

/**
 * POST /api/bridge/estimate
 */
router.post('/bridge/estimate', async (req: Request, res: Response) => {
    try {
        const { fromChain, toChain, amount, address, recipientAddress, config } = req.body;
        if (!fromChain || !toChain || !amount) {
            return res.status(400).json({ error: 'Missing required fields: fromChain, toChain, amount' });
        }
        const estimate = await bridgeKitService.estimateTransfer({
            fromChain,
            toChain,
            amount,
            address,
            recipientAddress,
            config,
        });
        res.json({ success: true, data: serializeForJson(estimate) });
    } catch (error: any) {
        const msg = error?.message || 'Failed to estimate Bridge Kit transfer';
        const isRpcBalance = /native balance|RPC error|unknown RPC error/i.test(msg);
        res.status(400).json({
            error: isRpcBalance
                ? 'Failed to get balance on source chain. Try another chain (e.g. Ethereum Sepolia) or try again later.'
                : msg,
        });
    }
});

/**
 * POST /api/bridge/transfer
 */
router.post('/bridge/transfer', async (req: Request, res: Response) => {
    try {
        const { fromChain, toChain, amount, address, recipientAddress, config } = req.body;
        if (!fromChain || !toChain || !amount) {
            return res.status(400).json({ error: 'Missing required fields: fromChain, toChain, amount' });
        }
        const result = await bridgeKitService.bridgeTransfer({
            fromChain,
            toChain,
            amount,
            address,
            recipientAddress,
            config,
        });
        res.json({ success: true, data: serializeForJson(result) });
    } catch (error: any) {
        const msg = error?.message || 'Failed to execute Bridge Kit transfer';
        const isRpcBalance = /native balance|RPC error|unknown RPC error/i.test(msg);
        res.status(400).json({
            error: isRpcBalance
                ? 'Failed to get balance on source chain. Try another chain (e.g. Ethereum Sepolia) or try again later.'
                : msg,
        });
    }
});

export default router;
