import { Router, Request, Response } from 'express';
import { ENSContextService } from '../services/ensContextService';
import { ContractService } from '../services/contractService';

const router = Router();

let ensService: ENSContextService;
let contractService: ContractService;

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

export default router;
